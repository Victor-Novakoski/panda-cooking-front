"use client"

import { cn } from "@/lib/utils"
import { InputHTMLAttributes, forwardRef } from "react"

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label htmlFor={id} className="text-xs font-extrabold uppercase tracking-widest text-[#1A0A00]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            "h-11 w-full rounded-xl border-[3px] border-[#1A0A00] bg-white px-3 text-sm font-semibold text-[#1A0A00] placeholder:text-[#1A0A00]/30 shadow-[2px_2px_0px_#1A0A00] focus:outline-none focus:border-[#C0392B] focus:shadow-[3px_3px_0px_#C0392B] transition-all",
            error && "border-[#C0392B] shadow-[2px_2px_0px_#C0392B]",
            className
          )}
          {...props}
        />
        {error && <span className="text-xs font-bold text-[#C0392B]">{error}</span>}
      </div>
    )
  }
)

Input.displayName = "Input"
