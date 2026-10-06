import { NextRequest } from "next/server"
import { describe, expect, it } from "vitest"
import { proxy } from "./proxy"

function request(path: string, token?: string) {
  const req = new NextRequest(new URL(path, "http://localhost:3000"))
  if (token) req.cookies.set("@pandaToken", token)
  return req
}

describe("proxy", () => {
  it.each(["/profile", "/profile/edit", "/recipes/new", "/recipes/abc-123/edit"])(
    "sem login, %s vai para o login",
    (path) => {
      const res = proxy(request(path))
      expect(res.headers.get("location")).toBe("http://localhost:3000/auth/login")
    }
  )

  it("página da receita continua pública", () => {
    const res = proxy(request("/recipes/abc-123"))
    expect(res.headers.get("location")).toBeNull()
  })

  it("com login, a edição abre normalmente", () => {
    const res = proxy(request("/recipes/abc-123/edit", "token"))
    expect(res.headers.get("location")).toBeNull()
  })
})
