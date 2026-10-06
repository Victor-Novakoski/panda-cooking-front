import { beforeEach, describe, expect, it } from "vitest"
import { useAuthStore } from "./auth.store"
import type { User } from "@/types"

const user: User = { id: "1", name: "Maria Silva", email: "maria@pandacooking.com", is_adm: false }

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth()
  })

  it("setAuth guarda o token no localStorage, no cookie e no estado", () => {
    useAuthStore.getState().setAuth(user, "token-abc")

    expect(localStorage.getItem("@pandaToken")).toBe("token-abc")
    expect(document.cookie).toContain("@pandaToken=token-abc")
    expect(useAuthStore.getState().user).toEqual(user)
    expect(useAuthStore.getState().isAuthenticated()).toBe(true)
  })

  it("clearAuth apaga token, cookie, estado e o que foi persistido", () => {
    useAuthStore.getState().setAuth(user, "token-abc")

    useAuthStore.getState().clearAuth()

    expect(localStorage.getItem("@pandaToken")).toBeNull()
    expect(document.cookie).not.toContain("@pandaToken=token-abc")
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().isAuthenticated()).toBe(false)
    const persisted = JSON.parse(localStorage.getItem("panda-auth") ?? "{}")
    expect(persisted.state?.token ?? null).toBeNull()
  })
})
