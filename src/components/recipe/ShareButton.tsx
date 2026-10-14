"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Share2 } from "lucide-react"

// No celular abre o compartilhamento do aparelho (WhatsApp e afins); onde
// isso não existe, copia o link da página.
export function ShareButton({ title }: { title: string }) {
  const [feedback, setFeedback] = useState<"copied" | "failed" | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function share() {
    const url = window.location.href
    if (typeof navigator.share === "function") {
      // fechar a janela de compartilhar sem escolher nada cai no catch: não é erro
      await navigator.share({ title, url }).catch(() => {})
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setFeedback("copied")
    } catch {
      setFeedback("failed")
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setFeedback(null), 2500)
  }

  return (
    <button
      type="button"
      onClick={share}
      className="flex items-center justify-center gap-2 rounded-xl border-[3px] border-[#1A0A00] bg-white px-3 py-2.5 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F5E6C8] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none print:hidden"
    >
      {feedback === "copied" ? <Check className="h-4 w-4 shrink-0" aria-hidden /> : <Share2 className="h-4 w-4 shrink-0" aria-hidden />}
      <span aria-live="polite">
        {feedback === "copied" ? "Link copiado!" : feedback === "failed" ? "Não deu para copiar o link" : "Compartilhar"}
      </span>
    </button>
  )
}
