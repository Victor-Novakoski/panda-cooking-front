import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { favoritesService } from "@/services/favorites.service"
import { usersService } from "@/services/users.service"
import { apiStatus } from "@/services/api"
import { ME_KEY } from "@/lib/query-keys"
import { useAuthStore } from "@/store/auth.store"

const favoritesKey = [...ME_KEY, "favorites"] as const
const favoriteKey = (recipeId: string) => [...favoritesKey, "status", recipeId] as const

export function useFavoriteList(page: number, enabled = true) {
  return useQuery({
    queryKey: [...favoritesKey, "list", page],
    queryFn: () => usersService.favorites(page),
    placeholderData: keepPreviousData,
    enabled,
  })
}

// Se a receita está nos favoritos de quem está logado.
export function useIsFavorite(recipeId: string) {
  const status = useAuthStore((s) => s.status)
  return useQuery({
    queryKey: favoriteKey(recipeId),
    queryFn: () => favoritesService.isFavorite(recipeId),
    enabled: status === "authenticated",
  })
}

// Favorita ou desfavorita. O botão muda na hora; se a API recusar, volta.
export function useToggleFavorite(recipeId: string) {
  const queryClient = useQueryClient()
  const key = favoriteKey(recipeId)

  return useMutation({
    mutationFn: async (favorite: boolean) => {
      try {
        await (favorite ? favoritesService.add(recipeId) : favoritesService.remove(recipeId))
      } catch (error) {
        // Já estava como a pessoa queria (clique em duas abas): não é erro.
        const status = apiStatus(error)
        if ((favorite && status === 409) || (!favorite && status === 404)) return
        throw error
      }
    },
    onMutate: async (favorite) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<boolean>(key)
      queryClient.setQueryData(key, favorite)
      return { previous }
    },
    onError: (_error, _favorite, context) => {
      queryClient.setQueryData(key, context?.previous)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoritesKey })
    },
  })
}
