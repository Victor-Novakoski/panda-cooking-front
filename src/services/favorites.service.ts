import { api } from "./api"

export const favoritesService = {
  isFavorite: async (recipeId: string): Promise<boolean> => {
    const res = await api.get<{ favorite: boolean }>(`/favorites/${encodeURIComponent(recipeId)}`)
    return res.data.favorite
  },

  add: async (recipeId: string): Promise<void> => {
    await api.post(`/favorites/${encodeURIComponent(recipeId)}`)
  },

  remove: async (recipeId: string): Promise<void> => {
    await api.delete(`/favorites/${encodeURIComponent(recipeId)}`)
  },
}
