import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import NewRecipePage from "./page"
import { recipesService } from "@/services/recipes.service"
import { loginAs, makeRecipe, renderWithClient } from "@/test/utils"

const push = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
  usePathname: () => "/recipes/new",
}))
vi.mock("@/services/recipes.service", () => ({ recipesService: { create: vi.fn() } }))
vi.mock("@/services/categories.service", () => ({
  categoriesService: { getAll: vi.fn().mockResolvedValue([{ id: 2, name: "Massas" }]) },
}))

describe("NewRecipePage", () => {
  beforeEach(() => {
    push.mockReset()
    vi.mocked(recipesService.create).mockReset()
  })

  it("publica a receita e abre a página dela", async () => {
    loginAs()
    vi.mocked(recipesService.create).mockResolvedValue(makeRecipe({ id: "nova" }))
    renderWithClient(<NewRecipePage />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText("Nome da receita"), "Bolo de fubá")
    await user.type(screen.getByLabelText("Descrição"), "O bolo da vó, fofinho e cheiroso.")
    await user.type(screen.getByLabelText("Tempo"), "50 minutos")
    await user.type(screen.getByLabelText("Porções"), "8")
    await user.selectOptions(screen.getByLabelText("Categoria"), await screen.findByRole("option", { name: "Massas" }))
    await user.type(screen.getByLabelText("Quantidade do ingrediente 1"), "2 xícaras")
    await user.type(screen.getByLabelText("Ingrediente 1"), "fubá")
    await user.type(screen.getByLabelText("Passo 1"), "Misture tudo e asse.")
    await user.click(screen.getByRole("button", { name: /publicar receita/i }))

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/recipes/nova"))
    expect(recipesService.create).toHaveBeenCalledWith({
      name: "Bolo de fubá",
      description: "O bolo da vó, fofinho e cheiroso.",
      time: "50 minutos",
      portions: 8,
      category_id: 2,
      images: [],
      ingredients: [{ amount: "2 xícaras", name: "fubá" }],
      preparations: [{ description: "Misture tudo e asse." }],
    })
  })
})
