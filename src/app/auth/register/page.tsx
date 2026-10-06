"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { authService } from "@/services/auth.service"
import { Input } from "@/components/ui/Input"

const registerSchema = z
  .object({
    name: z.string().min(2, "Nome muito curto"),
    email: z.email("Email inválido"),
    password: z.string().min(6, "Mínimo de 6 caracteres"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  })

type RegisterForm = z.infer<typeof registerSchema>

export default function RegisterPage() {
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, setError } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const { mutate, isPending } = useMutation({
    mutationFn: (data: RegisterForm) =>
      authService.register({ name: data.name, email: data.email, password: data.password }),
    onSuccess: () => router.push("/auth/login"),
    onError: () => setError("root", { message: "Esse email já está em uso" }),
  })

  return (
    <div className="flex min-h-screen">
      {/* Esquerda */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between border-r-4 border-[#1A0A00] bg-[#8B1A1A] p-12"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23ffffff' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}
      >
        <div>
          <div className="text-xl font-black text-[#F0C040]">🐼 Panda Cooking</div>
          <div className="mt-1 text-xs font-bold tracking-[3px] text-[#D4A017]">熊猫厨房</div>
        </div>
        <div>
          <div className="mb-6 text-center text-8xl">🍳🐼</div>
          <p className="text-2xl font-black leading-snug text-white" style={{ textShadow: "2px 2px 0 #5a0f0f" }}>
            &ldquo;Compartilhe sabor,{" "}
            <span className="text-[#F0C040]">inspire pessoas.</span>&rdquo;
          </p>
          <p className="mt-3 text-sm font-bold text-[#D4A017]">— comunidade Panda Cooking</p>
        </div>
        <p className="text-xs font-semibold text-white/30">Receitas para todos os gostos</p>
      </div>

      {/* Direita */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#FDF6E3] px-6 py-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border-[3px] border-[#A07010] bg-[#D4A017] text-xl shadow-[2px_2px_0px_#1A0A00]">🐼</div>
            <span className="font-black text-[#1A0A00]">Panda Cooking</span>
          </Link>

          <h1 className="text-2xl font-black text-[#1A0A00]">Criar conta 🍜</h1>
          <p className="mb-6 mt-1 text-sm font-semibold text-[#1A0A00]/50">Comece a compartilhar suas receitas</p>

          <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-4">
            <Input id="name" label="Nome" placeholder="Seu nome de chef"
              error={errors.name?.message} {...register("name")} />
            <Input id="email" label="Email" type="email" placeholder="mestre@pandacooking.com"
              error={errors.email?.message} {...register("email")} />
            <Input id="password" label="Senha" type="password" placeholder="••••••••"
              error={errors.password?.message} {...register("password")} />
            <Input id="confirmPassword" label="Confirmar senha" type="password" placeholder="••••••••"
              error={errors.confirmPassword?.message} {...register("confirmPassword")} />

            {errors.root && (
              <div className="rounded-xl border-[3px] border-[#C0392B] bg-[#C0392B]/10 px-4 py-3 text-sm font-bold text-[#C0392B]">
                {errors.root.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#8B1A1A] bg-[#C0392B] text-sm font-black text-white shadow-[4px_4px_0px_#1A0A00] transition-all hover:bg-[#E74C3C] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-60"
            >
              {isPending ? "Criando conta..." : "🐼 Criar conta"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-[#1A0A00]/50">
            Já tem conta?{" "}
            <Link href="/auth/login" className="font-black text-[#C0392B] hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
