import "server-only"
import { cache } from "react"
import { headers } from "next/headers"
import type { Page, Recipe, RecipeSummary } from "@/types"
import { clientIP } from "@/lib/bff"
import { PER_PAGE } from "@/lib/limits"

// Chamadas feitas no servidor do Next (páginas renderizadas lá). Vão direto
// para a API pela rede interna, sem passar pelo /api do próprio front.
const API_URL = process.env.API_URL || "http://localhost:8080"

// Repassa o IP de quem abriu a página: sem isso, todas as visitas contariam
// no limite de requisições do IP do servidor do front.
async function forwardedHeaders(): Promise<HeadersInit> {
  const incoming = await headers()
  const out: Record<string, string> = { Accept: "application/json" }
  const ip = clientIP(incoming)
  if (ip) out["X-Forwarded-For"] = ip
  return out
}

// cache(): generateMetadata e a página pedem a mesma receita; vai uma
// requisição só por renderização.
export const getRecipe = cache(async (id: string): Promise<Recipe | null> => {
  const res = await fetch(`${API_URL}/api/recipes/${encodeURIComponent(id)}`, {
    headers: await forwardedHeaders(),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`a API respondeu ${res.status} ao buscar a receita`)
  return res.json()
})

// Receitas mais novas para a página inicial. Se a API não responder, a
// página abre sem a seção em vez de quebrar.
export async function getLatestRecipes(count: number): Promise<RecipeSummary[]> {
  try {
    const res = await fetch(`${API_URL}/api/recipes?per_page=${count}`, {
      headers: await forwardedHeaders(),
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    })
    if (!res.ok) return []
    const page: Page<RecipeSummary> = await res.json()
    return page.items
  } catch {
    return []
  }
}

// Primeira página das receitas de uma pessoa, para a página pública dela. A
// API ainda não tem rota de perfil público: nome e foto vêm do autor das
// próprias receitas, então quem não publicou nada não tem página (null).
export const getAuthorRecipes = cache(async (userId: string): Promise<Page<RecipeSummary> | null> => {
  const res = await fetch(
    `${API_URL}/api/recipes?user_id=${encodeURIComponent(userId)}&per_page=${PER_PAGE.recipes}`,
    { headers: await forwardedHeaders(), cache: "no-store", signal: AbortSignal.timeout(10_000) }
  )
  // 422: o id não é um UUID
  if (res.status === 422 || res.status === 404) return null
  if (!res.ok) throw new Error(`a API respondeu ${res.status} ao buscar as receitas do autor`)
  const page: Page<RecipeSummary> = await res.json()
  return page.items.length > 0 ? page : null
})
