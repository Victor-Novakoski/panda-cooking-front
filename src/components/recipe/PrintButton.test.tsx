import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import { PrintButton } from "./PrintButton"

describe("PrintButton", () => {
  afterEach(() => vi.restoreAllMocks())

  it("abre a impressão do navegador", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {})
    render(<PrintButton />)

    await userEvent.click(screen.getByRole("button", { name: "Imprimir" }))

    expect(print).toHaveBeenCalledOnce()
  })
})
