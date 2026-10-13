import { describe, expect, it } from "vitest"
import { capitalize, formatDate, isHttpsUrl, isImageUrl, safeNextPath, utf8Length } from "./utils"

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

describe("isImageUrl", () => {
  it("aceita link https e foto enviada do computador", () => {
    expect(isImageUrl("https://exemplo.com/foto.jpg")).toBe(true)
    expect(isImageUrl("/api/uploads/0b7c1d2e-3f4a-4b5c-8d9e-0f1a2b3c4d5e")).toBe(true)
  })

  it("recusa outros caminhos do site e links que não são https", () => {
    expect(isImageUrl("/api/uploads/../users/profile")).toBe(false)
    expect(isImageUrl("/api/uploads/123")).toBe(false)
    expect(isImageUrl("//api/uploads/0b7c1d2e-3f4a-4b5c-8d9e-0f1a2b3c4d5e")).toBe(false)
    expect(isImageUrl("http://exemplo.com/foto.jpg")).toBe(false)
    expect(isImageUrl("javascript:alert(1)")).toBe(false)
  })
})

describe("safeNextPath", () => {
  it.each([
    ["/profile", "/profile"],
    ["/recipes/abc?x=1", "/recipes/abc?x=1"],
    [null, "/recipes"],
    ["", "/recipes"],
    ["https://outro.site", "/recipes"],
    ["//outro.site", "/recipes"],
    ["/\\outro.site", "/recipes"],
    ["profile", "/recipes"],
    // o navegador ignora tab e quebra de linha: "/\t/outro.site" vira "//outro.site"
    ["/\t/outro.site", "/recipes"],
    ["/\n/outro.site", "/recipes"],
    ["/\r\n/outro.site", "/recipes"],
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
