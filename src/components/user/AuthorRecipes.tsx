"use client"

import { useState } from "react"
import { useRecipeList } from "@/hooks/useRecipes"
import { cn } from "@/lib/utils"
import { RecipeGrid } from "@/components/recipe/RecipeGrid"
import { Notice } from "@/components/ui/Notice"
import { Pagination } from "@/components/ui/Pagination"
import type { Page, RecipeSummary } from "@/types"

interface AuthorRecipesProps {
  userId: string
  // a primeira página já vem pronta do servidor
  first: Page<RecipeSummary>
}

// Receitas de uma pessoa, paginadas. Só as páginas seguintes são buscadas
// pelo navegador.
export function AuthorRecipes({ userId, first }: AuthorRecipesProps) {
  const [page, setPage] = useState(1)
  const { data, isError, isPlaceholderData } = useRecipeList({ user_id: userId, page }, page > 1)
  const current = page === 1 ? first : data

  function goToPage(next: number) {
    setPage(next)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (isError && !current) {
    return (
      <Notice emoji="😕" title="Não foi possível carregar as receitas." role="alert">
        Tente de novo daqui a pouco.
      </Notice>
    )
  }

  // a página seguinte ainda não chegou: fica a anterior, mais apagada
  const shown = current ?? first
  return (
    <div className={cn("transition-opacity", (!current || (page > 1 && isPlaceholderData)) && "opacity-60")}>
      <RecipeGrid recipes={shown.items} />
      <Pagination page={page} totalPages={first.total_pages} onChange={goToPage} />
    </div>
  )
}
