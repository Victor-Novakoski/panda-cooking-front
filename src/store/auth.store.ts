import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User } from "@/types"

interface AuthState {
  user: User | null
  token: string | null
  setAuth: (user: User, token: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
  isAuthenticated: () => boolean
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0`
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        localStorage.setItem("@pandaToken", token)
        setCookie("@pandaToken", token)
        set({ user, token })
      },
      // Depois de editar o perfil: troca os dados do usuário e mantém a sessão.
      setUser: (user) => set({ user }),
      clearAuth: () => {
        localStorage.removeItem("@pandaToken")
        deleteCookie("@pandaToken")
        set({ user: null, token: null })
      },
      isAuthenticated: () => !!get().token,
    }),
    {
      name: "panda-auth",
      partialize: (state) => ({ user: state.user, token: state.token }),
      // O servidor não tem localStorage e renderiza sem usuário. Se o navegador lesse a
      // sessão já no primeiro render, o HTML não bateria com o do servidor (erro de
      // hidratação). O Providers chama rehydrate() depois de montar.
      skipHydration: true,
    }
  )
)
