import { describe, expect, it, vi } from "vitest"
import sitemap from "./sitemap"
import robots from "./robots"
import { getSitemapRecipes } from "@/lib/server-api"

vi.mock("@/lib/server-api", () => ({ getSitemapRecipes: vi.fn() }))

describe("sitemap", () => {
  it("lista a home, as receitas e cada receita pública", async () => {
    vi.mocked(getSitemapRecipes).mockResolvedValue([{ id: "r1", created_at: "2026-10-01T10:00:00Z" }])
    const urls = (await sitemap()).map((entry) => entry.url)
    expect(urls).toEqual([
      "https://pandacooking.vercel.app",
      "https://pandacooking.vercel.app/recipes",
      "https://pandacooking.vercel.app/recipes/r1",
    ])
  })

  it("com a API fora do ar, ainda traz a home e a lista", async () => {
    vi.mocked(getSitemapRecipes).mockResolvedValue([])
    expect(await sitemap()).toHaveLength(2)
  })

  it("o robots aponta para o sitemap", () => {
    expect(robots().sitemap).toBe("https://pandacooking.vercel.app/sitemap.xml")
  })
})
