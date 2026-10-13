import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import { RecipeImage, canOptimize } from "./RecipeImage"

describe("RecipeImage", () => {
  afterEach(() => vi.restoreAllMocks())

  it("foto do Unsplash passa pelo otimizador do Next", () => {
    render(<RecipeImage src="https://images.unsplash.com/foto.jpg" alt="Bolo" width={100} height={100} />)

    expect(screen.getByRole("img", { name: "Bolo" }).getAttribute("src")).toContain("/_next/image?url=https%3A%2F%2Fimages.unsplash.com")
  })

  it("foto de outro site vai direto, sem referrer", () => {
    render(<RecipeImage src="https://exemplo.com/foto.jpg" alt="Bolo" width={100} height={100} />)

    const img = screen.getByRole("img", { name: "Bolo" })
    expect(img).toHaveAttribute("src", "https://exemplo.com/foto.jpg")
    expect(img).toHaveAttribute("referrerpolicy", "no-referrer")
  })

  it.each(["", "http://exemplo.com/foto.jpg", "javascript:alert(1)"])("sem foto válida (%s) mostra o prato", (src) => {
    render(<RecipeImage src={src} alt="Bolo" width={100} height={100} />)

    expect(screen.getByRole("img", { name: "Bolo" })).toHaveTextContent("🍽️")
  })

  it("link quebrado troca pela figura", () => {
    render(<RecipeImage src="https://exemplo.com/sumiu.jpg" alt="Bolo" width={100} height={100} />)

    fireEvent.error(screen.getByRole("img", { name: "Bolo" }))

    expect(screen.getByRole("img", { name: "Bolo" })).toHaveTextContent("🍽️")
  })

  it("foto que falhou antes do React assumir a página também troca pela figura", () => {
    // complete sem largura é o estado de uma imagem que o navegador já desistiu de carregar
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true)
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(0)

    render(<RecipeImage src="https://exemplo.com/sumiu.jpg" alt="Bolo" width={100} height={100} />)

    expect(screen.getByRole("img", { name: "Bolo" })).toHaveTextContent("🍽️")
  })

  it("foto já carregada continua na tela", () => {
    vi.spyOn(HTMLImageElement.prototype, "complete", "get").mockReturnValue(true)
    vi.spyOn(HTMLImageElement.prototype, "naturalWidth", "get").mockReturnValue(800)

    render(<RecipeImage src="https://exemplo.com/foto.jpg" alt="Bolo" width={100} height={100} />)

    expect(screen.getByRole("img", { name: "Bolo" })).toHaveAttribute("src", "https://exemplo.com/foto.jpg")
  })

  it("canOptimize só aceita os sites liberados no next.config.ts", () => {
    expect(canOptimize("https://images.unsplash.com/x.jpg")).toBe(true)
    expect(canOptimize("https://images.unsplash.com.malicioso.site/x.jpg")).toBe(false)
    expect(canOptimize("não é url")).toBe(false)
  })
})
