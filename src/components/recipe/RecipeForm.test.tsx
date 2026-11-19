import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { RecipeForm, emptyRecipeForm, recipeToForm, toRecipePayload } from "./RecipeForm"
import type { RecipePayload } from "@/services/recipes.service"
import { apiError, makeRecipe, renderWithClient } from "@/test/utils"
import { uploadsService } from "@/services/uploads.service"

vi.mock("@/services/uploads.service", () => ({ uploadsService: { upload: vi.fn() } }))
// O navegador do teste (jsdom) não desenha em canvas: a foto vai como veio.
vi.mock("@/lib/photo", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/photo")>()),
  preparePhoto: vi.fn(async (file: File) => file),
}))

vi.mock("@/services/categories.service", () => ({
  categoriesService: { getAll: vi.fn().mockResolvedValue([{ id: 1, name: "Massas" }, { id: 2, name: "Doces" }]) },
}))

const recipe = makeRecipe({
  category: { id: 2, name: "Doces" },
  video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  images: [
    { id: 1, url: "https://images.unsplash.com/capa.jpg" },
    { id: 2, url: "https://exemplo.com/extra.jpg" },
  ],
})

function renderForm(onSubmit = vi.fn<(payload: RecipePayload) => Promise<unknown>>().mockResolvedValue(undefined)) {
  renderWithClient(
    <RecipeForm
      defaultValues={recipeToForm(recipe)}
      onSubmit={onSubmit}
      errorFallback="Erro ao salvar."
      submitLabel="Salvar"
      pendingLabel="Salvando..."
    />
  )
  return onSubmit
}

