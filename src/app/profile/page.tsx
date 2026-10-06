"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useAuthStore } from "@/store/auth.store"
import { usersService } from "@/services/users.service"
import { recipesService } from "@/services/recipes.service"
import { Header } from "@/components/layout/Header"
import { RecipeCard } from "@/components/recipe/RecipeCard"
import Link from "next/link"
import { Pencil, Plus } from "lucide-react"

type Tab = "recipes" | "favorites"

export default function ProfilePage() {
  const { user } = useAuthStore()
  const [tab, setTab] = useState<Tab>("recipes")

  const { data: allRecipes } = useQuery({
    queryKey: ["recipes"],
    queryFn: recipesService.getAll,
  })

  const myRecipes = allRecipes?.filter((r) => r.user_id === user?.id)

  const { data: favorites, isLoading: loadingFavorites } = useQuery({
    queryKey: ["favorites"],
    queryFn: usersService.getFavorites,
    enabled: tab === "favorites",
  })

  const isLoading = tab === "favorites" && loadingFavorites
  const data = tab === "recipes" ? myRecipes : favorites

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-6 py-10">
        {/* Card de perfil */}
        <div className="mb-8 flex flex-col items-start gap-4 rounded-2xl border-[3px] border-[#1A0A00] bg-white p-6 shadow-[4px_4px_0px_#1A0A00] sm:flex-row sm:items-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-[3px] border-[#1A0A00] bg-[#D4A017] text-4xl shadow-[3px_3px_0px_#1A0A00]">
            {user?.image_profile
              ? // A foto é uma URL qualquer informada pelo usuário; o next/image exigiria liberar cada domínio.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image_profile} alt={user.name} className="h-full w-full rounded-full object-cover" />
              : "🐼"
            }
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-[#1A0A00]">{user?.name}</h1>
            <p className="text-sm font-semibold text-[#1A0A00]/50">{user?.email}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/profile/edit"
              className="flex items-center gap-2 rounded-xl border-[3px] border-[#1A0A00] bg-white px-5 py-2.5 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F5E6C8] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Pencil className="h-4 w-4" /> Editar perfil
            </Link>
            <Link
              href="/recipes/new"
              className="flex items-center gap-2 rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] px-5 py-2.5 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F0C040] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              <Plus className="h-4 w-4" /> Nova receita
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex border-b-[3px] border-[#1A0A00]">
          {[
            { key: "recipes" as Tab, label: "🍳 Minhas receitas", count: myRecipes?.length },
            { key: "favorites" as Tab, label: "❤️ Favoritas", count: undefined },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 border-b-[3px] px-5 pb-3 text-sm font-black transition-colors ${
                tab === t.key
                  ? "-mb-[3px] border-[#C0392B] text-[#C0392B]"
                  : "border-transparent text-[#1A0A00]/40 hover:text-[#1A0A00]"
              }`}
            >
              {t.label}
              {t.count !== undefined && (
                <span className="rounded-full border-2 border-[#1A0A00] bg-[#F5E6C8] px-2 py-0.5 text-xs font-black text-[#1A0A00]">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl border-[3px] border-[#1A0A00]/20 bg-[#F5E6C8]" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (!data || data.length === 0) && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-[3px] border-dashed border-[#D4A017] bg-[#F5E6C8] py-24 text-center">
            <div className="mb-4 text-6xl">{tab === "recipes" ? "🍳" : "❤️"}</div>
            <p className="font-black text-[#1A0A00]">
              {tab === "recipes" ? "Você ainda não criou nenhuma receita." : "Você ainda não tem favoritas."}
            </p>
            {tab === "recipes" && (
              <Link
                href="/recipes/new"
                className="mt-5 flex items-center gap-2 rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] px-5 py-2.5 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F0C040]"
              >
                <Plus className="h-4 w-4" /> Criar primeira receita
              </Link>
            )}
          </div>
        )}

        {/* Grid */}
        {!isLoading && data && data.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {data.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
