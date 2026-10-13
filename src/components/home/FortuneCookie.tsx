"use client"

import { useState } from "react"
import { PHRASES, nextPhrase } from "./phrases"

// A primeira frase é sorteada no servidor (initial), para o HTML e o
// navegador mostrarem a mesma.
export function FortuneCookie({ initial }: { initial: number }) {
  const [phrase, setPhrase] = useState(initial % PHRASES.length)
  // muda a cada clique, para a animação da frase recomeçar
  const [opened, setOpened] = useState(0)

  function open() {
    setPhrase((current) => nextPhrase(current))
    setOpened((n) => n + 1)
  }

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
      <button
        type="button"
        onClick={open}
        aria-label="Abrir outro biscoito da sorte"
        className="fortune-cookie flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-[#1A0A00] bg-[#D4A017] text-5xl shadow-[4px_4px_0px_#1A0A00] transition-[box-shadow,translate] hover:bg-[#F0C040] active:translate-x-1 active:translate-y-1 active:shadow-none"
      >
        <span aria-hidden>🥠</span>
      </button>

      <div className="relative w-full flex-1 rounded-2xl border-[3px] border-[#1A0A00] bg-white px-6 py-5 shadow-[4px_4px_0px_#1A0A00]">
        <p className="mb-1 text-[10px] font-black uppercase tracking-[3px] text-[#C0392B]">Sua sorte de hoje</p>
        <p
          key={opened}
          aria-live="polite"
          className="fortune-message text-lg font-black leading-snug text-[#1A0A00]"
        >
          &ldquo;{PHRASES[phrase]}&rdquo;
        </p>
      </div>
    </div>
  )
}
