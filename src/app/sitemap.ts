import type { MetadataRoute } from "next"
import { getSitemapRecipes } from "@/lib/server-api"
import { SITE_URL } from "@/lib/seo"

// Dinâmico de propósito: montado a cada pedido, nunca no build. Buscar as
// receitas no build deixaria o deploy refém da API (que dorme no plano grátis).
export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const recipes = await getSitemapRecipes()
  return [
    { url: SITE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/recipes`, changeFrequency: "daily", priority: 0.8 },
    ...recipes.map((recipe) => ({
      url: `${SITE_URL}/recipes/${recipe.id}`,
      lastModified: recipe.created_at,
      priority: 0.6,
    })),
  ]
}
