"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import dynamic from "next/dynamic"

// ssr: false garante que o HeaderNav nunca roda no servidor
// ambos (server e client) renderizam o placeholder na primeira passagem
const HeaderNav = dynamic(
  () => import("./HeaderNav").then((m) => m.HeaderNav),
  { ssr: false, loading: () => <div className="ml-2 h-9 w-40" /> }
)

export function Header() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href

  return (
    <header className="border-b-4 border-[#D4A017] bg-[#8B1A1A] relative">
      <div
        className="h-1 w-full"
        style={{ background: "repeating-linear-gradient(90deg, #D4A017 0, #D4A017 12px, #A07010 12px, #A07010 24px)" }}
      />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] text-2xl shadow-[3px_3px_0px_#1A0A00]">
            🐼
          </div>
          <div>
            <div className="text-lg font-black text-[#F0C040] leading-tight" style={{ textShadow: "2px 2px 0 #8B1A1A" }}>
              Panda Cooking
            </div>
            <div className="text-[10px] font-bold tracking-[3px] text-[#D4A017]">熊猫厨房</div>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${
              isActive("/dashboard")
                ? "bg-white/20 text-[#F0C040]"
                : "text-[#F0C040]/80 hover:bg-white/10 hover:text-[#F0C040]"
            }`}
          >
            Receitas
          </Link>

          <HeaderNav />
        </nav>
      </div>
    </header>
  )
}
