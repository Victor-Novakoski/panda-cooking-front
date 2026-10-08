import { apiStatus, refreshSession } from "@/services/api"
import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"

// Ao abrir a página. O access token só vive em memória, então a sessão volta
// trocando o refresh token do cookie por um token novo. hasSession vem do
// servidor (cookie panda_session): sem ele nem vale perguntar para a API.
export async function restoreSession(hasSession: boolean) {
  const { status, setStatus } = useAuthStore.getState()
  if (status === "authenticated") return
  if (!hasSession) {
    setStatus("anonymous")
    return
  }
  try {
    await refreshSession()
  } catch {
    setStatus("unavailable")
  }
}

// Encerra a sessão na API e só então na tela. Se a API não responder, a
// sessão continua (o cookie de refresh vale por dias e traria a pessoa de
// volta ao recarregar): devolve false para a tela avisar, em vez de fingir
// que saiu, o que num computador compartilhado deixaria a conta aberta.
export async function logout(): Promise<boolean> {
  try {
    await authService.logout()
  } catch (error) {
    // 401: a sessão já tinha acabado, sair é o que se queria
    if (apiStatus(error) !== 401) return false
  }
  useAuthStore.getState().clearSession(true)
  announce("logout")
  return true
}

// Avisa as outras abas do site. O access token de cada aba vive na memória
// dela; sem o aviso, uma aba continuaria logada depois do "Sair" em outra.
export type SessionEvent = "login" | "logout"

const channel =
  typeof window !== "undefined" && "BroadcastChannel" in window ? new BroadcastChannel("panda-session") : null

export function announce(event: SessionEvent) {
  channel?.postMessage(event)
}

export function onSessionEvent(listener: (event: SessionEvent) => void): () => void {
  if (!channel) return () => {}
  const handler = (e: MessageEvent) => {
    if (e.data === "login" || e.data === "logout") listener(e.data)
  }
  channel.addEventListener("message", handler)
  return () => channel.removeEventListener("message", handler)
}
