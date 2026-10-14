"use client"

import { useEffect, useRef, useState } from "react"
import type { IngredientRecipe, Preparation } from "@/types"
import { cn } from "@/lib/utils"
import { useScaledIngredients } from "./Portions"
import { ChefHat, ChevronLeft, ChevronRight, ListChecks, X } from "lucide-react"

interface CookModeProps {
  name: string
  ingredients: IngredientRecipe[]
  preparations: Preparation[]
}

// Modo cozinha: a receita em tela cheia, um passo por vez e em letra grande,
// para ler de longe com a mão ocupada. Enquanto está aberto a tela do
// aparelho não apaga (onde o navegador permite).
export function CookMode({ name, ingredients: original, preparations }: CookModeProps) {
  // as mesmas quantidades da página, já ajustadas para as porções escolhidas
  const ingredients = useScaledIngredients(original)
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [showIngredients, setShowIngredients] = useState(false)
  const dialog = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLButtonElement>(null)

  const last = preparations.length - 1

  function start() {
    setStep(0)
    setShowIngredients(false)
    setOpen(true)
  }

  function close() {
    setOpen(false)
    opener.current?.focus()
  }

  // Tela acesa. O navegador solta a trava quando a aba sai da frente; ao
  // voltar, pede de novo.
  useEffect(() => {
    if (!open || !("wakeLock" in navigator)) return
    let lock: WakeLockSentinel | null = null
    let closed = false

    async function keepAwake() {
      try {
        const next = await navigator.wakeLock.request("screen")
        if (closed) next.release().catch(() => {})
        else lock = next
      } catch {
        // bateria fraca ou permissão negada: o modo funciona do mesmo jeito
      }
    }
    function onVisible() {
      if (document.visibilityState === "visible") keepAwake()
    }

    keepAwake()
    document.addEventListener("visibilitychange", onVisible)
    return () => {
      closed = true
      document.removeEventListener("visibilitychange", onVisible)
      lock?.release().catch(() => {})
    }
  }, [open])

  // Enquanto está aberto: a página de trás não rola e o foco começa na janela.
  useEffect(() => {
    if (!open) return
    const overflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    dialog.current?.focus()
    return () => {
      document.body.style.overflow = overflow
    }
  }, [open])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") close()
    if (e.key === "ArrowLeft") setStep((s) => Math.max(0, s - 1))
    if (e.key === "ArrowRight") setStep((s) => Math.min(last, s + 1))
    // o Tab fica dando a volta dentro da janela
    if (e.key === "Tab" && dialog.current) {
      const focusable = dialog.current.querySelectorAll<HTMLElement>("button:not(:disabled)")
      const first = focusable[0]
      const end = focusable[focusable.length - 1]
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
        e.preventDefault()
        end?.focus()
      } else if (!e.shiftKey && document.activeElement === end) {
        e.preventDefault()
        first?.focus()
      }
    }
  }

  if (preparations.length === 0) return null

  const barButton =
    "flex items-center justify-center gap-2 rounded-xl border-[3px] border-[#1A0A00] px-4 py-3 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:shadow-none sm:px-6 sm:text-base"

  return (
    <>
      <button
        ref={opener}
        type="button"
        onClick={start}
        className="flex items-center justify-center gap-2 rounded-xl border-[3px] border-[#1A0A00] bg-[#C0392B] px-5 py-2.5 text-sm font-black text-white shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#A93226] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none print:hidden"
      >
        <ChefHat className="h-4 w-4" aria-hidden /> Modo cozinha
      </button>

      {open && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={`Modo cozinha: ${name}`}
          tabIndex={-1}
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-50 flex flex-col bg-[#FDF6E3] outline-none print:hidden"
        >
          <div className="flex items-center gap-3 border-b-4 border-[#D4A017] bg-[#8B1A1A] px-4 py-3 sm:px-6">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-black text-[#F0C040] sm:text-base">{name}</p>
              <p className="text-xs font-bold text-white/70" aria-live="polite">
                Passo {step + 1} de {preparations.length}
              </p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Sair do modo cozinha"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-[#1A0A00] bg-white text-[#1A0A00] shadow-[2px_2px_0px_#1A0A00] hover:bg-[#F5E6C8]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="h-2 bg-[#F5E6C8]" aria-hidden>
            <div
              className="h-full bg-[#C0392B] transition-all"
              style={{ width: `${((step + 1) / preparations.length) * 100}%` }}
            />
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-8 sm:px-10">
            {showIngredients ? (
              <div className="mx-auto max-w-2xl">
                <h2 className="mb-5 text-2xl font-black text-[#1A0A00] sm:text-3xl">Ingredientes</h2>
                <ul className="flex flex-col gap-3">
                  {ingredients.map((item) => (
                    <li key={item.id} className="border-b-2 border-dashed border-[#D4A017]/50 pb-3 text-lg sm:text-xl">
                      <span className="font-black text-[#1A0A00]">{item.amount}</span>
                      <span className="font-semibold text-[#1A0A00]/70"> {item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center gap-6">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[#1A0A00] bg-[#C0392B] text-2xl font-black text-white shadow-[3px_3px_0px_#1A0A00]">
                  {step + 1}
                </span>
                <p className="whitespace-pre-line text-2xl font-bold leading-snug text-[#1A0A00] sm:text-4xl sm:leading-snug">
                  {preparations[step].description}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t-4 border-[#1A0A00] bg-[#F5E6C8] px-4 py-3 sm:gap-3 sm:px-6">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={showIngredients || step === 0}
              aria-label="Anterior"
              className={cn(barButton, "bg-white hover:bg-[#FDF6E3]")}
            >
              {/* no celular fica só a seta, para os três botões caberem */}
              <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden /> <span className="hidden sm:inline">Anterior</span>
            </button>
            <button
              type="button"
              onClick={() => setShowIngredients((v) => !v)}
              aria-pressed={showIngredients}
              className={cn(barButton, "flex-1", showIngredients ? "bg-[#D4A017]" : "bg-white hover:bg-[#FDF6E3]")}
            >
              <ListChecks className="h-5 w-5 shrink-0" aria-hidden /> {showIngredients ? "Voltar ao passo" : "Ingredientes"}
            </button>
            {step === last && !showIngredients ? (
              <button type="button" onClick={close} className={cn(barButton, "bg-[#D4A017] hover:bg-[#F0C040]")}>
                Pronto! 🐼
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep((s) => Math.min(last, s + 1))}
                disabled={showIngredients}
                aria-label="Próximo"
                className={cn(barButton, "bg-[#D4A017] hover:bg-[#F0C040]")}
              >
                <span className="hidden sm:inline">Próximo</span> <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
