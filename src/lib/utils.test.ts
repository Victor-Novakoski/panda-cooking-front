import { describe, expect, it } from "vitest"
import { capitalize, formatDate, isHttpsUrl, safeNextPath, utf8Length } from "./utils"

describe("isHttpsUrl", () => {
  it.each([
    ["https://images.unsplash.com/foto.jpg", true],
    ["https://exemplo.com", true],
    ["http://exemplo.com/foto.jpg", false],
    ["javascript:alert(1)", false],
    ["data:image/png;base64,AAAA", false],
    ["https://usuario:senha@exemplo.com/foto.jpg", false],
    ["https://exemplo.com/foto com espaço.jpg", false],
    ["foto.jpg", false],
    ["", false],
  ])("%s → %s", (url, expected) => {
    expect(isHttpsUrl(url)).toBe(expected)
  })
})

describe("safeNextPath", () => {
  it.each([
    ["/profile", "/profile"],
    ["/recipes/abc?x=1", "/recipes/abc?x=1"],
    [null, "/dashboard"],
    ["", "/dashboard"],
    ["https://outro.site", "/dashboard"],
    ["//outro.site", "/dashboard"],
    ["/\\outro.site", "/dashboard"],
    ["profile", "/dashboard"],
    // o navegador ignora tab e quebra de linha: "/\t/outro.site" vira "//outro.site"
    ["/\t/outro.site", "/dashboard"],
    ["/\n/outro.site", "/dashboard"],
    ["/\r\n/outro.site", "/dashboard"],
    ["/%2F/outro.site", "/%2F/outro.site"],
  ])("%s → %s", (next, expected) => {
    expect(safeNextPath(next)).toBe(expected)
  })
})

it("utf8Length conta bytes, não letras", () => {
  expect(utf8Length("panda")).toBe(5)
  expect(utf8Length("pão")).toBe(4)
})

it("capitalize deixa só a primeira letra maiúscula", () => {
  expect(capitalize("campo obrigatório")).toBe("Campo obrigatório")
  expect(capitalize("")).toBe("")
})

it("formatDate usa o horário de Brasília, não o do servidor", () => {
  // 23h de 6/10 em Brasília já é 7/10 em UTC
  expect(formatDate("2026-10-07T02:00:00Z")).toMatch(/^06/)
})
