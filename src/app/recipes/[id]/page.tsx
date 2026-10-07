import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getRecipe } from "@/lib/server-api"
import { formatDate } from "@/lib/utils"
import { Header } from "@/components/layout/Header"
import { FavoriteButton } from "@/components/recipe/FavoriteButton"
import { CommentSection } from "@/components/recipe/CommentSection"
import { RecipeOwnerActions } from "@/components/recipe/RecipeOwnerActions"
import { RecipeImage } from "@/components/recipe/RecipeImage"
import { portionsLabel } from "@/components/recipe/format"
import { Avatar } from "@/components/user/Avatar"
import { ArrowLeft, ChefHat, Clock, Users } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const recipe = await getRecipe(id)
  if (!recipe) return { title: "Receita não encontrada" }
  const cover = recipe.images[0]?.url
  return {
    title: recipe.name,
    description: recipe.description.slice(0, 160),
    openGraph: { title: recipe.name, description: recipe.description.slice(0, 160), images: cover ? [cover] : [] },
  }
}

export default async function RecipePage({ params }: PageProps) {
  const { id } = await params
  const recipe = await getRecipe(id)
  if (!recipe) notFound()

  const [cover, ...gallery] = recipe.images

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <Link href="/dashboard" className="mb-6 inline-flex items-center gap-1.5 text-sm font-black text-[#1A0A00]/50 hover:text-[#C0392B]">
          <ArrowLeft className="h-4 w-4" /> Todas as receitas
        </Link>

        {/* Capa */}
        <div className="relative mb-10 h-64 overflow-hidden rounded-3xl border-4 border-[#1A0A00] bg-[#F5E6C8] shadow-[6px_6px_0px_#1A0A00] sm:h-80 md:h-96">
          <RecipeImage
            src={cover?.url ?? ""}
            alt={recipe.name}
            fill
            priority
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
            fallback="🍽️"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Link
                href={`/dashboard?categoria=${recipe.category.id}`}
                className="rounded-full border-2 border-[#1A0A00] bg-[#D4A017] px-3 py-0.5 text-xs font-black text-[#1A0A00] shadow-[2px_2px_0px_#1A0A00] hover:bg-[#F0C040]"
              >
                {recipe.category.name}
              </Link>
              <FavoriteButton recipeId={recipe.id} />
            </div>
            <h1 className="text-3xl font-black text-white drop-shadow-lg sm:text-4xl" style={{ textShadow: "2px 2px 0 #000" }}>
              {recipe.name}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <p className="whitespace-pre-line text-base font-semibold leading-relaxed text-[#1A0A00]/70">
              {recipe.description}
            </p>

            {gallery.length > 0 && (
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {gallery.map((image, index) => (
                  <a
                    key={image.id}
                    href={image.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative aspect-square overflow-hidden rounded-xl border-[3px] border-[#1A0A00] bg-[#F5E6C8] shadow-[3px_3px_0px_#1A0A00] transition-transform hover:-translate-y-0.5"
                  >
                    <RecipeImage
                      src={image.url}
                      alt={`${recipe.name}, foto ${index + 2}`}
                      fill
                      sizes="(min-width: 640px) 160px, 33vw"
                      className="object-cover"
                    />
                  </a>
                ))}
              </div>
            )}

            <section className="rounded-2xl border-[3px] border-[#1A0A00] bg-white p-6 shadow-[4px_4px_0px_#1A0A00]">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-6 w-1.5 rounded-full border-2 border-[#1A0A00] bg-[#C0392B]" />
                <h2 className="text-xl font-black text-[#1A0A00]">Modo de preparo</h2>
              </div>
              <ol className="flex flex-col gap-4">
                {recipe.preparations.map((step, index) => (
                  <li key={step.id} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#1A0A00] bg-[#C0392B] text-sm font-black text-white shadow-[2px_2px_0px_#1A0A00]">
                      {index + 1}
                    </span>
                    <p className="whitespace-pre-line pt-1 text-sm font-semibold leading-relaxed text-[#1A0A00]/70">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <CommentSection recipeId={recipe.id} />
          </div>

          <aside className="flex flex-col gap-4">
            <RecipeOwnerActions recipeId={recipe.id} ownerId={recipe.author.id} />

            <div className="rounded-2xl border-[3px] border-[#1A0A00] bg-white p-5 shadow-[4px_4px_0px_#1A0A00]">
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-[#1A0A00]/40">Informações</p>
              {[
                { icon: <Clock className="h-4 w-4 text-[#C0392B]" />, label: "Tempo", value: recipe.time },
                { icon: <Users className="h-4 w-4 text-[#C0392B]" />, label: "Rende", value: portionsLabel(recipe.portions) },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 border-b-2 border-dashed border-[#F5E6C8] py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#1A0A00] bg-[#F5E6C8] shadow-[2px_2px_0px_#1A0A00]">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1A0A00]/40">{item.label}</p>
                    <p className="text-sm font-black text-[#1A0A00]">{item.value}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3 pt-3">
                <Avatar src={recipe.author.image_profile} />
                <div className="min-w-0">
                  <p className="flex items-center gap-1 text-xs font-bold text-[#1A0A00]/40">
                    <ChefHat className="h-3 w-3" aria-hidden /> Chef
                  </p>
                  <p className="truncate text-sm font-black text-[#1A0A00]">{recipe.author.name}</p>
                  <p className="text-xs font-semibold text-[#1A0A00]/40">
                    publicada em <time dateTime={recipe.created_at}>{formatDate(recipe.created_at)}</time>
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border-[3px] border-[#1A0A00] bg-white p-5 shadow-[4px_4px_0px_#1A0A00]">
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-[#1A0A00]/40">🥢 Ingredientes</p>
              <ul className="flex flex-col gap-2">
                {recipe.ingredients.map((item) => (
                  <li key={item.id} className="flex items-start gap-2.5 border-b-2 border-dashed border-[#F5E6C8] pb-2 text-sm last:border-0 last:pb-0">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full border-2 border-[#1A0A00] bg-[#C0392B]" />
                    <span>
                      <span className="font-black text-[#1A0A00]">{item.amount}</span>
                      <span className="font-semibold text-[#1A0A00]/60"> {item.name}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </>
  )
}
