"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { LogOut, Plus } from "lucide-react"

export function HeaderNav() {
  const { user, clearAuth, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  const isActive = (href: string) => pathname === href

  function handleLogout() {
    clearAuth()
    router.push("/")
  }

  if (isAuthenticated()) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/recipes/new"
          className="ml-2 flex items-center gap-1.5 rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] px-4 py-1.5 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F0C040] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <Plus className="h-4 w-4" />
          Nova receita
        </Link>
        <Link
          href="/profile"
          className={`ml-1 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
            isActive("/profile")
              ? "bg-white/20 text-[#F0C040]"
              : "text-[#F0C040]/80 hover:bg-white/10 hover:text-[#F0C040]"
          }`}
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#D4A017] bg-[#D4A017]/20 text-sm">
            🐼
          </div>
          <span className="hidden sm:block">{user?.name?.split(" ")[0]}</span>
        </Link>
        <button
          onClick={handleLogout}
          className="rounded-lg p-2 text-[#F0C040]/60 transition-colors hover:bg-white/10 hover:text-[#F0C040]"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="ml-2 flex items-center gap-2">
      <Link
        href="/auth/login"
        className="rounded-xl border-[3px] border-[#D4A017] px-4 py-1.5 text-sm font-black text-[#F0C040] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-white/10 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        Entrar
      </Link>
      <Link
        href="/auth/register"
        className="rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] px-4 py-1.5 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F0C040] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        🍜 Cadastrar
      </Link>
    </div>
  )
}
