"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { usersService } from "@/services/users.service"
import { apiErrorMessage } from "@/services/api"
import { useAuthStore } from "@/store/auth.store"
import { useRequireAuth } from "@/hooks/useRequireAuth"
import { announce } from "@/lib/session"
import { showApiErrors } from "@/lib/forms"
import { URL_MAX, USER } from "@/lib/limits"
import { isHttpsUrl } from "@/lib/utils"
import { Header } from "@/components/layout/Header"
import { SessionNotice } from "@/components/layout/SessionNotice"
import { Avatar } from "@/components/user/Avatar"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { FormError } from "@/components/ui/FormError"
import { ArrowLeft, Trash2 } from "lucide-react"

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(USER.nameMin, `Use pelo menos ${USER.nameMin} caracteres`)
    .max(USER.nameMax, `Use no máximo ${USER.nameMax} caracteres`),
  image_profile: z
    .string()
    .trim()
    .max(URL_MAX, `Use no máximo ${URL_MAX} caracteres`)
    .refine((v) => v === "" || isHttpsUrl(v), "Use um link que comece com https://"),
})

type ProfileValues = z.infer<typeof profileSchema>

export default function EditProfilePage() {
  const status = useRequireAuth()
  const user = useAuthStore((s) => s.user)

  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-10 sm:px-6">
        <Link href="/profile" className="mb-6 inline-flex items-center gap-1.5 text-sm font-black text-[#1A0A00]/50 hover:text-[#C0392B]">
          <ArrowLeft className="h-4 w-4" /> Voltar para o perfil
        </Link>

        <h1 className="mb-8 text-3xl font-black text-[#1A0A00]">🐼 Editar perfil</h1>

        {status === "authenticated" && user ? (
          <div className="flex flex-col gap-6">
            <ProfileDetailsForm key={user.id} />
            <DeleteAccount />
          </div>
        ) : (
          <SessionNotice status={status} />
        )}
      </main>
    </>
  )
}

function ProfileDetailsForm() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const setUser = useAuthStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "", image_profile: user?.image_profile ?? "" },
  })

  const photo = useWatch({ control, name: "image_profile" })?.trim()

  async function onSubmit(data: ProfileValues) {
    try {
      // Foto vazia vai como "" e a API remove a foto.
      setUser(await usersService.update(data))
      router.push("/profile")
    } catch (error) {
      showApiErrors(error, setError, {
        fallback: "Não foi possível salvar. Tente novamente.",
        fields: ["name", "image_profile"],
      })
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5 rounded-2xl border-[3px] border-[#1A0A00] bg-white p-6 shadow-[4px_4px_0px_#1A0A00]"
    >
      <div className="flex items-center gap-4">
        <Avatar key={photo} src={isHttpsUrl(photo ?? "") ? photo : ""} alt="Prévia da foto" size="lg" />
        <div className="min-w-0">
          <p className="truncate font-black text-[#1A0A00]">{user?.email}</p>
          <p className="text-xs font-semibold text-[#1A0A00]/50">O e-mail não pode ser trocado.</p>
        </div>
      </div>

      <Input id="name" label="Nome" autoComplete="name" error={errors.name?.message} {...register("name")} />

      <div className="flex flex-col gap-2">
        <Input
          id="image_profile"
          label="Link da foto (opcional)"
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

      <FormError message={errors.root?.server?.message} />

      <Button type="submit" size="lg" loading={isSubmitting} disabled={!isDirty}>
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  )
}

function DeleteAccount() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [confirming, setConfirming] = useState(false)

  const remove = useMutation({
    mutationFn: usersService.deleteAccount,
    onSuccess: () => {
      // A API já apagou a sessão e os cookies.
      useAuthStore.getState().clearSession(true)
      announce("logout")
      queryClient.clear()
      router.replace("/")
    },
  })

  return (
    <section className="rounded-2xl border-[3px] border-dashed border-[#C0392B] bg-[#C0392B]/5 p-6">
      <h2 className="font-black text-[#C0392B]">Apagar conta</h2>
      <p className="mt-1 text-sm font-semibold text-[#1A0A00]/60">
        Suas receitas, comentários e favoritos saem do site junto com a conta. Não dá para desfazer.
      </p>
      {confirming ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => remove.mutate()}
            disabled={remove.isPending}
            className="flex items-center gap-1.5 rounded-xl border-[3px] border-[#8B1A1A] bg-[#C0392B] px-4 py-2 text-sm font-black text-white shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#E74C3C] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" /> {remove.isPending ? "Apagando..." : "Sim, apagar minha conta"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="rounded-xl border-[3px] border-[#1A0A00] bg-white px-4 py-2 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00]"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="mt-4 flex items-center gap-1.5 rounded-xl border-[3px] border-[#C0392B] bg-white px-4 py-2 text-sm font-black text-[#C0392B] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#C0392B]/10"
        >
          <Trash2 className="h-4 w-4" /> Apagar conta
        </button>
      )}
      {remove.error && (
        <p role="alert" className="mt-3 text-sm font-bold text-[#C0392B]">
          {apiErrorMessage(remove.error, "Não foi possível apagar a conta.")}
        </p>
      )}
    </section>
  )
}
