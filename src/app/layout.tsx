import type { Metadata } from "next"
import { Nunito } from "next/font/google"
import "./globals.css"
import { Providers } from "@/lib/providers"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: "Panda Cooking",
  description: "Descubra e compartilhe receitas incríveis",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <body className={`${nunito.className} min-h-full flex flex-col`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
