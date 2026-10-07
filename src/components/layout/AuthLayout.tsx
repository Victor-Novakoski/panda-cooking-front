import Link from "next/link"
import type { ReactNode } from "react"

interface AuthLayoutProps {
  emoji: string
  quote: string
  highlight: string
  author: string
  title: string
  subtitle: string
  children: ReactNode
}

// Moldura das telas de login e cadastro: frase à esquerda (telas grandes),
// formulário à direita.
export function AuthLayout({ emoji, quote, highlight, author, title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="bg-lattice hidden flex-col justify-between border-r-4 border-[#1A0A00] bg-[#8B1A1A] p-12 lg:flex lg:w-1/2">
        <Link href="/">
          <div className="text-xl font-black text-[#F0C040]">🐼 Panda Cooking</div>
          <div className="mt-1 text-xs font-bold tracking-[3px] text-[#D4A017]">熊猫厨房</div>
        </Link>
        <figure>
          <div className="mb-6 text-center text-8xl" aria-hidden>
            {emoji}
          </div>
          <blockquote className="text-2xl font-black leading-snug text-white" style={{ textShadow: "2px 2px 0 #5a0f0f" }}>
            &ldquo;{quote} <span className="text-[#F0C040]">{highlight}</span>&rdquo;
          </blockquote>
          <figcaption className="mt-3 text-sm font-bold text-[#D4A017]">— {author}</figcaption>
        </figure>
        <p className="text-xs font-semibold text-white/30">Receitas para todos os gostos</p>
      </div>

      <main className="flex flex-1 flex-col items-center justify-center bg-[#FDF6E3] px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] text-xl shadow-[2px_2px_0px_#1A0A00]">
              🐼
            </div>
            <span className="font-black text-[#1A0A00]">Panda Cooking</span>
          </Link>

          <h1 className="text-2xl font-black text-[#1A0A00]">{title}</h1>
          <p className="mb-6 mt-1 text-sm font-semibold text-[#1A0A00]/50">{subtitle}</p>

          {children}
        </div>
      </main>
    </div>
  )
}

export const submitButtonClass =
  "mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#8B1A1A] bg-[#C0392B] text-sm font-black text-white shadow-[4px_4px_0px_#1A0A00] transition-all hover:bg-[#E74C3C] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-60"
