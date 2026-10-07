import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Só estes sites passam pelo otimizador de imagens; foto de outro site é
    // mostrada direto (ver src/components/recipe/RecipeImage.tsx).
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com", pathname: "/**" }],
  },
}

export default nextConfig
