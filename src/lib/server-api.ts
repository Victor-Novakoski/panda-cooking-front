import "server-only"
import { cache } from "react"
import { headers } from "next/headers"
import type { Page, Recipe, RecipeSummary } from "@/types"

// Chamadas feitas no servidor do Next (páginas renderizadas lá). Vão direto
// para a API pela rede interna, sem passar pelo /api do próprio front.
const API_URL = process.env.API_URL || "http://localhost:8080"

// Repassa o IP de quem abriu a página: sem isso, todas as visitas contariam
// no limite de requisições do IP do servidor do front.
async function forwardedHeaders(): Promise<HeadersInit> {
  const incoming = await headers()
  const out: Record<string, string> = { Accept: "application/json" }
  const forwardedFor = incoming.get("x-forwarded-for")
  if (forwardedFor) out["X-Forwarded-For"] = forwardedFor
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
