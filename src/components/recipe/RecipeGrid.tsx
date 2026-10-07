import type { RecipeSummary } from "@/types"
import { RecipeCard } from "./RecipeCard"

const gridClass = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

export function RecipeGrid({ recipes }: { recipes: RecipeSummary[] }) {
  return (
    <div className={gridClass}>
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}

// Esqueleto enquanto a lista carrega.
export function RecipeGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className={gridClass} aria-busy="true" aria-label="Carregando receitas">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-72 animate-pulse rounded-2xl border-[3px] border-[#1A0A00]/20 bg-[#F5E6C8]" />
      ))}
    </div>
  )
}
