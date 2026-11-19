import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { CookMode } from "./CookMode"

const ingredients = [
  { id: 1, amount: "200 g", name: "macarrão" },
  { id: 2, amount: "1 litro", name: "caldo" },
]
const preparations = [
  { id: 1, description: "Ferva o caldo" },
  { id: 2, description: "Cozinhe o macarrão" },
  { id: 3, description: "Sirva quente" },
]

function open() {
  render(<CookMode name="Lámen" ingredients={ingredients} preparations={preparations} />)
  return userEvent.click(screen.getByRole("button", { name: "Modo cozinha" }))
}

describe("CookMode", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    Reflect.deleteProperty(navigator, "wakeLock")
  })

  it("sem passos de preparo, não mostra o botão", () => {
    render(<CookMode name="Lámen" ingredients={ingredients} preparations={[]} />)

    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("abre no primeiro passo e anda com Próximo e Anterior", async () => {
    await open()

    const dialog = screen.getByRole("dialog", { name: "Modo cozinha: Lámen" })
    expect(dialog).toHaveTextContent("Passo 1 de 3")
    expect(dialog).toHaveTextContent("Ferva o caldo")
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled()

    await userEvent.click(screen.getByRole("button", { name: "Próximo" }))
    expect(dialog).toHaveTextContent("Passo 2 de 3")
    expect(dialog).toHaveTextContent("Cozinhe o macarrão")

    await userEvent.click(screen.getByRole("button", { name: "Anterior" }))
    expect(dialog).toHaveTextContent("Ferva o caldo")
  })

  it("anda também pelas setas do teclado", async () => {
    await open()

    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}")
    expect(screen.getByRole("dialog")).toHaveTextContent("Passo 3 de 3")

    await userEvent.keyboard("{ArrowLeft}")
    expect(screen.getByRole("dialog")).toHaveTextContent("Passo 2 de 3")
  })

  it("no último passo, o botão fecha o modo", async () => {
    await open()
    await userEvent.keyboard("{ArrowRight}{ArrowRight}")

    await userEvent.click(screen.getByRole("button", { name: /Pronto/ }))

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Modo cozinha" })).toHaveFocus()
  })

  it("mostra os ingredientes e volta ao passo em que estava", async () => {
    await open()
    await userEvent.click(screen.getByRole("button", { name: "Próximo" }))

    await userEvent.click(screen.getByRole("button", { name: "Ingredientes" }))
    expect(screen.getByRole("heading", { name: "Ingredientes" })).toBeInTheDocument()
    expect(screen.getByText("macarrão")).toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Voltar ao passo" }))
    expect(screen.getByRole("dialog")).toHaveTextContent("Cozinhe o macarrão")
  })

  it("fecha com Esc e com o botão de sair", async () => {
    await open()
    await userEvent.keyboard("{Escape}")
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole("button", { name: "Modo cozinha" }))
    await userEvent.click(screen.getByRole("button", { name: "Sair do modo cozinha" }))
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("reabre sempre no primeiro passo", async () => {
    await open()
    await userEvent.keyboard("{ArrowRight}{Escape}")

    await userEvent.click(screen.getByRole("button", { name: "Modo cozinha" }))

    expect(screen.getByRole("dialog")).toHaveTextContent("Passo 1 de 3")
  })

  it("mantém a tela acesa enquanto está aberto e solta ao fechar", async () => {
    const release = vi.fn().mockResolvedValue(undefined)
    const request = vi.fn().mockResolvedValue({ release })
    Object.defineProperty(navigator, "wakeLock", { value: { request }, configurable: true })

    await open()
    expect(request).toHaveBeenCalledWith("screen")

    await userEvent.keyboard("{Escape}")
    expect(release).toHaveBeenCalled()
  })

  it("funciona mesmo quando o aparelho recusa manter a tela acesa", async () => {
    Object.defineProperty(navigator, "wakeLock", {
      value: { request: vi.fn().mockRejectedValue(new Error("bateria fraca")) },
      configurable: true,
    })

    await open()

    expect(screen.getByRole("dialog")).toHaveTextContent("Ferva o caldo")
  })
})
