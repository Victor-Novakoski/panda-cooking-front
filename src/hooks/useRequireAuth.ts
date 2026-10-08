"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"

// Páginas que exigem login. O proxy.ts já manda para o login quem chega sem
// o cookie da sessão; isto cobre a sessão que acabou com a página aberta
// (ou o cookie que sobrou de uma sessão encerrada).
export function useRequireAuth() {
  const status = useAuthStore((s) => s.status)
  const endedHere = useAuthStore((s) => s.endedHere)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === "anonymous" && !endedHere) {
      router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [status, endedHere, router, pathname])

  return status
}
