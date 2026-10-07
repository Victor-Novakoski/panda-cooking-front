// Repasse do /api do front para a API (o "backend for frontend").
//
// O navegador só fala com o front. Assim o cookie da sessão é do mesmo site,
// não precisa de CORS e a API pode ficar fechada na rede interna. O repasse
// confere a origem (proteção contra CSRF), limita o tamanho do corpo e passa
// adiante só os cabeçalhos que a API usa.

// Igual ao limite da API: corpo maior nem chega a ela.
export const MAX_BODY_BYTES = 1 << 20

export const API_TIMEOUT_MS = 15_000

const FORWARDED_REQUEST_HEADERS = ["accept", "authorization", "content-type", "cookie", "x-forwarded-for", "x-request-id"]
const FORWARDED_RESPONSE_HEADERS = ["content-type", "location", "retry-after", "www-authenticate", "x-request-id"]

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])
const NULL_BODY_STATUS = new Set([101, 204, 205, 304])

// Mesma regra do http.CrossOriginProtection do Go, que a API usa: método que
// muda algo só passa se o navegador disser que a requisição veio deste site.
// Sem Sec-Fetch-Site nem Origin não é navegador (curl, testes), e aí não há
// cookie de vítima em jogo.
export function isSameOrigin(request: Request): boolean {
  if (SAFE_METHODS.has(request.method)) return true

  const site = request.headers.get("sec-fetch-site")
  if (site) return site === "same-origin" || site === "none"

  const origin = request.headers.get("origin")
  if (!origin) return true
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host")
  try {
    return new URL(origin).host === host
  } catch {
    return false
  }
}

class BodyTooLarge extends Error {}

// Lê o corpo até o limite, sem guardar na memória o que passar dele.
async function readBody(request: Request): Promise<Uint8Array<ArrayBuffer> | undefined> {
  if (!request.body) return undefined
  if (Number(request.headers.get("content-length") ?? 0) > MAX_BODY_BYTES) throw new BodyTooLarge()

  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let size = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.byteLength
    if (size > MAX_BODY_BYTES) {
      await reader.cancel()
      throw new BodyTooLarge()
    }
    chunks.push(value)
  }

  const body = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    body.set(chunk, offset)
    offset += chunk.byteLength
  }
  return body
}

function errorResponse(status: number, message: string) {
  return Response.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } })
}

export async function forward(request: Request, apiUrl: string): Promise<Response> {
  if (!isSameOrigin(request)) {
    return errorResponse(403, "origem não permitida")
  }

  // O caminho vai como chegou (ainda codificado) e sempre começa com /api/.
  const { pathname, search } = new URL(request.url)
  const target = new URL(pathname + search, apiUrl)

  const headers = new Headers()
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name)
    if (value) headers.set(name, value)
  }

  let body: Uint8Array<ArrayBuffer> | undefined
  try {
    body = SAFE_METHODS.has(request.method) ? undefined : await readBody(request)
  } catch (error) {
    if (error instanceof BodyTooLarge) return errorResponse(413, "corpo da requisição grande demais")
    throw error
  }

  let upstream: Response
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(API_TIMEOUT_MS),
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      return errorResponse(504, "a API demorou demais para responder, tente novamente")
    }
    console.error("repasse para a API falhou", { path: pathname, error })
    return errorResponse(502, "não foi possível falar com a API, tente novamente")
  }

  const out = new Headers({ "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" })
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name)
    if (value) out.set(name, value)
  }
  for (const cookie of upstream.headers.getSetCookie()) {
    out.append("Set-Cookie", cookie)
  }

  const hasBody = request.method !== "HEAD" && !NULL_BODY_STATUS.has(upstream.status)
  return new Response(hasBody ? upstream.body : null, { status: upstream.status, headers: out })
}
