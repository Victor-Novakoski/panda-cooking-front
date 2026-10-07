import type { ReactNode } from "react"

interface NoticeProps {
  emoji: string
  title: string
  children?: ReactNode
  // alert: o leitor de tela anuncia na hora (erro)
  role?: "alert" | "status"
}

// Caixa de aviso: lista vazia, erro ao carregar, página sem permissão.
export function Notice({ emoji, title, children, role }: NoticeProps) {
  return (
    <div
      role={role}
      className="flex flex-col items-center rounded-2xl border-[3px] border-dashed border-[#D4A017] bg-[#F5E6C8] px-6 py-16 text-center"
    >
      <div className="mb-3 text-5xl" aria-hidden>
        {emoji}
      </div>
      <p className="font-black text-[#1A0A00]">{title}</p>
      {children && <div className="mt-2 text-sm font-semibold text-[#1A0A00]/60">{children}</div>}
    </div>
  )
}
