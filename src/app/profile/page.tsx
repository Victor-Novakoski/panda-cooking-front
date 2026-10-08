"use client"

import { useState } from "react"
import Link from "next/link"
import { useAuthStore } from "@/store/auth.store"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { useRecipeList } from "@/hooks/useRecipes"
import { useFavoriteList } from "@/hooks/useFavorites"
import { cn } from "@/lib/utils"
import { Header } from "@/components/layout/Header"
import { SessionNotice } from "@/components/layout/SessionNotice"
import { RecipeGrid, RecipeGridSkeleton } from "@/components/recipe/RecipeGrid"
import { Avatar } from "@/components/user/Avatar"
import { Notice } from "@/components/ui/Notice"
import { Pagination } from "@/components/ui/Pagination"
import { Pencil, Plus } from "lucide-react"

type Tab = "recipes" | "favorites"

export default function ProfilePage() {
  const status = useRequireAuth()
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useState<Tab>("recipes")
  const [recipesPage, setRecipesPage] = useState(1)
  const [favoritesPage, setFavoritesPage] = useState(1)

  const ready = status === "authenticated" && !!user
  const recipes = useRecipeList({ user_id: user?.id, page: recipesPage }, ready)
  const favorites = useFavoriteList(favoritesPage, ready)
  const current = tab === "recipes" ? recipes : favorites

  function goToPage(page: number) {
    if (tab === "recipes") setRecipesPage(page)
    else setFavoritesPage(page)
  }

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        {!ready ? (
          <SessionNotice status={status} />
        ) : (
          <>
            {/* Card de perfil */}
            <div className="mb-8 flex flex-col items-start gap-4 rounded-2xl border-[3px] border-[#1A0A00] bg-white p-6 shadow-[4px_4px_0px_#1A0A00] sm:flex-row sm:items-center">
              <Avatar src={user.image_profile} alt={user.name} size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-2xl font-black text-[#1A0A00]">{user.name}</h1>
                <p className="truncate text-sm font-semibold text-[#1A0A00]/50">{user.email}</p>
                {user.created_at && (
                  <p className="mt-1 text-xs font-bold text-[#1A0A00]/40">
                    Na cozinha desde {new Date(user.created_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                  </p>
                )}
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

            {/* Abas */}
            <div className="mb-6 flex border-b-[3px] border-[#1A0A00]" role="tablist">
              {[
                { key: "recipes" as Tab, label: "🍳 Minhas receitas", count: recipes.data?.total },
                { key: "favorites" as Tab, label: "❤️ Favoritas", count: favorites.data?.total },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.key}
                  onClick={() => setTab(t.key)}
                  className={cn(
                    "flex items-center gap-2 border-b-[3px] px-4 pb-3 text-sm font-black transition-colors sm:px-5",
                    tab === t.key
                      ? "-mb-[3px] border-[#C0392B] text-[#C0392B]"
                      : "border-transparent text-[#1A0A00]/40 hover:text-[#1A0A00]"
                  )}
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

            <div role="tabpanel">
              {current.isPending && <RecipeGridSkeleton count={4} />}

              {current.isError && !current.data && (
                <Notice emoji="😕" title="Não foi possível carregar a lista." role="alert">
                  Tente de novo daqui a pouco.
                </Notice>
              )}

              {current.data && current.data.items.length === 0 && (
                <Notice
                  emoji={tab === "recipes" ? "🍳" : "❤️"}
                  title={tab === "recipes" ? "Você ainda não criou nenhuma receita." : "Você ainda não tem favoritas."}
                >
                  {tab === "recipes" ? (
                    <Link href="/recipes/new" className="font-black text-[#C0392B] hover:underline">
                      Criar a primeira receita
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="font-black text-[#C0392B] hover:underline">
                      Encontrar receitas para favoritar
                    </Link>
                  )}
                </Notice>
              )}

              {current.data && current.data.items.length > 0 && (
                <div className={cn("transition-opacity", current.isPlaceholderData && "opacity-60")}>
                  <RecipeGrid recipes={current.data.items} />
                  <Pagination page={current.data.page} totalPages={current.data.total_pages} onChange={goToPage} />
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  )
}
