import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Notice } from "@/components/ui/Notice"

export default function RecipeNotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <Notice emoji="🍽️" title="Receita não encontrada.">
          Ela pode ter sido apagada.{" "}
          <Link href="/dashboard" className="font-black text-[#C0392B] hover:underline">
            Ver outras receitas
          </Link>
        </Notice>
      </main>
    </>
  )
}
