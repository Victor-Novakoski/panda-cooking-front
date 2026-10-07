"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/store/auth.store"
import { logout } from "@/lib/session"
import { ME_KEY } from "@/lib/query-keys"
import { Avatar } from "@/components/user/Avatar"
import { LogOut, Plus } from "lucide-react"

export function HeaderNav() {
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const queryClient = useQueryClient()
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  async function handleLogout() {
    await logout()
    queryClient.removeQueries({ queryKey: ME_KEY })
    router.push("/")
  }

  // Enquanto confere a sessão (logo que a página abre), um espaço do mesmo
  // tamanho: nem "Entrar" piscando para quem está logado, nem o contrário.
  if (status === "loading") {
    return <div className="ml-2 h-9 w-24 sm:w-40" aria-hidden />
  }

  if (status === "authenticated" && user) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          href="/recipes/new"
          aria-label="Nova receita"
          className="ml-1 flex items-center gap-1.5 rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] px-3 py-1.5 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F0C040] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none sm:ml-2 sm:px-4"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden md:inline">Nova receita</span>
        </Link>
        <Link
          href="/profile"
          className={`flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-bold transition-colors sm:px-3 ${
            isActive("/profile")
              ? "bg-white/20 text-[#F0C040]"
              : "text-[#F0C040]/80 hover:bg-white/10 hover:text-[#F0C040]"
          }`}
        >
          <Avatar src={user.image_profile} size="sm" className="border-[#D4A017]" />
          <span className="hidden sm:block">{user.name.split(" ")[0]}</span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Sair"
          title="Sair"
          className="rounded-lg p-2 text-[#F0C040]/60 transition-colors hover:bg-white/10 hover:text-[#F0C040]"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="ml-1 flex items-center gap-2 sm:ml-2">
      <Link
        href="/auth/login"
        className="rounded-xl border-[3px] border-[#D4A017] px-3 py-1.5 text-sm font-black text-[#F0C040] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-white/10 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none sm:px-4"
      >
        Entrar
      </Link>
      <Link
        href="/auth/register"
        className="hidden rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] px-4 py-1.5 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F0C040] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none sm:block"
      >
        🍜 Cadastrar
      </Link>
    </div>
  )
}
