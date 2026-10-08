import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import RegisterPage from "./page"
import { authService } from "@/services/auth.service"
import { usersService } from "@/services/users.service"
import { useAuthStore } from "@/store/auth.store"
import { apiError, makeUser, renderWithClient } from "@/test/utils"

const replace = vi.fn()
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }))
vi.mock("@/services/auth.service", () => ({ authService: { login: vi.fn() } }))
vi.mock("@/services/users.service", () => ({ usersService: { signup: vi.fn() } }))

const maria = makeUser()

async function fill(values: { name?: string; email?: string; password?: string; confirm?: string } = {}) {
  const { name = "Maria Silva", email = "maria@pandacooking.com", password = "panda come bambu" } = values
  const confirm = values.confirm ?? password
  const user = userEvent.setup()
  await user.type(screen.getByLabelText("Nome"), name)
  await user.type(screen.getByLabelText("E-mail"), email)
  await user.type(screen.getByLabelText("Senha"), password)
  await user.type(screen.getByLabelText("Confirmar senha"), confirm)
  await user.click(screen.getByRole("button", { name: /criar conta/i }))
}

describe("RegisterPage", () => {
  beforeEach(() => {
    replace.mockReset()
    vi.mocked(usersService.signup).mockReset()
    vi.mocked(authService.login).mockReset()
  })

  it("pede senha de 10 caracteres ou mais", async () => {
    renderWithClient(<RegisterPage />)

    await fill({ password: "curta" })

    expect(await screen.findByText("Use pelo menos 10 caracteres")).toBeInTheDocument()
    expect(usersService.signup).not.toHaveBeenCalled()
  })

  it("confere a confirmação e recusa a senha igual ao e-mail", async () => {
    renderWithClient(<RegisterPage />)

    await fill({ email: "chef.panda@pandacooking.com", password: "chef.panda", confirm: "outra-coisa" })

    expect(await screen.findByText("As senhas não coincidem")).toBeInTheDocument()
    expect(screen.getByText("A senha não pode ser o seu e-mail")).toBeInTheDocument()
  })

  it("e-mail já cadastrado aparece ao lado do campo", async () => {
    vi.mocked(usersService.signup).mockRejectedValue(
      apiError(409, { error: "e-mail já cadastrado", fields: { email: "e-mail já cadastrado" } })
    )
    renderWithClient(<RegisterPage />)

    await fill()

    expect(await screen.findByText("E-mail já cadastrado")).toBeInTheDocument()
    expect(screen.getByLabelText("E-mail")).toHaveAttribute("aria-invalid", "true")
    expect(authService.login).not.toHaveBeenCalled()
  })

  it("senha comum recusada pela API aparece no campo da senha", async () => {
    vi.mocked(usersService.signup).mockRejectedValue(
      apiError(422, { error: "senha muito comum, escolha outra", fields: { password: "senha muito comum, escolha outra" } })
    )
    renderWithClient(<RegisterPage />)

    await fill({ password: "senha123456" })

    expect(await screen.findByText("Senha muito comum, escolha outra")).toBeInTheDocument()
  })

  it("cria a conta, entra e vai para o dashboard", async () => {
    vi.mocked(usersService.signup).mockResolvedValue(maria)
    vi.mocked(authService.login).mockResolvedValue({ access_token: "token-abc", token_type: "Bearer", expires_in: 900, user: maria })
    renderWithClient(<RegisterPage />)

    await fill()

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/dashboard"))
    expect(usersService.signup).toHaveBeenCalledWith({ name: "Maria Silva", email: "maria@pandacooking.com", password: "panda come bambu" })
    expect(useAuthStore.getState().status).toBe("authenticated")
  })

  it("conta criada mas o login falhou: manda para o login com aviso", async () => {
    vi.mocked(usersService.signup).mockResolvedValue(maria)
    vi.mocked(authService.login).mockRejectedValue(apiError(429))
    renderWithClient(<RegisterPage />)

    await fill()

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/auth/login?created=1"))
  })
})
