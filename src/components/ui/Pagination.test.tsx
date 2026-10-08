import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"
import { Pagination, pageWindow } from "./Pagination"

describe("pageWindow", () => {
  it.each([
    [1, 1, [1]],
    [1, 3, [1, 2, 3]],
    [3, 5, [1, 2, 3, 4, 5]],
    [1, 10, [1, 2, "…", 10]],
    [6, 12, [1, "…", 5, 6, 7, "…", 12]],
    [12, 12, [1, "…", 11, 12]],
  ])("página %i de %i", (page, total, expected) => {
    expect(pageWindow(page, total)).toEqual(expected)
  })
})

describe("Pagination", () => {
  it("não aparece com uma página só", () => {
    const { container } = render(<Pagination page={1} totalPages={1} onChange={vi.fn()} />)
    expect(container).toBeEmptyDOMElement()
  })

  it("marca a página atual e navega", async () => {
    const onChange = vi.fn()
    render(<Pagination page={2} totalPages={3} onChange={onChange} />)
    const user = userEvent.setup()

    expect(screen.getByRole("button", { name: "Página 2" })).toHaveAttribute("aria-current", "page")
    await user.click(screen.getByRole("button", { name: "Próxima página" }))
    await user.click(screen.getByRole("button", { name: "Página 1" }))

    expect(onChange.mock.calls).toEqual([[3], [1]])
  })

  it("desabilita voltar na primeira e avançar na última", () => {
    const { rerender } = render(<Pagination page={1} totalPages={2} onChange={vi.fn()} />)
    expect(screen.getByRole("button", { name: "Página anterior" })).toBeDisabled()

    rerender(<Pagination page={2} totalPages={2} onChange={vi.fn()} />)
    expect(screen.getByRole("button", { name: "Próxima página" })).toBeDisabled()
  })
})
