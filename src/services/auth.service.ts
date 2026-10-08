import { api } from "./api"
import type { AuthResult } from "@/types"

export interface LoginPayload {
  email: string
  password: string
}

export const authService = {
  // A API grava o refresh token no cookie HttpOnly e devolve o access token no corpo.
  login: async (data: LoginPayload): Promise<AuthResult> => {
    const res = await api.post<AuthResult>("/auth/login", data)
    return res.data
  },

  // Encerra a sessão no banco e apaga os cookies.
  logout: async (): Promise<void> => {
    await api.post("/auth/logout")
  },
}
