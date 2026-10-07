"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { recipesService, type RecipePayload } from "@/services/recipes.service"
import { apiErrorMessage, apiStatus } from "@/services/api"
import { RECIPES_KEY, recipeKey, useRecipe } from "@/hooks/useRecipes"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { useAuthStore } from "@/store/auth.store"
import { Header } from "@/components/layout/Header"
import { SessionNotice } from "@/components/layout/SessionNotice"
import { RecipeForm, recipeToForm } from "@/components/recipe/RecipeForm"
import { Notice } from "@/components/ui/Notice"
import { ArrowLeft, Trash2 } from "lucide-react"

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>()
  const status = useRequireAuth()
  const user = useAuthStore((s) => s.user)
  const router = useRouter()
  const queryClient = useQueryClient()

  const { data: recipe, isPending, isError, error } = useRecipe(id)

  async function save(payload: RecipePayload) {
    const updated = await recipesService.replace(id, payload)
    queryClient.setQueryData(recipeKey(id), updated)
    queryClient.invalidateQueries({ queryKey: [...RECIPES_KEY, "list"] })
    router.push(`/recipes/${id}`)
    // A página da receita é renderizada no servidor; sem refresh, o Next mostraria a versão em cache do roteador.
    router.refresh()
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6">
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

        {status !== "authenticated" ? (
          <SessionNotice status={status} />
        ) : isPending ? (
          <div className="h-96 animate-pulse rounded-2xl border-[3px] border-[#1A0A00]/20 bg-[#F5E6C8]" aria-busy="true" />
        ) : isError ? (
          apiStatus(error) === 404 ? (
            <Notice emoji="🍽️" title="Receita não encontrada." />
          ) : (
            <Notice emoji="😕" title="Não foi possível carregar a receita." role="alert">
              {apiErrorMessage(error, "Tente de novo daqui a pouco.")}
            </Notice>
          )
        ) : user?.id !== recipe.author.id ? (
          <Notice emoji="🔒" title="Só quem criou a receita pode editá-la." />
        ) : (
          <div className="flex flex-col gap-6">
            <RecipeForm
              key={recipe.id}
              defaultValues={recipeToForm(recipe)}
              onSubmit={save}
              errorFallback="Não foi possível salvar. Verifique os campos e tente novamente."
              submitLabel="💾 Salvar alterações"
              pendingLabel="Salvando..."
            />
            <DeleteRecipe id={id} />
          </div>
        )}
      </main>
    </>
  )
}

function DeleteRecipe({ id }: { id: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [confirming, setConfirming] = useState(false)

  const remove = useMutation({
    mutationFn: () => recipesService.delete(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: recipeKey(id) })
      queryClient.invalidateQueries({ queryKey: RECIPES_KEY })
      router.push("/profile")
    },
  })

  return (
    <section className="rounded-2xl border-[3px] border-dashed border-[#C0392B] bg-[#C0392B]/5 p-6">
      <h2 className="font-black text-[#C0392B]">Apagar receita</h2>
      <p className="mt-1 text-sm font-semibold text-[#1A0A00]/60">
        A receita sai do site junto com fotos, comentários e favoritos. Não dá para desfazer.
      </p>
      {confirming ? (
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
            onClick={() => setConfirming(false)}
            className="rounded-xl border-[3px] border-[#1A0A00] bg-white px-4 py-2 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00]"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
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
  )
}
