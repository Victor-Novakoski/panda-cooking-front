import { api } from "./api"
import { Recipe } from "@/types"

interface CreateRecipePayload {
  name: string
  description: string
  time: string
  portions: number
  category_id: number
  images: { url: string }[]
  ingredients: { name: string; amount: string }[]
  preparations: { description: string }[]
}

export const recipesService = {
  getAll: async (): Promise<Recipe[]> => {
    const res = await api.get("/recipes")
    return res.data
  },

  getById: async (id: string): Promise<Recipe> => {
    const res = await api.get(`/recipes/${id}`)
    return res.data
  },

  create: async (data: CreateRecipePayload): Promise<Recipe> => {
    const res = await api.post("/recipes", data)
    return res.data
  },

  update: async (id: string, data: Partial<CreateRecipePayload>): Promise<Recipe> => {
    const res = await api.patch(`/recipes/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/recipes/${id}`)
  },
}
