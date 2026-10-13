"use client"

import { useRef, useState } from "react"
import { RecipeImage } from "./RecipeImage"
import { cn } from "@/lib/utils"
import type { ImageRecipe } from "@/types"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Carrossel das fotos da receita além da capa: uma foto por vez, com setas,
// bolinhas e arrastar para o lado (no celular). A rolagem com scroll-snap é
// do próprio navegador; as setas só rolam até a foto certa.
export function PhotoCarousel({ images, name }: { images: ImageRecipe[]; name: string }) {
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
    <section aria-roledescription="carrossel" aria-label={`Mais fotos de ${name}`} className="flex flex-col gap-3">
      <div className="relative">
        <div
          ref={track}
          onScroll={onScroll}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") goTo(current - 1)
            if (e.key === "ArrowRight") goTo(current + 1)
          }}
          className="flex snap-x snap-mandatory overflow-x-auto rounded-2xl border-[3px] border-[#1A0A00] bg-[#F5E6C8] shadow-[4px_4px_0px_#1A0A00] [scrollbar-width:none] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C0392B]"
        >
          {images.map((image, index) => (
            <div
              key={image.id}
              role="group"
              aria-roledescription="foto"
              aria-label={`${index + 1} de ${images.length}`}
              className="relative aspect-4/3 w-full shrink-0 snap-center"
            >
              <RecipeImage
                src={image.url}
                alt={`${name}, foto ${index + 2}`}
                fill
                sizes="(min-width: 1024px) 640px, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

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
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex justify-center gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Ver foto ${index + 1}`}
              aria-current={index === current || undefined}
              className={cn(
                "h-3 rounded-full border-2 border-[#1A0A00] transition-all",
                index === current ? "w-7 bg-[#C0392B]" : "w-3 bg-white hover:bg-[#F5E6C8]"
              )}
            />
          ))}
        </div>
      )}
    </section>
  )
}
