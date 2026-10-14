import { api } from "./api"
import { PER_PAGE } from "@/lib/limits"
import type { Page, Recipe, RecipeSummary } from "@/types"

export interface RecipePayload {
  name: string
  description: string
  time_minutes: number
  portions: number
  category_id: number
  // vazio tira o vídeo
  video_url: string
  images: { url: string }[]
  ingredients: { name: string; amount: string }[]
  preparations: { description: string }[]
}

export interface RecipeFilters {
  search?: string
  category_id?: number
  user_id?: string
  // só as receitas prontas em até esse tempo, em minutos
  max_time?: number
  sort?: RecipeSort
  page?: number
}

// recent: mais novas (padrão); quickest: menor tempo de preparo;
// favorites: mais favoritadas.
export type RecipeSort = "recent" | "quickest" | "favorites"

export const recipesService = {
  // Das mais novas para as mais antigas, se sort não pedir outra ordem. A
  // busca ignora acento e maiúscula.
  list: async ({ search, category_id, user_id, max_time, sort, page = 1 }: RecipeFilters = {}): Promise<Page<RecipeSummary>> => {
    const res = await api.get<Page<RecipeSummary>>("/recipes", {
      params: { search: search || undefined, category_id, user_id, max_time, sort, page, per_page: PER_PAGE.recipes },
    })
    return res.data
  },

  getById: async (id: string): Promise<Recipe> => {
    const res = await api.get<Recipe>(`/recipes/${encodeURIComponent(id)}`)
    return res.data
  },

  create: async (data: RecipePayload): Promise<Recipe> => {
    const res = await api.post<Recipe>("/recipes", data)
    return res.data
  },

  // Troca a receita inteira (dados, fotos, ingredientes e passos) numa transação na API.
  replace: async (id: string, data: RecipePayload): Promise<Recipe> => {
    const res = await api.put<Recipe>(`/recipes/${encodeURIComponent(id)}`, data)
    return res.data
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/recipes/${encodeURIComponent(id)}`)
  },
}
