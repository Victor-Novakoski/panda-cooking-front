import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { RecipeCard } from "./RecipeCard"
import { makeSummary } from "@/test/utils"

describe("RecipeCard", () => {
  it("mostra o nome inteiro de quem publicou", () => {
    render(<RecipeCard recipe={makeSummary({ author: { id: "maria", name: "Chef Maria Silva", image_profile: "" } })} />)

    expect(screen.getByText("por Chef Maria Silva")).toBeInTheDocument()
  })
})
