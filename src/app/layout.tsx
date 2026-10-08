import type { Metadata } from "next"
import { cookies } from "next/headers"
import { Nunito } from "next/font/google"
import "./globals.css"
import { Providers } from "@/lib/providers"
import { SESSION_COOKIE } from "@/lib/cookies"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: { default: "Panda Cooking", template: "%s | Panda Cooking" },
  description: "Descubra e compartilhe receitas incríveis",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Ler o cookie também deixa toda página dinâmica, o que o nonce da CSP exige (ver proxy.ts).
  const hasSession = (await cookies()).has(SESSION_COOKIE)

  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <body className={`${nunito.className} min-h-full flex flex-col`}>
        <Providers hasSession={hasSession}>{children}</Providers>
      </body>
    </html>
  )
}
