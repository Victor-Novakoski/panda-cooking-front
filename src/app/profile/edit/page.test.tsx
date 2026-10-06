import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import EditProfilePage from "./page"
import { usersService } from "@/services/users.service"
import { useAuthStore } from "@/store/auth.store"

const push = vi.fn()
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }), usePathname: () => "/profile/edit" }))
vi.mock("@/services/users.service", () => ({ usersService: { update: vi.fn() } }))

const maria = {
  id: "maria",
  name: "Maria Silva",
  email: "maria@pandacooking.com",
  image_profile: "https://exemplo.com/maria.jpg",
  is_adm: false,
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <EditProfilePage />
    </QueryClientProvider>
  )
}

describe("EditProfilePage", () => {
  beforeEach(() => {
    push.mockReset()
    vi.mocked(usersService.update).mockReset()
    useAuthStore.getState().setAuth(maria, "token-abc")
  })

  it("salva o nome novo e atualiza o usuário da sessão", async () => {
    vi.mocked(usersService.update).mockResolvedValue({ ...maria, name: "Maria S." })
    renderPage()
    const user = userEvent.setup()

    const name = screen.getByLabelText("Nome")
    expect(name).toHaveValue("Maria Silva")
    await user.clear(name)
    await user.type(name, "Maria S.")
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/profile"))
    expect(usersService.update).toHaveBeenCalledWith(
      { name: "Maria S.", image_profile: "https://exemplo.com/maria.jpg" },
      expect.anything()
    )
    expect(useAuthStore.getState().user?.name).toBe("Maria S.")
    expect(useAuthStore.getState().token).toBe("token-abc")
  })

  it("remover foto manda a foto vazia", async () => {
    vi.mocked(usersService.update).mockResolvedValue({ ...maria, image_profile: "" })
    renderPage()
    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: "Remover foto" }))
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    await vi.waitFor(() => expect(usersService.update).toHaveBeenCalled())
    expect(vi.mocked(usersService.update).mock.calls[0][0]).toEqual({ name: "Maria Silva", image_profile: "" })
    expect(useAuthStore.getState().user?.image_profile).toBe("")
  })

  it("recusa foto que não é link http ou https", async () => {
    renderPage()
    const user = userEvent.setup()

    const photo = screen.getByLabelText("URL da foto (opcional)")
    await user.clear(photo)
    await user.type(photo, "foto.jpg")
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    expect(await screen.findByText("Use um link que comece com http:// ou https://")).toBeInTheDocument()
    expect(usersService.update).not.toHaveBeenCalled()
  })

  it("botão de salvar fica desabilitado sem mudança", () => {
    renderPage()

    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled()
  })
})
