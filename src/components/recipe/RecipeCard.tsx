import Link from "next/link"
import Image from "next/image"
import { Recipe } from "@/types"
import { Clock, Users } from "lucide-react"

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const image = recipe.images?.[0]?.url

  return (
    <Link href={`/recipes/${recipe.id}`} className="group block">
      <div className="rounded-2xl border-[3px] border-[#1A0A00] bg-white shadow-[4px_4px_0px_#1A0A00] overflow-hidden transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0px_#1A0A00]">
        {/* Imagem */}
        <div className="relative h-44 bg-[#F5E6C8] border-b-[3px] border-[#1A0A00]">
          {image ? (
            <Image
              src={image}
              alt={recipe.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">🍽️</div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
          <span className="absolute right-2 top-2 rounded-full border-2 border-[#1A0A00] bg-[#D4A017] px-2.5 py-0.5 text-xs font-black text-[#1A0A00] shadow-[2px_2px_0px_#1A0A00]">
            {recipe.category?.name}
          </span>
        </div>

        {/* Body */}
        <div className="p-4">
          <h3 className="mb-1 font-black text-[#1A0A00] line-clamp-1 group-hover:text-[#C0392B] transition-colors">
            {recipe.name}
          </h3>
          <p className="mb-3 text-xs leading-relaxed text-[#1A0A00]/60 line-clamp-2">
            {recipe.description}
          </p>
          <div className="flex items-center gap-3 border-t-2 border-dashed border-[#F5E6C8] pt-3 text-xs font-bold text-[#1A0A00]/50">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> {recipe.time}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {recipe.portions} porções
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
