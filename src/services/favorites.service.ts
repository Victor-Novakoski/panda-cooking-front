import { api } from "./api"

export const favoritesService = {
  add: async (recipeId: string): Promise<void> => {
    await api.post(`/favorites/${recipeId}`)
  },

  remove: async (recipeId: string): Promise<void> => {
    await api.delete(`/favorites/${recipeId}`)
  },
}
