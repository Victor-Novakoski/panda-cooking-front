import Link from "next/link"
import { Header } from "@/components/layout/Header"

export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section
          className="relative overflow-hidden border-b-4 border-[#D4A017] bg-[#8B1A1A] px-6 py-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        >
          {/* lanternas decorativas */}
          <div className="pointer-events-none absolute right-16 top-0 text-5xl opacity-20 tracking-[24px]">
            🏮🏮🏮
          </div>

          <div className="mx-auto flex max-w-7xl items-center justify-between gap-12">
            <div className="max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-[#A07010] bg-[#D4A017] px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00]">
                🏮 Comunidade de Receitas
              </div>

              <h1
                className="mb-5 text-5xl font-black leading-tight text-white sm:text-6xl"
                style={{ textShadow: "3px 3px 0px #5a0f0f" }}
              >
                Descubra receitas{" "}
                <span className="text-[#F0C040]" style={{ textShadow: "3px 3px 0px #A07010" }}>
                  incríveis
                </span>{" "}
                com sabor de aventura
              </h1>

              <p className="mb-8 text-base leading-relaxed text-white/70">
                De dim sum a ramen. Explore pratos da comunidade, salve seus favoritos e
                compartilhe suas criações com o mundo.
              </p>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] px-6 py-3 text-sm font-black text-[#1A0A00] shadow-[4px_4px_0px_#1A0A00] transition-all hover:bg-[#F0C040] active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  🔍 Explorar receitas
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center gap-2 rounded-xl border-[3px] border-[#D4A017] px-6 py-3 text-sm font-black text-[#F0C040] shadow-[4px_4px_0px_#1A0A00] transition-all hover:bg-white/10 active:translate-x-1 active:translate-y-1 active:shadow-none"
                >
                  Criar conta grátis
                </Link>
              </div>
            </div>

            {/* Mascote */}
            <div className="relative hidden shrink-0 lg:block">
              <div className="flex h-52 w-52 items-center justify-center rounded-full border-[5px] border-[#D4A017] bg-[#F5E6C8] text-9xl shadow-[6px_6px_0px_#1A0A00]">
                🐼
              </div>
              <div className="absolute -bottom-2 -right-2 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[#1A0A00] bg-[#D4A017] text-2xl shadow-[3px_3px_0px_#1A0A00]">
                🍜
              </div>
            </div>
          </div>
        </section>

        {/* Features bar */}
        <div className="flex border-b-4 border-[#1A0A00] bg-[#D4A017]">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`flex flex-1 items-center gap-3 px-6 py-4 ${i < features.length - 1 ? "border-r-[3px] border-[#1A0A00]" : ""}`}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-[#1A0A00] bg-white text-xl shadow-[2px_2px_0px_#1A0A00]">
                {f.icon}
              </div>
              <div>
                <div className="text-sm font-black text-[#1A0A00]">{f.title}</div>
                <div className="text-xs font-semibold text-[#1A0A00]/60">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA final */}
        <section className="border-t-4 border-[#1A0A00] bg-[#F5E6C8] py-20 text-center">
          <div className="mx-auto max-w-xl px-6">
            <div className="mb-4 text-5xl">🐼🍜</div>
            <h2 className="mb-3 text-3xl font-black text-[#1A0A00]">Pronto para cozinhar?</h2>
            <p className="mb-8 text-[#1A0A00]/60 font-semibold">
              Crie sua conta e comece a compartilhar suas receitas com a comunidade.
            </p>
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] px-8 py-3.5 text-base font-black text-[#1A0A00] shadow-[4px_4px_0px_#1A0A00] transition-all hover:bg-[#F0C040] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              🥢 Criar conta grátis
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}

const features = [
  { icon: "🍳", title: "Crie receitas", desc: "Compartilhe com a comunidade" },
  { icon: "❤️", title: "Salve favoritas", desc: "Monte sua coleção pessoal" },
  { icon: "💬", title: "Interaja", desc: "Comente e conecte-se" },
]
