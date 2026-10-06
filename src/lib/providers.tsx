"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { useAuthStore } from "@/store/auth.store"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // dados ficam "frescos" por 5 minutos
            retry: 1,
          },
        },
      })
  )

  // Lê a sessão salva só depois do primeiro render (ver skipHydration na store).
  useEffect(() => {
    useAuthStore.persist.rehydrate()
  }, [])

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
