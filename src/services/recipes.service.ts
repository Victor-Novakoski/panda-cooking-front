import { api } from "./api"
import { Recipe } from "@/types"

export interface RecipePayload {
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

  create: async (data: RecipePayload): Promise<Recipe> => {
    const res = await api.post("/recipes", data)
    return res.data
  },

  // Troca a receita inteira (dados, fotos, ingredientes e passos) numa transação na API.
  replace: async (id: string, data: RecipePayload): Promise<Recipe> => {
    const res = await api.put(`/recipes/${id}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/recipes/${id}`)
  },
}
