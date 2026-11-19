"use client"

import { useRef, useState, type ReactNode } from "react"
import { RecipeImage } from "./RecipeImage"
import { cn } from "@/lib/utils"
import type { ImageRecipe } from "@/types"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PhotoCarouselProps {
  images: ImageRecipe[]
  name: string
  // o que fica por cima das fotos (categoria, favoritar, título)
  children?: ReactNode
}

// Capa da receita: todas as fotos num carrossel, uma por vez, com setas,
// bolinhas e arrastar para o lado (no celular). A rolagem com scroll-snap é
// do próprio navegador; as setas só rolam até a foto certa.
export function PhotoCarousel({ images, name, children }: PhotoCarouselProps) {
  const track = useRef<HTMLDivElement>(null)
  const [current, setCurrent] = useState(0)

  function goTo(index: number) {
    const el = track.current
    if (!el) return
    const next = Math.max(0, Math.min(images.length - 1, index))
    el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" })
  }

  function onScroll() {
    const el = track.current
    if (el && el.clientWidth) setCurrent(Math.round(el.scrollLeft / el.clientWidth))
  }

  const arrowClass =
    "absolute top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-[#1A0A00] bg-white text-[#1A0A00] shadow-[2px_2px_0px_#1A0A00] transition-opacity hover:bg-[#F5E6C8] disabled:pointer-events-none disabled:opacity-0"

  return (
    <section
      aria-roledescription="carrossel"
      aria-label={`Fotos de ${name}`}
      className="relative aspect-4/3 overflow-hidden rounded-3xl border-4 border-[#1A0A00] bg-[#F5E6C8] shadow-[6px_6px_0px_#1A0A00] sm:aspect-video"
    >
      {images.length === 0 ? (
        <RecipeImage src="" alt={name} fallback="🍽️" />
      ) : (
        <div
          ref={track}
          onScroll={onScroll}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") goTo(current - 1)
            if (e.key === "ArrowRight") goTo(current + 1)
          }}
          className="absolute inset-0 flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-[#F0C040]"
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              role="group"
              aria-roledescription="foto"
              aria-label={`${index + 1} de ${images.length}`}
              className="relative h-full w-full shrink-0 snap-center overflow-hidden"
            >
              {/* A foto aparece inteira, sem corte; o que sobra dos lados é
                  preenchido com a mesma foto desfocada. */}
              <div aria-hidden className="absolute inset-0 scale-110 opacity-70 blur-2xl">
                <RecipeImage
                  src={image.url}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="object-cover"
                  fallback=""
                />
              </div>
              <RecipeImage
                src={image.url}
                alt={index === 0 ? name : `${name}, foto ${index + 1}`}
                fill
                priority={index === 0}
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-contain"
              />
            </div>
          ))}
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(current - 1)}
            disabled={current === 0}
            aria-label="Foto anterior"
            className={cn(arrowClass, "left-3")}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => goTo(current + 1)}
            disabled={current === images.length - 1}
            aria-label="Próxima foto"
            className={cn(arrowClass, "right-3")}
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute right-4 top-4 z-10 flex gap-2">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Ver foto ${index + 1}`}
                aria-current={index === current || undefined}
                className={cn(
                  "h-3 rounded-full border-2 border-[#1A0A00] shadow-[1px_1px_0px_#1A0A00] transition-all",
                  index === current ? "w-7 bg-[#D4A017]" : "w-3 bg-white hover:bg-[#F5E6C8]"
                )}
              />
            ))}
          </div>
        </>
      )}

      {/* não segura o toque: dá para arrastar a foto por cima do título */}
      {children && <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-6 *:pointer-events-auto">{children}</div>}
    </section>
  )
}
