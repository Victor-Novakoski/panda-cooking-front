import { describe, expect, it } from "vitest"
import { useAuthStore } from "./auth.store"
import { makeUser } from "@/test/utils"

const user = makeUser()

describe("useAuthStore", () => {
  it("começa conferindo a sessão", () => {
    expect(useAuthStore.getState().status).toBe("loading")
  })

  it("setSession guarda usuário e token só em memória", () => {
    useAuthStore.getState().setSession(user, "token-abc")

    expect(useAuthStore.getState()).toMatchObject({ user, token: "token-abc", status: "authenticated" })
    // nada que um script na página possa ler depois
    expect(localStorage.length).toBe(0)
    expect(document.cookie).toBe("")
  })

  it("clearSession apaga tudo e marca sem sessão", () => {
    useAuthStore.getState().setSession(user, "token-abc")

    useAuthStore.getState().clearSession()

    expect(useAuthStore.getState()).toMatchObject({ user: null, token: null, status: "anonymous", endedHere: false })
  })

  it("clearSession(true) marca que a pessoa saiu nesta aba, e o próximo login desmarca", () => {
    useAuthStore.getState().setSession(user, "token-abc")

    useAuthStore.getState().clearSession(true)
    expect(useAuthStore.getState()).toMatchObject({ status: "anonymous", endedHere: true })

    useAuthStore.getState().setSession(user, "token-novo")
    expect(useAuthStore.getState().endedHere).toBe(false)
  })

  it("setUser troca os dados do usuário e mantém a sessão", () => {
    useAuthStore.getState().setSession(user, "token-abc")

    useAuthStore.getState().setUser({ ...user, name: "Maria Panda" })

    expect(useAuthStore.getState().user?.name).toBe("Maria Panda")
    expect(useAuthStore.getState().token).toBe("token-abc")
  })
})
