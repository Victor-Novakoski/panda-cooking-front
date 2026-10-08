import "@testing-library/jest-dom/vitest"
import { cleanup } from "@testing-library/react"
import { afterEach } from "vitest"
import { useAuthStore } from "@/store/auth.store"

afterEach(() => {
  cleanup()
  // os testes do servidor (bff, proxy) rodam no ambiente node, sem localStorage
  globalThis.localStorage?.clear()
  // cada teste começa como a página recém-aberta: conferindo a sessão
  useAuthStore.setState({ user: null, token: null, status: "loading", endedHere: false })
})
