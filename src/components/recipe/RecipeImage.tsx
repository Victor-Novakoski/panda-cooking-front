"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"
import { isHttpsUrl } from "@/lib/utils"

// Fotos destes sites passam pelo otimizador do Next (tamanho certo para a
// tela, WebP/AVIF). Precisa bater com images.remotePatterns do next.config.ts.
// Link de outro site vai direto para o navegador: liberar qualquer domínio
// no otimizador deixaria o servidor baixar o que qualquer pessoa mandasse.
const OPTIMIZED_HOSTS = new Set(["images.unsplash.com"])

export function canOptimize(url: string) {
  try {
    return OPTIMIZED_HOSTS.has(new URL(url).hostname)
  } catch {
    return false
  }
}

type RecipeImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string
  alt: string
  // o que aparece sem foto ou com link quebrado
  fallback?: string
}

export function RecipeImage({ src, alt, fallback = "🍽️", ...props }: RecipeImageProps) {
  const [broken, setBroken] = useState(false)

  if (!src || broken || !isHttpsUrl(src)) {
    return (
      <div className="flex h-full w-full items-center justify-center text-6xl" role="img" aria-label={alt}>
        {fallback}
      </div>
    )
  }

  const optimized = canOptimize(src)
  return (
    <Image
      src={src}
      alt={alt}
      unoptimized={!optimized}
      // sem referrer o site da foto não fica sabendo qual página a mostrou
      referrerPolicy={optimized ? undefined : "no-referrer"}
      onError={() => setBroken(true)}
      {...props}
    />
  )
}
