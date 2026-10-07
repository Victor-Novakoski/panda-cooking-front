import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { FavoriteButton } from "./FavoriteButton"
import { favoritesService } from "@/services/favorites.service"
import { useAuthStore } from "@/store/auth.store"
import { apiError, loginAs, renderWithClient } from "@/test/utils"

vi.mock("@/services/favorites.service", () => ({
  favoritesService: { isFavorite: vi.fn(), add: vi.fn(), remove: vi.fn() },
}))

describe("FavoriteButton", () => {
  beforeEach(() => {
    vi.mocked(favoritesService.isFavorite).mockReset()
    vi.mocked(favoritesService.add).mockReset()
    vi.mocked(favoritesService.remove).mockReset()
  })

  it("não aparece sem sessão (nem pergunta para a API)", () => {
    useAuthStore.getState().clearSession()
    const { container } = renderWithClient(<FavoriteButton recipeId="r1" />)

    expect(container).toBeEmptyDOMElement()
    expect(favoritesService.isFavorite).not.toHaveBeenCalled()
  })

  it("favorita e o botão muda na hora", async () => {
    loginAs()
    vi.mocked(favoritesService.isFavorite).mockResolvedValueOnce(false).mockResolvedValue(true)
    let finish = () => {}
    vi.mocked(favoritesService.add).mockReturnValue(new Promise<void>((resolve) => (finish = resolve)))
    renderWithClient(<FavoriteButton recipeId="r1" />)

    const button = await screen.findByRole("button", { name: /favoritar/i })
    await vi.waitFor(() => expect(button).toBeEnabled())
    await userEvent.setup().click(button)

    expect(await screen.findByRole("button", { name: /favoritada/i })).toHaveAttribute("aria-pressed", "true")
    finish()
    expect(favoritesService.add).toHaveBeenCalledWith("r1")
  })

  it("desfavorita", async () => {
    loginAs()
    vi.mocked(favoritesService.isFavorite).mockResolvedValueOnce(true).mockResolvedValue(false)
    vi.mocked(favoritesService.remove).mockResolvedValue()
    renderWithClient(<FavoriteButton recipeId="r1" />)

    const button = await screen.findByRole("button", { name: /favoritada/i })
    await vi.waitFor(() => expect(button).toBeEnabled())
    await userEvent.setup().click(button)

    await vi.waitFor(() => expect(favoritesService.remove).toHaveBeenCalledWith("r1"))
    expect(await screen.findByRole("button", { name: /favoritar/i })).toHaveAttribute("aria-pressed", "false")
  })

  it("já estava nos favoritos (outra aba): continua favoritada, sem erro", async () => {
    loginAs()
    vi.mocked(favoritesService.isFavorite).mockResolvedValueOnce(false).mockResolvedValue(true)
    vi.mocked(favoritesService.add).mockRejectedValue(apiError(409, { error: "receita já está nos favoritos" }))
    renderWithClient(<FavoriteButton recipeId="r1" />)

    const button = await screen.findByRole("button", { name: /favoritar/i })
    await vi.waitFor(() => expect(button).toBeEnabled())
    await userEvent.setup().click(button)

    expect(await screen.findByRole("button", { name: /favoritada/i })).toBeInTheDocument()
  })

  it("erro da API desfaz a mudança", async () => {
    loginAs()
    vi.mocked(favoritesService.isFavorite).mockResolvedValue(false)
    vi.mocked(favoritesService.add).mockRejectedValue(apiError(500))
    renderWithClient(<FavoriteButton recipeId="r1" />)

    const button = await screen.findByRole("button", { name: /favoritar/i })
    await vi.waitFor(() => expect(button).toBeEnabled())
    await userEvent.setup().click(button)

    await vi.waitFor(() => expect(favoritesService.add).toHaveBeenCalled())
    expect(await screen.findByRole("button", { name: /favoritar/i })).toHaveAttribute("aria-pressed", "false")
  })
})
