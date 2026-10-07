"use client"

import Link from "next/link"
import { useAuthStore, type SessionStatus } from "@/store/auth.store"
import { Notice } from "@/components/ui/Notice"

// O que uma página que exige login mostra enquanto a sessão não está pronta.
export function SessionNotice({ status }: { status: SessionStatus }) {
  const endedHere = useAuthStore((s) => s.endedHere)
  if (status === "unavailable") {
    return (
      <Notice emoji="🔌" title="Não foi possível conferir sua sessão." role="alert">
        O servidor não respondeu. Recarregue a página daqui a pouco.
      </Notice>
    )
  }
  if (status === "anonymous" && endedHere) {
    // Quem saiu nesta aba e voltou pelo histórico: o useRequireAuth não
    // redireciona (a saída foi de propósito), então a página oferece o login.
    return (
      <Notice emoji="🔒" title="Você não está logado.">
        <Link href="/auth/login" className="font-black text-[#C0392B] hover:underline">
          Entrar
        </Link>{" "}
        para ver esta página.
      </Notice>
    )
  }
  // carregando, ou indo para o login (useRequireAuth)
  return <div className="h-64 animate-pulse rounded-2xl border-[3px] border-[#1A0A00]/20 bg-[#F5E6C8]" aria-busy="true" />
}
