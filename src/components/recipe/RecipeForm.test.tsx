import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { RecipeForm, recipeToForm, toRecipePayload } from "./RecipeForm"
import type { Recipe } from "@/types"

vi.mock("@/services/categories.service", () => ({
  categoriesService: { getAll: vi.fn().mockResolvedValue([{ id: 1, name: "Massas" }, { id: 2, name: "Doces" }]) },
}))

const recipe: Recipe = {
  id: "r1",
  name: "Lámen do Po",
  description: "Caldo forte e macarrão fresco",
  time: "1 hora",
  portions: 2,
  user_id: "u1",
  category: { id: 2, name: "Doces" },
  images: [{ id: 1, url: "https://exemplo.com/lamen.jpg" }],
  ingredients: [{ id: 1, amount: "200 g", name: "macarrão" }],
  preparations: [{ id: 1, description: "Cozinhe o macarrão" }],
}

function renderForm(onSubmit = vi.fn()) {
  const client = new QueryClient()
  render(
    <QueryClientProvider client={client}>
      <RecipeForm
        defaultValues={recipeToForm(recipe)}
        onSubmit={onSubmit}
        isPending={false}
        submitLabel="Salvar"
        pendingLabel="Salvando..."
      />
    </QueryClientProvider>
  )
  return onSubmit
}

describe("RecipeForm", () => {
  it("volta da receita para o formulário e do formulário para a API sem perder nada", () => {
    expect(toRecipePayload(recipeToForm(recipe))).toEqual({
      name: recipe.name,
      description: recipe.description,
      time: "1 hora",
      portions: 2,
      category_id: 2,
      images: [{ url: "https://exemplo.com/lamen.jpg" }],
      ingredients: [{ amount: "200 g", name: "macarrão" }],
      preparations: [{ description: "Cozinhe o macarrão" }],
    })
  })

  it("mostra a categoria salva quando as opções chegam", async () => {
    renderForm()

    await screen.findByRole("option", { name: "Doces" })
    expect(screen.getByLabelText("Categoria")).toHaveValue("2")
  })

  it("recusa URL de imagem que não é http ou https", async () => {
    const onSubmit = renderForm()
    const user = userEvent.setup()

    const image = screen.getByLabelText("URL da imagem (opcional)")
    await user.clear(image)
    await user.type(image, "javascript:alert(1)")
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    expect(await screen.findByText("Use um link que comece com http:// ou https://")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("adiciona e remove passos antes de enviar", async () => {
    const onSubmit = renderForm()
    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: /adicionar passo/i }))
    await user.type(screen.getByLabelText("Passo 2"), "Sirva quente")
    await user.click(screen.getByRole("button", { name: "Remover passo 1" }))
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0].preparations).toEqual([{ description: "Sirva quente" }])
  })
})
