import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AuthorRecipes } from "./AuthorRecipes"
import { recipesService } from "@/services/recipes.service"
import { apiError, makeSummary, page, renderWithClient } from "@/test/utils"

vi.mock("@/services/recipes.service", () => ({ recipesService: { list: vi.fn() } }))

const bolo = makeSummary({ id: "r1", name: "Bolo de Cenoura" })
const pao = makeSummary({ id: "r2", name: "Pão de Queijo" })
const first = page([bolo], { total: 13, total_pages: 2 })

describe("AuthorRecipes", () => {
  beforeEach(() => {
    vi.mocked(recipesService.list).mockReset()
    vi.spyOn(window, "scrollTo").mockImplementation(() => {})
  })

  it("mostra a primeira página que veio do servidor, sem buscar de novo", () => {
    renderWithClient(<AuthorRecipes userId="maria" first={first} />)

    expect(screen.getByRole("heading", { name: "Bolo de Cenoura" })).toBeInTheDocument()
    expect(recipesService.list).not.toHaveBeenCalled()
  })

  it("busca a página seguinte só das receitas da pessoa", async () => {
    vi.mocked(recipesService.list).mockResolvedValue(page([pao], { page: 2, total: 13, total_pages: 2 }))
    renderWithClient(<AuthorRecipes userId="maria" first={first} />)

    await userEvent.click(screen.getByRole("button", { name: "Página 2" }))

    expect(await screen.findByRole("heading", { name: "Pão de Queijo" })).toBeInTheDocument()
    expect(recipesService.list).toHaveBeenCalledWith({ user_id: "maria", page: 2 })
  })

  it("avisa quando a página seguinte não carrega", async () => {
    vi.mocked(recipesService.list).mockRejectedValue(apiError(500))
    renderWithClient(<AuthorRecipes userId="maria" first={first} />)

    await userEvent.click(screen.getByRole("button", { name: "Página 2" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar as receitas.")
  })
})
