import { describe, expect, it } from "vitest"
import { formatTime, portionsLabel } from "./format"

describe("formatTime", () => {
  it.each([
    [1, "1 min"],
    [40, "40 min"],
    [59, "59 min"],
    [60, "1h"],
    [90, "1h 30min"],
    [180, "3h"],
    [2880, "48h"],
  ])("%i minutos vira %s", (minutes, expected) => {
    expect(formatTime(minutes)).toBe(expected)
  })

  it("sem tempo válido, mostra um traço", () => {
    expect(formatTime(0)).toBe("—")
    expect(formatTime(Number.NaN)).toBe("—")
  })
})

describe("portionsLabel", () => {
  it("uma porção fica no singular", () => {
    expect(portionsLabel(1)).toBe("1 porção")
    expect(portionsLabel(4)).toBe("4 porções")
  })
})
