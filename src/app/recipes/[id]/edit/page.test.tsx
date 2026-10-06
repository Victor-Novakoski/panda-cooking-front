import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import EditRecipePage from "./page"
import { recipesService } from "@/services/recipes.service"
import { useAuthStore } from "@/store/auth.store"
import type { Recipe } from "@/types"

const push = vi.fn()
const refresh = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  useParams: () => ({ id: "r1" }),
  usePathname: () => "/recipes/r1/edit",
}))
vi.mock("@/services/recipes.service", () => ({
  recipesService: { getById: vi.fn(), replace: vi.fn(), delete: vi.fn() },
}))
vi.mock("@/services/categories.service", () => ({
  categoriesService: { getAll: vi.fn().mockResolvedValue([{ id: 1, name: "Massas" }]) },
}))

const recipe: Recipe = {
  id: "r1",
  name: "Lámen do Po",
  description: "Caldo forte e macarrão fresco",
  time: "1 hora",
  portions: 2,
  user_id: "dono",
  category: { id: 1, name: "Massas" },
  images: [{ id: 1, url: "https://exemplo.com/capa.jpg" }, { id: 2, url: "https://exemplo.com/extra.jpg" }],
  ingredients: [{ id: 1, amount: "200 g", name: "macarrão" }],
  preparations: [{ id: 1, description: "Cozinhe o macarrão" }],
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <EditRecipePage />
    </QueryClientProvider>
  )
}

function loginAs(id: string) {
  useAuthStore.getState().setAuth({ id, name: "Maria", email: "maria@pandacooking.com", is_adm: false }, "token")
}

describe("EditRecipePage", () => {
  beforeEach(() => {
    push.mockReset()
    refresh.mockReset()
    vi.mocked(recipesService.getById).mockResolvedValue(recipe)
    vi.mocked(recipesService.replace).mockReset()
    vi.mocked(recipesService.delete).mockReset()
  })

  it("abre com a receita preenchida e salva a receita inteira", async () => {
    loginAs("dono")
    vi.mocked(recipesService.replace).mockResolvedValue({ ...recipe, name: "Lámen picante" })
    renderPage()
    const user = userEvent.setup()

    const name = await screen.findByLabelText("Nome da receita")
    expect(name).toHaveValue("Lámen do Po")
    await user.clear(name)
    await user.type(name, "Lámen picante")
    await user.click(screen.getByRole("button", { name: /salvar alterações/i }))

    await vi.waitFor(() => expect(recipesService.replace).toHaveBeenCalled())
    const [id, payload] = vi.mocked(recipesService.replace).mock.calls[0]
    expect(id).toBe("r1")
    expect(payload.name).toBe("Lámen picante")
    expect(payload.category_id).toBe(1)
    // A foto extra, que o formulário não mostra, continua na receita.
    expect(payload.images).toEqual([{ url: "https://exemplo.com/capa.jpg" }, { url: "https://exemplo.com/extra.jpg" }])
    expect(push).toHaveBeenCalledWith("/recipes/r1")
    expect(refresh).toHaveBeenCalled()
  })

  it("mostra o erro que a API mandou", async () => {
    loginAs("dono")
    vi.mocked(recipesService.replace).mockRejectedValue(
      Object.assign(new Error("400"), { isAxiosError: true, response: { data: { error: "categoria não encontrada" } } })
    )
    renderPage()
    const user = userEvent.setup()

    await screen.findByLabelText("Nome da receita")
    await user.click(screen.getByRole("button", { name: /salvar alterações/i }))

    expect(await screen.findByText("categoria não encontrada")).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  it("quem não criou a receita não vê o formulário", async () => {
    loginAs("outra-pessoa")
    renderPage()

    expect(await screen.findByText("Só quem criou a receita pode editá-la.")).toBeInTheDocument()
    expect(screen.queryByLabelText("Nome da receita")).not.toBeInTheDocument()
  })

  it("apaga só depois de confirmar", async () => {
    loginAs("dono")
    vi.mocked(recipesService.delete).mockResolvedValue()
    renderPage()
    const user = userEvent.setup()

    await user.click(await screen.findByRole("button", { name: "Apagar receita" }))
    expect(recipesService.delete).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: /sim, apagar/i }))

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/profile"))
    expect(recipesService.delete).toHaveBeenCalled()
  })
})
