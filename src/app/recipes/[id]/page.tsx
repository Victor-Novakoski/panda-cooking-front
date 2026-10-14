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
import { ShareButton } from "@/components/recipe/ShareButton"
import { CookMode } from "@/components/recipe/CookMode"
import { IngredientList, PortionsProvider } from "@/components/recipe/Portions"
import { RecipeVideo } from "@/components/recipe/RecipeVideo"
import { formatTime, portionsLabel } from "@/components/recipe/format"
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

        {/* A ordem aqui é a do celular e a do papel: ingredientes antes do
            preparo. No computador a grade põe a coluna lateral à direita. */}
        <PortionsProvider base={recipe.portions}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:grid-rows-[auto_auto_auto_1fr] print:block">
            <p className="whitespace-pre-line text-base font-semibold leading-relaxed text-[#1A0A00]/70 lg:col-span-2 lg:col-start-1 lg:row-start-1 print:hidden">
              {recipe.description}
            </p>

            <aside className="flex flex-col gap-4 lg:col-start-3 lg:row-span-4 lg:row-start-1 print:mb-8">
              <div className="contents print:hidden">
                <RecipeOwnerActions recipeId={recipe.id} ownerId={recipe.author.id} />
              </div>
              <CookMode name={recipe.name} ingredients={recipe.ingredients} preparations={recipe.preparations} />
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 xl:grid-cols-2 print:hidden">
                <ShareButton title={recipe.name} />
                <PrintButton />
              </div>

              <div className="rounded-2xl border-[3px] border-[#1A0A00] bg-white p-5 shadow-[4px_4px_0px_#1A0A00] print:hidden">
                <p className="mb-4 text-xs font-black uppercase tracking-widest text-[#1A0A00]/40">Informações</p>
                {[
                  { icon: <Clock className="h-4 w-4 text-[#C0392B]" />, label: "Tempo", value: formatTime(recipe.time_minutes) },
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
                <Link
                  href={`/users/${recipe.author.id}`}
                  title={`Ver as receitas de ${recipe.author.name}`}
                  className="group -mx-2 mt-1 flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#F5E6C8]"
                >
                  <Avatar src={recipe.author.image_profile} />
                  <div className="min-w-0">
                    <p className="flex items-center gap-1 text-xs font-bold text-[#1A0A00]/40">
                      <ChefHat className="h-3 w-3" aria-hidden /> Chef
                    </p>
                    <p className="truncate text-sm font-black text-[#1A0A00] group-hover:text-[#C0392B]">{recipe.author.name}</p>
                    <p className="text-xs font-semibold text-[#1A0A00]/40">
                      publicada em <time dateTime={recipe.created_at}>{formatDate(recipe.created_at)}</time>
                    </p>
                  </div>
                </Link>
              </div>

              <IngredientList ingredients={recipe.ingredients} />
            </aside>

            <section className="lg:col-span-2 lg:col-start-1 lg:row-start-2 rounded-2xl border-[3px] border-[#1A0A00] bg-white p-6 shadow-[4px_4px_0px_#1A0A00] print:border-0 print:p-0 print:shadow-none">
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

            <div className="empty:hidden lg:col-span-2 lg:col-start-1 lg:row-start-3">
              <RecipeVideo url={recipe.video_url} title={recipe.name} />
            </div>

            <div className="lg:col-span-2 lg:col-start-1 lg:row-start-4 print:hidden">
              <CommentSection recipeId={recipe.id} />
            </div>
          </div>
        </PortionsProvider>
      </main>
    </>
  )
}
