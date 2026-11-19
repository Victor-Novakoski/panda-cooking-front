import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { FortuneCookie } from "./FortuneCookie"
import { PHRASES, nextPhrase, randomPhrase } from "./phrases"

describe("FortuneCookie", () => {
  it("abre com a frase sorteada no servidor e troca a cada clique", async () => {
    render(<FortuneCookie initial={3} />)
    expect(screen.getByText(`“${PHRASES[3]}”`)).toBeInTheDocument()

    await userEvent.setup().click(screen.getByRole("button", { name: "Abrir outro biscoito da sorte" }))

    expect(screen.queryByText(`“${PHRASES[3]}”`)).not.toBeInTheDocument()
  })

  it("nunca repete a frase que está na tela, e todas podem sair", () => {
    const seen = new Set<number>()
    for (let current = 0; current < PHRASES.length; current++) {
      for (const r of [0, 0.5, 0.999]) {
        const next = nextPhrase(current, () => r)
        expect(next).not.toBe(current)
        seen.add(next)
      }
    }
    expect(seen.size).toBe(PHRASES.length)
    expect(randomPhrase(() => 0.999)).toBe(PHRASES.length - 1)
  })
})
