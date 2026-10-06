import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CommentSection } from "./CommentSection"
import { commentsService } from "@/services/comments.service"
import { useAuthStore } from "@/store/auth.store"
import type { Comment } from "@/types"

vi.mock("@/services/comments.service", () => ({
  commentsService: { getByRecipe: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
}))

const maria = { id: "maria", name: "Maria", image_profile: "" }
const joao = { id: "joao", name: "João", image_profile: "" }

const comments: Comment[] = [
  { id: 1, description: "Ficou ótimo", recipe_id: "r1", user: maria, created_at: "2026-10-01T10:00:00Z", updated_at: "2026-10-01T10:00:00Z" },
  { id: 2, description: "Faltou sal", recipe_id: "r1", user: joao, created_at: "2026-10-02T10:00:00Z", updated_at: "2026-10-03T10:00:00Z" },
]

function renderSection() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  render(
    <QueryClientProvider client={client}>
      <CommentSection recipeId="r1" />
    </QueryClientProvider>
  )
}

function loginAs(id: string, isAdm = false) {
  useAuthStore.getState().setAuth({ id, name: id, email: `${id}@pandacooking.com`, is_adm: isAdm }, "token")
}

async function commentItem(text: string) {
  return (await screen.findByText(text)).closest("li") as HTMLElement
}

describe("CommentSection", () => {
  beforeEach(() => {
    vi.mocked(commentsService.getByRecipe).mockResolvedValue(comments)
    vi.mocked(commentsService.update).mockReset()
    vi.mocked(commentsService.delete).mockReset()
    useAuthStore.getState().clearAuth()
  })

  it("lista os comentários com autor e marca o que foi editado", async () => {
    renderSection()

    const joaoItem = await commentItem("Faltou sal")
    expect(within(joaoItem).getByText("João")).toBeInTheDocument()
    expect(within(joaoItem).getByText(/editado/)).toBeInTheDocument()
    expect(within(await commentItem("Ficou ótimo")).queryByText(/editado/)).not.toBeInTheDocument()
    expect(commentsService.getByRecipe).toHaveBeenCalledWith("r1")
  })

  it("autor edita o próprio comentário", async () => {
    loginAs("maria")
    vi.mocked(commentsService.update).mockResolvedValue({ ...comments[0], description: "Ficou ótimo, fiz de novo" })
    renderSection()
    const user = userEvent.setup()

    const item = await commentItem("Ficou ótimo")
    await user.click(within(item).getByRole("button", { name: "Editar comentário" }))
    const box = within(item).getByRole("textbox", { name: "Editar comentário" })
    await user.clear(box)
    await user.type(box, "Ficou ótimo, fiz de novo")
    await user.click(within(item).getByRole("button", { name: "Salvar" }))

    await vi.waitFor(() => expect(commentsService.update).toHaveBeenCalledWith(1, "Ficou ótimo, fiz de novo"))
  })

  it("cancelar volta o texto original sem chamar a API", async () => {
    loginAs("maria")
    renderSection()
    const user = userEvent.setup()

    const item = await commentItem("Ficou ótimo")
    await user.click(within(item).getByRole("button", { name: "Editar comentário" }))
    await user.type(within(item).getByRole("textbox"), " mudado")
    await user.click(within(item).getByRole("button", { name: "Cancelar" }))

    expect(within(item).getByText("Ficou ótimo")).toBeInTheDocument()
    expect(commentsService.update).not.toHaveBeenCalled()
  })

  it("não mostra editar nem apagar no comentário de outra pessoa", async () => {
    loginAs("maria")
    renderSection()

    const item = await commentItem("Faltou sal")
    expect(within(item).queryByRole("button", { name: "Editar comentário" })).not.toBeInTheDocument()
    expect(within(item).queryByRole("button", { name: "Apagar comentário" })).not.toBeInTheDocument()
  })

  it("admin apaga comentário de outra pessoa, mas não edita", async () => {
    loginAs("admin", true)
    vi.mocked(commentsService.delete).mockResolvedValue()
    renderSection()
    const user = userEvent.setup()

    const item = await commentItem("Faltou sal")
    expect(within(item).queryByRole("button", { name: "Editar comentário" })).not.toBeInTheDocument()
    await user.click(within(item).getByRole("button", { name: "Apagar comentário" }))

    await vi.waitFor(() => expect(commentsService.delete).toHaveBeenCalledWith(2))
  })
})
