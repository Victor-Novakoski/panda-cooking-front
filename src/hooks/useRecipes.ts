import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { recipesService, type RecipeFilters } from "@/services/recipes.service"

export const RECIPES_KEY = ["recipes"] as const

export const recipeKey = (id: string) => [...RECIPES_KEY, "detail", id] as const

// Página da listagem. Ao trocar de página ou de filtro, mostra a página
// anterior até a nova chegar, em vez de piscar o esqueleto.
export function useRecipeList(filters: RecipeFilters, enabled = true) {
  return useQuery({
    queryKey: [...RECIPES_KEY, "list", filters],
    queryFn: () => recipesService.list(filters),
    placeholderData: keepPreviousData,
    enabled,
  })
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: recipeKey(id),
    queryFn: () => recipesService.getById(id),
    enabled: !!id,
  })
}

export function useDeleteRecipe() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: recipesService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECIPES_KEY })
    },
  })
}
