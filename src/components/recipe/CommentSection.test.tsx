import { screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CommentSection } from "./CommentSection"
import { commentsService } from "@/services/comments.service"
import { useAuthStore } from "@/store/auth.store"
import { apiError, loginAs, makeComment, page, renderWithClient } from "@/test/utils"

vi.mock("next/navigation", () => ({ usePathname: () => "/recipes/r1" }))
vi.mock("@/services/comments.service", () => ({
  commentsService: { list: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
}))

const maria = { id: "maria", name: "Maria", image_profile: "" }
const joao = { id: "joao", name: "João", image_profile: "" }

const fromMaria = makeComment({ id: 1, description: "Ficou ótimo", user: maria })
const fromJoao = makeComment({
  id: 2,
  description: "Faltou sal",
  user: joao,
  created_at: "2026-10-02T10:00:00Z",
  updated_at: "2026-10-03T10:00:00Z",
})

async function commentItem(text: string) {
  return (await screen.findByText(text)).closest("li") as HTMLElement
}

describe("CommentSection", () => {
  beforeEach(() => {
    vi.mocked(commentsService.list).mockReset().mockResolvedValue(page([fromJoao, fromMaria]))
    vi.mocked(commentsService.create).mockReset()
    vi.mocked(commentsService.update).mockReset()
    vi.mocked(commentsService.delete).mockReset()
  })

  it("lista com autor, total e marca o que foi editado", async () => {
    useAuthStore.getState().clearSession()
    renderWithClient(<CommentSection recipeId="r1" />)

    const joaoItem = await commentItem("Faltou sal")
    expect(within(joaoItem).getByText("João")).toBeInTheDocument()
    expect(within(joaoItem).getByText(/editado/)).toBeInTheDocument()
    expect(within(await commentItem("Ficou ótimo")).queryByText(/editado/)).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Comentários (2)" })).toBeInTheDocument()
    expect(commentsService.list).toHaveBeenCalledWith("r1", 1)
  })

  it("sem sessão convida a entrar, voltando para a receita", async () => {
    useAuthStore.getState().clearSession()
    renderWithClient(<CommentSection recipeId="r1" />)

    expect(await screen.findByRole("link", { name: "Entre" })).toHaveAttribute("href", "/auth/login?next=%2Frecipes%2Fr1")
    expect(screen.queryByLabelText("Novo comentário")).not.toBeInTheDocument()
  })

  it("carrega mais comentários sob demanda", async () => {
    const older = makeComment({ id: 3, description: "Receita antiga e boa" })
    vi.mocked(commentsService.list).mockImplementation(async (_id, p = 1) =>
      p === 1 ? page([fromJoao, fromMaria], { total: 3, total_pages: 2 }) : page([older], { page: 2, total: 3, total_pages: 2 })
    )
    renderWithClient(<CommentSection recipeId="r1" />)

    await userEvent.setup().click(await screen.findByRole("button", { name: "Ver mais comentários" }))

    expect(await screen.findByText("Receita antiga e boa")).toBeInTheDocument()
    expect(commentsService.list).toHaveBeenCalledWith("r1", 2)
    expect(screen.queryByRole("button", { name: "Ver mais comentários" })).not.toBeInTheDocument()
  })

  it("comenta na receita e limpa o campo", async () => {
    loginAs()
    vi.mocked(commentsService.create).mockResolvedValue(makeComment({ id: 9, description: "Amei" }))
    renderWithClient(<CommentSection recipeId="r1" />)
    const user = userEvent.setup()

    const box = await screen.findByLabelText("Novo comentário")
    await user.type(box, "  Amei  ")
    await user.click(screen.getByRole("button", { name: /comentar/i }))

    await vi.waitFor(() => expect(commentsService.create).toHaveBeenCalledWith("r1", "Amei"))
    await vi.waitFor(() => expect(box).toHaveValue(""))
  })

  it("comentário longo demais não envia", async () => {
    loginAs()
    renderWithClient(<CommentSection recipeId="r1" />)
    const user = userEvent.setup()

    const box = await screen.findByLabelText("Novo comentário")
    await user.click(box)
    await user.paste("a".repeat(1001))

    expect(screen.getByText("1001/1000")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /comentar/i })).toBeDisabled()
  })

  it("mostra o erro da API ao comentar", async () => {
    loginAs()
    vi.mocked(commentsService.create).mockRejectedValue(apiError(404, { error: "receita não encontrada" }))
    renderWithClient(<CommentSection recipeId="r1" />)
    const user = userEvent.setup()

    await user.type(await screen.findByLabelText("Novo comentário"), "Oi")
    await user.click(screen.getByRole("button", { name: /comentar/i }))

    expect(await screen.findByText("Receita não encontrada")).toBeInTheDocument()
  })

  it("autor edita o próprio comentário", async () => {
    loginAs({ id: "maria" })
    vi.mocked(commentsService.update).mockResolvedValue({ ...fromMaria, description: "Ficou ótimo, fiz de novo" })
    renderWithClient(<CommentSection recipeId="r1" />)
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
    loginAs({ id: "maria" })
    renderWithClient(<CommentSection recipeId="r1" />)
    const user = userEvent.setup()

    const item = await commentItem("Ficou ótimo")
    await user.click(within(item).getByRole("button", { name: "Editar comentário" }))
    await user.type(within(item).getByRole("textbox"), " mudado")
    await user.click(within(item).getByRole("button", { name: "Cancelar" }))

    expect(within(item).getByText("Ficou ótimo")).toBeInTheDocument()
    expect(commentsService.update).not.toHaveBeenCalled()
  })

  it("não mostra editar nem apagar no comentário de outra pessoa", async () => {
    loginAs({ id: "maria" })
    renderWithClient(<CommentSection recipeId="r1" />)

    const item = await commentItem("Faltou sal")
    expect(within(item).queryByRole("button", { name: "Editar comentário" })).not.toBeInTheDocument()
    expect(within(item).queryByRole("button", { name: "Apagar comentário" })).not.toBeInTheDocument()
  })

  it("admin apaga comentário de outra pessoa, mas não edita", async () => {
    loginAs({ id: "admin", is_adm: true })
    vi.mocked(commentsService.delete).mockResolvedValue()
    renderWithClient(<CommentSection recipeId="r1" />)
    const user = userEvent.setup()

    const item = await commentItem("Faltou sal")
    expect(within(item).queryByRole("button", { name: "Editar comentário" })).not.toBeInTheDocument()
    await user.click(within(item).getByRole("button", { name: "Apagar comentário" }))

    await vi.waitFor(() => expect(commentsService.delete).toHaveBeenCalledWith(2))
  })
})
