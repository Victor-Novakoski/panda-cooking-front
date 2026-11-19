import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import RecipesPage from "./page"
import { recipesService } from "@/services/recipes.service"
import { categoriesService } from "@/services/categories.service"
import { makeSummary, page, renderWithClient } from "@/test/utils"

const replace = vi.fn()
let searchParams = new URLSearchParams()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => "/recipes",
  useSearchParams: () => searchParams,
}))
vi.mock("@/services/recipes.service", () => ({ recipesService: { list: vi.fn() } }))
vi.mock("@/services/categories.service", () => ({
  categoriesService: { getAll: vi.fn() },
}))

const bolo = makeSummary({ id: "r1", name: "Bolo de Cenoura" })
const pao = makeSummary({ id: "r2", name: "Pão de Queijo", category: { id: 12, name: "Pães e Bolos" } })

describe("RecipesPage", () => {
  beforeEach(() => {
    replace.mockReset()
    searchParams = new URLSearchParams()
    window.history.replaceState(null, "", "/recipes")
    vi.mocked(recipesService.list).mockReset().mockResolvedValue(page([bolo, pao]))
    vi.mocked(categoriesService.getAll).mockResolvedValue([
      { id: 2, name: "Massas" },
      { id: 12, name: "Pães e Bolos" },
    ])
    vi.spyOn(window, "scrollTo").mockImplementation(() => {})
  })

  it("lista as receitas da API com o total", async () => {
    renderWithClient(<RecipesPage />)

    expect(await screen.findByText("Bolo de Cenoura")).toBeInTheDocument()
    expect(screen.getByText("Pão de Queijo")).toBeInTheDocument()
    expect(screen.getByText("2 receitas")).toBeInTheDocument()
    expect(recipesService.list).toHaveBeenCalledWith({ search: "", category_id: undefined, page: 1 })
  })

  it("busca, categoria e página vêm da URL", async () => {
    searchParams = new URLSearchParams({ q: "pao", categoria: "12", pagina: "2" })
    vi.mocked(recipesService.list).mockResolvedValue(page([pao], { page: 2, total: 13, total_pages: 2 }))
    renderWithClient(<RecipesPage />)

    expect(await screen.findByText("13 receitas para “pao” em Pães e Bolos")).toBeInTheDocument()
    expect(recipesService.list).toHaveBeenCalledWith({ search: "pao", category_id: 12, page: 2 })
    expect(screen.getByLabelText("Buscar receitas")).toHaveValue("pao")
    expect(screen.getByRole("button", { name: "Pães e Bolos" })).toHaveAttribute("aria-pressed", "true")
  })

  it("tempo e ordem vêm da URL e vão para a API", async () => {
    searchParams = new URLSearchParams({ tempo: "30", ordem: "rapidas" })
    vi.mocked(recipesService.list).mockResolvedValue(page([pao]))
    renderWithClient(<RecipesPage />)

    expect(await screen.findByText("1 receita em até 30 min")).toBeInTheDocument()
    expect(recipesService.list).toHaveBeenCalledWith({
      search: "",
      category_id: undefined,
      max_time: 30,
      sort: "quickest",
      page: 1,
    })
    expect(screen.getByRole("button", { name: "Até 30 min" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByLabelText("Ordenar")).toHaveValue("rapidas")
  })

  it("valor que a API não aceita na URL é ignorado", async () => {
    searchParams = new URLSearchParams({ tempo: "7", ordem: "aleatoria" })
    renderWithClient(<RecipesPage />)

    await screen.findByText("2 receitas")
    expect(recipesService.list).toHaveBeenCalledWith({ search: "", category_id: undefined, page: 1 })
    expect(screen.getByLabelText("Ordenar")).toHaveValue("")
  })

  it("escolher tempo e ordem muda a URL e volta para a página 1", async () => {
    searchParams = new URLSearchParams({ pagina: "3" })
    window.history.replaceState(null, "", "/recipes?pagina=3")
    renderWithClient(<RecipesPage />)
    await screen.findByText("Bolo de Cenoura")

    await userEvent.click(screen.getByRole("button", { name: "Até 1 hora" }))
    expect(replace).toHaveBeenLastCalledWith("/recipes?tempo=60", { scroll: false })

    await userEvent.selectOptions(screen.getByLabelText("Ordenar"), "Mais favoritadas")
    expect(replace).toHaveBeenLastCalledWith("/recipes?ordem=favoritas", { scroll: false })
  })

  it("digitar busca na API depois de uma pausa e volta para a página 1", async () => {
    searchParams = new URLSearchParams({ pagina: "3" })
    window.history.replaceState(null, "", "/recipes?pagina=3")
    renderWithClient(<RecipesPage />)

    await userEvent.setup().type(screen.getByLabelText("Buscar receitas"), "pão de queijo")

    await vi.waitFor(() => expect(replace).toHaveBeenCalled())
    expect(replace).toHaveBeenCalledTimes(1)
    expect(replace).toHaveBeenCalledWith("/recipes?q=p%C3%A3o+de+queijo", { scroll: false })
  })

  it("o texto digitado fica no campo enquanto a URL ainda não mudou", async () => {
    renderWithClient(<RecipesPage />)
    const input = screen.getByLabelText("Buscar receitas")

    await userEvent.setup().type(input, "pao")
    await vi.waitFor(() => expect(replace).toHaveBeenCalled())

    // o router (mockado) ainda não atualizou o searchParams, como numa
    // navegação que espera o servidor
    expect(input).toHaveValue("pao")
  })

  it("URL editada à mão com valores que a API recusaria vira o mais próximo aceito", async () => {
    searchParams = new URLSearchParams({ q: "x".repeat(150), categoria: "1.5", pagina: "1e20" })
    renderWithClient(<RecipesPage />)

    await screen.findByText("Bolo de Cenoura")
    expect(recipesService.list).toHaveBeenCalledWith({ search: "x".repeat(100), category_id: undefined, page: 10_000 })
  })

  it("filtra por categoria e desmarca clicando de novo", async () => {
    renderWithClient(<RecipesPage />)
    const user = userEvent.setup()

    await user.click(await screen.findByRole("button", { name: "Massas" }))
    expect(replace).toHaveBeenLastCalledWith("/recipes?categoria=2", { scroll: false })
  })

  it("troca de página pela paginação", async () => {
    vi.mocked(recipesService.list).mockResolvedValue(page([bolo], { total: 30, total_pages: 3 }))
    renderWithClient(<RecipesPage />)

    await userEvent.setup().click(await screen.findByRole("button", { name: "Próxima página" }))

    expect(replace).toHaveBeenCalledWith("/recipes?pagina=2", { scroll: false })
  })

  it("sem resultado com filtro: oferece limpar", async () => {
    searchParams = new URLSearchParams({ q: "xyz" })
    vi.mocked(recipesService.list).mockResolvedValue(page([]))
    renderWithClient(<RecipesPage />)

    expect(await screen.findByText("Nenhuma receita encontrada.")).toBeInTheDocument()
    await userEvent.setup().click(screen.getByRole("button", { name: /limpar busca e filtros/i }))

    expect(replace).toHaveBeenCalledWith("/recipes", { scroll: false })
  })

  it("erro da API vira aviso", async () => {
    vi.mocked(recipesService.list).mockRejectedValue(new Error("rede"))
    renderWithClient(<RecipesPage />)

    expect(await screen.findByText("Não foi possível carregar as receitas.")).toBeInTheDocument()
  })
})
