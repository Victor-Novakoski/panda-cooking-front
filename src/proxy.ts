import { NextRequest, NextResponse } from "next/server"

const protectedRoutes = ["/profile", "/recipes/new"]
const authRoutes = ["/auth/login", "/auth/register"]

export function proxy(request: NextRequest) {
  const token = request.cookies.get("@pandaToken")?.value
  const { pathname } = request.nextUrl

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))
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
  matcher: ["/profile", "/recipes/new", "/auth/login", "/auth/register"],
}
