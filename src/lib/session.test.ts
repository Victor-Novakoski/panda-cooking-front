import { beforeEach, describe, expect, it, vi } from "vitest"
import { logout, restoreSession } from "./session"
import { refreshSession } from "@/services/api"
import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"
import { apiError, loginAs } from "@/test/utils"

vi.mock("@/services/api", () => ({
  refreshSession: vi.fn(),
  apiStatus: (error: { response?: { status?: number } }) => error?.response?.status,
}))
vi.mock("@/services/auth.service", () => ({ authService: { logout: vi.fn() } }))

describe("restoreSession", () => {
  beforeEach(() => {
    vi.mocked(refreshSession).mockReset()
  })

  it("sem o cookie da sessão nem pergunta para a API", async () => {
    await restoreSession(false)

    expect(refreshSession).not.toHaveBeenCalled()
    expect(useAuthStore.getState().status).toBe("anonymous")
  })

  it("com o cookie, renova o access token", async () => {
    vi.mocked(refreshSession).mockResolvedValue("token-novo")

    await restoreSession(true)

    expect(refreshSession).toHaveBeenCalledTimes(1)
  })

  it("API fora do ar: marca indisponível, sem mandar para o login", async () => {
    vi.mocked(refreshSession).mockRejectedValue(apiError(503))

    await restoreSession(true)

    expect(useAuthStore.getState().status).toBe("unavailable")
  })

  it("já logado (login nesta aba): não renova de novo", async () => {
    loginAs()

    await restoreSession(true)

    expect(refreshSession).not.toHaveBeenCalled()
  })
})

describe("logout", () => {
  it("encerra a sessão na API e limpa a memória", async () => {
    loginAs()
    vi.mocked(authService.logout).mockResolvedValue()

    expect(await logout()).toBe(true)

    expect(authService.logout).toHaveBeenCalled()
    expect(useAuthStore.getState()).toMatchObject({ status: "anonymous", endedHere: true })
  })

  it("sessão que já tinha acabado (401) também conta como saída", async () => {
    loginAs()
    vi.mocked(authService.logout).mockRejectedValue(apiError(401))

    expect(await logout()).toBe(true)
    expect(useAuthStore.getState().token).toBeNull()
  })

  it("API fora do ar: não finge que saiu, porque o cookie traria a sessão de volta", async () => {
    loginAs()
    vi.mocked(authService.logout).mockRejectedValue(new Error("rede"))

    expect(await logout()).toBe(false)
    expect(useAuthStore.getState().status).toBe("authenticated")
  })
})
