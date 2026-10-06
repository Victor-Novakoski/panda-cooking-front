"use client"

import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { commentsService } from "@/services/comments.service"
import { apiErrorMessage } from "@/services/api"
import { useAuthStore } from "@/store/auth.store"
import { Comment, User } from "@/types"
import { Pencil, Trash2 } from "lucide-react"
import Link from "next/link"

interface CommentSectionProps {
  recipeId: string
}

const textareaClass = "w-full resize-none rounded-xl border-[3px] border-[#1A0A00] bg-[#FDF6E3] px-3 py-2 text-sm font-semibold text-[#1A0A00] placeholder:text-[#1A0A00]/30 shadow-[2px_2px_0px_#1A0A00] focus:border-[#C0392B] focus:outline-none"
const goldBtnClass = "flex items-center gap-2 rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] px-5 py-2 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F0C040] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"

export function commentsKey(recipeId: string) {
  return ["recipes", recipeId, "comments"]
}

export function CommentSection({ recipeId }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const [text, setText] = useState("")

  const { data: comments = [], isLoading } = useQuery({
    queryKey: commentsKey(recipeId),
    queryFn: () => commentsService.getByRecipe(recipeId),
  })

  const createMutation = useMutation({
    mutationFn: () => commentsService.create({ description: text.trim(), recipe_id: recipeId }),
    onSuccess: () => {
      setText("")
      queryClient.invalidateQueries({ queryKey: commentsKey(recipeId) })
    },
  })

  return (
    <section>
      <div className="mb-5 flex items-center gap-3">
        <div className="h-6 w-1.5 rounded-full border-2 border-[#1A0A00] bg-[#C0392B]" />
        <h2 className="text-xl font-black text-[#1A0A00]">
          Comentários {comments.length > 0 && `(${comments.length})`}
        </h2>
      </div>

      {isAuthenticated() ? (
        <div className="mb-6 rounded-2xl border-[3px] border-[#1A0A00] bg-white p-4 shadow-[4px_4px_0px_#1A0A00]">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Deixe seu comentário... 🥢"
            aria-label="Novo comentário"
            rows={3}
            className={textareaClass}
          />
          <button
            disabled={!text.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className={`mt-3 ${goldBtnClass}`}
          >
            {createMutation.isPending ? "Enviando..." : "🐼 Comentar"}
          </button>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border-[3px] border-dashed border-[#D4A017] bg-[#F5E6C8] p-4 text-center">
          <p className="text-sm font-bold text-[#1A0A00]/60">
            <Link href="/auth/login" className="font-black text-[#C0392B] hover:underline">Entre</Link>
            {" "}para deixar um comentário.
          </p>
        </div>
      )}

      {isLoading ? (
        <div className="h-20 animate-pulse rounded-2xl border-[3px] border-[#1A0A00]/20 bg-[#F5E6C8]" />
      ) : comments.length === 0 ? (
        <div className="rounded-2xl border-[3px] border-dashed border-[#D4A017] bg-[#F5E6C8] p-8 text-center">
          <div className="text-3xl mb-2">💬</div>
          <p className="text-sm font-bold text-[#1A0A00]/50">Nenhum comentário ainda. Seja o primeiro!</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} recipeId={recipeId} currentUser={user} />
          ))}
        </ul>
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

  const updateMutation = useMutation({
    mutationFn: () => commentsService.update(comment.id, draft.trim()),
    onSuccess: () => {
      setEditing(false)
      queryClient.invalidateQueries({ queryKey: commentsKey(recipeId) })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: () => commentsService.delete(comment.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentsKey(recipeId) }),
  })

  function cancelEdit() {
    setDraft(comment.description)
    setEditing(false)
    updateMutation.reset()
  }

  return (
    <li className="flex items-start gap-3 rounded-2xl border-[3px] border-[#1A0A00] bg-white p-4 shadow-[3px_3px_0px_#1A0A00]">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[#1A0A00] bg-[#D4A017] text-lg shadow-[2px_2px_0px_#1A0A00]">
        {comment.user.image_profile
          ? // Foto é URL de qualquer domínio; o next/image exigiria liberar cada um.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={comment.user.image_profile} alt="" className="h-full w-full object-cover" />
          : "🐼"}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-xs font-black text-[#1A0A00]">
          {comment.user.name}
          <span className="ml-2 font-semibold text-[#1A0A00]/40">
            {formatDate(comment.created_at)}
            {wasEdited && " · editado"}
          </span>
        </p>

        {editing ? (
          <div className="mt-2">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              aria-label="Editar comentário"
              rows={3}
              autoFocus
              className={textareaClass}
            />
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => updateMutation.mutate()}
                disabled={!draft.trim() || draft.trim() === comment.description || updateMutation.isPending}
                className={goldBtnClass}
              >
                {updateMutation.isPending ? "Salvando..." : "Salvar"}
              </button>
              <button
                onClick={cancelEdit}
                className="rounded-xl border-[3px] border-[#1A0A00] bg-white px-4 py-2 text-sm font-black text-[#1A0A00]"
              >
                Cancelar
              </button>
            </div>
            {updateMutation.error && (
              <p role="alert" className="mt-2 text-xs font-bold text-[#C0392B]">
                {apiErrorMessage(updateMutation.error, "Não foi possível salvar o comentário.")}
              </p>
            )}
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-line wrap-break-word text-sm font-semibold text-[#1A0A00]">{comment.description}</p>
        )}
      </div>

      {!editing && (
        <div className="flex gap-1">
          {isAuthor && (
            <button
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
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
}
