"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { commentsService } from "@/services/comments.service"
import { useAuthStore } from "@/store/auth.store"
import { Comment } from "@/types"
import { Trash2 } from "lucide-react"
import Link from "next/link"

interface CommentSectionProps {
  recipeId: string
  comments: Comment[]
}

export function CommentSection({ recipeId, comments }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuthStore()
  const queryClient = useQueryClient()
  const [text, setText] = useState("")

  const createMutation = useMutation({
    mutationFn: () => commentsService.create({ description: text, recipe_id: recipeId }),
    onSuccess: () => {
      setText("")
      queryClient.invalidateQueries({ queryKey: ["recipes", recipeId] })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: commentsService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["recipes", recipeId] }),
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
            rows={3}
            className="w-full resize-none rounded-xl border-[3px] border-[#1A0A00] bg-[#FDF6E3] px-3 py-2 text-sm font-semibold text-[#1A0A00] placeholder:text-[#1A0A00]/30 shadow-[2px_2px_0px_#1A0A00] focus:border-[#C0392B] focus:outline-none"
          />
          <button
            disabled={!text.trim() || createMutation.isPending}
            onClick={() => createMutation.mutate()}
            className="mt-3 flex items-center gap-2 rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] px-5 py-2 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#F0C040] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
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

      {comments.length === 0 ? (
        <div className="rounded-2xl border-[3px] border-dashed border-[#D4A017] bg-[#F5E6C8] p-8 text-center">
          <div className="text-3xl mb-2">💬</div>
          <p className="text-sm font-bold text-[#1A0A00]/50">Nenhum comentário ainda. Seja o primeiro!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex items-start gap-3 rounded-2xl border-[3px] border-[#1A0A00] bg-white p-4 shadow-[3px_3px_0px_#1A0A00]">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#1A0A00] bg-[#D4A017] text-lg shadow-[2px_2px_0px_#1A0A00]">
                🐼
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1A0A00]">{comment.description}</p>
              </div>
              {user?.id === comment.user_id && (
                <button
                  onClick={() => deleteMutation.mutate(comment.id)}
                  className="text-[#1A0A00]/20 transition-colors hover:text-[#C0392B]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
