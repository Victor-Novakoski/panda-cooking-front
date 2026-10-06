import Image from "next/image"
import { notFound } from "next/navigation"
import { api } from "@/services/api"
import { Recipe } from "@/types"
import { Header } from "@/components/layout/Header"
import { FavoriteButton } from "@/components/recipe/FavoriteButton"
import { CommentSection } from "@/components/recipe/CommentSection"
import { RecipeOwnerActions } from "@/components/recipe/RecipeOwnerActions"
import { Clock, Users, ChefHat } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

async function getRecipe(id: string): Promise<Recipe | null> {
  try {
    const res = await api.get(`/recipes/${id}`)
    return res.data
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const recipe = await getRecipe(id)
  if (!recipe) return { title: "Receita não encontrada" }
  return {
    title: `${recipe.name} — Panda Cooking`,
    description: recipe.description,
  }
}

export default async function RecipePage({ params }: PageProps) {
  const { id } = await params
  const recipe = await getRecipe(id)

  if (!recipe) notFound()

  const image = recipe.images?.[0]?.url

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-6 py-10">
        {/* Hero */}
        <div className="relative mb-10 h-64 overflow-hidden rounded-3xl border-4 border-[#1A0A00] bg-[#F5E6C8] shadow-[6px_6px_0px_#1A0A00] sm:h-80 md:h-96">
          {image ? (
            <Image src={image} alt={recipe.name} fill className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center text-8xl">🍽️</div>
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />

          {/* Título sobre a imagem */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full border-2 border-[#1A0A00] bg-[#D4A017] px-3 py-0.5 text-xs font-black text-[#1A0A00] shadow-[2px_2px_0px_#1A0A00]">
                {recipe.category?.name}
              </span>
              <FavoriteButton recipeId={recipe.id} />
            </div>
            <h1 className="text-3xl font-black text-white drop-shadow-lg sm:text-4xl" style={{ textShadow: "2px 2px 0 #000" }}>
              {recipe.name}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Conteúdo */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <p className="text-base font-semibold leading-relaxed text-[#1A0A00]/70">
              {recipe.description}
            </p>

            {/* Modo de preparo */}
            <div className="rounded-2xl border-[3px] border-[#1A0A00] bg-white p-6 shadow-[4px_4px_0px_#1A0A00]">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-6 w-1.5 rounded-full border-2 border-[#1A0A00] bg-[#C0392B]" />
                <h2 className="text-xl font-black text-[#1A0A00]">Modo de preparo</h2>
              </div>
              <ol className="flex flex-col gap-4">
                {recipe.preparations?.map((step, index) => (
                  <li key={step.id} className="flex gap-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#1A0A00] bg-[#C0392B] text-sm font-black text-white shadow-[2px_2px_0px_#1A0A00]">
                      {index + 1}
                    </span>
                    <p className="pt-1 text-sm font-semibold leading-relaxed text-[#1A0A00]/70">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>

            <CommentSection recipeId={recipe.id} />
          </div>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            <RecipeOwnerActions recipeId={recipe.id} ownerId={recipe.user_id} />

            {/* Info */}
            <div className="rounded-2xl border-[3px] border-[#1A0A00] bg-white p-5 shadow-[4px_4px_0px_#1A0A00]">
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-[#1A0A00]/40">Informações</p>
              {[
                { icon: <Clock className="h-4 w-4 text-[#C0392B]" />, label: "Tempo", value: recipe.time },
                { icon: <Users className="h-4 w-4 text-[#C0392B]" />, label: "Porções", value: `${recipe.portions} porções` },
                { icon: <ChefHat className="h-4 w-4 text-[#C0392B]" />, label: "Chef", value: recipe.user?.name ?? "Chef" },
              ].map((item, i, arr) => (
                <div key={item.label} className={`flex items-center gap-3 py-3 ${i < arr.length - 1 ? "border-b-2 border-dashed border-[#F5E6C8]" : ""}`}>
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-[#1A0A00] bg-[#F5E6C8] shadow-[2px_2px_0px_#1A0A00]">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#1A0A00]/40">{item.label}</p>
                    <p className="text-sm font-black text-[#1A0A00]">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Ingredientes */}
            <div className="rounded-2xl border-[3px] border-[#1A0A00] bg-white p-5 shadow-[4px_4px_0px_#1A0A00]">
              <p className="mb-4 text-xs font-black uppercase tracking-widest text-[#1A0A00]/40">🥢 Ingredientes</p>
              <ul className="flex flex-col gap-2">
                {recipe.ingredients?.map((item) => (
                  <li key={item.id} className={`flex items-start gap-2.5 pb-2 text-sm border-b-2 border-dashed border-[#F5E6C8] last:border-0 last:pb-0`}>
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
