"use client"

import { useLinkStatus } from "next/link"
import { cn } from "@/lib/utils"

// Esmaece o card enquanto a página da receita carrega. A receita não tem
// loading.tsx de propósito: com ele a resposta começa antes de saber se a
// receita existe, e a receita apagada voltaria 200 em vez de 404. O atraso
// evita piscar quando a navegação é rápida.
export function LinkPending() {
  const { pending } = useLinkStatus()
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 bg-[#FDF6E3] transition-opacity",
        pending ? "animate-pulse opacity-60 delay-150" : "opacity-0"
      )}
    />
  )
}
