"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { favoritesService } from "@/services/favorites.service"
import { usersService } from "@/services/users.service"
import { useAuthStore } from "@/store/auth.store"

interface FavoriteButtonProps {
  recipeId: string
}

export function FavoriteButton({ recipeId }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()

  const { data: favorites } = useQuery({
    queryKey: ["favorites"],
    queryFn: usersService.getFavorites,
    enabled: isAuthenticated(),
  })

  const isFavorited = favorites?.some((r) => r.id === recipeId) ?? false

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      isFavorited ? favoritesService.remove(recipeId) : favoritesService.add(recipeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  })

  if (!isAuthenticated()) return null

  return (
    <button
      onClick={() => mutate()}
      disabled={isPending}
      className={`flex items-center gap-2 rounded-xl border-[3px] border-[#1A0A00] px-4 py-2 text-sm font-black shadow-[3px_3px_0px_#1A0A00] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1A0A00] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50 ${
        isFavorited
          ? "bg-[#C0392B] text-white"
          : "bg-white text-[#1A0A00] hover:bg-[#FDF6E3]"
      }`}
    >
      {isPending ? "..." : isFavorited ? "❤️ Favoritado" : "🤍 Favoritar"}
    </button>
  )
}
