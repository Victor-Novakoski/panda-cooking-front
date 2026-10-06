import { NextRequest, NextResponse } from "next/server"

// "/recipes/<id>/edit" é testado à parte: o id fica no meio do caminho.
const protectedRoutes = ["/profile", "/recipes/new"]
const isEditRecipe = (pathname: string) => /^\/recipes\/[^/]+\/edit$/.test(pathname)
const authRoutes = ["/auth/login", "/auth/register"]

export function proxy(request: NextRequest) {
  const token = request.cookies.get("@pandaToken")?.value
  const { pathname } = request.nextUrl

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r)) || isEditRecipe(pathname)
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r))

  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/profile/:path*", "/recipes/new", "/recipes/:id/edit", "/auth/login", "/auth/register"],
}
