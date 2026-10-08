import { describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import { useAuthStore } from "@/store/auth.store"
import { loginAs } from "@/test/utils"
import { useRequireAuth } from "./useRequireAuth"

const replace = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => "/profile/edit",
}))

describe("useRequireAuth", () => {
  it("espera a sessão ser conferida antes de decidir", () => {
    replace.mockClear()
    const { result } = renderHook(() => useRequireAuth())

    expect(result.current).toBe("loading")
    expect(replace).not.toHaveBeenCalled()
  })

  it("sem sessão, manda para o login e volta para a mesma página depois", () => {
    replace.mockClear()
    useAuthStore.getState().clearSession()

    renderHook(() => useRequireAuth())

    expect(replace).toHaveBeenCalledWith("/auth/login?next=%2Fprofile%2Fedit")
  })

  it("sessão que acabou em outra aba (ou venceu) com a página aberta também vai para o login", () => {
    replace.mockClear()
    loginAs()
    renderHook(() => useRequireAuth())

    act(() => useAuthStore.getState().clearSession())

    expect(replace).toHaveBeenCalledWith("/auth/login?next=%2Fprofile%2Fedit")
  })

  it("quem saiu nesta aba (Sair, apagar conta) não é mandado para o login", () => {
    replace.mockClear()
    loginAs()
    renderHook(() => useRequireAuth())

    act(() => useAuthStore.getState().clearSession(true))

    expect(replace).not.toHaveBeenCalled()
  })
})
