import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { CookMode } from "./CookMode"
import { IngredientList, PortionsProvider } from "./Portions"

const ingredients = [
  { id: 1, amount: "500g", name: "massa de lasanha" },
  { id: 2, amount: "1 lata", name: "molho de tomate" },
  { id: 3, amount: "a gosto", name: "sal" },
]

function renderList(base = 4) {
  render(
    <PortionsProvider base={base}>
      <IngredientList ingredients={ingredients} />
      <CookMode name="Lasanha" ingredients={ingredients} preparations={[{ id: 1, description: "Monte e asse" }]} />
    </PortionsProvider>
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