describe("RecipeForm", () => {
  let user: ReturnType<typeof userEvent.setup>
  beforeEach(() => {
    user = userEvent.setup()
  })

  it("volta da receita para o formulário e do formulário para a API sem perder nada", () => {
    expect(toRecipePayload(recipeToForm(recipe))).toEqual({
      name: recipe.name,
      description: recipe.description,
      time_minutes: 60,
      portions: 2,
      category_id: 2,
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      images: [{ url: "https://images.unsplash.com/capa.jpg" }, { url: "https://exemplo.com/extra.jpg" }],
      ingredients: [{ amount: "200 g", name: "macarrão" }],
      preparations: [{ description: "Cozinhe o macarrão" }],
    })
  })

  it("o tempo é um número de minutos, e a partir de uma hora mostra como vai aparecer", async () => {
    const onSubmit = renderForm()
    const time = screen.getByLabelText("Tempo (minutos)")
    expect(time).toHaveValue(60)
    expect(screen.getByText("Aparece como 1h")).toBeInTheDocument()

    await user.clear(time)
    await user.type(time, "95")
    expect(screen.getByText("Aparece como 1h 35min")).toBeInTheDocument()

    await user.clear(time)
    await user.type(time, "3000")
    await user.click(screen.getByRole("button", { name: "Salvar" }))
    expect(await screen.findByText("Use um número de 1 a 2880 minutos")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    await user.clear(time)
    await user.click(screen.getByRole("button", { name: "Salvar" }))
    expect(await screen.findByText("Informe o tempo")).toBeInTheDocument()
  })

  it("o vídeo é opcional e só aceita link do YouTube", async () => {
    const onSubmit = renderForm()
    const video = screen.getByLabelText("Vídeo (opcional)")
    expect(video).toHaveValue("https://www.youtube.com/watch?v=dQw4w9WgXcQ")

    await user.clear(video)
    await user.type(video, "https://vimeo.com/123456789")
    await user.click(screen.getByRole("button", { name: "Salvar" }))
    expect(await screen.findByText("Use um link de vídeo do YouTube")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()

    await user.clear(video)
    await user.click(screen.getByRole("button", { name: "Salvar" }))
    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ video_url: "" })))
  })

  it("mostra a categoria salva quando as opções chegam", async () => {
    renderForm()

    await screen.findByRole("option", { name: "Doces" })
    expect(screen.getByLabelText("Categoria")).toHaveValue("2")
  })

  it("aceita só foto em https", async () => {
    const onSubmit = renderForm()

    const cover = screen.getByLabelText("Link da foto de capa")
    await user.clear(cover)
    await user.type(cover, "http://exemplo.com/foto.jpg")
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    expect(await screen.findByText("Use um link que comece com https:// ou envie a foto do computador")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("adiciona e remove fotos, ingredientes e passos", async () => {
    const onSubmit = renderForm()

    await user.click(screen.getByRole("button", { name: "Remover foto 2" }))
    await user.click(screen.getByRole("button", { name: /adicionar ingrediente/i }))
    await user.type(screen.getByLabelText("Quantidade do ingrediente 2"), "1 colher")
    await user.type(screen.getByLabelText("Ingrediente 2"), "shoyu")
    await user.click(screen.getByRole("button", { name: /adicionar passo/i }))
    await user.type(screen.getByLabelText("Passo 2"), "Sirva quente")
    await user.click(screen.getByRole("button", { name: "Remover passo 1" }))
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled())
    const payload = onSubmit.mock.calls[0][0]
    expect(payload.images).toEqual([{ url: "https://images.unsplash.com/capa.jpg" }])
    expect(payload.ingredients).toEqual([
      { amount: "200 g", name: "macarrão" },
      { amount: "1 colher", name: "shoyu" },
    ])
    expect(payload.preparations).toEqual([{ description: "Sirva quente" }])
  })

  it("campo de foto vazio pede o link ou que seja removido", async () => {
    const onSubmit = renderForm()

    await user.click(screen.getByRole("button", { name: "Adicionar link" }))
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    expect(await screen.findByText("Cole o link da foto ou remova o campo")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("respeita os limites da API", async () => {
    const onSubmit = renderForm()

    const name = screen.getByLabelText("Nome da receita")
    await user.clear(name)
    await user.click(name)
    await user.paste("x".repeat(121))
    const portions = screen.getByLabelText("Porções")
    await user.clear(portions)
    await user.type(portions, "101")
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    expect(await screen.findByText("Use no máximo 120 caracteres")).toBeInTheDocument()
    expect(screen.getByText("Use um número de 1 a 100")).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it("mostra cada erro da API no campo certo", async () => {
    renderForm(
      vi.fn().mockRejectedValue(
        apiError(422, {
          error: "dados inválidos",
          fields: {
            "ingredients[0].amount": "use no máximo 60 caracteres",
            "images[1].url": "use um link que comece com https://",
            category_id: "categoria não encontrada",
          },
        })
      )
    )

    await user.click(screen.getByRole("button", { name: "Salvar" }))

    expect(await screen.findByText("Use no máximo 60 caracteres")).toBeInTheDocument()
    expect(screen.getByLabelText("Quantidade do ingrediente 1")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByLabelText("Link da foto 2")).toHaveAttribute("aria-invalid", "true")
    expect(screen.getByText("Categoria não encontrada")).toBeInTheDocument()
  })

  it("erro sem campo vira aviso geral", async () => {
    renderForm(vi.fn().mockRejectedValue(apiError(403, { error: "sem permissão para editar esta receita" })))

    await user.click(screen.getByRole("button", { name: "Salvar" }))

    expect(await screen.findByRole("alert")).toHaveTextContent("Sem permissão para editar esta receita")
  })

  it("envia várias fotos do computador de uma vez e elas entram depois das que já existiam", async () => {
    const uuid = (n: number) => `00000000-0000-0000-0000-00000000000${n}`
    vi.mocked(uploadsService.upload).mockResolvedValueOnce(`/api/uploads/${uuid(1)}`).mockResolvedValueOnce(`/api/uploads/${uuid(2)}`)
    const onSubmit = renderForm()

    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!
    expect(input).toHaveAttribute("multiple")
    await user.upload(input, [
      new File(["a"], "a.png", { type: "image/png" }),
      new File(["b"], "b.jpg", { type: "image/jpeg" }),
    ])

    expect(await screen.findByText("Foto 4: enviada do computador")).toBeInTheDocument()
    expect(screen.getByText("Foto 3: enviada do computador")).toBeInTheDocument()

    await user.click(screen.getAllByRole("button", { name: "Usar como capa" }).at(-1)!)
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(onSubmit.mock.calls[0][0].images).toEqual([
      { url: `/api/uploads/${uuid(2)}` },
      { url: "https://images.unsplash.com/capa.jpg" },
      { url: "https://exemplo.com/extra.jpg" },
      { url: `/api/uploads/${uuid(1)}` },
    ])
  })

  it("mostra o erro do envio e mantém as fotos que já subiram", async () => {
    vi.mocked(uploadsService.upload)
      .mockReset()
      .mockResolvedValueOnce("/api/uploads/00000000-0000-0000-0000-000000000001")
      .mockRejectedValueOnce(apiError(422, { error: "use uma foto JPG, PNG, WebP ou GIF" }))
    renderForm()

    await user.upload(document.querySelector<HTMLInputElement>('input[type="file"]')!, [
      new File(["a"], "a.png", { type: "image/png" }),
      new File(["b"], "b.png", { type: "image/png" }),
    ])

    expect(await screen.findByRole("alert")).toHaveTextContent("Use uma foto JPG, PNG, WebP ou GIF")
    expect(screen.getByText("Foto 3: enviada do computador")).toBeInTheDocument()
    expect(screen.queryByText("Foto 4: enviada do computador")).not.toBeInTheDocument()
  })

  it("sobe e desce ingredientes e passos, e a ordem nova vai para a API", async () => {
    const onSubmit = vi.fn<(payload: RecipePayload) => Promise<unknown>>().mockResolvedValue(undefined)
    renderWithClient(
      <RecipeForm
        defaultValues={recipeToForm(
          makeRecipe({
            ingredients: [
              { id: 1, amount: "200 g", name: "macarrão" },
              { id: 2, amount: "1 litro", name: "caldo" },
            ],
            preparations: [
              { id: 1, description: "Ferva o caldo" },
              { id: 2, description: "Cozinhe o macarrão" },
              { id: 3, description: "Sirva" },
            ],
          })
        )}
        onSubmit={onSubmit}
        errorFallback="Erro ao salvar."
        submitLabel="Salvar"
        pendingLabel="Salvando..."
      />
    )

    expect(screen.getByRole("button", { name: "Subir ingrediente 1" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Descer passo 3" })).toBeDisabled()

    await user.click(screen.getByRole("button", { name: "Descer ingrediente 1" }))
    await user.click(screen.getByRole("button", { name: "Subir passo 3" }))
    await user.click(screen.getByRole("button", { name: "Subir passo 2" }))
    await user.click(screen.getByRole("button", { name: "Salvar" }))

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled())
    const payload = onSubmit.mock.calls[0][0]
    expect(payload.ingredients).toEqual([
      { amount: "1 litro", name: "caldo" },
      { amount: "200 g", name: "macarrão" },
    ])
    expect(payload.preparations.map((p) => p.description)).toEqual(["Sirva", "Ferva o caldo", "Cozinhe o macarrão"])
  })

  it("com um item só, não mostra as setas", () => {
    renderForm()

    expect(screen.queryByRole("button", { name: /Subir ingrediente|Descer ingrediente/ })).not.toBeInTheDocument()
  })
})

describe("RecipeForm: rascunho", () => {
  const KEY = "panda:rascunho:teste"
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    window.localStorage.clear()
    user = userEvent.setup()
  })

  function renderNew(onSubmit = vi.fn<(payload: RecipePayload) => Promise<unknown>>().mockResolvedValue(undefined), draftKey: string | null = KEY) {
    renderWithClient(
      <RecipeForm draftKey={draftKey ?? undefined} onSubmit={onSubmit} errorFallback="Erro." submitLabel="Publicar" pendingLabel="..." />
    )
    return onSubmit
  }

  const stored = () => JSON.parse(window.localStorage.getItem(KEY) ?? "null")

  it("guarda o que a pessoa digita, meio segundo depois", async () => {
    renderNew()
    expect(stored()).toBeNull()

    await user.type(screen.getByLabelText("Nome da receita"), "Bolo de fubá")

    await vi.waitFor(() => expect(stored()?.values.name).toBe("Bolo de fubá"))
    expect(Date.parse(stored().savedAt)).not.toBeNaN()
  })

  it("oferece continuar de onde parou e preenche o formulário", async () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ values: { ...emptyRecipeForm, name: "Bolo de fubá", time_minutes: "50" }, savedAt: "2026-10-13T22:30:00Z" })
    )
    renderNew()

    expect(screen.getByRole("status")).toHaveTextContent("Você tem uma receita não publicada (“Bolo de fubá”)")
    expect(screen.getByLabelText("Nome da receita")).toHaveValue("")

    await user.click(screen.getByRole("button", { name: "Continuar de onde parei" }))

    expect(screen.getByLabelText("Nome da receita")).toHaveValue("Bolo de fubá")
    expect(screen.getByLabelText("Tempo (minutos)")).toHaveValue(50)
    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("descartar apaga o rascunho", async () => {
    window.localStorage.setItem(KEY, JSON.stringify({ values: { ...emptyRecipeForm, name: "Bolo" }, savedAt: "2026-10-13T22:30:00Z" }))
    renderNew()

    await user.click(screen.getByRole("button", { name: "Descartar" }))

    expect(stored()).toBeNull()
    expect(screen.getByLabelText("Nome da receita")).toHaveValue("")
  })

  it("enquanto a pessoa não decide, o rascunho antigo não é apagado por cima", async () => {
    window.localStorage.setItem(KEY, JSON.stringify({ values: { ...emptyRecipeForm, name: "Antigo" }, savedAt: "2026-10-13T22:30:00Z" }))
    renderNew()

    await user.type(screen.getByLabelText("Nome da receita"), "Novo")
    await new Promise((r) => setTimeout(r, 700))

    expect(stored().values.name).toBe("Antigo")
  })

  it("publicar apaga o rascunho", async () => {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({
        values: {
          ...emptyRecipeForm,
          name: "Bolo de fubá",
          description: "O bolo da vó, fofinho e cheiroso.",
          time_minutes: "50",
          portions: "8",
          category_id: "1",
          ingredients: [{ amount: "2 xícaras", name: "fubá" }],
          preparations: [{ description: "Misture e asse." }],
        },
        savedAt: "2026-10-13T22:30:00Z",
      })
    )
    const onSubmit = renderNew()
    await screen.findByRole("option", { name: "Massas" })
    await user.click(screen.getByRole("button", { name: "Continuar de onde parei" }))

    await user.click(screen.getByRole("button", { name: "Publicar" }))

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled())
    await vi.waitFor(() => expect(stored()).toBeNull())
  })

  it("rascunho estragado é ignorado", () => {
    window.localStorage.setItem(KEY, "{não é json")
    renderNew()

    expect(screen.queryByRole("status")).not.toBeInTheDocument()
  })

  it("sem chave (tela de edição), não guarda nada", async () => {
    renderNew(undefined, null)

    await user.type(screen.getByLabelText("Nome da receita"), "Bolo")
    await new Promise((r) => setTimeout(r, 700))

    expect(window.localStorage.length).toBe(0)
  })
})
