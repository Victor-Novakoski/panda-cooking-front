"use client"

import Link from "next/link"
import { useAuthStore } from "@/store/auth.store"
import { Pencil } from "lucide-react"

// A página da receita é renderizada no servidor, que não sabe quem está
// logado; o botão de editar aparece no navegador, só para quem criou a receita.
// Receita de demonstração ninguém edita (a senha dessas contas é pública).
export function RecipeOwnerActions({ recipeId, ownerId, isDemo }: { recipeId: string; ownerId: string; isDemo: boolean }) {
  const user = useAuthStore((s) => s.user)
  if (!user || user.id !== ownerId) return null

  if (isDemo) {
    return (
      <p className="rounded-xl border-[3px] border-dashed border-[#D4A017] bg-[#F5E6C8] px-4 py-2.5 text-center text-sm font-bold text-[#1A0A00]/70">
        Receita de demonstração: não dá para editar nem apagar.
      </p>
    )
  }

  return (
    <Link
      href={`/recipes/${recipeId}/edit`}
      className="flex items-center justify-center gap-2 rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] px-5 py-2.5 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F0C040] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      <Pencil className="h-4 w-4" /> Editar receita
    </Link>
  )
}
