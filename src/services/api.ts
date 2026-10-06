import axios from "axios"

// No servidor do Next (páginas renderizadas lá), API_INTERNAL_URL aponta a API pela rede
// do Docker; no navegador vale sempre a URL pública.
const baseURL =
  typeof window === "undefined"
    ? (process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL)
    : process.env.NEXT_PUBLIC_API_URL

export const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("@pandaToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("@pandaToken")
        // Fora de componente não há router; a navegação completa também limpa o estado em memória.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.href = "/auth/login"
      }
    }
    return Promise.reject(error)
  }
)
