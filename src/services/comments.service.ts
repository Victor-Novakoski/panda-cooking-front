import { api } from "./api"
import { PER_PAGE } from "@/lib/limits"
import type { Comment, Page } from "@/types"

export const commentsService = {
  // Dos mais novos para os mais antigos.
  list: async (recipeId: string, page = 1): Promise<Page<Comment>> => {
    const res = await api.get<Page<Comment>>(`/recipes/${encodeURIComponent(recipeId)}/comments`, {
      params: { page, per_page: PER_PAGE.comments },
    })
    return res.data
  },

  create: async (recipeId: string, description: string): Promise<Comment> => {
    const res = await api.post<Comment>(`/recipes/${encodeURIComponent(recipeId)}/comments`, { description })
    return res.data
  },

  update: async (id: number, description: string): Promise<Comment> => {
    const res = await api.patch<Comment>(`/comments/${id}`, { description })
    return res.data
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/comments/${id}`)
  },
}
