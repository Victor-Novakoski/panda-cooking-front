// Prepara a foto escolhida no computador para enviar: reduz para no máximo
// MAX_SIDE pixels no lado maior e converte para WebP (ou JPEG, se o navegador
// não gerar WebP) até caber no limite da API. Uma foto de celular de 5 MB
// vira umas centenas de KB, sobe mais rápido e abre mais rápido no site.

export const MAX_SIDE = 1600
// a API aceita até 900 KB
export const MAX_PHOTO_BYTES = 900 * 1024
const QUALITIES = [0.85, 0.75, 0.6, 0.45]

export class PhotoError extends Error {}

export function isPhoto(file: File) {
  return file.type.startsWith("image/")
}

export async function preparePhoto(file: File): Promise<Blob> {
  if (!isPhoto(file)) throw new PhotoError("Escolha um arquivo de foto (JPG, PNG, WebP ou GIF).")

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    throw new PhotoError("Não foi possível abrir esta foto. Tente outra.")
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const context = canvas.getContext("2d")
  if (!context) throw new PhotoError("Não foi possível preparar a foto neste navegador.")
  // fundo branco: PNG transparente convertido para JPEG ficaria preto
  context.fillStyle = "#fff"
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  for (const quality of QUALITIES) {
    const blob = (await toBlob(canvas, "image/webp", quality)) ?? (await toBlob(canvas, "image/jpeg", quality))
    if (blob && blob.size <= MAX_PHOTO_BYTES) return blob
  }
  throw new PhotoError("A foto continua grande demais mesmo reduzida. Tente outra.")
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) =>
    canvas.toBlob((blob) => resolve(blob && blob.type === type ? blob : null), type, quality)
  )
}
