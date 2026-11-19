import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    // áreas com login e a API não têm o que indexar
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/auth/", "/profile", "/recipes/new"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
