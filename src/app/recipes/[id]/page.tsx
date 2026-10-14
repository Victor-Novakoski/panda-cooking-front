import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getRecipe } from "@/lib/server-api"
import { formatDate, isImageUrl } from "@/lib/utils"
import { Header } from "@/components/layout/Header"
import { FavoriteButton } from "@/components/recipe/FavoriteButton"
import { CommentSection } from "@/components/recipe/CommentSection"
import { RecipeOwnerActions } from "@/components/recipe/RecipeOwnerActions"
import { PhotoCarousel } from "@/components/recipe/PhotoCarousel"
import { PrintButton } from "@/components/recipe/PrintButton"
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

  const photos = recipe.images.filter((image) => isImageUrl(image.url))

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 print:max-w-none print:p-0">
        <Link href="/recipes" className="mb-6 inline-flex items-center print:hidden gap-1.5 text-sm font-black text-[#1A0A00]/50 hover:text-[#C0392B]">
          <ArrowLeft className="h-4 w-4" /> Todas as receitas
        </Link>

        {/* Capa: todas as fotos da receita num carrossel */}
        <div className="mb-10 print:hidden">
          <PhotoCarousel images={photos} name={recipe.name}>
            <div className="mb-2 flex w-fit flex-wrap items-center gap-2">
              <Link
                href={`/recipes?categoria=${recipe.category.id}`}
                className="rounded-full border-2 border-[#1A0A00] bg-[#D4A017] px-3 py-0.5 text-xs font-black text-[#1A0A00] shadow-[2px_2px_0px_#1A0A00] hover:bg-[#F0C040]"
              >
                {recipe.category.name}
              </Link>
              <FavoriteButton recipeId={recipe.id} />
            </div>
            <h1 className="w-fit text-3xl font-black text-white drop-shadow-lg sm:text-4xl" style={{ textShadow: "2px 2px 0 #000" }}>
              {recipe.name}
            </h1>
          </PhotoCarousel>
        </div>

        {/* No papel saem só o nome, os ingredientes e o modo de preparo, nessa
            ordem; o resto leva print:hidden. */}
        <p className="mb-6 hidden text-3xl font-black text-black print:block">{recipe.name}</p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 print:flex print:flex-col-reverse">
          <div className="flex flex-col gap-8 lg:col-span-2">
            <p className="whitespace-pre-line text-base font-semibold leading-relaxed text-[#1A0A00]/70 print:hidden">
              {recipe.description}
            </p>

            <section className="rounded-2xl border-[3px] border-[#1A0A00] bg-white p-6 shadow-[4px_4px_0px_#1A0A00] print:border-0 print:p-0 print:shadow-none">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-6 w-1.5 rounded-full border-2 border-[#1A0A00] bg-[#C0392B]" />
                <h2 className="text-xl font-black text-[#1A0A00]">Modo de preparo</h2>
              </div>
              <ol className="flex flex-col gap-4">
                {recipe.preparations.map((step, index) => (
                  <li key={step.id} className="flex gap-4 break-inside-avoid">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#1A0A00] bg-[#C0392B] text-sm font-black text-white shadow-[2px_2px_0px_#1A0A00]">
                      {index + 1}
                    </span>
                    <p className="whitespace-pre-line pt-1 text-sm font-semibold leading-relaxed text-[#1A0A00]/70 print:text-black">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
            </section>

            <div className="print:hidden">
              <CommentSection recipeId={recipe.id} />
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <div className="contents print:hidden">
              <RecipeOwnerActions recipeId={recipe.id} ownerId={recipe.author.id} />
            </div>
            <PrintButton />

            <div className="rounded-2xl border-[3px] border-[#1A0A00] bg-white p-5 shadow-[4px_4px_0px_#1A0A00] print:hidden">
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

            <div className="rounded-2xl border-[3px] border-[#1A0A00] bg-white p-5 shadow-[4px_4px_0px_#1A0A00] print:border-0 print:p-0 print:shadow-none">
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-[#1A0A00]/40 print:text-xl print:normal-case print:tracking-normal print:text-black">
                <span className="print:hidden">🥢 </span>Ingredientes
              </p>
              <ul className="flex flex-col gap-2">
                {recipe.ingredients.map((item) => (
                  <li key={item.id} className="flex items-start gap-2.5 border-b-2 border-dashed border-[#F5E6C8] pb-2 text-sm last:border-0 last:pb-0">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full border-2 border-[#1A0A00] bg-[#C0392B]" />
                    <span>
                      <span className="font-black text-[#1A0A00]">{item.amount}</span>
                      <span className="font-semibold text-[#1A0A00]/60 print:text-black"> {item.name}</span>
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
