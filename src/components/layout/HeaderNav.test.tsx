import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { HeaderNav } from "./HeaderNav"
import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"
import { loginAs, renderWithClient } from "@/test/utils"

const push = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/dashboard",
}))
vi.mock("@/services/auth.service", () => ({ authService: { logout: vi.fn() } }))

describe("HeaderNav", () => {
  beforeEach(() => {
    push.mockReset()
    vi.mocked(authService.logout).mockReset().mockResolvedValue()
  })

  it("enquanto confere a sessão não mostra nem Entrar nem o usuário", () => {
    renderWithClient(<HeaderNav />)

    expect(screen.queryByRole("link", { name: "Entrar" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Sair" })).not.toBeInTheDocument()
  })

  it("sem sessão mostra Entrar e Cadastrar", () => {
    useAuthStore.getState().clearSession()
    renderWithClient(<HeaderNav />)

    expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute("href", "/auth/login")
    expect(screen.getByRole("link", { name: /cadastrar/i })).toHaveAttribute("href", "/auth/register")
  })

  it("com sessão mostra o primeiro nome e sair encerra a sessão na API", async () => {
    loginAs({ name: "Maria Silva" })
    renderWithClient(<HeaderNav />)
    expect(screen.getByText("Maria")).toBeInTheDocument()

    await userEvent.setup().click(screen.getByRole("button", { name: "Sair" }))

    expect(authService.logout).toHaveBeenCalled()
    expect(useAuthStore.getState().token).toBeNull()
    expect(push).toHaveBeenCalledWith("/")
    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument()
  })
})
