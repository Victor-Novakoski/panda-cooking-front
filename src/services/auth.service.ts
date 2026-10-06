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
    // O token ainda não está salvo, então vai só nesta chamada (não fica no axios depois do logout).
    const { data: user } = await api.get<User>("/users/profile", {
      headers: { Authorization: `Bearer ${tokenData.token}` },
    })
    return { token: tokenData.token, user }
  },

  register: async (data: RegisterPayload): Promise<User> => {
    const res = await api.post<User>("/users", data)
    return res.data
  },
}
