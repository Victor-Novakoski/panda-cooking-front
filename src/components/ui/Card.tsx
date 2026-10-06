import { cn } from "@/lib/utils"
import { HTMLAttributes } from "react"

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border-[3px] border-[#1A0A00] bg-white shadow-[4px_4px_0px_#1A0A00]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
