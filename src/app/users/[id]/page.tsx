import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getAuthorRecipes, getPublicUser } from "@/lib/server-api"
import { Header } from "@/components/layout/Header"
import { AuthorRecipes } from "@/components/user/AuthorRecipes"
import { Avatar } from "@/components/user/Avatar"
import { Notice } from "@/components/ui/Notice"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const author = await getPublicUser(id)
  if (!author) return { title: "Página não encontrada" }
  return { title: `Receitas de ${author.name}` }
}

// Página pública de quem publica: nome, foto e as receitas.
export default async function AuthorPage({ params }: PageProps) {
  const { id } = await params
  const author = await getPublicUser(id)
  if (!author) notFound()
  const first = await getAuthorRecipes(author.id)

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6">
        <Link href="/recipes" className="mb-6 inline-flex items-center gap-1.5 text-sm font-black text-[#1A0A00]/50 hover:text-[#C0392B]">
          <ArrowLeft className="h-4 w-4" /> Todas as receitas
        </Link>

        <div className="mb-8 flex items-center gap-4 rounded-2xl border-[3px] border-[#1A0A00] bg-white p-6 shadow-[4px_4px_0px_#1A0A00]">
          <Avatar src={author.image_profile} alt="" size="lg" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-black text-[#1A0A00]">{author.name}</h1>
            <p className="text-sm font-bold text-[#1A0A00]/50">
              {first.total === 1 ? "1 receita publicada" : `${first.total} receitas publicadas`}
            </p>
            <p className="mt-1 text-xs font-bold text-[#1A0A00]/40">
              Na cozinha desde{" "}
              {/* fuso fixo: a página é renderizada no servidor, que costuma estar em UTC */}
              {new Date(author.created_at).toLocaleDateString("pt-BR", {
                month: "long",
                year: "numeric",
                timeZone: "America/Sao_Paulo",
              })}
            </p>
          </div>
        </div>

        {first.total === 0 ? (
          <Notice emoji="🍳" title={`${author.name} ainda não publicou receitas.`}>
            <Link href="/recipes" className="font-black text-[#C0392B] hover:underline">
              Ver as receitas da comunidade
            </Link>
          </Notice>
        ) : (
          <AuthorRecipes userId={author.id} first={first} />
        )}
      </main>
    </>
  )
}
