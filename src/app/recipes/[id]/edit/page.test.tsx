import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import EditRecipePage from "./page"
import { recipesService } from "@/services/recipes.service"
import { useAuthStore } from "@/store/auth.store"
import { apiError, loginAs, makeRecipe, renderWithClient } from "@/test/utils"

const push = vi.fn()
const replace = vi.fn()
const refresh = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace, refresh }),
  useParams: () => ({ id: "r1" }),
  usePathname: () => "/recipes/r1/edit",
}))
vi.mock("@/services/recipes.service", () => ({
  recipesService: { getById: vi.fn(), replace: vi.fn(), delete: vi.fn() },
}))
vi.mock("@/services/categories.service", () => ({
  categoriesService: { getAll: vi.fn().mockResolvedValue([{ id: 2, name: "Massas" }]) },
}))

const recipe = makeRecipe({
  author: { id: "dono", name: "Dono", image_profile: "" },
  images: [
    { id: 1, url: "https://images.unsplash.com/capa.jpg" },
    { id: 2, url: "https://exemplo.com/extra.jpg" },
  ],
})

describe("EditRecipePage", () => {
  beforeEach(() => {
    push.mockReset()
    replace.mockReset()
    refresh.mockReset()
    vi.mocked(recipesService.getById).mockReset().mockResolvedValue(recipe)
    vi.mocked(recipesService.replace).mockReset()
    vi.mocked(recipesService.delete).mockReset()
  })

  it("abre com a receita preenchida e salva a receita inteira", async () => {
    loginAs({ id: "dono" })
    vi.mocked(recipesService.replace).mockResolvedValue({ ...recipe, name: "Lámen picante" })
    renderWithClient(<EditRecipePage />)
    const user = userEvent.setup()

    const name = await screen.findByLabelText("Nome da receita")
    expect(name).toHaveValue("Lámen do Po")
    await user.clear(name)
    await user.type(name, "Lámen picante")
    await user.click(screen.getByRole("button", { name: /salvar alterações/i }))

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/recipes/r1"))
    const [id, payload] = vi.mocked(recipesService.replace).mock.calls[0]
    expect(id).toBe("r1")
    expect(payload.name).toBe("Lámen picante")
    expect(payload.category_id).toBe(2)
    // todas as fotos aparecem no formulário e voltam para a API na mesma ordem
    expect(payload.images).toEqual([{ url: "https://images.unsplash.com/capa.jpg" }, { url: "https://exemplo.com/extra.jpg" }])
    expect(refresh).toHaveBeenCalled()
  })

  it("quem não criou a receita não vê o formulário", async () => {
    loginAs({ id: "outra-pessoa" })
    renderWithClient(<EditRecipePage />)

    expect(await screen.findByText("Só quem criou a receita pode editá-la.")).toBeInTheDocument()
    expect(screen.queryByLabelText("Nome da receita")).not.toBeInTheDocument()
  })

  it("receita que não existe", async () => {
    loginAs({ id: "dono" })
    vi.mocked(recipesService.getById).mockRejectedValue(apiError(404, { error: "receita não encontrada" }))
    renderWithClient(<EditRecipePage />)

    expect(await screen.findByText("Receita não encontrada.")).toBeInTheDocument()
  })

  it("sem sessão vai para o login e volta para a edição", async () => {
    useAuthStore.getState().clearSession()
    renderWithClient(<EditRecipePage />)

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/auth/login?next=%2Frecipes%2Fr1%2Fedit"))
    expect(screen.queryByLabelText("Nome da receita")).not.toBeInTheDocument()
  })

  it("apaga só depois de confirmar", async () => {
    loginAs({ id: "dono" })
    vi.mocked(recipesService.delete).mockResolvedValue()
    renderWithClient(<EditRecipePage />)
    const user = userEvent.setup()

    await user.click(await screen.findByRole("button", { name: "Apagar receita" }))
    expect(recipesService.delete).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: /sim, apagar/i }))

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/profile"))
    expect(recipesService.delete).toHaveBeenCalledWith("r1")
  })
})
