import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { recipesService } from "@/services/recipes.service"

export const RECIPES_KEY = ["recipes"]

export function useRecipes() {
  return useQuery({
    queryKey: RECIPES_KEY,
    queryFn: recipesService.getAll,
  })
}

export function useRecipe(id: string) {
  return useQuery({
    queryKey: [...RECIPES_KEY, id],
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
