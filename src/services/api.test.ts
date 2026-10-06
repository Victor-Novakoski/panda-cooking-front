import { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from "axios"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { api } from "./api"
import { useAuthStore } from "@/store/auth.store"
import type { User } from "@/types"

const user: User = { id: "1", name: "Maria Silva", email: "maria@pandacooking.com", is_adm: false }

// Responde toda requisição com o status pedido, sem rede.
function respondWith(status: number): AxiosAdapter {
  return async (config: InternalAxiosRequestConfig) => {
    const response = { data: {}, status, statusText: "", headers: {}, config }
    if (status >= 400) {
      throw new AxiosError("erro", undefined, config, undefined, response)
    }
    return response
  }
}

describe("api", () => {
  let href: string

  beforeEach(() => {
    href = "http://localhost/dashboard"
    // O jsdom não navega; o teste só confere para onde o usuário seria mandado.
    vi.spyOn(window, "location", "get").mockReturnValue({
      get href() { return href },
      set href(value: string) { href = value },
      pathname: "/dashboard",
    } as Location)
    useAuthStore.getState().setAuth(user, "token-abc")
  })

  afterEach(() => {
    vi.restoreAllMocks()
    useAuthStore.getState().clearAuth()
  })

  it("manda o token salvo no header Authorization", async () => {
    let authorization: unknown
    await api.get("/users/profile", {
      adapter: async (config) => {
        authorization = config.headers.Authorization
        return respondWith(200)(config)
      },
    })

    expect(authorization).toBe("Bearer token-abc")
  })

  it("não troca um Authorization passado na chamada", async () => {
    let authorization: unknown
    await api.get("/users/profile", {
      headers: { Authorization: "Bearer token-novo" },
      adapter: async (config) => {
        authorization = config.headers.Authorization
        return respondWith(200)(config)
      },
    })

    expect(authorization).toBe("Bearer token-novo")
  })

  it("401 encerra a sessão inteira e manda para o login", async () => {
    await expect(api.get("/users/profile", { adapter: respondWith(401) })).rejects.toThrow()

    expect(localStorage.getItem("@pandaToken")).toBeNull()
    expect(document.cookie).not.toContain("@pandaToken=token-abc")
    expect(useAuthStore.getState().token).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
    expect(href).toBe("/auth/login")
  })

  it("401 no login (senha errada) não mexe na sessão nem recarrega a página", async () => {
    await expect(api.post("/auth", {}, { adapter: respondWith(401) })).rejects.toThrow()

    expect(useAuthStore.getState().token).toBe("token-abc")
    expect(href).toBe("http://localhost/dashboard")
  })

  it("outros erros não encerram a sessão", async () => {
    await expect(api.get("/recipes", { adapter: respondWith(500) })).rejects.toThrow()

    expect(useAuthStore.getState().token).toBe("token-abc")
    expect(href).toBe("http://localhost/dashboard")
  })
})
