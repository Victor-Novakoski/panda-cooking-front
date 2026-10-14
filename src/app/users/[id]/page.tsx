import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { getAuthorRecipes } from "@/lib/server-api"
import { Header } from "@/components/layout/Header"
import { AuthorRecipes } from "@/components/user/AuthorRecipes"
import { Avatar } from "@/components/user/Avatar"
import { ArrowLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const first = await getAuthorRecipes(id)
  if (!first) return { title: "Página não encontrada" }
  return { title: `Receitas de ${first.items[0].author.name}` }
}

// Página pública de quem publica: nome, foto e as receitas.
export default async function AuthorPage({ params }: PageProps) {
  const { id } = await params
  const first = await getAuthorRecipes(id)
  if (!first) notFound()

  const author = first.items[0].author

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
          </div>
        </div>

        <AuthorRecipes userId={id} first={first} />
      </main>
    </>
  )
}
