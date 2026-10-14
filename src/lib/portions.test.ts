import { describe, expect, it } from "vitest"
import { scaleAmount } from "./portions"

describe("scaleAmount", () => {
  it.each([
    ["500g", 2, "1000g"],
    ["500g (moída)", 1.5, "750g (moída)"],
    ["200 ml", 0.5, "100 ml"],
    ["3 colheres de sopa", 2, "6 colheres de sopa"],
    ["1 colher de sopa", 2, "2 colheres de sopa"],
    ["2 colheres de sopa", 0.5, "1 colher de sopa"],
    ["1 lata (395g)", 3, "3 latas (395g)"],
    ["2 latas", 0.5, "1 lata"],
    ["1 unidade", 4, "4 unidades"],
    ["3 dentes", 1 / 3, "1 dente"],
    ["1 litro", 1.5, "1 1/2 litro"],
    ["1 kg", 2, "2 kg"],
    ["1/2 xícara", 2, "1 xícara"],
    ["1/2 xícara", 3, "1 1/2 xícara"],
    ["1 1/2 xícara", 2, "3 xícaras"],
    ["1,5 litro", 2, "3 litros"],
    ["1.5 litro", 2, "3 litros"],
    ["½ limão", 2, "1 limão"],
    ["2 ovos", 1.5, "3 ovos"],
    ["1 pitada", 0.25, "1/4 pitada"],
    ["3", 2, "6"],
    ["100g para cobrir", 0.3, "30g para cobrir"],
    ["4", 0.3, "1,2"],
  ])("%s × %f = %s", (amount, factor, expected) => {
    expect(scaleAmount(amount, factor)).toBe(expected)
  })

  it.each(["a gosto", "q.b.", "uma pitada", "", "meia xícara"])("deixa “%s” como está", (amount) => {
    expect(scaleAmount(amount, 3)).toBe(amount)
  })

  it("com o mesmo número de porções, não mexe em nada", () => {
    expect(scaleAmount("1,50 kg", 1)).toBe("1,50 kg")
  })
})
