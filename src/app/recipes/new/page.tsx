"use client"

import { useRouter } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { recipesService } from "@/services/recipes.service"
import { Header } from "@/components/layout/Header"
import { RecipeForm } from "@/components/recipe/RecipeForm"

export default function NewRecipePage() {
  const router = useRouter()

  const { mutate, isPending, error } = useMutation({
    mutationFn: recipesService.create,
    onSuccess: (recipe) => router.push(`/recipes/${recipe.id}`),
  })

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1A0A00]">🍳 Nova receita</h1>
          <p className="mt-1 text-sm font-semibold text-[#1A0A00]/50">Compartilhe sua criação com a comunidade</p>
        </div>

        <RecipeForm
          onSubmit={(payload) => mutate(payload)}
          isPending={isPending}
          errorMessage={error ? "Erro ao criar receita. Verifique os campos e tente novamente." : undefined}
          submitLabel="🥢 Publicar receita"
          pendingLabel="Publicando..."
        />
      </main>
    </>
  )
}
