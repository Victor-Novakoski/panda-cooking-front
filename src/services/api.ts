import axios from "axios"

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
})

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
