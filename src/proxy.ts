import { NextRequest, NextResponse } from "next/server"
import { SESSION_COOKIE } from "@/lib/cookies"
import { safeNextPath } from "@/lib/utils"

// "/recipes/<id>/edit" é testado à parte: o id fica no meio do caminho.
const protectedRoutes = ["/profile", "/recipes/new"]
const isEditRecipe = (pathname: string) => /^\/recipes\/[^/]+\/edit$/.test(pathname)
const authRoutes = ["/auth/login", "/auth/register"]

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hasSession = request.cookies.has(SESSION_COOKIE)

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r)) || isEditRecipe(pathname)
  if (isProtected && !hasSession) {
    const login = new URL("/auth/login", request.url)
    login.searchParams.set("next", pathname + search)
    return NextResponse.redirect(login)
  }

  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r))
  if (isAuthRoute && hasSession) {
    const next = safeNextPath(request.nextUrl.searchParams.get("next"))
    return NextResponse.redirect(new URL(next, request.url))
  }

  return withSecurityHeaders(request)
}

// Content-Security-Policy com nonce: só roda o script que o Next marcou nesta
// resposta, então um script injetado (XSS) não executa. O Next lê o nonce do
// cabeçalho da requisição e aplica nos próprios scripts; por isso toda página
// é renderizada a cada requisição (o layout lê os cookies).
function withSecurityHeaders(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID())
  const isDev = process.env.NODE_ENV === "development"
  const csp = [
    "default-src 'self'",
    // 'unsafe-eval' só em desenvolvimento: o React usa para mostrar o erro do servidor no navegador
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    // estilo inline (atributo style do React e do next/image) não executa código
    "style-src 'self' 'unsafe-inline'",
    // as fotos das receitas são links https de qualquer site
    "img-src 'self' data: blob: https:",
    "font-src 'self'",
    // o navegador só fala com o próprio front (/api); ws: é o recarregamento do next dev
    `connect-src 'self'${isDev ? " ws:" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isDev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ")

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-nonce", nonce)
  requestHeaders.set("Content-Security-Policy", csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set("Content-Security-Policy", csp)
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()")
  if (request.headers.get("x-forwarded-proto") === "https") {
    response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains")
  }
  return response
}

export const config = {
  matcher: [
    // Tudo menos o repasse para a API, os arquivos estáticos e o prefetch dos links.
    {
      source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
}
