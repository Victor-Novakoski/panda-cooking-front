import type { Metadata } from "next"
import { cookies } from "next/headers"
import { Nunito } from "next/font/google"
import "./globals.css"
import { Providers } from "@/lib/providers"
import { SESSION_COOKIE } from "@/lib/cookies"
import { DEFAULT_OG_IMAGE, SITE_DESCRIPTION, SITE_URL } from "@/lib/seo"

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
})

export const metadata: Metadata = {
  title: { default: "Panda Cooking", template: "%s | Panda Cooking" },
  description: SITE_DESCRIPTION,
  // base dos endereços absolutos de og:image e do canonical
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    siteName: "Panda Cooking",
    locale: "pt_BR",
    title: "Panda Cooking",
    description: SITE_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: { card: "summary_large_image", title: "Panda Cooking", description: SITE_DESCRIPTION, images: [DEFAULT_OG_IMAGE.url] },
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
