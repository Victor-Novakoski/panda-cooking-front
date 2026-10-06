import { useMutation, useQueryClient } from "@tanstack/react-query"
import { favoritesService } from "@/services/favorites.service"

export function useToggleFavorite() {
  const queryClient = useQueryClient()

  const add = useMutation({
    mutationFn: favoritesService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
  })

  const remove = useMutation({
    mutationFn: favoritesService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites"] })
    },
  })

  return { add, remove }
}
