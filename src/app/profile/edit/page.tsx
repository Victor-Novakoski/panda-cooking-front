"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { usersService } from "@/services/users.service"
import { apiErrorMessage } from "@/services/api"
import { useAuthStore } from "@/store/auth.store"
import { isHttpUrl } from "@/lib/utils"
import { Header } from "@/components/layout/Header"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { ArrowLeft } from "lucide-react"

const profileSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto"),
  image_profile: z
    .string()
    .trim()
    .refine((v) => v === "" || isHttpUrl(v), "Use um link que comece com http:// ou https://"),
})

type ProfileForm = z.infer<typeof profileSchema>

export default function EditProfilePage() {
  const router = useRouter()
  const { user, setUser } = useAuthStore()

  const { register, handleSubmit, control, setValue, formState: { errors, isDirty } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? "", image_profile: user?.image_profile ?? "" },
  })

  const photo = useWatch({ control, name: "image_profile" })
  const showPreview = !!photo && isHttpUrl(photo)

  const { mutate, isPending, error } = useMutation({
    // Foto vazia vai como "" e a API remove a foto.
    mutationFn: usersService.update,
    onSuccess: (updated) => {
      setUser(updated)
      router.push("/profile")
    },
  })

  return (
    <>
      <Header />
      <main className="mx-auto max-w-xl px-6 py-10">
        <Link href="/profile" className="mb-6 inline-flex items-center gap-1.5 text-sm font-black text-[#1A0A00]/50 hover:text-[#C0392B]">
          <ArrowLeft className="h-4 w-4" /> Voltar para o perfil
        </Link>

        <h1 className="mb-8 text-3xl font-black text-[#1A0A00]">🐼 Editar perfil</h1>

        <form
          onSubmit={handleSubmit((data) => mutate(data))}
          className="flex flex-col gap-5 rounded-2xl border-[3px] border-[#1A0A00] bg-white p-6 shadow-[4px_4px_0px_#1A0A00]"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-[3px] border-[#1A0A00] bg-[#D4A017] text-4xl shadow-[3px_3px_0px_#1A0A00]">
              {showPreview
                ? // Foto é URL de qualquer domínio; o next/image exigiria liberar cada um.
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo} alt="Prévia da foto" className="h-full w-full object-cover" />
                : "🐼"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-black text-[#1A0A00]">{user?.email}</p>
              <p className="text-xs font-semibold text-[#1A0A00]/50">O e-mail não pode ser trocado.</p>
            </div>
          </div>

          <Input id="name" label="Nome" error={errors.name?.message} {...register("name")} />

          <div className="flex flex-col gap-2">
            <Input
              id="image_profile"
              label="URL da foto (opcional)"
              placeholder="https://..."
              error={errors.image_profile?.message}
              {...register("image_profile")}
            />
            {photo && (
              <button
                type="button"
                onClick={() => setValue("image_profile", "", { shouldDirty: true })}
                className="self-start text-xs font-black text-[#C0392B] hover:underline"
              >
                Remover foto
              </button>
            )}
          </div>

          {error && (
            <div role="alert" className="rounded-xl border-[3px] border-[#C0392B] bg-[#C0392B]/10 px-4 py-3 text-sm font-bold text-[#C0392B]">
              {apiErrorMessage(error, "Não foi possível salvar. Tente novamente.")}
            </div>
          )}

          <Button type="submit" size="lg" loading={isPending} disabled={!isDirty}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </main>
    </>
  )
}
