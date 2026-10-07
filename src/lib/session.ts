import { refreshSession } from "@/services/api"
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

// Sai mesmo se a API não responder: o access token some da memória e o
// refresh token vence sozinho.
export async function logout() {
  try {
    await authService.logout()
  } catch {
    // segue saindo
  }
  useAuthStore.getState().clearSession(true)
  announce("logout")
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
