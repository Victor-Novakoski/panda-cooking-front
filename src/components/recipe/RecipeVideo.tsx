import { youtubeId } from "@/lib/video"

// Vídeo da receita. O player é montado com o id tirado do link (nunca com o
// endereço inteiro) e vem do youtube-nocookie.com, que não grava cookie
// enquanto a pessoa não dá play. Sem link válido, não aparece nada.
export function RecipeVideo({ url, title }: { url: string; title: string }) {
  const id = youtubeId(url)
  if (!id) return null

  return (
    <section className="rounded-2xl border-[3px] border-[#1A0A00] bg-white p-6 shadow-[4px_4px_0px_#1A0A00] print:hidden">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-6 w-1.5 rounded-full border-2 border-[#1A0A00] bg-[#C0392B]" />
        <h2 className="text-xl font-black text-[#1A0A00]">Vídeo</h2>
      </div>
      <div className="relative aspect-video overflow-hidden rounded-xl border-[3px] border-[#1A0A00] bg-[#1A0A00]">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${id}`}
          title={`Vídeo: ${title}`}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          // o YouTube recusa o player quando não recebe de onde ele foi aberto
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </section>
  )
}
