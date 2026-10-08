import { api } from "./api"
import { PER_PAGE } from "@/lib/limits"
import type { Page, RecipeSummary, User } from "@/types"

export interface SignupPayload {
  name: string
  email: string
  password: string
}

export interface UpdateProfilePayload {
  name?: string
  // Vazio remove a foto.
  image_profile?: string
}

export const usersService = {
  // Cria a conta; a sessão é aberta depois, com o login.
  signup: async (data: SignupPayload): Promise<User> => {
    const res = await api.post<User>("/users", data)
    return res.data
  },

  update: async (data: UpdateProfilePayload): Promise<User> => {
    const res = await api.patch<User>("/users/profile", data)
    return res.data
  },

  // Apaga a conta com receitas, comentários e favoritos; a API apaga os cookies.
  deleteAccount: async (): Promise<void> => {
    await api.delete("/users/profile")
  },

  // Da receita favoritada por último para a primeira.
  favorites: async (page = 1): Promise<Page<RecipeSummary>> => {
    const res = await api.get<Page<RecipeSummary>>("/users/profile/favorites", {
      params: { page, per_page: PER_PAGE.recipes },
    })
    return res.data
  },
}
