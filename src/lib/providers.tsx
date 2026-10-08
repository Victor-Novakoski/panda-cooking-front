"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { refreshSession } from "@/services/api"
import { onSessionEvent, restoreSession } from "@/lib/session"
import { ME_KEY } from "@/lib/query-keys"
import { useAuthStore } from "@/store/auth.store"

export function Providers({ children, hasSession }: { children: React.ReactNode; hasSession: boolean }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60, // dados ficam "frescos" por 1 minuto
            retry: 1,
          },
        },
      })
  )

  useEffect(() => {
    void restoreSession(hasSession)
  }, [hasSession])

  // Login ou logout em outra aba: esta acompanha.
  useEffect(
    () =>
      onSessionEvent((event) => {
        queryClient.removeQueries({ queryKey: ME_KEY })
        if (event === "logout") {
          useAuthStore.getState().clearSession()
        } else {
          refreshSession().catch(() => useAuthStore.getState().setStatus("unavailable"))
        }
      }),
    [queryClient]
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
