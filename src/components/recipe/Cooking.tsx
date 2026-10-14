"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { RECIPE } from "@/lib/limits"
import { scaleAmount } from "@/lib/portions"
import { cn } from "@/lib/utils"
import type { IngredientRecipe, Preparation } from "@/types"
import { portionsLabel } from "./format"
import { Check, ClipboardCopy, Minus, Plus } from "lucide-react"

interface CookingState {
  base: number
  portions: number
  setPortions: (portions: number) => void
  // ingredientes e passos que a pessoa já marcou ("i:12", "p:3")
  done: ReadonlySet<string>
  toggle: (key: string) => void
  setDone: (key: string, value: boolean) => void
  clearDone: () => void
}

const CookingContext = createContext<CookingState | null>(null)

export const ingredientKey = (item: IngredientRecipe) => `i:${item.id}`
export const stepKey = (step: Preparation) => `p:${step.id}`

// O que a pessoa está fazendo com a receita aberta: para quantas porções vai
// cozinhar e o que já marcou como feito. Fica em volta da página da receita,
// para a lista de ingredientes, o modo de preparo e o modo cozinha
// mostrarem a mesma coisa. Nada é guardado: recarregar a página começa de novo.
export function CookingProvider({ base, children }: { base: number; children: ReactNode }) {
  const [portions, setPortions] = useState(base)
  const [done, setDoneSet] = useState<ReadonlySet<string>>(() => new Set())

  const setDone = useCallback((key: string, value: boolean) => {
    setDoneSet((current) => {
      if (current.has(key) === value) return current
      const next = new Set(current)
      if (value) next.add(key)
      else next.delete(key)
      return next
    })
  }, [])
  const toggle = useCallback((key: string) => {
    setDoneSet((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])
  const clearDone = useCallback(() => setDoneSet(new Set()), [])

  const value = useMemo(
    () => ({ base, portions, setPortions, done, toggle, setDone, clearDone }),
    [base, portions, done, toggle, setDone, clearDone]
  )
  return <CookingContext.Provider value={value}>{children}</CookingContext.Provider>
}

export function useCooking() {
  return useContext(CookingContext)
}

// Ingredientes com a quantidade ajustada para as porções escolhidas. Fora
// do CookingProvider, devolve a lista como veio.
export function useScaledIngredients(ingredients: IngredientRecipe[]) {
  const state = useContext(CookingContext)
  const base = state?.base
  const portions = state?.portions
  return useMemo(() => {
    if (!base || !portions || portions === base) return ingredients
    const factor = portions / base
    return ingredients.map((item) => ({ ...item, amount: scaleAmount(item.amount, factor) }))
  }, [ingredients, base, portions])
}

const stepClass =
  "flex h-8 w-8 items-center justify-center rounded-lg border-2 border-[#1A0A00] bg-white text-[#1A0A00] shadow-[2px_2px_0px_#1A0A00] transition-all hover:bg-[#F5E6C8] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-30 disabled:shadow-none"

// a caixinha fica escondida (sr-only); o contorno do foco vai no item inteiro
const focusRing = "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#C0392B]"

// Item que dá para riscar: o marcador vira uma caixinha. No papel sai sem
// risco, como se nada estivesse marcado.
export function CheckItem({ checked, onToggle, label, children, className }: {
  checked: boolean
  onToggle: () => void
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn(focusRing, "group flex cursor-pointer items-start gap-2.5 rounded print:cursor-auto", className)}>
      <input type="checkbox" checked={checked} onChange={onToggle} aria-label={label} className="sr-only" />
      <span
        aria-hidden
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 border-[#1A0A00] transition-colors print:bg-white",
          checked ? "bg-[#27AE60]" : "bg-white group-hover:bg-[#F5E6C8]"
        )}
      >
        {checked && <Check className="h-3 w-3 text-white print:hidden" strokeWidth={4} />}
      </span>
      <span className={cn("transition-opacity print:no-underline print:opacity-100", checked && "line-through opacity-50")}>
        {children}
      </span>
    </label>
  )
}

