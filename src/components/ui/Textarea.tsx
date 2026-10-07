"use client"

import { cn } from "@/lib/utils"
import { TextareaHTMLAttributes, forwardRef } from "react"

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  // mostra "usados/máximo" embaixo do campo
  counter?: { length: number; max: number }
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, counter, id, ...props }, ref) => {
    const over = counter ? counter.length > counter.max : false
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-xs font-extrabold uppercase tracking-widest text-[#1A0A00]">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          aria-invalid={!!error || over || undefined}
          className={cn(
            "w-full resize-none rounded-xl border-[3px] border-[#1A0A00] bg-white px-3 py-2 text-sm font-semibold text-[#1A0A00] placeholder:text-[#1A0A00]/30 shadow-[2px_2px_0px_#1A0A00] focus:border-[#C0392B] focus:outline-none",
            (error || over) && "border-[#C0392B] shadow-[2px_2px_0px_#C0392B]",
            className
          )}
          {...props}
        />
        {(error || counter) && (
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs font-bold text-[#C0392B]">{error}</span>
            {counter && (
              <span className={cn("shrink-0 text-xs font-bold", over ? "text-[#C0392B]" : "text-[#1A0A00]/40")}>
                {counter.length}/{counter.max}
              </span>
            )}
          </div>
        )}
      </div>
    )
  }
)

Textarea.displayName = "Textarea"
