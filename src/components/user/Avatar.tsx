"use client"

import { useState } from "react"
import { cn, isHttpsUrl } from "@/lib/utils"

const sizes = {
  sm: "h-7 w-7 border-2 text-sm",
  md: "h-9 w-9 border-2 text-lg shadow-[2px_2px_0px_#1A0A00]",
  lg: "h-20 w-20 border-[3px] text-4xl shadow-[3px_3px_0px_#1A0A00]",
}

interface AvatarProps {
  src?: string
  // texto alternativo; vazio quando o nome já aparece ao lado
  alt?: string
  size?: keyof typeof sizes
  className?: string
}

// Foto da pessoa ou o panda. A foto é um link que ela mesma informou, de
// qualquer site: vai direto num <img>, sem o otimizador do Next.
export function Avatar({ src, alt = "", size = "md", className }: AvatarProps) {
  const [broken, setBroken] = useState(false)
  const showPhoto = !!src && !broken && isHttpsUrl(src)

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border-[#1A0A00] bg-[#D4A017]",
        sizes[size],
        className
      )}
    >
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setBroken(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span aria-hidden>🐼</span>
      )}
    </div>
  )
}
