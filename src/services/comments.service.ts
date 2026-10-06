import { api } from "./api"
import { Comment } from "@/types"

export const commentsService = {
  getByRecipe: async (recipeId: string): Promise<Comment[]> => {
    const res = await api.get(`/recipes/${recipeId}/comments`)
    return res.data
  },

  create: async (data: { description: string; recipe_id: string }): Promise<Comment> => {
    const res = await api.post("/comments", data)
    return res.data
  },

  update: async (id: number, description: string): Promise<Comment> => {
    const res = await api.patch(`/comments/${id}`, { description })
    return res.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/comments/${id}`)
  },
}
