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

// Foto enviada do computador: a API guarda e devolve este endereço, servido
// pelo próprio site (o /api é repassado para a API).
const UPLOAD_PATH = /^\/api\/uploads\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUploadPath(value: string) {
  return UPLOAD_PATH.test(value)
}

// Endereço que pode virar foto: link https ou foto enviada do computador.
export function isImageUrl(value: string) {
  return isUploadPath(value) || isHttpsUrl(value)
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
// para fora (open redirect). Em vez de conferir prefixos, resolve o endereço
// como o navegador faria (que ignora tab e quebra de linha: "/\t/evil.com"
// vira "//evil.com") e confere se continua na mesma origem.
const BASE = "http://mesmo-site.invalid"
export function safeNextPath(next: string | null | undefined, fallback = "/recipes") {
  if (!next || !next.startsWith("/")) return fallback
  let url: URL
  try {
    url = new URL(next, BASE)
  } catch {
    return fallback
  }
  if (url.origin !== BASE) return fallback
  return url.pathname + url.search + url.hash
}

export function formatDate(iso: string) {
  // Fuso fixo: a página é renderizada no servidor, que costuma estar em UTC,
  // e a receita das 22h apareceria com a data do dia seguinte.
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  })
}
