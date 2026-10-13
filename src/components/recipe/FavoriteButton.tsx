"use client"

import { useIsFavorite, useToggleFavorite } from "@/hooks/useFavorites"
import { useAuthStore } from "@/store/auth.store"
import { cn } from "@/lib/utils"
import { Heart } from "lucide-react"

export function FavoriteButton({ recipeId }: { recipeId: string }) {
  const status = useAuthStore((s) => s.status)
  const { data: isFavorite = false, isPending } = useIsFavorite(recipeId)
  const toggle = useToggleFavorite(recipeId)

  if (status !== "authenticated") return null

  return (
    <button
      type="button"
      onClick={() => toggle.mutate(!isFavorite)}
      disabled={isPending || toggle.isPending}
      aria-pressed={isFavorite}
      className={cn(
        "flex items-center gap-2 rounded-xl border-[3px] border-[#1A0A00] px-4 py-2 text-sm font-black shadow-[3px_3px_0px_#1A0A00] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#1A0A00] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60",
        isFavorite ? "bg-[#FDECEA] text-[#C0392B]" : "bg-white text-[#1A0A00] hover:bg-[#FDF6E3]"
      )}
    >
      <Heart
        aria-hidden
        className={cn("h-4 w-4 transition-transform", isFavorite ? "scale-110 fill-[#E0245E] text-[#E0245E]" : "text-[#1A0A00]")}
      />
      {isFavorite ? "Favoritada" : "Favoritar"}
    </button>
  )
}
