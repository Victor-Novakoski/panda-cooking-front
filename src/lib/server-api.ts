import "server-only"
import { cache } from "react"
import { headers } from "next/headers"
import type { Page, PublicUser, Recipe, RecipeSummary } from "@/types"
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

// Perfil público de uma pessoa (nome, foto, desde quando está no site).
export const getPublicUser = cache(async (id: string): Promise<PublicUser | null> => {
  const res = await fetch(`${API_URL}/api/users/${encodeURIComponent(id)}`, {
    headers: await forwardedHeaders(),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  })
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`a API respondeu ${res.status} ao buscar o perfil`)
  return res.json()
})

// Primeira página das receitas de uma pessoa, para a página pública dela.
export async function getAuthorRecipes(userId: string): Promise<Page<RecipeSummary>> {
  const res = await fetch(
    `${API_URL}/api/recipes?user_id=${encodeURIComponent(userId)}&per_page=${PER_PAGE.recipes}`,
    { headers: await forwardedHeaders(), cache: "no-store", signal: AbortSignal.timeout(10_000) }
  )
  if (!res.ok) throw new Error(`a API respondeu ${res.status} ao buscar as receitas do autor`)
  return res.json()
}

// Endereço e data de cada receita para o sitemap. Páginas de até 50 (o máximo
// da API), no máximo 20 páginas e 8 s no total; se a API estiver dormindo ou
// falhar no meio, devolve o que já tinha em vez de derrubar o sitemap.
export async function getSitemapRecipes(): Promise<{ id: string; created_at: string }[]> {
  const out: { id: string; created_at: string }[] = []
  const deadline = AbortSignal.timeout(8_000)
  try {
    for (let page = 1; page <= 20; page++) {
      const res = await fetch(`${API_URL}/api/recipes?per_page=50&page=${page}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
        signal: deadline,
      })
      if (!res.ok) break
      const data: Page<RecipeSummary> = await res.json()
      out.push(...data.items.map(({ id, created_at }) => ({ id, created_at })))
      if (page >= data.total_pages) break
    }
  } catch {
    // devolve o que deu para buscar
  }
  return out
}
