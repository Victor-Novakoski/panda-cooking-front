import { api } from "./api"
import { User } from "@/types"

interface LoginPayload {
  email: string
  password: string
}

interface RegisterPayload {
  name: string
  email: string
  password: string
}

export const authService = {
  login: async (data: LoginPayload): Promise<{ token: string; user: User }> => {
    const { data: tokenData } = await api.post<{ token: string }>("/auth", data)
    // salva token temporariamente para buscar perfil
    api.defaults.headers.common["Authorization"] = `Bearer ${tokenData.token}`
    const { data: user } = await api.get<User>("/users/profile")
    return { token: tokenData.token, user }
  },

  register: async (data: RegisterPayload): Promise<User> => {
    const res = await api.post<User>("/users", data)
    return res.data
  },
}
