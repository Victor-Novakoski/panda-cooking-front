"use client"

import { useState } from "react"
import { useRecipes } from "@/hooks/useRecipes"
import { Header } from "@/components/layout/Header"
import { RecipeCard } from "@/components/recipe/RecipeCard"
import { Search } from "lucide-react"

export default function DashboardPage() {
  const { data: recipes, isLoading, isError } = useRecipes()
  const [search, setSearch] = useState("")

  const filtered = recipes?.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Título da seção */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1.5 rounded-full border-2 border-[#1A0A00] bg-[#C0392B]" />
            <div>
              <h1 className="text-3xl font-black text-[#1A0A00]">Receitas</h1>
              <p className="text-sm font-semibold text-[#1A0A00]/50">
                {recipes ? `${recipes.length} receitas disponíveis` : "Explore o que a comunidade criou"}
              </p>
            </div>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#1A0A00]/40" />
            <input
              type="text"
              placeholder="Buscar receitas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-xl border-[3px] border-[#1A0A00] bg-white pl-9 pr-4 text-sm font-semibold text-[#1A0A00] placeholder:text-[#1A0A00]/30 shadow-[3px_3px_0px_#1A0A00] focus:outline-none focus:border-[#C0392B]"
            />
          </div>
        </div>

        {/* Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl border-[3px] border-[#1A0A00]/20 bg-[#F5E6C8]" />
            ))}
          </div>
        )}

        {/* Erro */}
        {isError && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-[3px] border-[#1A0A00] bg-white py-24 text-center shadow-[4px_4px_0px_#1A0A00]">
            <div className="mb-4 text-6xl">😕</div>
            <p className="font-black text-[#1A0A00]">Erro ao carregar receitas.</p>
            <p className="mt-1 text-sm font-semibold text-[#1A0A00]/50">Verifique se a API está rodando.</p>
          </div>
        )}

        {/* Grid */}
        {filtered && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filtered?.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-[3px] border-[#1A0A00] bg-white py-24 text-center shadow-[4px_4px_0px_#1A0A00]">
            <div className="mb-4 text-6xl">🔍</div>
            <p className="font-black text-[#1A0A00]">Nenhuma receita encontrada</p>
            <p className="mt-1 text-sm font-semibold text-[#1A0A00]/50">para "{search}"</p>
          </div>
        )}
      </main>
    </>
  )
}
