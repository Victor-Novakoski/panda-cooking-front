"use client"

import { useRef, useState } from "react"
import { uploadsService } from "@/services/uploads.service"
import { apiErrorMessage } from "@/services/api"
import { PhotoError, preparePhoto } from "@/lib/photo"
import { cn } from "@/lib/utils"
import { Upload } from "lucide-react"

interface PhotoUploadProps {
  // recebe o endereço de cada foto enviada, na ordem em que foram escolhidas
  onUploaded: (urls: string[]) => void
  // quantas fotos ainda cabem; com 1, escolhe uma foto só
  max: number
  label: string
  className?: string
}

// Botão que abre a escolha de fotos do computador (ou da galeria, no
// celular), reduz cada uma e envia para a API.
export function PhotoUpload({ onUploaded, max, label, className }: PhotoUploadProps) {
  const input = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const [error, setError] = useState<string>()

  async function send(files: File[]) {
    setError(undefined)
    const chosen = files.slice(0, max)
    const skipped = files.length - chosen.length
    const urls: string[] = []
    setProgress({ done: 0, total: chosen.length })
    try {
      for (const file of chosen) {
        urls.push(await uploadsService.upload(await preparePhoto(file)))
        setProgress({ done: urls.length, total: chosen.length })
      }
      if (skipped > 0) setError(`Só cabiam mais ${max} foto${max === 1 ? "" : "s"}; ${skipped} ficou de fora.`)
    } catch (e) {
      setError(e instanceof PhotoError ? e.message : apiErrorMessage(e, "Não foi possível enviar a foto. Tente de novo."))
    } finally {
      // as que já subiram entram mesmo se uma do meio falhar
      if (urls.length) onUploaded(urls)
      setProgress(null)
    }
  }

  const busy = progress !== null
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple={max > 1}
        className="hidden"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          const files = Array.from(e.target.files ?? [])
          // limpa para a mesma foto poder ser escolhida de novo
          e.target.value = ""
          if (files.length) void send(files)
        }}
      />
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy || max < 1}
        className="flex items-center gap-1.5 self-start rounded-xl border-[3px] border-[#1A0A00] bg-white px-4 py-2 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#FDF6E3] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-40"
      >
        <Upload className="h-4 w-4" aria-hidden />
        {busy ? `Enviando ${Math.min(progress.done + 1, progress.total)} de ${progress.total}...` : label}
      </button>
      {error && (
        <span role="alert" className="text-xs font-bold text-[#C0392B]">
          {error}
        </span>
      )}
    </div>
  )
}
