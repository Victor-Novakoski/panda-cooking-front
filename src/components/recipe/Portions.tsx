"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { RECIPE } from "@/lib/limits"
import { scaleAmount } from "@/lib/portions"
import type { IngredientRecipe } from "@/types"
import { portionsLabel } from "./format"
import { Minus, Plus } from "lucide-react"

interface PortionsState {
  base: number
  portions: number
  setPortions: (portions: number) => void
}

const PortionsContext = createContext<PortionsState | null>(null)

// Guarda para quantas porções a pessoa quer cozinhar. Fica em volta da
// página da receita: a lista de ingredientes e o modo cozinha mostram as
// mesmas quantidades.
export function PortionsProvider({ base, children }: { base: number; children: ReactNode }) {
  const [portions, setPortions] = useState(base)
  const value = useMemo(() => ({ base, portions, setPortions }), [base, portions])
  return <PortionsContext.Provider value={value}>{children}</PortionsContext.Provider>
}

// Ingredientes com a quantidade ajustada para as porções escolhidas. Fora
// do PortionsProvider, devolve a lista como veio.
export function useScaledIngredients(ingredients: IngredientRecipe[]) {
  const state = useContext(PortionsContext)
  return useMemo(() => {
    if (!state || state.portions === state.base) return ingredients
    const factor = state.portions / state.base
    return ingredients.map((item) => ({ ...item, amount: scaleAmount(item.amount, factor) }))
  }, [ingredients, state])
}

const stepClass =
  "flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#1A0A00] bg-white text-[#1A0A00] shadow-[2px_2px_0px_#1A0A00] transition-all hover:bg-[#F5E6C8] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-30 disabled:shadow-none"

// Lista de ingredientes com o ajuste de porções ("− 4 porções +").
export function IngredientList({ ingredients }: { ingredients: IngredientRecipe[] }) {
  const state = useContext(PortionsContext)
  const scaled = useScaledIngredients(ingredients)

  return (
    <div className="rounded-2xl border-[3px] border-[#1A0A00] bg-white p-5 shadow-[4px_4px_0px_#1A0A00] print:border-0 print:p-0 print:shadow-none">
      <p className="mb-4 text-xs font-black uppercase tracking-widest text-[#1A0A00]/40 print:text-xl print:normal-case print:tracking-normal print:text-black">
        <span className="print:hidden">🥢 </span>Ingredientes
      </p>

      {state && (
        <div className="mb-4 flex flex-wrap items-center gap-2 border-b-2 border-dashed border-[#F5E6C8] pb-4 print:mb-2 print:border-0 print:pb-0">
          <div className="flex items-center gap-2 print:hidden" role="group" aria-label="Ajustar porções">
            <button
              type="button"
              onClick={() => state.setPortions(state.portions - 1)}
              disabled={state.portions <= RECIPE.portionsMin}
              aria-label="Menos uma porção"
              className={stepClass}
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="min-w-24 text-center text-sm font-black text-[#1A0A00]" aria-live="polite">
              {portionsLabel(state.portions)}
            </span>
            <button
              type="button"
              onClick={() => state.setPortions(state.portions + 1)}
              disabled={state.portions >= RECIPE.portionsMax}
              aria-label="Mais uma porção"
              className={stepClass}
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {/* no papel, para quantas porções são as quantidades impressas */}
          <span className="hidden text-sm font-semibold text-black print:inline">Para {portionsLabel(state.portions)}</span>
          {state.portions !== state.base && (
            <button
              type="button"
              onClick={() => state.setPortions(state.base)}
              className="text-xs font-black text-[#C0392B] hover:underline print:hidden"
            >
              Voltar para {state.base}
            </button>
          )}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {scaled.map((item) => (
          <li key={item.id} className="flex items-start gap-2.5 border-b-2 border-dashed border-[#F5E6C8] pb-2 text-sm last:border-0 last:pb-0">
            <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full border-2 border-[#1A0A00] bg-[#C0392B]" />
            <span>
              <span className="font-black text-[#1A0A00]">{item.amount}</span>
              <span className="font-semibold text-[#1A0A00]/60 print:text-black"> {item.name}</span>
            </span>
          </li>
        ))}
      </ul>

      {state && state.portions !== state.base && (
        <p className="mt-3 text-xs font-semibold text-[#1A0A00]/50 print:hidden">
          Quantidades recalculadas a partir da receita original ({portionsLabel(state.base)}). Confira as que vêm
          escritas por extenso, como “a gosto”.
        </p>
      )}
    </div>
  )
}
