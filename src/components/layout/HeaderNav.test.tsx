import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { HeaderNav } from "./HeaderNav"
import { useAuthStore } from "@/store/auth.store"

const push = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  usePathname: () => "/dashboard",
}))

describe("HeaderNav", () => {
  beforeEach(() => {
    push.mockReset()
    useAuthStore.getState().clearAuth()
  })

  it("sem sessão mostra Entrar e Cadastrar", () => {
    render(<HeaderNav />)

    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument()
    expect(screen.getByRole("link", { name: /cadastrar/i })).toBeInTheDocument()
  })

  it("com sessão mostra o primeiro nome e sair encerra a sessão", async () => {
    useAuthStore.getState().setAuth(
      { id: "1", name: "Maria Silva", email: "maria@pandacooking.com", is_adm: false },
      "token-abc"
    )
    render(<HeaderNav />)
    expect(screen.getByText("Maria")).toBeInTheDocument()

    await userEvent.setup().click(screen.getByRole("button", { name: "Sair" }))

    expect(useAuthStore.getState().token).toBeNull()
    expect(localStorage.getItem("@pandaToken")).toBeNull()
    expect(push).toHaveBeenCalledWith("/")
    expect(screen.getByRole("link", { name: "Entrar" })).toBeInTheDocument()
  })
})
