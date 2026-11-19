import { describe, expect, it } from "vitest"
import { DEFAULT_OG_IMAGE, recipeMetadata } from "./seo"
import { makeRecipe } from "@/test/utils"

describe("recipeMetadata", () => {
  it("usa a primeira foto válida da receita como imagem da prévia", () => {
    const recipe = makeRecipe({
      images: [
        { id: 1, url: "javascript:alert(1)" },
        { id: 2, url: "https://exemplo.com/bolo.jpg" },
      ],
    })
    const meta = recipeMetadata(recipe)
    expect(meta.openGraph?.images).toEqual([{ url: "https://exemplo.com/bolo.jpg", alt: recipe.name }])
    expect(meta.twitter?.images).toEqual(["https://exemplo.com/bolo.jpg"])
  })

  it("aceita a foto enviada do computador", () => {
    const url = "/api/uploads/123e4567-e89b-12d3-a456-426614174000"
    const meta = recipeMetadata(makeRecipe({ images: [{ id: 1, url }] }))
    expect(meta.openGraph?.images).toEqual([{ url, alt: expect.any(String) }])
  })

  it("sem foto, usa a imagem do site", () => {
    const meta = recipeMetadata(makeRecipe({ images: [] }))
    expect(meta.openGraph?.images).toEqual([DEFAULT_OG_IMAGE])
  })

  it("usa o nome e corta a descrição em 160 caracteres", () => {
    const meta = recipeMetadata(makeRecipe({ name: "Bolo de Cenoura", description: "a".repeat(300) }))
    expect(meta.title).toBe("Bolo de Cenoura")
    expect(meta.description).toHaveLength(160)
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" })
  })
})
