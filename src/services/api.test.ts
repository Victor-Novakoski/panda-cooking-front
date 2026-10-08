import { AxiosError, type InternalAxiosRequestConfig } from "axios"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { api, apiErrorMessage, apiFieldErrors, refreshSession } from "./api"
import { useAuthStore } from "@/store/auth.store"
import { apiError, loginAs, makeUser } from "@/test/utils"

type Reply = [status: number, data?: unknown]

const originalAdapter = api.defaults.adapter
let calls: InternalAxiosRequestConfig[]

// Responde as requisições do axios sem rede: handler decide status e corpo.
function server(handler: (config: InternalAxiosRequestConfig) => Reply | Promise<Reply>) {
  api.defaults.adapter = async (config) => {
    calls.push(config)
    const [status, data = {}] = await handler(config)
    const response = { data, status, statusText: "", headers: {}, config }
    if (status >= 400) throw new AxiosError("erro", String(status), config, undefined, response)
    return response
  }
}

const sessionUser = makeUser({ name: "Maria Renovada" })
const refreshed = { access_token: "token-novo", token_type: "Bearer", expires_in: 900, user: sessionUser }
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe("api", () => {
  let assign: ReturnType<typeof vi.fn>

  beforeEach(() => {
    calls = []
    assign = vi.fn()
    // O jsdom não navega; o teste só confere para onde a pessoa seria mandada.
    vi.spyOn(window, "location", "get").mockReturnValue({
      pathname: "/profile",
      search: "?aba=favoritas",
      assign,
    } as unknown as Location)
  })

  afterEach(() => {
    api.defaults.adapter = originalAdapter
    vi.restoreAllMocks()
  })

  it("manda o access token da memória no Authorization", async () => {
    loginAs()
    server(() => [200])

    await api.get("/users/profile")

    expect(calls[0].headers.Authorization).toBe("Bearer token-abc")
    expect(calls[0].baseURL).toBe("/api")
  })

  it("não manda o token nas rotas da sessão", async () => {
    loginAs()
    server(() => [204])

    await api.post("/auth/logout")

    expect(calls[0].headers.Authorization).toBeUndefined()
  })

  it("token vencido: renova com o cookie e repete a requisição", async () => {
    loginAs()
    server((config) => {
      if (config.url === "/auth/refresh") return [200, refreshed]
      return config.headers.Authorization === "Bearer token-novo" ? [200, { ok: true }] : [401]
    })

    const res = await api.post("/recipes", { name: "Bolo" })

    expect(res.data).toEqual({ ok: true })
    expect(calls.map((c) => c.url)).toEqual(["/recipes", "/auth/refresh", "/recipes"])
    expect(JSON.parse(calls[2].data)).toEqual({ name: "Bolo" })
    expect(useAuthStore.getState().token).toBe("token-novo")
    expect(useAuthStore.getState().user?.name).toBe("Maria Renovada")
  })

  it("várias requisições com o token vencido esperam uma renovação só", async () => {
    loginAs()
    server(async (config) => {
      if (config.url === "/auth/refresh") {
        await delay(20)
        return [200, refreshed]
      }
      return config.headers.Authorization === "Bearer token-novo" ? [200] : [401]
    })

    await Promise.all([api.get("/a"), api.get("/b"), api.get("/c")])

    expect(calls.filter((c) => c.url === "/auth/refresh")).toHaveLength(1)
  })

  it("sessão acabou: limpa a memória e manda para o login, voltando para a mesma página", async () => {
    loginAs()
    server(() => [401])

    await expect(api.get("/users/profile")).rejects.toThrow()

    expect(useAuthStore.getState().status).toBe("anonymous")
    expect(useAuthStore.getState().token).toBeNull()
    expect(assign).toHaveBeenCalledWith("/auth/login?next=%2Fprofile%3Faba%3Dfavoritas")
  })

  it("não deu para renovar (API fora do ar): devolve o erro e mantém a sessão", async () => {
    loginAs()
    server((config) => (config.url === "/auth/refresh" ? [503] : [401]))

    await expect(api.get("/users/profile")).rejects.toThrow()

    expect(useAuthStore.getState().status).toBe("authenticated")
    expect(assign).not.toHaveBeenCalled()
  })

  it("repete só uma vez: 401 de novo depois de renovar não entra em laço", async () => {
    loginAs()
    server((config) => (config.url === "/auth/refresh" ? [200, refreshed] : [401]))

    await expect(api.get("/users/profile")).rejects.toThrow()

    expect(calls.map((c) => c.url)).toEqual(["/users/profile", "/auth/refresh", "/users/profile"])
  })

  it("401 no login (senha errada) não tenta renovar nem sai da página", async () => {
    server(() => [401, { error: "e-mail ou senha inválidos" }])

    await expect(api.post("/auth/login", {})).rejects.toThrow()

    expect(calls).toHaveLength(1)
    expect(assign).not.toHaveBeenCalled()
  })

  it("outros erros não mexem na sessão", async () => {
    loginAs()
    server(() => [500])

    await expect(api.get("/recipes")).rejects.toThrow()

    expect(calls).toHaveLength(1)
    expect(useAuthStore.getState().token).toBe("token-abc")
  })

  describe("refreshSession", () => {
    it("devolve null e marca sem sessão quando a API recusa o cookie", async () => {
      server(() => [401])

      await expect(refreshSession()).resolves.toBeNull()

      expect(useAuthStore.getState().status).toBe("anonymous")
    })

    it("lança erro quando não dá para saber (rede, 429, 5xx)", async () => {
      server(() => [429])

      await expect(refreshSession()).rejects.toThrow()

      expect(useAuthStore.getState().status).toBe("loading")
    })
  })
})

describe("apiErrorMessage", () => {
  it("usa a mensagem da API, com maiúscula", () => {
    expect(apiErrorMessage(apiError(404, { error: "receita não encontrada" }), "padrão")).toBe("Receita não encontrada")
  })

  it("sem resposta: avisa da conexão", () => {
    expect(apiErrorMessage(new AxiosError("Network Error"), "padrão")).toMatch(/conexão/)
  })

  it("resposta sem mensagem ou erro qualquer: texto padrão", () => {
    expect(apiErrorMessage(apiError(500, "<html>"), "padrão")).toBe("padrão")
    expect(apiErrorMessage(new Error("x"), "padrão")).toBe("padrão")
  })
})

describe("apiFieldErrors", () => {
  it("traduz o caminho do campo para o do react-hook-form", () => {
    const error = apiError(422, {
      error: "dados inválidos",
      fields: { "ingredients[0].amount": "campo obrigatório", name: "use pelo menos 3 caracteres", bad: 42 },
    })

    expect(apiFieldErrors(error)).toEqual({
      "ingredients.0.amount": "Campo obrigatório",
      name: "Use pelo menos 3 caracteres",
    })
  })

  it("sem fields: nada", () => {
    expect(apiFieldErrors(apiError(401, { error: "x" }))).toEqual({})
    expect(apiFieldErrors(new Error("x"))).toEqual({})
  })
})
