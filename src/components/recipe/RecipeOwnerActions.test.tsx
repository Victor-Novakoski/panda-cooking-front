import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { RecipeOwnerActions } from "./RecipeOwnerActions"
import { loginAs } from "@/test/utils"
import { useAuthStore } from "@/store/auth.store"

describe("RecipeOwnerActions", () => {
  it("o dono vê o botão de editar", () => {
    loginAs({ id: "dono" })
    render(<RecipeOwnerActions recipeId="r1" ownerId="dono" isDemo={false} />)

    expect(screen.getByRole("link", { name: /editar receita/i })).toHaveAttribute("href", "/recipes/r1/edit")
  })

  it("receita de demonstração mostra aviso no lugar do botão", () => {
    loginAs({ id: "dono" })
    render(<RecipeOwnerActions recipeId="r1" ownerId="dono" isDemo />)

    expect(screen.queryByRole("link", { name: /editar receita/i })).not.toBeInTheDocument()
    expect(screen.getByText("Receita de demonstração: não dá para editar nem apagar.")).toBeInTheDocument()
  })

  it("outra pessoa e visitante não veem nada", () => {
    loginAs({ id: "outra" })
    const { container, rerender } = render(<RecipeOwnerActions recipeId="r1" ownerId="dono" isDemo />)
    expect(container).toBeEmptyDOMElement()

    useAuthStore.getState().clearSession()
    rerender(<RecipeOwnerActions recipeId="r1" ownerId="dono" isDemo={false} />)
    expect(container).toBeEmptyDOMElement()
  })
})
