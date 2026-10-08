// @vitest-environment node
import { NextRequest } from "next/server"
import { describe, expect, it } from "vitest"
import { proxy } from "./proxy"

function request(path: string, { session = false, headers = {} }: { session?: boolean; headers?: Record<string, string> } = {}) {
  const req = new NextRequest(new URL(path, "http://localhost:3000"), { headers })
  if (session) req.cookies.set("panda_session", "1")
  return req
}

describe("proxy", () => {
  it.each(["/profile", "/profile/edit", "/recipes/new", "/recipes/abc-123/edit"])(
    "sem sessão, %s vai para o login e volta depois",
    (path) => {
      const res = proxy(request(path))
      const location = new URL(res.headers.get("location")!)
      expect(location.pathname).toBe("/auth/login")
      expect(location.searchParams.get("next")).toBe(path)
    }
  )

  it("guarda a query da página pedida", () => {
    const res = proxy(request("/profile?aba=favoritas"))
    expect(new URL(res.headers.get("location")!).searchParams.get("next")).toBe("/profile?aba=favoritas")
  })

  it("página da receita continua pública", () => {
    expect(proxy(request("/recipes/abc-123")).headers.get("location")).toBeNull()
  })

  it("com sessão, a edição abre normalmente", () => {
    expect(proxy(request("/recipes/abc-123/edit", { session: true })).headers.get("location")).toBeNull()
  })

  it("com sessão, login e cadastro vão para a página pedida ou o dashboard", () => {
    expect(proxy(request("/auth/login", { session: true })).headers.get("location")).toBe("http://localhost:3000/dashboard")
    expect(proxy(request("/auth/login?next=/profile", { session: true })).headers.get("location")).toBe(
      "http://localhost:3000/profile"
    )
    expect(proxy(request("/auth/register", { session: true })).headers.get("location")).toBe(
      "http://localhost:3000/dashboard"
    )
  })

  it("não redireciona para fora do site (open redirect)", () => {
    const res = proxy(request("/auth/login?next=//malicioso.site", { session: true }))
    expect(res.headers.get("location")).toBe("http://localhost:3000/dashboard")
  })

  describe("cabeçalhos de segurança", () => {
    it("CSP com nonce na resposta e na requisição (o Next aplica nos scripts)", () => {
      const res = proxy(request("/dashboard"))
      const csp = res.headers.get("content-security-policy")!
      const nonce = res.headers.get("x-middleware-request-x-nonce")!

      expect(nonce).toMatch(/^[A-Za-z0-9+/=]{20,}$/)
      expect(csp).toContain(`script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`)
      expect(csp).toContain("frame-ancestors 'none'")
      expect(csp).toContain("object-src 'none'")
      expect(csp).not.toContain("unsafe-eval")
      expect(res.headers.get("x-middleware-request-content-security-policy")).toBe(csp)
    })

    it("nonce novo a cada requisição", () => {
      const a = proxy(request("/")).headers.get("x-middleware-request-x-nonce")
      const b = proxy(request("/")).headers.get("x-middleware-request-x-nonce")
      expect(a).not.toBe(b)
    })

    it("demais cabeçalhos", () => {
      const res = proxy(request("/"))
      expect(res.headers.get("x-content-type-options")).toBe("nosniff")
      expect(res.headers.get("x-frame-options")).toBe("DENY")
      expect(res.headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin")
      expect(res.headers.get("permissions-policy")).toContain("camera=()")
      expect(res.headers.has("strict-transport-security")).toBe(false)
    })

    it("HSTS só quando chegou por https", () => {
      const res = proxy(request("/", { headers: { "x-forwarded-proto": "https" } }))
      expect(res.headers.get("strict-transport-security")).toBe("max-age=63072000; includeSubDomains")
    })
  })
})
