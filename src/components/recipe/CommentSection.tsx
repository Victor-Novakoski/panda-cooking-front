"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { commentsService } from "@/services/comments.service"
import { apiErrorMessage } from "@/services/api"
import { useAuthStore } from "@/store/auth.store"
import { COMMENT_MAX } from "@/lib/limits"
import { formatDate } from "@/lib/utils"
import { Avatar } from "@/components/user/Avatar"
import { Textarea } from "@/components/ui/Textarea"
import type { Comment, User } from "@/types"
import { Pencil, Trash2 } from "lucide-react"

const goldBtnClass =
  "flex items-center gap-2 rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] px-5 py-2 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F0C040] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"

export function commentsKey(recipeId: string) {
  return ["recipes", "detail", recipeId, "comments"]
}

export function CommentSection({ recipeId }: { recipeId: string }) {
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const pathname = usePathname()
  const queryClient = useQueryClient()
  const [text, setText] = useState("")

  // Dos mais novos para os mais antigos, uma página por vez ("ver mais").
  const { data, isPending, isError, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: commentsKey(recipeId),
    queryFn: ({ pageParam }) => commentsService.list(recipeId, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last) => (last.page < last.total_pages ? last.page + 1 : undefined),
  })

  // Um comentário novo empurra os outros para a página seguinte; sem
  // filtrar, o último de uma página apareceria de novo no começo da próxima.
  const seen = new Set<number>()
  const comments = (data?.pages.flatMap((p) => p.items) ?? []).filter((c) => !seen.has(c.id) && seen.add(c.id))
  const total = data?.pages[0]?.total ?? 0

  const create = useMutation({
    mutationFn: () => commentsService.create(recipeId, text.trim()),
    onSuccess: () => {
      setText("")
      queryClient.invalidateQueries({ queryKey: commentsKey(recipeId) })
    },
  })

  const draft = text.trim()

  return (
    <section aria-labelledby="comments-title">
      <div className="mb-5 flex items-center gap-3">
        <div className="h-6 w-1.5 rounded-full border-2 border-[#1A0A00] bg-[#C0392B]" />
        <h2 id="comments-title" className="text-xl font-black text-[#1A0A00]">
          Comentários {total > 0 && `(${total})`}
        </h2>
      </div>

      {status === "authenticated" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            create.mutate()
          }}
          className="mb-6 rounded-2xl border-[3px] border-[#1A0A00] bg-white p-4 shadow-[4px_4px_0px_#1A0A00]"
        >
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Deixe seu comentário... 🥢"
            aria-label="Novo comentário"
            rows={3}
            className="bg-[#FDF6E3]"
            counter={{ length: draft.length, max: COMMENT_MAX }}
            error={create.error ? apiErrorMessage(create.error, "Não foi possível enviar o comentário.") : undefined}
          />
          <button
            type="submit"
            disabled={!draft || draft.length > COMMENT_MAX || create.isPending}
            className={`mt-3 ${goldBtnClass}`}
          >
            {create.isPending ? "Enviando..." : "🐼 Comentar"}
          </button>
        </form>
      ) : status !== "loading" ? (
        <div className="mb-6 rounded-2xl border-[3px] border-dashed border-[#D4A017] bg-[#F5E6C8] p-4 text-center">
          <p className="text-sm font-bold text-[#1A0A00]/60">
            <Link
              href={`/auth/login?next=${encodeURIComponent(pathname)}`}
              className="font-black text-[#C0392B] hover:underline"
            >
              Entre
            </Link>{" "}
            para deixar um comentário.
          </p>
        </div>
      ) : null}

      {isPending ? (
        <div className="h-20 animate-pulse rounded-2xl border-[3px] border-[#1A0A00]/20 bg-[#F5E6C8]" />
      ) : isError ? (
        <p role="alert" className="text-sm font-bold text-[#C0392B]">
          Não foi possível carregar os comentários.
        </p>
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border-[3px] border-dashed border-[#D4A017] bg-[#F5E6C8] p-8 text-center">
          <div className="mb-2 text-3xl" aria-hidden>
            💬
          </div>
          <p className="text-sm font-bold text-[#1A0A00]/50">Nenhum comentário ainda. Seja o primeiro!</p>
        </div>
      ) : (
        <>
          <ul className="flex flex-col gap-3">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} recipeId={recipeId} currentUser={user} />
            ))}
          </ul>
          {hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="mx-auto mt-4 flex rounded-xl border-[3px] border-[#1A0A00] bg-white px-5 py-2 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F5E6C8] disabled:opacity-60"
            >
              {isFetchingNextPage ? "Carregando..." : "Ver mais comentários"}
            </button>
          )}
        </>
      )}
    </section>
  )
}

interface CommentItemProps {
  comment: Comment
  recipeId: string
  currentUser: User | null
}

function CommentItem({ comment, recipeId, currentUser }: CommentItemProps) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(comment.description)

  const isAuthor = currentUser?.id === comment.user.id
  // A API deixa o admin apagar qualquer comentário, mas editar só o autor.
  const canDelete = isAuthor || !!currentUser?.is_adm
  const wasEdited = comment.updated_at !== comment.created_at
  const trimmed = draft.trim()

  const update = useMutation({
    mutationFn: () => commentsService.update(comment.id, trimmed),
    onSuccess: () => {
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: commentsKey(recipeId) })
    },
  })

  const remove = useMutation({
    mutationFn: () => commentsService.delete(comment.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentsKey(recipeId) }),
  })

  function cancelEdit() {
    setDraft(comment.description)
    setEditing(false)
    update.reset()
  }

  return (
    <li className="flex items-start gap-3 rounded-2xl border-[3px] border-[#1A0A00] bg-white p-4 shadow-[3px_3px_0px_#1A0A00]">
      <Avatar src={comment.user.image_profile} />

      <div className="min-w-0 flex-1">
        <p className="text-xs font-black text-[#1A0A00]">
          {comment.user.name}
          <span className="ml-2 font-semibold text-[#1A0A00]/40">
            <time dateTime={comment.created_at}>{formatDate(comment.created_at)}</time>
            {wasEdited && " · editado"}
          </span>
        </p>

        {editing ? (
          <div className="mt-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Editar comentário"
              rows={3}
              autoFocus
              className="bg-[#FDF6E3]"
              counter={{ length: trimmed.length, max: COMMENT_MAX }}
              error={update.error ? apiErrorMessage(update.error, "Não foi possível salvar o comentário.") : undefined}
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => update.mutate()}
                disabled={!trimmed || trimmed === comment.description || trimmed.length > COMMENT_MAX || update.isPending}
                className={goldBtnClass}
              >
                {update.isPending ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border-[3px] border-[#1A0A00] bg-white px-4 py-2 text-sm font-black text-[#1A0A00]"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-line wrap-break-word text-sm font-semibold text-[#1A0A00]">
            {comment.description}
          </p>
        )}
        {remove.error && (
          <p role="alert" className="mt-2 text-xs font-bold text-[#C0392B]">
            {apiErrorMessage(remove.error, "Não foi possível apagar o comentário.")}
          </p>
        )}
      </div>

      {!editing && (
        <div className="flex gap-1">
          {isAuthor && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              aria-label="Editar comentário"
              title="Editar"
              className="rounded-lg p-1.5 text-[#1A0A00]/30 transition-colors hover:text-[#1A0A00]"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => remove.mutate()}
              disabled={remove.isPending}
              aria-label="Apagar comentário"
              title="Apagar"
              className="rounded-lg p-1.5 text-[#1A0A00]/30 transition-colors hover:text-[#C0392B]"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </li>
  )
}
