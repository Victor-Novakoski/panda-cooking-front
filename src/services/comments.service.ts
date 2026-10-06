import { api } from "./api"
import { Comment } from "@/types"

export const commentsService = {
  create: async (data: { description: string; recipe_id: string }): Promise<Comment> => {
    const res = await api.post("/comments", data)
    return res.data
  },

  delete: async (id: string | number): Promise<void> => {
    await api.delete(`/comments/${id}`)
  },
}
