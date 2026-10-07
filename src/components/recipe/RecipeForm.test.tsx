import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { RecipeForm, recipeToForm, toRecipePayload } from "./RecipeForm"
import type { RecipePayload } from "@/services/recipes.service"
import { apiError, makeRecipe, renderWithClient } from "@/test/utils"

vi.mock("@/services/categories.service", () => ({
  categoriesService: { getAll: vi.fn().mockResolvedValue([{ id: 1, name: "Massas" }, { id: 2, name: "Doces" }]) },
}))

const recipe = makeRecipe({
  category: { id: 2, name: "Doces" },
  images: [
    { id: 1, url: "https://images.unsplash.com/capa.jpg" },
    { id: 2, url: "https://exemplo.com/extra.jpg" },
  ],
})

function renderForm(onSubmit = vi.fn<(payload: RecipePayload) => Promise<unknown>>().mockResolvedValue(undefined)) {
  renderWithClient(
    <RecipeForm
      defaultValues={recipeToForm(recipe)}
      onSubmit={onSubmit}
      errorFallback="Erro ao salvar."
      submitLabel="Salvar"
      pendingLabel="Salvando..."
    />
  )
  return onSubmit
}

describe("RecipeForm", () => {
  let user: ReturnType<typeof userEvent.setup>
  beforeEach(() => {
    user = userEvent.setup()
  })

  it("volta da receita para o formulário e do formulário para a API sem perder nada", () => {
    expect(toRecipePayload(recipeToForm(recipe))).toEqual({
      name: recipe.name,
      description: recipe.description,
      time: "1 hora",
      portions: 2,
      category_id: 2,
      images: [{ url: "https://images.unsplash.com/capa.jpg" }, { url: "https://exemplo.com/extra.jpg" }],
      ingredients: [{ amount: "200 g", name: "macarrão" }],
      preparations: [{ description: "Cozinhe o macarrão" }],
    })
  })

  it("mostra a categoria salva quando as opções chegam", async () => {
    renderForm()

    await screen.findByRole("option", { name: "Doces" })
    expect(screen.getByLabelText("Categoria")).toHaveValue("2")
  })

  it("aceita só foto em https", async () => {
    const onSubmit = renderForm()

    const cover = screen.getByLabelText("Link da foto de capa")
    await user.clear(cover)
    await user.type(cover, "http://exemplo.com/foto.jpg")
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    expect(await screen.findByText("Use um link que comece com https://")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("adiciona e remove fotos, ingredientes e passos", async () => {
    const onSubmit = renderForm()

    await user.click(screen.getByRole("button", { name: "Remover foto 2" }))
    await user.click(screen.getByRole("button", { name: /adicionar ingrediente/i }))
    await user.type(screen.getByLabelText("Quantidade do ingrediente 2"), "1 colher")
    await user.type(screen.getByLabelText("Ingrediente 2"), "shoyu")
    await user.click(screen.getByRole("button", { name: /adicionar passo/i }))
    await user.type(screen.getByLabelText("Passo 2"), "Sirva quente")
    await user.click(screen.getByRole("button", { name: "Remover passo 1" }))
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled())
    const payload = onSubmit.mock.calls[0][0]
    expect(payload.images).toEqual([{ url: "https://images.unsplash.com/capa.jpg" }])
    expect(payload.ingredients).toEqual([
      { amount: "200 g", name: "macarrão" },
      { amount: "1 colher", name: "shoyu" },
    ])
    expect(payload.preparations).toEqual([{ description: "Sirva quente" }])
  })

  it("campo de foto vazio pede o link ou que seja removido", async () => {
    const onSubmit = renderForm()

    await user.click(screen.getByRole("button", { name: "Adicionar foto" }))
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    expect(await screen.findByText("Cole o link da foto ou remova o campo")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("respeita os limites da API", async () => {
    const onSubmit = renderForm()

    const name = screen.getByLabelText("Nome da receita")
    await user.clear(name)
    await user.click(name)
    await user.paste("x".repeat(121))
    const portions = screen.getByLabelText("Porções")
    await user.clear(portions)
    await user.type(portions, "101")
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    expect(await screen.findByText("Use no máximo 120 caracteres")).toBeInTheDocument()
    expect(screen.getByText("Use um número de 1 a 100")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("mostra cada erro da API no campo certo", async () => {
    renderForm(
      vi.fn().mockRejectedValue(
        apiError(422, {
          error: "dados inválidos",
          fields: {
            "ingredients[0].amount": "use no máximo 60 caracteres",
            "images[1].url": "use um link que comece com https://",
            category_id: "categoria não encontrada",
          },
        })
      )
    )

    await user.click(screen.getByRole("button", { name: "Salvar" }))

    expect(await screen.findByText("Use no máximo 60 caracteres")).toBeInTheDocument()
    expect(screen.getByLabelText("Quantidade do ingrediente 1")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByLabelText("Link da foto 2")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByText("Categoria não encontrada")).toBeInTheDocument()
  })

  it("erro sem campo vira aviso geral", async () => {
    renderForm(vi.fn().mockRejectedValue(apiError(403, { error: "sem permissão para editar esta receita" })))

    await user.click(screen.getByRole("button", { name: "Salvar" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Sem permissão para editar esta receita")
  })
})
