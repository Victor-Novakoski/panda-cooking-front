import axios, { type InternalAxiosRequestConfig } from "axios"
import { useAuthStore } from "@/store/auth.store"
import { capitalize } from "@/lib/utils"
import type { AuthResult } from "@/types"

// O navegador só fala com o próprio front: /api/* é repassado para a API pelo
// servidor do Next (src/app/api/[...path]/route.ts). Sendo a mesma origem, o
// cookie da sessão vai junto sem precisar de CORS.
export const api = axios.create({ baseURL: "/api", timeout: 15_000 })

// Rotas da sessão: nelas o 401 é a própria resposta (senha errada, sessão
// vencida), não aviso de access token vencido.
const sessionRoutes = ["/auth/login", "/auth/refresh", "/auth/logout"]

interface RetryableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  // Não troca um Authorization já definido (a nova tentativa depois da renovação manda o token novo assim).
  if (token && !config.headers.Authorization && !sessionRoutes.includes(config.url ?? "")) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 401 fora das rotas da sessão: o access token (15 minutos) venceu. Renova
// com o cookie e repete a requisição uma vez; a API recusou antes de fazer
// qualquer coisa, então repetir é seguro mesmo num POST.
api.interceptors.response.use(undefined, async (error) => {
  const config = axios.isAxiosError(error) ? (error.config as RetryableConfig | undefined) : undefined
  const isExpiredToken =
    axios.isAxiosError(error) &&
    error.response?.status === 401 &&
    config &&
    !config._retried &&
    !sessionRoutes.includes(config.url ?? "")
  if (!isExpiredToken) {
    return Promise.reject(error)
  }

  config._retried = true
  let token: string | null
  try {
    token = await refreshSession()
  } catch {
    // Não deu para renovar (API fora do ar, limite de requisições): a sessão
    // pode continuar válida, então só devolve o erro.
    return Promise.reject(error)
  }
  if (!token) {
    redirectToLogin()
    return Promise.reject(error)
  }
  config.headers.Authorization = `Bearer ${token}`
  return api(config)
})

let refreshing: Promise<string | null> | null = null

// Troca o refresh token do cookie por um access token novo e devolve o token,
// ou null se não há sessão (a API respondeu 401 e apagou os cookies). Lança
// erro quando não deu para saber (rede, 429, 5xx).
//
// Várias requisições com o token vencido ao mesmo tempo esperam a mesma
// renovação, em vez de cada uma gastar uma troca do refresh token.
export function refreshSession(): Promise<string | null> {
  refreshing ??= api
    .post<AuthResult>("/auth/refresh")
    .then(({ data }) => {
      useAuthStore.getState().setSession(data.user, data.access_token)
      return data.access_token
    })
    .catch((error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        useAuthStore.getState().clearSession()
        return null
      }
      throw error
    })
    .finally(() => {
      refreshing = null
    })
  return refreshing
}

// Navegação completa (fora de componente não há router), que também descarta
// o cache das queries. Volta para a mesma página depois do login.
function redirectToLogin() {
  const { pathname, search } = window.location
  if (pathname.startsWith("/auth/")) return
  // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- fora de componente não há router
  window.location.assign(`/auth/login?next=${encodeURIComponent(pathname + search)}`)
}

interface ApiErrorBody {
  error?: unknown
  fields?: unknown
}

// Mensagem de erro que a API mandou (em português e sem detalhe interno),
// ou o texto padrão quando não há resposta.
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    const message = error.response?.data?.error
    if (typeof message === "string" && message) return capitalize(message)
    if (!error.response) return "Não foi possível falar com o servidor. Confira sua conexão e tente de novo."
  }
  return fallback
}

// Erros por campo (422, e o 409 de e-mail já cadastrado). A API manda
// {"ingredients[0].amount": "campo obrigatório"}; aqui vira
// {"ingredients.0.amount": "Campo obrigatório"}, o caminho do react-hook-form.
export function apiFieldErrors(error: unknown): Record<string, string> {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return {}
  const fields = error.response?.data?.fields
  if (!fields || typeof fields !== "object") return {}
  return Object.fromEntries(
    Object.entries(fields as Record<string, unknown>)
      .filter(([, message]) => typeof message === "string")
      .map(([path, message]) => [path.replace(/\[(\d+)\]/g, ".$1"), capitalize(message as string)])
  )
}

export function apiStatus(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}
