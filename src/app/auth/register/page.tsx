"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQueryClient } from "@tanstack/react-query"
import { authService } from "@/services/auth.service"
import { usersService } from "@/services/users.service"
import { useAuthStore } from "@/store/auth.store"
import { announce } from "@/lib/session"
import { showApiErrors } from "@/lib/forms"
import { ME_KEY } from "@/lib/query-keys"
import { USER } from "@/lib/limits"
import { utf8Length } from "@/lib/utils"
import { Input } from "@/components/ui/Input"
import { FormError } from "@/components/ui/FormError"
import { AuthLayout, submitButtonClass } from "@/components/layout/AuthLayout"

// As mesmas regras da API; a lista de senhas comuns fica só lá.
const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(USER.nameMin, `Use pelo menos ${USER.nameMin} caracteres`)
      .max(USER.nameMax, `Use no máximo ${USER.nameMax} caracteres`),
    email: z.email("E-mail inválido").max(USER.emailMax, "E-mail inválido"),
    password: z
      .string()
      .min(USER.passwordMin, `Use pelo menos ${USER.passwordMin} caracteres`)
      .max(USER.passwordMax, `Use no máximo ${USER.passwordMax} caracteres`)
      .refine((v) => utf8Length(v) <= USER.passwordMaxBytes, "Senha longa demais (letra com acento conta como 2)"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })
  .refine(
    ({ password, email }) => {
      const lower = password.toLowerCase()
      return lower !== email.toLowerCase() && lower !== email.split("@")[0].toLowerCase()
    },
    { message: "A senha não pode ser o seu e-mail", path: ["password"] }
  )

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const setSession = useAuthStore((s) => s.setSession)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

  async function onSubmit({ name, email, password }: RegisterForm) {
    try {
      await usersService.signup({ name, email, password })
    } catch (error) {
      showApiErrors(error, setError, {
        fallback: "Não foi possível criar a conta. Tente novamente.",
        fields: ["name", "email", "password"],
      })
      return
    }

    // A API não abre sessão no cadastro: entra logo em seguida.
    try {
      const { user, access_token } = await authService.login({ email, password })
      queryClient.removeQueries({ queryKey: ME_KEY })
      setSession(user, access_token)
      announce("login")
      router.replace("/dashboard")
    } catch {
      // A conta existe; só o login automático falhou (limite de tentativas, rede).
      router.replace("/auth/login?created=1")
    }
  }

  return (
    <AuthLayout
      emoji="🍳🐼"
      quote="Compartilhe sabor,"
      highlight="inspire pessoas."
      author="comunidade Panda Cooking"
      title="Criar conta 🍜"
      subtitle="Comece a compartilhar suas receitas"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Input
          id="name"
          label="Nome"
          autoComplete="name"
          placeholder="Seu nome de chef"
          error={errors.name?.message}
          {...register("name")}
        />
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
          autoComplete="new-password"
          placeholder="••••••••••"
          hint={`Pelo menos ${USER.passwordMin} caracteres. Uma frase curta funciona bem.`}
          error={errors.password?.message}
          {...register("password")}
        />
        <Input
          id="confirmPassword"
          label="Confirmar senha"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••••"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <FormError message={errors.root?.server?.message} />

        <button type="submit" disabled={isSubmitting} className={submitButtonClass}>
          {isSubmitting ? "Criando conta..." : "🐼 Criar conta"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm font-semibold text-[#1A0A00]/50">
        Já tem conta?{" "}
        <Link href="/auth/login" className="font-black text-[#C0392B] hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
