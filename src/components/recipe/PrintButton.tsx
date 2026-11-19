"use client"

import { Printer } from "lucide-react"

// Abre a impressão do navegador. O que sai no papel (só título, ingredientes
// e modo de preparo) é decidido pelas classes print: da página da receita.
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex items-center justify-center gap-2 rounded-xl border-[3px] border-[#1A0A00] bg-white px-3 py-2.5 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F5E6C8] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none print:hidden"
    >
      <Printer className="h-4 w-4 shrink-0" aria-hidden /> Imprimir
    </button>
  )
}
