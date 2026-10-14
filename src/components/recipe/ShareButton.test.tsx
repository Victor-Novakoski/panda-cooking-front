import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { ShareButton } from "./ShareButton"

describe("ShareButton", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    Reflect.deleteProperty(navigator, "share")
  })

  it("abre o compartilhamento do aparelho quando ele existe", async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, "share", { value: share, configurable: true })
    render(<ShareButton title="Bolo" />)

    await userEvent.click(screen.getByRole("button", { name: "Compartilhar" }))

    expect(share).toHaveBeenCalledWith({ title: "Bolo", url: window.location.href })
  })

  it("fechar o compartilhamento sem escolher nada não mostra erro", async () => {
    Object.defineProperty(navigator, "share", {
      value: vi.fn().mockRejectedValue(new DOMException("cancelado", "AbortError")),
      configurable: true,
    })
    render(<ShareButton title="Bolo" />)

    await userEvent.click(screen.getByRole("button", { name: "Compartilhar" }))

    expect(screen.getByRole("button", { name: "Compartilhar" })).toBeInTheDocument()
  })

  it("sem compartilhamento no aparelho, copia o link e avisa", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
    render(<ShareButton title="Bolo" />)

    await user.click(screen.getByRole("button", { name: "Compartilhar" }))

    expect(writeText).toHaveBeenCalledWith(window.location.href)
    expect(await screen.findByRole("button", { name: "Link copiado!" })).toBeInTheDocument()
  })

  it("avisa quando não consegue copiar", async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("sem permissão"))
    render(<ShareButton title="Bolo" />)

    await user.click(screen.getByRole("button", { name: "Compartilhar" }))

    expect(await screen.findByRole("button", { name: "Não deu para copiar o link" })).toBeInTheDocument()
  })
})
