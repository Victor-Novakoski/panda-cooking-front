"use client"

import { useEffect } from "react"
import { Header } from "@/components/layout/Header"
import { Notice } from "@/components/ui/Notice"

// Erro inesperado numa página (ex.: a API fora do ar ao abrir uma receita).
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <Notice emoji="🔥" title="Algo deu errado na cozinha." role="alert">
          <p>Tente de novo daqui a pouco.</p>
          <button
            type="button"
            onClick={() => retry()}
            className="mt-4 rounded-xl border-[3px] border-[#1A0A00] bg-white px-5 py-2 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] hover:bg-[#FDF6E3]"
          >
            Tentar de novo
          </button>
        </Notice>
      </main>
    </>
  )
}
