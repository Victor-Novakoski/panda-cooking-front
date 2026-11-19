import type { Metadata } from "next"
import type { Recipe } from "@/types"
import { isImageUrl } from "@/lib/utils"

// Endereço público do site: base dos links absolutos das prévias (og:image) e do sitemap.
export const SITE_URL = "https://pandacooking.vercel.app"

// Imagem de compartilhamento do site (1200x630, em public/og.png), usada na
// home e nas receitas sem foto.
export const DEFAULT_OG_IMAGE = {
  url: "/og.png",
  width: 1200,
  height: 630,
  alt: "Panda Cooking: descubra receitas incríveis com sabor de aventura",
}

export const SITE_DESCRIPTION = "Descubra receitas incríveis com sabor de aventura"

// Título, descrição e foto da prévia de uma receita compartilhada. A foto é a
// primeira que passa na mesma regra da tela (https ou envio do computador);
// sem ela, vale a imagem do site. Foto enviada é um caminho (/api/uploads/…):
// o metadataBase do layout o transforma em endereço absoluto.
export function recipeMetadata(recipe: Recipe): Metadata {
  const description = recipe.description.slice(0, 160)
  const cover = recipe.images.find((image) => isImageUrl(image.url))
  const image = cover ? { url: cover.url, alt: recipe.name } : DEFAULT_OG_IMAGE
  return {
    title: recipe.name,
    description,
    alternates: { canonical: `/recipes/${recipe.id}` },
    openGraph: { type: "article", title: recipe.name, description, images: [image] },
    twitter: { card: "summary_large_image", title: recipe.name, description, images: [image.url] },
  }
}
