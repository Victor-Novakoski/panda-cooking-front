import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ProfilePage from "./page"
import { recipesService } from "@/services/recipes.service"
import { usersService } from "@/services/users.service"
import { loginAs, makeSummary, page, renderWithClient } from "@/test/utils"

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/profile",
}))
vi.mock("@/services/recipes.service", () => ({ recipesService: { list: vi.fn() } }))
vi.mock("@/services/users.service", () => ({ usersService: { favorites: vi.fn() } }))
vi.mock("@/services/auth.service", () => ({ authService: { logout: vi.fn() } }))

describe("ProfilePage", () => {
  beforeEach(() => {
    vi.mocked(recipesService.list).mockReset().mockResolvedValue(page([makeSummary({ name: "Minha Coxinha" })]))
    vi.mocked(usersService.favorites)
      .mockReset()
      .mockResolvedValue(page([makeSummary({ id: "r9", name: "Pudim da Ana" }), makeSummary({ id: "r8", name: "Brigadeiro" })]))
  })

  it("mostra as receitas da pessoa, filtradas pela API", async () => {
    loginAs({ id: "maria" })
    renderWithClient(<ProfilePage />)

    expect(await screen.findByText("Minha Coxinha")).toBeInTheDocument()
    expect(recipesService.list).toHaveBeenCalledWith({ user_id: "maria", page: 1 })
    expect(screen.getByRole("heading", { name: "Maria Silva" })).toBeInTheDocument()
  })

  it("aba de favoritas com o total", async () => {
    loginAs()
    renderWithClient(<ProfilePage />)

    await userEvent.setup().click(screen.getByRole("tab", { name: /favoritas/i }))

    expect(await screen.findByText("Pudim da Ana")).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: /favoritas/i })).toHaveTextContent("2")
    expect(usersService.favorites).toHaveBeenCalledWith(1)
  })

  it("sem receitas convida a criar a primeira", async () => {
    loginAs()
    vi.mocked(recipesService.list).mockResolvedValue(page([]))
    renderWithClient(<ProfilePage />)

    expect(await screen.findByText("Você ainda não criou nenhuma receita.")).toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Criar a primeira receita" })).toHaveAttribute("href", "/recipes/new")
  })
})
