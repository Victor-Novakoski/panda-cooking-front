import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import EditProfilePage from "./page"
import { usersService } from "@/services/users.service"
import { useAuthStore } from "@/store/auth.store"
import { apiError, loginAs, renderWithClient } from "@/test/utils"

const push = vi.fn()
const replace = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace }),
  usePathname: () => "/profile/edit",
}))
vi.mock("@/services/users.service", () => ({ usersService: { update: vi.fn(), deleteAccount: vi.fn() } }))

const photo = "https://images.unsplash.com/maria.jpg"

describe("EditProfilePage", () => {
  beforeEach(() => {
    push.mockReset()
    replace.mockReset()
    vi.mocked(usersService.update).mockReset()
    vi.mocked(usersService.deleteAccount).mockReset()
  })

  it("salva o nome novo e atualiza o usuário da sessão", async () => {
    const maria = loginAs({ image_profile: photo })
    vi.mocked(usersService.update).mockResolvedValue({ ...maria, name: "Maria S." })
    renderWithClient(<EditProfilePage />)
    const user = userEvent.setup()

    const name = screen.getByLabelText("Nome")
    expect(name).toHaveValue("Maria Silva")
    await user.clear(name)
    await user.type(name, "Maria S.")
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/profile"))
    expect(usersService.update).toHaveBeenCalledWith({ name: "Maria S.", image_profile: photo })
    expect(useAuthStore.getState().user?.name).toBe("Maria S.")
    expect(useAuthStore.getState().token).toBe("token-abc")
  })

  it("remover foto manda a foto vazia", async () => {
    const maria = loginAs({ image_profile: photo })
    vi.mocked(usersService.update).mockResolvedValue({ ...maria, image_profile: "" })
    renderWithClient(<EditProfilePage />)
    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: "Remover foto" }))
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    await vi.waitFor(() => expect(usersService.update).toHaveBeenCalledWith({ name: "Maria Silva", image_profile: "" }))
    await vi.waitFor(() => expect(useAuthStore.getState().user?.image_profile).toBe(""))
  })

  it("aceita só foto em https", async () => {
    loginAs()
    renderWithClient(<EditProfilePage />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText("Link da foto (opcional)"), "http://exemplo.com/foto.jpg")
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    expect(await screen.findByText("Use um link que comece com https://")).toBeInTheDocument()
    expect(usersService.update).not.toHaveBeenCalled()
  })

  it("erro da API aparece no campo", async () => {
    loginAs()
    vi.mocked(usersService.update).mockRejectedValue(
      apiError(422, { error: "dados inválidos", fields: { name: "use no máximo 80 caracteres" } })
    )
    renderWithClient(<EditProfilePage />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText("Nome"), " Panda")
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    expect(await screen.findByText("Use no máximo 80 caracteres")).toBeInTheDocument()
  })

  it("botão de salvar fica desabilitado sem mudança", () => {
    loginAs()
    renderWithClient(<EditProfilePage />)

    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled()
  })

  it("apaga a conta só depois de confirmar e encerra a sessão", async () => {
    loginAs()
    vi.mocked(usersService.deleteAccount).mockResolvedValue()
    renderWithClient(<EditProfilePage />)
    const user = userEvent.setup()

    await user.click(screen.getByRole("button", { name: "Apagar conta" }))
    expect(usersService.deleteAccount).not.toHaveBeenCalled()
    await user.click(screen.getByRole("button", { name: /sim, apagar minha conta/i }))

    await vi.waitFor(() => expect(replace).toHaveBeenCalledWith("/"))
    expect(useAuthStore.getState().status).toBe("anonymous")
  })

  it("API fora do ar ao conferir a sessão: avisa em vez de mandar para o login", () => {
    useAuthStore.getState().setStatus("unavailable")
    renderWithClient(<EditProfilePage />)

    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível conferir sua sessão.")
    expect(replace).not.toHaveBeenCalled()
  })
})
