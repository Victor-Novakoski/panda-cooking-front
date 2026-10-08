"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HeaderNav } from "./HeaderNav"

export function Header() {
  const pathname = usePathname()
  const isActive = (href: string) => pathname === href

  return (
    <header className="relative border-b-4 border-[#D4A017] bg-[#8B1A1A]">
      <div
        className="h-1 w-full"
        style={{ background: "repeating-linear-gradient(90deg, #D4A017 0, #D4A017 12px, #A07010 12px, #A07010 24px)" }}
      />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] text-2xl shadow-[3px_3px_0px_#1A0A00]">
            🐼
          </div>
          <div className="hidden sm:block">
            <div className="text-lg font-black leading-tight text-[#F0C040]" style={{ textShadow: "2px 2px 0 #8B1A1A" }}>
              Panda Cooking
            </div>
            <div className="text-[10px] font-bold tracking-[3px] text-[#D4A017]">熊猫厨房</div>
          </div>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/dashboard"
            className={`rounded-lg px-3 py-2 text-sm font-bold transition-colors sm:px-4 ${
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
