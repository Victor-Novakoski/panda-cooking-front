// Mesma regra da API (internal/service/video.go): só link https do YouTube,
// nos formatos que o site e o aplicativo entregam ao compartilhar. O player
// é montado com o id tirado daqui, nunca com o endereço que a pessoa colou.
const HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "www.youtube-nocookie.com"])
const ID = /^[A-Za-z0-9_-]{11}$/

export function youtubeId(value: string): string | null {
  if (/\s/.test(value)) return null
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return null
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return null

  let id = ""
  if (url.hostname === "youtu.be") {
    id = url.pathname.slice(1)
  } else if (HOSTS.has(url.hostname)) {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v") ?? ""
    } else {
      const prefix = ["/shorts/", "/embed/", "/live/"].find((p) => url.pathname.startsWith(p))
      if (prefix) id = url.pathname.slice(prefix.length)
    }
  }
  id = id.replace(/\/$/, "")
  return ID.test(id) ? id : null
}
