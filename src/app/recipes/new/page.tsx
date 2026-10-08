"use client"

import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { recipesService, type RecipePayload } from "@/services/recipes.service"
import { RECIPES_KEY, recipeKey } from "@/hooks/useRecipes"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { Header } from "@/components/layout/Header"
import { SessionNotice } from "@/components/layout/SessionNotice"
import { RecipeForm } from "@/components/recipe/RecipeForm"

export default function NewRecipePage() {
  const status = useRequireAuth()
  const router = useRouter()
  const queryClient = useQueryClient()

  async function create(payload: RecipePayload) {
    const recipe = await recipesService.create(payload)
    queryClient.setQueryData(recipeKey(recipe.id), recipe)
    queryClient.invalidateQueries({ queryKey: [...RECIPES_KEY, "list"] })
    router.push(`/recipes/${recipe.id}`)
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1A0A00]">🍳 Nova receita</h1>
          <p className="mt-1 text-sm font-semibold text-[#1A0A00]/50">Compartilhe sua criação com a comunidade</p>
        </div>

        {status === "authenticated" ? (
          <RecipeForm
            onSubmit={create}
            errorFallback="Não foi possível publicar a receita. Tente novamente."
            submitLabel="🥢 Publicar receita"
            pendingLabel="Publicando..."
          />
        ) : (
          <SessionNotice status={status} />
        )}
      </main>
    </>
  )
}
