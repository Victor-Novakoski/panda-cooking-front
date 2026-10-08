import { create } from "zustand"
import type { User } from "@/types"

// loading: ainda conferindo a sessão (logo que a página abre)
// authenticated: tem access token
// anonymous: sem sessão
// unavailable: não deu para conferir (API fora do ar); não manda para o
// login, senão a pessoa entraria num vai e volta com a sessão ainda válida
export type SessionStatus = "loading" | "authenticated" | "anonymous" | "unavailable"

interface AuthState {
  user: User | null
  // Access token só em memória: some ao fechar a aba e um XSS não acha nada
  // no localStorage. O refresh token fica no cookie HttpOnly, que o
  // JavaScript não lê; é com ele que a sessão volta ao recarregar a página.
  token: string | null
  status: SessionStatus
  // A sessão acabou por ação da pessoa nesta aba (Sair, apagar a conta):
  // quem chamou já leva para a página certa, as páginas protegidas não
  // mandam para o login.
  endedHere: boolean
  setSession: (user: User, token: string) => void
  // Depois de editar o perfil: troca os dados do usuário e mantém a sessão.
  setUser: (user: User) => void
  clearSession: (endedHere?: boolean) => void
  setStatus: (status: SessionStatus) => void
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  status: "loading",
  endedHere: false,
  setSession: (user, token) => set({ user, token, status: "authenticated", endedHere: false }),
  setUser: (user) => set({ user }),
  clearSession: (endedHere = false) => set({ user: null, token: null, status: "anonymous", endedHere }),
  setStatus: (status) => set({ status }),
}))
