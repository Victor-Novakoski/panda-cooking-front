import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Notice } from "@/components/ui/Notice"

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
        <Notice emoji="🐼" title="Página não encontrada.">
          O panda procurou em toda a cozinha.{" "}
          <Link href="/dashboard" className="font-black text-[#C0392B] hover:underline">
            Ver as receitas
          </Link>
        </Notice>
      </main>
    </>
  )
}
