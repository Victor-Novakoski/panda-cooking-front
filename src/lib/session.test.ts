import { beforeEach, describe, expect, it, vi } from "vitest"
import { logout, restoreSession } from "./session"
import { refreshSession } from "@/services/api"
import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"
import { apiError, loginAs } from "@/test/utils"

vi.mock("@/services/api", () => ({ refreshSession: vi.fn() }))
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

    await logout()

    expect(authService.logout).toHaveBeenCalled()
    expect(useAuthStore.getState()).toMatchObject({ status: "anonymous", endedHere: true })
  })

  it("sai mesmo se a API não responder", async () => {
    loginAs()
    vi.mocked(authService.logout).mockRejectedValue(new Error("rede"))

    await logout()

    expect(useAuthStore.getState().token).toBeNull()
  })
})
