"use client"

import { Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { authService } from "@/services/auth.service"
import { useAuthStore } from "@/store/auth.store"
import { announce } from "@/lib/session"
import { showApiErrors } from "@/lib/forms"
import { ME_KEY } from "@/lib/query-keys"
import { USER } from "@/lib/limits"
import { safeNextPath } from "@/lib/utils"
import { Input } from "@/components/ui/Input"
import { FormError } from "@/components/ui/FormError"
import { AuthLayout, submitButtonClass } from "@/components/layout/AuthLayout"

const loginSchema = z.object({
  email: z.email("E-mail inválido").max(USER.emailMax, "E-mail inválido"),
  password: z.string().min(1, "Informe a senha").max(USER.passwordMax, `Use no máximo ${USER.passwordMax} caracteres`),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  return (
    <AuthLayout
      emoji="🐼🍜"
      quote="A barriga cheia faz o"
      highlight="coração feliz."
      author="Mestre Po"
      title="Bem-vindo de volta! 👋"
      subtitle="Entre na sua conta para continuar"
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryClient = useQueryClient()
  const setSession = useAuthStore((s) => s.setSession)
  const next = safeNextPath(searchParams.get("next"))
  const justCreated = searchParams.has("created")

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

  async function onSubmit(data: LoginForm) {
    try {
      const { user, access_token } = await authService.login(data)
      queryClient.removeQueries({ queryKey: ME_KEY })
      setSession(user, access_token)
      announce("login")
      router.replace(next)
    } catch (error) {
      showApiErrors(error, setError, { fallback: "Não foi possível entrar. Tente novamente.", fields: ["email", "password"] })
    }
  }

  return (
    <>
      {justCreated && (
        <div role="status" className="mb-4 rounded-xl border-[3px] border-[#1A0A00] bg-[#D4A017]/20 px-4 py-3 text-sm font-bold text-[#1A0A00]">
          Conta criada! Agora é só entrar.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          id="email"
          label="E-mail"
          type="email"
          autoComplete="email"
          placeholder="mestre@pandacooking.com"
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          id="password"
          label="Senha"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register("password")}
        />

        <FormError message={errors.root?.server?.message} />

        <button type="submit" disabled={isSubmitting} className={submitButtonClass}>
          {isSubmitting ? "Entrando..." : "🥢 Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm font-semibold text-[#1A0A00]/50">
        Não tem conta?{" "}
        <Link href="/auth/register" className="font-black text-[#C0392B] hover:underline">
          Cadastre-se grátis
        </Link>
      </p>
    </>
  )
}
