import { api } from "./api"
import type { Category } from "@/types"

export const categoriesService = {
  // As categorias são fixas, em ordem alfabética.
  getAll: async (): Promise<Category[]> => {
    const res = await api.get<Category[]>("/categories")
    return res.data
  },
}
