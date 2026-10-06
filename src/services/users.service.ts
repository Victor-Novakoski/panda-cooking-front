import { api } from "./api"
import { Recipe, User } from "@/types"

export const usersService = {
  getFavorites: async (): Promise<Recipe[]> => {
    const res = await api.get("/users/profile/favorite-recipes")
    return res.data
  },

  update: async (data: Partial<User>): Promise<User> => {
    const res = await api.patch("/users/profile", data)
    return res.data
  },
}
