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
    <div className="flex min-h-18 items-center gap-4">
      <button
        type="button"
        onClick={open}
        aria-label="Abrir outro biscoito da sorte"
        title="Abrir outro biscoito"
        className="fortune-cookie shrink-0 cursor-pointer text-5xl leading-none drop-shadow-[3px_3px_0_#5a0f0f] transition-transform active:scale-90"
      >
        <span aria-hidden>🥠</span>
      </button>
      <p
        key={opened}
        aria-live="polite"
        className="fortune-message text-base font-black italic leading-snug text-[#F0C040]"
        style={{ textShadow: "2px 2px 0 #5a0f0f" }}
      >
        &ldquo;{PHRASES[phrase]}&rdquo;
      </p>
    </div>
  )
}
