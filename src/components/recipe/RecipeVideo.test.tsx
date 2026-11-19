import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { RecipeVideo } from "./RecipeVideo"

describe("RecipeVideo", () => {
  it("monta o player só com o id do vídeo, no domínio sem cookie", () => {
    render(<RecipeVideo url="https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=x" title="Bolo" />)

    const player = screen.getByTitle("Vídeo: Bolo")
    expect(player).toHaveAttribute("src", "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ")
    expect(screen.getByRole("heading", { name: "Vídeo" })).toBeInTheDocument()
  })

  it.each(["", "https://evil.com/embed/dQw4w9WgXcQ", "javascript:alert(1)"])("sem link do YouTube (%s), não mostra nada", (url) => {
    const { container } = render(<RecipeVideo url={url} title="Bolo" />)

    expect(container).toBeEmptyDOMElement()
  })
})
