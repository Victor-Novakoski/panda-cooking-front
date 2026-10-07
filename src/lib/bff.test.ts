// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MAX_BODY_BYTES, forward, isSameOrigin } from "./bff"

const API = "http://api:8080"
const fetchMock = vi.fn<typeof fetch>()

type Init = Omit<RequestInit, "headers"> & { headers?: Record<string, string>; duplex?: "half" }

function request(path: string, init: Init = {}) {
  return new Request(`http://localhost:3000${path}`, {
    ...init,
    headers: { host: "localhost:3000", ...init.headers },
  })
}

function upstreamCall() {
  const [url, init] = fetchMock.mock.calls[0]
  return { url: String(url), init: init!, headers: new Headers(init!.headers) }
}

describe("forward", () => {
  beforeEach(() => {
    fetchMock.mockReset()
    fetchMock.mockResolvedValue(Response.json({ ok: true }))
    vi.stubGlobal("fetch", fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("repassa caminho, query e só os cabeçalhos que a API usa", async () => {
    await forward(
      request("/api/recipes?search=p%C3%A3o&page=2", {
        headers: {
          authorization: "Bearer abc",
          cookie: "panda_refresh=xyz",
          "x-forwarded-for": "203.0.113.7",
          origin: "http://localhost:3000",
          "sec-fetch-site": "same-origin",
          "x-qualquer": "1",
        },
      }),
      API
    )

    const { url, init, headers } = upstreamCall()
    expect(url).toBe("http://api:8080/api/recipes?search=p%C3%A3o&page=2")
    expect(init.method).toBe("GET")
    expect(headers.get("authorization")).toBe("Bearer abc")
    expect(headers.get("cookie")).toBe("panda_refresh=xyz")
    expect(headers.get("x-forwarded-for")).toBe("203.0.113.7")
    // a origem já foi conferida aqui; para a API, quem chama é o servidor do front
    expect(headers.has("origin")).toBe(false)
    expect(headers.has("sec-fetch-site")).toBe(false)
    expect(headers.has("x-qualquer")).toBe(false)
  })

  it("devolve status, corpo, cookies e cabeçalhos úteis da API", async () => {
    const upstream = new Response(JSON.stringify({ error: "muitas tentativas" }), {
      status: 429,
      headers: { "content-type": "application/json", "retry-after": "30", server: "gin", "x-request-id": "abc123" },
    })
    upstream.headers.append("set-cookie", "panda_refresh=novo; Path=/api/auth; HttpOnly; SameSite=Strict")
    upstream.headers.append("set-cookie", "panda_session=1; Path=/; HttpOnly; SameSite=Lax")
    fetchMock.mockResolvedValue(upstream)

    const res = await forward(request("/api/auth/refresh", { method: "POST" }), API)

    expect(res.status).toBe(429)
    expect(await res.json()).toEqual({ error: "muitas tentativas" })
    expect(res.headers.get("retry-after")).toBe("30")
    expect(res.headers.get("x-request-id")).toBe("abc123")
    expect(res.headers.get("cache-control")).toBe("no-store")
    expect(res.headers.has("server")).toBe(false)
    expect(res.headers.getSetCookie()).toEqual([
      "panda_refresh=novo; Path=/api/auth; HttpOnly; SameSite=Strict",
      "panda_session=1; Path=/; HttpOnly; SameSite=Lax",
    ])
  })

  it("repassa o corpo dos métodos que mudam algo", async () => {
    await forward(
      request("/api/recipes", {
        method: "POST",
        body: JSON.stringify({ name: "Bolo" }),
        headers: { "content-type": "application/json", "sec-fetch-site": "same-origin" },
      }),
      API
    )

    const { init, headers } = upstreamCall()
    expect(init.method).toBe("POST")
    expect(new TextDecoder().decode(init.body as Uint8Array)).toBe('{"name":"Bolo"}')
    expect(headers.get("content-type")).toBe("application/json")
  })

  it("204 volta sem corpo", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    const res = await forward(request("/api/comments/1", { method: "DELETE" }), API)

    expect(res.status).toBe(204)
    expect(res.body).toBeNull()
  })

  it("recusa requisição de outro site (CSRF) sem chamar a API", async () => {
    const res = await forward(
      request("/api/users/profile", { method: "DELETE", headers: { "sec-fetch-site": "cross-site" } }),
      API
    )

    expect(res.status).toBe(403)
    expect(await res.json()).toEqual({ error: "origem não permitida" })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("corpo maior que o limite: 413 sem chamar a API", async () => {
    const big = "x".repeat(MAX_BODY_BYTES + 1)

    const declared = await forward(request("/api/recipes", { method: "POST", body: big }), API)
    // sem content-length (envio em partes): conta enquanto lê
    const streamed = await forward(
      request("/api/recipes", {
        method: "POST",
        body: new Blob([big]).stream(),
        duplex: "half",
      }),
      API
    )

    expect(declared.status).toBe(413)
    expect(streamed.status).toBe(413)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("API fora do ar: 502 com mensagem em português", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    fetchMock.mockRejectedValue(new TypeError("fetch failed"))

    const res = await forward(request("/api/recipes"), API)

    expect(res.status).toBe(502)
    expect((await res.json()).error).toMatch(/não foi possível falar com a API/)
  })

  it("API demorou demais: 504", async () => {
    fetchMock.mockRejectedValue(new DOMException("tempo esgotado", "TimeoutError"))

    const res = await forward(request("/api/recipes"), API)

    expect(res.status).toBe(504)
  })
})

describe("isSameOrigin", () => {
  const post = (headers: Record<string, string>) => request("/api/recipes", { method: "POST", headers })

  it.each([
    ["GET de outro site (não muda nada)", request("/api/recipes", { headers: { "sec-fetch-site": "cross-site" } }), true],
    ["mesmo site pelo Sec-Fetch-Site", post({ "sec-fetch-site": "same-origin" }), true],
    ["digitado na barra (none)", post({ "sec-fetch-site": "none" }), true],
    ["outro site", post({ "sec-fetch-site": "cross-site" }), false],
    ["subdomínio irmão", post({ "sec-fetch-site": "same-site" }), false],
    ["navegador antigo, Origin igual ao Host", post({ origin: "http://localhost:3000" }), true],
    ["navegador antigo, Origin de outro site", post({ origin: "https://malicioso.site" }), false],
    ["atrás de proxy, Origin igual ao X-Forwarded-Host", post({ origin: "https://panda.site", "x-forwarded-host": "panda.site" }), true],
    ["Origin inválido", post({ origin: "null" }), false],
    ["fora do navegador (sem Origin nem Sec-Fetch-Site)", post({}), true],
  ])("%s", (_, req, expected) => {
    expect(isSameOrigin(req)).toBe(expected)
  })
})
