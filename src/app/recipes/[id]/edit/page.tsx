"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { recipesService, type RecipePayload } from "@/services/recipes.service"
import { apiErrorMessage } from "@/services/api"
import { RECIPES_KEY, useRecipe } from "@/hooks/useRecipes"
import { useAuthStore } from "@/store/auth.store"
import { Header } from "@/components/layout/Header"
import { RecipeForm, recipeToForm } from "@/components/recipe/RecipeForm"
import { ArrowLeft, Trash2 } from "lucide-react"

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: recipe, isLoading, isError } = useRecipe(id)

  const save = useMutation({
    mutationFn: (payload: RecipePayload) => recipesService.replace(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData([...RECIPES_KEY, id], updated)
      queryClient.invalidateQueries({ queryKey: RECIPES_KEY })
      router.push(`/recipes/${id}`)
      // A página da receita é renderizada no servidor; sem refresh ela mostraria a versão antiga.
      router.refresh()
    },
  })

  const remove = useMutation({
    mutationFn: () => recipesService.delete(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [...RECIPES_KEY, id] })
      queryClient.invalidateQueries({ queryKey: RECIPES_KEY })
      router.push("/profile")
    },
  })

  function handleSubmit(payload: RecipePayload) {
    // O formulário edita a foto principal; as outras fotos da receita continuam.
    const otherImages = recipe?.images?.slice(1).map(({ url }) => ({ url })) ?? []
    save.mutate({ ...payload, images: [...payload.images, ...otherImages] })
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <Link
          href={`/recipes/${id}`}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-black text-[#1A0A00]/50 hover:text-[#C0392B]"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para a receita
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1A0A00]">✏️ Editar receita</h1>
          {recipe && <p className="mt-1 text-sm font-semibold text-[#1A0A00]/50">{recipe.name}</p>}
        </div>

        {isLoading && (
          <div className="h-96 animate-pulse rounded-2xl border-[3px] border-[#1A0A00]/20 bg-[#F5E6C8]" />
        )}

        {isError && (
          <Notice emoji="🍽️" text="Receita não encontrada." />
        )}

        {recipe && user?.id !== recipe.user_id && (
          <Notice emoji="🔒" text="Só quem criou a receita pode editá-la." />
        )}

        {recipe && user?.id === recipe.user_id && (
          <div className="flex flex-col gap-6">
            <RecipeForm
              key={recipe.id}
              defaultValues={recipeToForm(recipe)}
              onSubmit={handleSubmit}
              isPending={save.isPending}
              errorMessage={save.error ? apiErrorMessage(save.error, "Erro ao salvar. Verifique os campos e tente novamente.") : undefined}
              submitLabel="💾 Salvar alterações"
              pendingLabel="Salvando..."
            />

            <section className="rounded-2xl border-[3px] border-dashed border-[#C0392B] bg-[#C0392B]/5 p-6">
              <h2 className="font-black text-[#C0392B]">Apagar receita</h2>
              <p className="mt-1 text-sm font-semibold text-[#1A0A00]/60">
                A receita sai do site junto com fotos, comentários e favoritos. Não dá para desfazer.
              </p>
              {confirmDelete ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => remove.mutate()}
                    disabled={remove.isPending}
                    className="flex items-center gap-1.5 rounded-xl border-[3px] border-[#8B1A1A] bg-[#C0392B] px-4 py-2 text-sm font-black text-white shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#E74C3C] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60"
                  >
                    <Trash2 className="h-4 w-4" /> {remove.isPending ? "Apagando..." : "Sim, apagar"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-xl border-[3px] border-[#1A0A00] bg-white px-4 py-2 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00]"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="mt-4 flex items-center gap-1.5 rounded-xl border-[3px] border-[#C0392B] bg-white px-4 py-2 text-sm font-black text-[#C0392B] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#C0392B]/10"
                >
                  <Trash2 className="h-4 w-4" /> Apagar receita
                </button>
              )}
              {remove.error && (
                <p role="alert" className="mt-3 text-sm font-bold text-[#C0392B]">
                  {apiErrorMessage(remove.error, "Não foi possível apagar a receita.")}
                </p>
              )}
            </section>
          </div>
        )}
      </main>
    </>
  )
}

function Notice({ emoji, text }: { emoji: string; text: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-[3px] border-dashed border-[#D4A017] bg-[#F5E6C8] py-16 text-center">
      <div className="mb-3 text-5xl">{emoji}</div>
      <p className="font-black text-[#1A0A00]">{text}</p>
    </div>
  )
}
