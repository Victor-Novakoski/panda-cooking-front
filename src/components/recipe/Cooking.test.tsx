import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { CookMode } from "./CookMode"
import { CookingProvider, IngredientList, StepList } from "./Cooking"

const ingredients = [
  { id: 1, amount: "500g", name: "massa de lasanha" },
  { id: 2, amount: "1 lata", name: "molho de tomate" },
  { id: 3, amount: "a gosto", name: "sal" },
]

function renderList(base = 4) {
  render(
    <CookingProvider base={base}>
      <IngredientList ingredients={ingredients} />
      <CookMode name="Lasanha" ingredients={ingredients} preparations={[{ id: 1, description: "Monte e asse" }]} />
    </CookingProvider>
  )
}

describe("IngredientList", () => {
  it("começa nas porções da receita, com as quantidades como foram escritas", () => {
    renderList()

    expect(screen.getByRole("group", { name: "Ajustar porções" })).toHaveTextContent("4 porções")
    expect(screen.getByText("500g")).toBeInTheDocument()
    expect(screen.getByText("1 lata")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /Voltar para/ })).not.toBeInTheDocument()
  })

  it("mais porções recalcula o que tem número e deixa “a gosto” como está", async () => {
    renderList()

    for (let i = 0; i < 4; i++) await userEvent.click(screen.getByRole("button", { name: "Mais uma porção" }))

    expect(screen.getByRole("group", { name: "Ajustar porções" })).toHaveTextContent("8 porções")
    expect(screen.getByText("1000g")).toBeInTheDocument()
    expect(screen.getByText("2 latas")).toBeInTheDocument()
    expect(screen.getByText("a gosto")).toBeInTheDocument()
    expect(screen.getByText(/Quantidades recalculadas/)).toBeInTheDocument()
  })

  it("menos porções para em uma, e dá para voltar ao original", async () => {
    renderList(2)

    await userEvent.click(screen.getByRole("button", { name: "Menos uma porção" }))
    expect(screen.getByRole("group", { name: "Ajustar porções" })).toHaveTextContent("1 porção")
    expect(screen.getByText("250g")).toBeInTheDocument()
    expect(screen.getByText("1/2 lata")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Menos uma porção" })).toBeDisabled()

    await userEvent.click(screen.getByRole("button", { name: "Voltar para 2" }))
    expect(screen.getByText("500g")).toBeInTheDocument()
  })

  it("o modo cozinha mostra as mesmas quantidades ajustadas", async () => {
    renderList()
    for (let i = 0; i < 4; i++) await userEvent.click(screen.getByRole("button", { name: "Mais uma porção" }))

    await userEvent.click(screen.getByRole("button", { name: "Modo cozinha" }))
    await userEvent.click(screen.getByRole("button", { name: "Ingredientes" }))

    expect(screen.getByRole("dialog")).toHaveTextContent("1000g massa de lasanha")
    expect(screen.getByRole("dialog")).toHaveTextContent("2 latas molho de tomate")
  })

  it("fora da página da receita, mostra a lista sem o ajuste", () => {
    render(<IngredientList ingredients={ingredients} />)

    expect(screen.getByText("500g")).toBeInTheDocument()
    expect(screen.queryByRole("group", { name: "Ajustar porções" })).not.toBeInTheDocument()
  })
})

describe("marcar o que já foi feito", () => {
  const steps = [
    { id: 1, description: "Cozinhe a massa" },
    { id: 2, description: "Monte as camadas" },
    { id: 3, description: "Leve ao forno" },
  ]

  function renderRecipe() {
    render(
      <CookingProvider base={4}>
        <IngredientList ingredients={ingredients} recipeName="Lasanha" />
        <StepList steps={steps} />
        <CookMode name="Lasanha" ingredients={ingredients} preparations={steps} />
      </CookingProvider>
    )
  }

  afterEach(() => vi.restoreAllMocks())

  it("risca ingrediente e passo ao tocar, e desmarca tudo de uma vez", async () => {
    renderRecipe()

    await userEvent.click(screen.getByText("massa de lasanha"))
    await userEvent.click(screen.getByText("Monte as camadas"))

    expect(screen.getByRole("checkbox", { name: "500g massa de lasanha" })).toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Passo 2 feito" })).toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Passo 1 feito" })).not.toBeChecked()

    await userEvent.click(screen.getByRole("button", { name: "Desmarcar tudo" }))
    expect(screen.getByRole("checkbox", { name: "500g massa de lasanha" })).not.toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Passo 2 feito" })).not.toBeChecked()
    expect(screen.queryByRole("button", { name: "Desmarcar tudo" })).not.toBeInTheDocument()
  })

  it("copia a lista de compras com as porções escolhidas, e só o que falta quando há algo marcado", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
    renderRecipe()
    await user.click(screen.getByRole("button", { name: "Mais uma porção" }))

    await user.click(screen.getByRole("button", { name: "Copiar lista de compras" }))
    expect(writeText).toHaveBeenLastCalledWith(
      "Ingredientes: Lasanha (5 porções)\n- 625g massa de lasanha\n- 1 1/4 lata molho de tomate\n- a gosto sal"
    )
    expect(await screen.findByRole("button", { name: "Lista copiada!" })).toBeInTheDocument()

    await user.click(screen.getByRole("checkbox", { name: "a gosto sal" }))
    await user.click(screen.getByRole("button", { name: /Copiar os que faltam \(2\)|Lista copiada!/ }))
    expect(writeText).toHaveBeenLastCalledWith(
      "Ingredientes: Lasanha (5 porções)\n- 625g massa de lasanha\n- 1 1/4 lata molho de tomate"
    )
  })

  it("avisa quando não consegue copiar", async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("sem permissão"))
    renderRecipe()

    await user.click(screen.getByRole("button", { name: "Copiar lista de compras" }))

    expect(await screen.findByRole("button", { name: "Não deu para copiar" })).toBeInTheDocument()
  })

  it("no modo cozinha, avançar marca o passo como feito, e as marcas valem nos dois lugares", async () => {
    renderRecipe()
    await userEvent.click(screen.getByRole("checkbox", { name: "1 lata molho de tomate" }))

    await userEvent.click(screen.getByRole("button", { name: "Modo cozinha" }))
    await userEvent.click(screen.getByRole("button", { name: "Próximo" }))
    await userEvent.click(screen.getByRole("button", { name: "Anterior" }))
    expect(screen.getByRole("dialog")).toHaveTextContent("Feito")

    await userEvent.click(screen.getByRole("button", { name: "Ingredientes" }))
    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByRole("checkbox", { name: "1 lata molho de tomate" })).toBeChecked()
    await userEvent.click(within(dialog).getByRole("checkbox", { name: "a gosto sal" }))

    await userEvent.keyboard("{Escape}")
    expect(screen.getByRole("checkbox", { name: "Passo 1 feito" })).toBeChecked()
    expect(screen.getByRole("checkbox", { name: "Passo 2 feito" })).not.toBeChecked()
    expect(screen.getByRole("checkbox", { name: "a gosto sal" })).toBeChecked()
  })

  it("“Pronto” no último passo marca ele também", async () => {
    renderRecipe()
    await userEvent.click(screen.getByRole("button", { name: "Modo cozinha" }))

    await userEvent.keyboard("{ArrowRight}{ArrowRight}")
    await userEvent.click(screen.getByRole("button", { name: /Pronto/ }))

    for (const n of [1, 2, 3]) expect(screen.getByRole("checkbox", { name: `Passo ${n} feito` })).toBeChecked()
  })
})
