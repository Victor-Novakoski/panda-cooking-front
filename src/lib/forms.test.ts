import { describe, expect, it, vi } from "vitest"
import { showApiErrors } from "./forms"
import { apiError } from "@/test/utils"

const options = { fallback: "padrão", fields: ["name", "ingredients"], lists: ["ingredients"] }

describe("showApiErrors", () => {
  it("põe a mensagem de cada campo ao lado dele e foca o primeiro", () => {
    const setError = vi.fn()
    const error = apiError(422, {
      error: "dados inválidos",
      fields: { name: "use pelo menos 3 caracteres", "ingredients[1].amount": "campo obrigatório" },
    })

    showApiErrors(error, setError, options)

    expect(setError).toHaveBeenCalledWith("name", { type: "server", message: "Use pelo menos 3 caracteres" }, { shouldFocus: true })
    expect(setError).toHaveBeenCalledWith(
      "ingredients.1.amount",
      { type: "server", message: "Campo obrigatório" },
      { shouldFocus: false }
    )
    expect(setError).not.toHaveBeenCalledWith("root.server", expect.anything())
  })

  it("erro da lista inteira vai para <lista>.root", () => {
    const setError = vi.fn()

    showApiErrors(apiError(422, { fields: { ingredients: "adicione pelo menos um item" } }), setError, options)

    expect(setError).toHaveBeenCalledWith(
      "ingredients.root",
      { type: "server", message: "Adicione pelo menos um item" },
      { shouldFocus: true }
    )
  })

  it("campo que o formulário não tem vira aviso geral", () => {
    const setError = vi.fn()

    showApiErrors(apiError(422, { fields: { is_adm: "campo não permitido" } }), setError, options)

    expect(setError).toHaveBeenCalledWith("root.server", { type: "server", message: "Campo não permitido" })
  })

  it("sem fields: mensagem da API, ou o texto padrão", () => {
    const setError = vi.fn()

    showApiErrors(apiError(401, { error: "e-mail ou senha inválidos" }), setError, options)
    showApiErrors(new Error("rede"), setError, options)

    expect(setError).toHaveBeenNthCalledWith(1, "root.server", { type: "server", message: "E-mail ou senha inválidos" })
    expect(setError).toHaveBeenNthCalledWith(2, "root.server", { type: "server", message: "padrão" })
  })
})
