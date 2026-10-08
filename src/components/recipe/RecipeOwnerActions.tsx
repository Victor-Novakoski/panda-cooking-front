"use client"

import Link from "next/link"
import { useAuthStore } from "@/store/auth.store"
import { Pencil } from "lucide-react"

// A página da receita é renderizada no servidor, que não sabe quem está
// logado; o botão de editar aparece no navegador, só para quem criou a receita.
export function RecipeOwnerActions({ recipeId, ownerId }: { recipeId: string; ownerId: string }) {
  const user = useAuthStore((s) => s.user)
  if (!user || user.id !== ownerId) return null

  return (
    <Link
      href={`/recipes/${recipeId}/edit`}
      className="flex items-center justify-center gap-2 rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] px-5 py-2.5 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F0C040] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      <Pencil className="h-4 w-4" /> Editar receita
    </Link>
  )
}
