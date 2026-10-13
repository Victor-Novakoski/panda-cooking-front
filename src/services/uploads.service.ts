import { api } from "./api"

export const uploadsService = {
  // Guarda a foto na API e devolve o endereço dela (/api/uploads/{id}),
  // que serve de link da foto da receita ou do perfil.
  upload: async (photo: Blob): Promise<string> => {
    const form = new FormData()
    form.append("file", photo, "foto")
    const res = await api.post<{ url: string }>("/uploads", form)
    return res.data.url
  },
}
