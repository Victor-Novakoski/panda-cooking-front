import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PhotoCarousel } from "./PhotoCarousel"

const images = [
  { id: 1, url: "https://exemplo.com/1.jpg" },
  { id: 2, url: "https://exemplo.com/2.jpg" },
  { id: 3, url: "https://exemplo.com/3.jpg" },
]

describe("PhotoCarousel", () => {
  it("mostra uma foto por vez, com setas e uma bolinha por foto", () => {
    render(<PhotoCarousel images={images} name="Bolo" />)

    expect(screen.getAllByRole("group")).toHaveLength(3)
    expect(screen.getByRole("button", { name: "Foto anterior" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Próxima foto" })).toBeEnabled()
    expect(screen.getByRole("button", { name: "Ver foto 1" })).toHaveAttribute("aria-current", "true")
    expect(screen.getAllByRole("button", { name: /Ver foto/ })).toHaveLength(3)
  })

  it("com uma foto só, não mostra setas nem bolinhas", () => {
    render(<PhotoCarousel images={images.slice(0, 1)} name="Bolo" />)

    expect(screen.getByRole("img", { name: "Bolo" })).toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("a primeira foto leva o nome da receita e as outras são numeradas", () => {
    render(<PhotoCarousel images={images} name="Bolo" />)

    expect(screen.getByRole("img", { name: "Bolo" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Bolo, foto 2" })).toBeInTheDocument()
    expect(screen.getByRole("img", { name: "Bolo, foto 3" })).toBeInTheDocument()
  })

  it("sem foto, mostra o prato no lugar e o que foi passado por cima", () => {
    render(
      <PhotoCarousel images={[]} name="Bolo">
        <h1>Bolo</h1>
      </PhotoCarousel>
    )

    expect(screen.getByRole("img", { name: "Bolo" })).toHaveTextContent("🍽️")
    expect(screen.getByRole("heading", { name: "Bolo" })).toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })
})