// Lista de ingredientes com o ajuste de porções ("− 4 porções +"), para
// riscar o que já separou e copiar como lista de compras.
export function IngredientList({ ingredients, recipeName }: { ingredients: IngredientRecipe[]; recipeName?: string }) {
  const state = useContext(CookingContext)
  const scaled = useScaledIngredients(ingredients)
  const missing = state ? scaled.filter((item) => !state.done.has(ingredientKey(item))) : scaled

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
        {scaled.map((item) => {
          const text = (
            <>
              <span className="font-black text-[#1A0A00]">{item.amount}</span>
              <span className="font-semibold text-[#1A0A00]/60 print:text-black"> {item.name}</span>
            </>
          )
          return (
            <li key={item.id} className="border-b-2 border-dashed border-[#F5E6C8] pb-2 text-sm last:border-0 last:pb-0">
              {state ? (
                <CheckItem
                  checked={state.done.has(ingredientKey(item))}
                  onToggle={() => state.toggle(ingredientKey(item))}
                  label={`${item.amount} ${item.name}`}
                >
                  {text}
                </CheckItem>
              ) : (
                <span className="flex items-start gap-2.5">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full border-2 border-[#1A0A00] bg-[#C0392B]" />
                  <span>{text}</span>
                </span>
              )}
            </li>
          )
        })}
      </ul>

      {state && state.portions !== state.base && (
        <p className="mt-3 text-xs font-semibold text-[#1A0A00]/50 print:hidden">
          Quantidades recalculadas a partir da receita original ({portionsLabel(state.base)}). Confira as que vêm
          escritas por extenso, como “a gosto”.
        </p>
      )}

      {state && (
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t-2 border-dashed border-[#F5E6C8] pt-4 print:hidden">
          <CopyIngredients
            items={missing}
            title={recipeName ? `${recipeName} (${portionsLabel(state.portions)})` : portionsLabel(state.portions)}
            partial={missing.length < scaled.length}
          />
          {state.done.size > 0 && (
            <button type="button" onClick={state.clearDone} className="text-xs font-black text-[#C0392B] hover:underline">
              Desmarcar tudo
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// Copia a lista de ingredientes como texto, para colar no WhatsApp ou nas
// notas. Com algum item marcado, copia só os que faltam.
function CopyIngredients({ items, title, partial }: { items: IngredientRecipe[]; title: string; partial: boolean }) {
  const [feedback, setFeedback] = useState<"copied" | "failed" | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)
  useEffect(() => () => clearTimeout(timer.current), [])

  async function copy() {
    const text = [`Ingredientes: ${title}`, ...items.map((item) => `- ${item.amount} ${item.name}`)].join("\n")
    try {
      await navigator.clipboard.writeText(text)
      setFeedback("copied")
    } catch {
      setFeedback("failed")
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setFeedback(null), 2500)
  }

  if (items.length === 0) return null
  return (
    <button
      type="button"
      onClick={copy}
      className="flex items-center gap-1.5 rounded-lg border-2 border-[#1A0A00] bg-white px-3 py-1.5 text-xs font-black text-[#1A0A00] shadow-[2px_2px_0px_#1A0A00] transition-all hover:bg-[#F5E6C8] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      {feedback === "copied" ? <Check className="h-3.5 w-3.5" aria-hidden /> : <ClipboardCopy className="h-3.5 w-3.5" aria-hidden />}
      <span aria-live="polite">
        {feedback === "copied"
          ? "Lista copiada!"
          : feedback === "failed"
            ? "Não deu para copiar"
            : partial
              ? `Copiar os que faltam (${items.length})`
              : "Copiar lista de compras"}
      </span>
    </button>
  )
}

// Modo de preparo com os passos para riscar conforme vai fazendo.
export function StepList({ steps }: { steps: Preparation[] }) {
  const state = useContext(CookingContext)

  return (
    <ol className="flex flex-col gap-4">
      {steps.map((step, index) => {
        const checked = state?.done.has(stepKey(step)) ?? false
        const number = (
          <span
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#1A0A00] text-sm font-black text-white shadow-[2px_2px_0px_#1A0A00] transition-colors print:bg-[#C0392B]",
              checked ? "bg-[#27AE60]" : "bg-[#C0392B]"
            )}
          >
            {checked ? <Check className="h-4 w-4 print:hidden" strokeWidth={4} aria-hidden /> : index + 1}
            {checked && <span className="hidden print:inline">{index + 1}</span>}
          </span>
        )
        const text = (
          <p
            className={cn(
              "whitespace-pre-line pt-1 text-sm font-semibold leading-relaxed text-[#1A0A00]/70 transition-opacity print:text-black print:no-underline print:opacity-100",
              checked && "line-through opacity-50"
            )}
          >
            {step.description}
          </p>
        )
        return (
          <li key={step.id} className="break-inside-avoid">
            {state ? (
              <label className={cn(focusRing, "flex cursor-pointer gap-4 rounded-lg print:cursor-auto")}>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => state.toggle(stepKey(step))}
                  aria-label={`Passo ${index + 1} feito`}
                  className="sr-only"
                />
                {number}
                {text}
              </label>
            ) : (
              <div className="flex gap-4">
                {number}
                {text}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}
