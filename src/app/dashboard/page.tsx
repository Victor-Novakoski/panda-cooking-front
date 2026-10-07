"use client"

import { Suspense, useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { useRecipeList } from "@/hooks/useRecipes"
import { categoriesService } from "@/services/categories.service"
import { SEARCH_MAX } from "@/lib/limits"
import { cn } from "@/lib/utils"
import { Header } from "@/components/layout/Header"
import { RecipeGrid, RecipeGridSkeleton } from "@/components/recipe/RecipeGrid"
import { Notice } from "@/components/ui/Notice"
import { Pagination } from "@/components/ui/Pagination"
import { Search, X } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <Suspense fallback={<RecipeGridSkeleton />}>
          <RecipeBrowser />
        </Suspense>
      </main>
    </>
  )
}

const chipClass =
  "shrink-0 rounded-full border-[3px] border-[#1A0A00] px-4 py-1.5 text-sm font-black shadow-[2px_2px_0px_#1A0A00] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"

// Busca, categoria e página ficam na URL (?q=&categoria=&pagina=): dá para
// compartilhar o link, e voltar da receita traz a lista como estava.
function RecipeBrowser() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const q = searchParams.get("q") ?? ""
  const categoryId = Number(searchParams.get("categoria")) || undefined
  const page = Math.max(1, Math.trunc(Number(searchParams.get("pagina"))) || 1)

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesService.getAll,
    staleTime: Infinity,
  })
  const { data, isPending, isError, isPlaceholderData } = useRecipeList({ search: q, category_id: categoryId, page })

  // O campo de busca é atualizado na hora; a URL (e a busca na API) só
  // depois de 300 ms sem digitar.
  const [search, setSearch] = useState(q)
  const [syncedQ, setSyncedQ] = useState(q)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  // A URL mudou por fora (voltar, avançar, link): o campo acompanha.
  if (q !== syncedQ) {
    setSyncedQ(q)
    setSearch(q)
  }

  function updateParams(changes: Record<string, string | undefined>) {
    // window.location e não searchParams: a busca roda num setTimeout e o
    // searchParams daquele render pode já estar velho.
    const params = new URLSearchParams(window.location.search)
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value)
      else params.delete(key)
    }
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  function onSearchChange(value: string) {
    setSearch(value)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      const next = value.trim()
      setSyncedQ(next)
      updateParams({ q: next || undefined, pagina: undefined })
    }, 300)
  }

  function clearFilters() {
    clearTimeout(timer.current)
    setSearch("")
    setSyncedQ("")
    router.replace(pathname, { scroll: false })
  }

  function goToPage(p: number) {
    updateParams({ pagina: p > 1 ? String(p) : undefined })
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const category = categories?.find((c) => c.id === categoryId)
  const hasFilters = !!q || !!categoryId

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1.5 rounded-full border-2 border-[#1A0A00] bg-[#C0392B]" />
          <div>
            <h1 className="text-3xl font-black text-[#1A0A00]">Receitas</h1>
            <p className="text-sm font-semibold text-[#1A0A00]/50" aria-live="polite">
              {data ? resultsLabel(data.total, q, category?.name) : "Explore o que a comunidade criou"}
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A0A00]/40" />
          <input
            type="search"
            placeholder="Buscar receitas... (ex: pao de queijo)"
            aria-label="Buscar receitas"
            value={search}
            maxLength={SEARCH_MAX}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-11 w-full rounded-xl border-[3px] border-[#1A0A00] bg-white pl-9 pr-4 text-sm font-semibold text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] placeholder:text-[#1A0A00]/30 focus:border-[#C0392B] focus:outline-none"
          />
        </div>
      </div>

      {/* Categorias */}
      <div className="-mx-4 mb-8 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0" role="group" aria-label="Filtrar por categoria">
        <button
          type="button"
          aria-pressed={!categoryId}
          onClick={() => updateParams({ categoria: undefined, pagina: undefined })}
          className={cn(chipClass, !categoryId ? "bg-[#C0392B] text-white" : "bg-white text-[#1A0A00] hover:bg-[#F5E6C8]")}
        >
          Todas
        </button>
        {categories?.map((c) => (
          <button
            key={c.id}
            type="button"
            aria-pressed={c.id === categoryId}
            onClick={() => updateParams({ categoria: c.id === categoryId ? undefined : String(c.id), pagina: undefined })}
            className={cn(
              chipClass,
              c.id === categoryId ? "bg-[#C0392B] text-white" : "bg-white text-[#1A0A00] hover:bg-[#F5E6C8]"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {isPending && <RecipeGridSkeleton />}

      {isError && !data && (
        <Notice emoji="😕" title="Não foi possível carregar as receitas." role="alert">
          Tente de novo daqui a pouco.
        </Notice>
      )}

      {data && data.items.length > 0 && (
        <div className={cn("transition-opacity", isPlaceholderData && "opacity-60")}>
          <RecipeGrid recipes={data.items} />
          <Pagination page={data.page} totalPages={data.total_pages} onChange={goToPage} />
        </div>
      )}

      {data && data.items.length === 0 && (
        <Notice emoji="🔍" title={data.total > 0 ? "Esta página não tem receitas." : "Nenhuma receita encontrada."}>
          {data.total > 0 ? (
            <button type="button" onClick={() => goToPage(1)} className="font-black text-[#C0392B] hover:underline">
              Voltar para a primeira página
            </button>
          ) : hasFilters ? (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-1 font-black text-[#C0392B] hover:underline"
            >
              <X className="h-4 w-4" /> Limpar busca e filtros
            </button>
          ) : (
            "Que tal publicar a primeira?"
          )}
        </Notice>
      )}
    </>
  )
}

function resultsLabel(total: number, q: string, category?: string) {
  const count = total === 1 ? "1 receita" : `${total} receitas`
  const parts = [count]
  if (q) parts.push(`para “${q}”`)
  if (category) parts.push(`em ${category}`)
  return parts.join(" ")
}
