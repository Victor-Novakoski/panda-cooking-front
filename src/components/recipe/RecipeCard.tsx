import Link from "next/link"
import type { RecipeSummary } from "@/types"
import { LinkPending } from "./LinkPending"
import { RecipeImage } from "./RecipeImage"
import { portionsLabel } from "./format"
import { Clock, Users } from "lucide-react"

export function RecipeCard({ recipe }: { recipe: RecipeSummary }) {
  return (
    <Link href={`/recipes/${recipe.id}`} className="group block h-full">
      <article className="relative flex h-full flex-col overflow-hidden rounded-2xl border-[3px] border-[#1A0A00] bg-white shadow-[4px_4px_0px_#1A0A00] transition-all duration-150 group-hover:-translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0px_#1A0A00]">
        <div className="relative h-44 border-b-[3px] border-[#1A0A00] bg-[#F5E6C8]">
          <RecipeImage
            src={recipe.image_url}
            alt={recipe.name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
          <span className="absolute right-2 top-2 rounded-full border-2 border-[#1A0A00] bg-[#D4A017] px-2.5 py-0.5 text-xs font-black text-[#1A0A00] shadow-[2px_2px_0px_#1A0A00]">
            {recipe.category.name}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="mb-1 line-clamp-1 font-black text-[#1A0A00] transition-colors group-hover:text-[#C0392B]">
            {recipe.name}
          </h3>
          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-[#1A0A00]/60">{recipe.description}</p>
          <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t-2 border-dashed border-[#F5E6C8] pt-3 text-xs font-bold text-[#1A0A00]/50">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" aria-hidden /> {recipe.time}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" aria-hidden /> {portionsLabel(recipe.portions)}
            </span>
            <span className="ml-auto truncate">por {recipe.author.name.split(" ")[0]}</span>
          </div>
        </div>
        <LinkPending />
      </article>
    </Link>
  )
}
