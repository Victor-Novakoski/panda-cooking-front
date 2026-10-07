import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Mesma regra da API: só https, com host e sem usuário ou senha no link.
// http seria bloqueado como conteúdo misto no site em https; javascript: e
// data: nunca devem virar src de imagem.
export function isHttpsUrl(value: string) {
  if (/\s/.test(value)) return false
  try {
    const url = new URL(value)
    return url.protocol === "https:" && url.hostname !== "" && !url.username && !url.password
  } catch {
    return false
  }
}

// Tamanho em bytes (UTF-8): a senha tem limite em bytes por causa do bcrypt.
export function utf8Length(value: string) {
  return new TextEncoder().encode(value).length
}

// Primeira letra maiúscula: as mensagens da API vêm em minúsculas
// ("campo obrigatório") para servir tanto no meio quanto no começo da frase.
export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Caminho para onde voltar depois do login (?next=). Só aceita caminho do
// próprio site: "//outro.site" ou "https://..." viraria um redirecionamento
// para fora (open redirect).
export function safeNextPath(next: string | null | undefined, fallback = "/dashboard") {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return fallback
  }
  return next
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}
