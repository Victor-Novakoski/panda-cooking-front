import axios from "axios"
import { useAuthStore } from "@/store/auth.store"

// No servidor do Next (páginas renderizadas lá), API_INTERNAL_URL aponta a API pela rede
// do Docker; no navegador vale sempre a URL pública.
const baseURL =
  typeof window === "undefined"
    ? (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL)
    : process.env.NEXT_PUBLIC_API_URL

export const api = axios.create({ baseURL })

// Rotas em que 401 é resposta esperada (senha errada), não sessão vencida.
const publicAuthRoutes = ["/auth"]

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("@pandaToken")
    // Não sobrescreve um header passado na chamada (o login manda o token novo assim).
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isPublicAuthRoute = publicAuthRoutes.includes(error.config?.url ?? "")
    if (error.response?.status === 401 && !isPublicAuthRoute && typeof window !== "undefined") {
      // Limpa token, cookie e estado persistido; sem isso o proxy.ts ainda vê o cookie
      // e manda o usuário de volta para o dashboard.
      useAuthStore.getState().clearAuth()
      if (window.location.pathname !== "/auth/login") {
        // Fora de componente não há router; a navegação completa também descarta o cache das queries.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/auth/login"
      }
    }
    return Promise.reject(error)
  }
)
