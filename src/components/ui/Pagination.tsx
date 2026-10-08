"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

// Números que aparecem: a primeira, a última e as vizinhas da atual.
// Ex.: página 6 de 12 → 1 … 5 6 7 … 12
export function pageWindow(page: number, totalPages: number): (number | "…")[] {
  const pages = new Set([1, totalPages, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  const out: (number | "…")[] = []
  for (const p of sorted) {
    const last = out[out.length - 1]
    if (typeof last === "number" && p - last > 1) out.push(p - last === 2 ? last + 1 : "…")
    out.push(p)
  }
  return out
}

const buttonClass =
  "flex h-10 min-w-10 items-center justify-center rounded-xl border-[3px] border-[#1A0A00] bg-white px-3 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F5E6C8] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-40"

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Paginação" className="mt-10 flex flex-wrap items-center justify-center gap-2">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Página anterior" className={buttonClass}>
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pageWindow(page, totalPages).map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 font-black text-[#1A0A00]/40" aria-hidden>
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            aria-label={`Página ${p}`}
            aria-current={p === page ? "page" : undefined}
            className={cn(buttonClass, p === page && "bg-[#D4A017] hover:bg-[#D4A017]")}
          >
            {p}
          </button>
        )
      )}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Próxima página" className={buttonClass}>
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
