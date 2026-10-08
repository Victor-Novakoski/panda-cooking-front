import { forward } from "@/lib/bff"

// Todo /api/* do front vai para a API (ver src/lib/bff.ts).
function handler(request: Request) {
  return forward(request, process.env.API_URL || "http://localhost:8080")
}

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE }
