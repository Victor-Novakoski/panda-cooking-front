"use client"

import { cn } from "@/lib/utils"
import { ButtonHTMLAttributes, forwardRef } from "react"

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "gold" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-bold rounded-xl border-[3px] border-[#1A0A00] transition-all active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none",
          {
            "bg-[#C0392B] text-white shadow-[4px_4px_0px_#1A0A00] hover:bg-[#E74C3C]": variant === "primary",
            "bg-[#D4A017] text-[#1A0A00] shadow-[4px_4px_0px_#1A0A00] hover:bg-[#F0C040]": variant === "gold",
            "bg-transparent text-[#F0C040] border-[#D4A017] shadow-[4px_4px_0px_#1A0A00] hover:bg-white/10": variant === "outline",
            "bg-transparent border-transparent text-[#1A0A00] hover:bg-[#F5E6C8] shadow-none": variant === "ghost",
          },
          {
            "h-8 px-3 text-xs gap-1.5": size === "sm",
            "h-10 px-4 text-sm gap-2": size === "md",
            "h-12 px-6 text-base gap-2": size === "lg",
          },
          className
        )}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = "Button"
