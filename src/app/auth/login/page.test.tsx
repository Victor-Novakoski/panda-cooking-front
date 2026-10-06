import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import LoginPage from "./page"
import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"

const push = vi.fn()
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }))
vi.mock("@/services/auth.service", () => ({ authService: { login: vi.fn() } }))

function renderPage() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <LoginPage />
    </QueryClientProvider>
  )
}

async function fillAndSubmit(email: string, password: string) {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText("Email"), email)
  await user.type(screen.getByLabelText("Senha"), password)
  await user.click(screen.getByRole("button", { name: /entrar/i }))
}

describe("LoginPage", () => {
  beforeEach(() => {
    push.mockReset()
    vi.mocked(authService.login).mockReset()
    useAuthStore.getState().clearAuth()
  })

  it("valida o formulário antes de chamar a API", async () => {
    renderPage()

    // "maria@pandacooking" passa na validação do navegador (input type="email"), mas não no Zod.
    await fillAndSubmit("maria@pandacooking", "123")

    expect(await screen.findByText("Email inválido")).toBeInTheDocument()
    expect(screen.getByText("Mínimo de 6 caracteres")).toBeInTheDocument()
    expect(authService.login).not.toHaveBeenCalled()
  })

  it("mostra erro quando email ou senha estão errados", async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error("401"))
    renderPage()

    await fillAndSubmit("maria@pandacooking.com", "senha-errada")

    expect(await screen.findByText("Email ou senha incorretos")).toBeInTheDocument()
    expect(push).not.toHaveBeenCalled()
  })

  it("salva a sessão e vai para o dashboard", async () => {
    const user = { id: "1", name: "Maria Silva", email: "maria@pandacooking.com", is_adm: false }
    vi.mocked(authService.login).mockResolvedValue({ token: "token-abc", user })
    renderPage()

    await fillAndSubmit("maria@pandacooking.com", "panda-cooking-demo")

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"))
    expect(useAuthStore.getState().user).toEqual(user)
    expect(localStorage.getItem("@pandaToken")).toBe("token-abc")
  })
})
