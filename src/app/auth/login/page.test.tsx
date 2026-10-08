import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import LoginPage from "./page"
import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"
import { apiError, makeUser, renderWithClient } from "@/test/utils"

const replace = vi.fn()
let searchParams = new URLSearchParams()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => searchParams,
}))
vi.mock("@/services/auth.service", () => ({ authService: { login: vi.fn() } }))

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText("E-mail"), email)
  if (password) await user.type(screen.getByLabelText("Senha"), password)
  await user.click(screen.getByRole("button", { name: /entrar/i }))
}

const maria = makeUser()

describe("LoginPage", () => {
  beforeEach(() => {
    replace.mockReset()
    searchParams = new URLSearchParams()
    vi.mocked(authService.login).mockReset()
  })

  it("valida o formulário antes de chamar a API", async () => {
    renderWithClient(<LoginPage />)

    await fillAndSubmit("maria@pandacooking", "")

    expect(await screen.findByText("E-mail inválido")).toBeInTheDocument()
    expect(screen.getByText("Informe a senha")).toBeInTheDocument()
    expect(authService.login).not.toHaveBeenCalled()
  })

  it("mostra a mensagem da API quando e-mail ou senha estão errados", async () => {
    vi.mocked(authService.login).mockRejectedValue(apiError(401, { error: "e-mail ou senha inválidos" }))
    renderWithClient(<LoginPage />)

    await fillAndSubmit("maria@pandacooking.com", "senha-errada")

    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha inválidos")
    expect(replace).not.toHaveBeenCalled()
  })

  it("mostra o bloqueio por tentativas", async () => {
    vi.mocked(authService.login).mockRejectedValue(
      apiError(429, { error: "muitas tentativas de login, tente novamente mais tarde" })
    )
    renderWithClient(<LoginPage />)

    await fillAndSubmit("maria@pandacooking.com", "qualquer-senha")

    expect(await screen.findByRole("alert")).toHaveTextContent("Muitas tentativas de login")
  })

  it("abre a sessão em memória e vai para o dashboard", async () => {
    vi.mocked(authService.login).mockResolvedValue({ access_token: "token-abc", token_type: "Bearer", expires_in: 900, user: maria })
    renderWithClient(<LoginPage />)

    await fillAndSubmit("maria@pandacooking.com", "panda-cooking-demo")

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"))
    expect(authService.login).toHaveBeenCalledWith({ email: "maria@pandacooking.com", password: "panda-cooking-demo" })
    expect(useAuthStore.getState()).toMatchObject({ user: maria, token: "token-abc", status: "authenticated" })
    expect(localStorage.length).toBe(0)
  })

  it("volta para a página que pediu o login", async () => {
    searchParams = new URLSearchParams({ next: "/recipes/r1/edit" })
    vi.mocked(authService.login).mockResolvedValue({ access_token: "t", token_type: "Bearer", expires_in: 900, user: maria })
    renderWithClient(<LoginPage />)

    await fillAndSubmit("maria@pandacooking.com", "panda-cooking-demo")

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/recipes/r1/edit"))
  })

  it("ignora next que leva para fora do site", async () => {
    searchParams = new URLSearchParams({ next: "https://malicioso.site" })
    vi.mocked(authService.login).mockResolvedValue({ access_token: "t", token_type: "Bearer", expires_in: 900, user: maria })
    renderWithClient(<LoginPage />)

    await fillAndSubmit("maria@pandacooking.com", "panda-cooking-demo")

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"))
  })

  it("avisa que a conta acabou de ser criada", () => {
    searchParams = new URLSearchParams({ created: "1" })
    renderWithClient(<LoginPage />)

    expect(screen.getByRole("status")).toHaveTextContent("Conta criada")
  })
})
