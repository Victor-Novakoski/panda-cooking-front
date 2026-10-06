"use client"

import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useMutation, useQuery } from "@tanstack/react-query"
import { recipesService } from "@/services/recipes.service"
import { categoriesService } from "@/services/categories.service"
import { Header } from "@/components/layout/Header"
import { Input } from "@/components/ui/Input"
import { Plus, Trash2 } from "lucide-react"

const recipeSchema = z.object({
  name: z.string().min(3, "Nome muito curto"),
  description: z.string().min(10, "Descreva melhor a receita"),
  time: z.string().min(1, "Informe o tempo"),
  portions: z.string().min(1, "Informe as porções"),
  category_id: z.string().min(1, "Selecione uma categoria"),
  imageUrl: z.string().optional(),
  ingredients: z
    .array(z.object({ amount: z.string().min(1, "Informe a quantidade"), name: z.string().min(1, "Informe o ingrediente") }))
    .min(1, "Adicione pelo menos um ingrediente"),
  preparations: z
    .array(z.object({ description: z.string().min(1, "Descreva o passo") }))
    .min(1, "Adicione pelo menos um passo"),
})

type RecipeForm = z.infer<typeof recipeSchema>

const sectionClass = "rounded-2xl border-[3px] border-[#1A0A00] bg-white p-6 shadow-[4px_4px_0px_#1A0A00] flex flex-col gap-4"
const addBtnClass = "flex items-center gap-1.5 self-start rounded-xl border-[3px] border-[#1A0A00] bg-[#F5E6C8] px-4 py-2 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#D4A017] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"

export default function NewRecipePage() {
  const router = useRouter()

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesService.getAll,
  })

  const { register, handleSubmit, control, formState: { errors } } = useForm<RecipeForm>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      ingredients: [{ amount: "", name: "" }],
      preparations: [{ description: "" }],
    },
  })

  const { fields: ingredientFields, append: appendIngredient, remove: removeIngredient } =
    useFieldArray({ control, name: "ingredients" })

  const { fields: prepFields, append: appendPrep, remove: removePrep } =
    useFieldArray({ control, name: "preparations" })

  const { mutate, isPending, error } = useMutation({
    mutationFn: (data: RecipeForm) =>
      recipesService.create({
        name: data.name,
        description: data.description,
        time: data.time,
        portions: Number(data.portions),
        category_id: Number(data.category_id),
        images: data.imageUrl ? [{ url: data.imageUrl }] : [],
        ingredients: data.ingredients,
        preparations: data.preparations,
      }),
    onSuccess: (recipe) => router.push(`/recipes/${recipe.id}`),
  })

  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#1A0A00]">🍳 Nova receita</h1>
          <p className="mt-1 text-sm font-semibold text-[#1A0A00]/50">Compartilhe sua criação com a comunidade</p>
        </div>

        <form onSubmit={handleSubmit((data) => mutate(data))} className="flex flex-col gap-6">
          {/* Básico */}
          <section className={sectionClass}>
            <h2 className="font-black text-[#1A0A00] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1A0A00] bg-[#D4A017] text-xs font-black shadow-[2px_2px_0px_#1A0A00]">1</span>
              Informações básicas
            </h2>

            <Input id="name" label="Nome da receita" placeholder="Ex: Ramen do Mestre Po"
              error={errors.name?.message} {...register("name")} />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold uppercase tracking-widest text-[#1A0A00]">Descrição</label>
              <textarea
                rows={3}
                placeholder="Descreva sua receita..."
                className="w-full resize-none rounded-xl border-[3px] border-[#1A0A00] bg-white px-3 py-2 text-sm font-semibold text-[#1A0A00] placeholder:text-[#1A0A00]/30 shadow-[2px_2px_0px_#1A0A00] focus:border-[#C0392B] focus:outline-none"
                {...register("description")}
              />
              {errors.description && <span className="text-xs font-bold text-[#C0392B]">{errors.description.message}</span>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input id="time" label="Tempo" placeholder="Ex: 45 minutos"
                error={errors.time?.message} {...register("time")} />
              <Input id="portions" label="Porções" type="number" placeholder="Ex: 4"
                error={errors.portions?.message} {...register("portions")} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-extrabold uppercase tracking-widest text-[#1A0A00]">Categoria</label>
              <select
                className="h-11 w-full rounded-xl border-[3px] border-[#1A0A00] bg-white px-3 text-sm font-semibold text-[#1A0A00] shadow-[2px_2px_0px_#1A0A00] focus:border-[#C0392B] focus:outline-none"
                {...register("category_id")}
              >
                <option value="">Selecione...</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.category_id && <span className="text-xs font-bold text-[#C0392B]">{errors.category_id.message}</span>}
            </div>

            <Input id="imageUrl" label="URL da imagem (opcional)" placeholder="https://..."
              error={errors.imageUrl?.message} {...register("imageUrl")} />
          </section>

          {/* Ingredientes */}
          <section className={sectionClass}>
            <h2 className="font-black text-[#1A0A00] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1A0A00] bg-[#D4A017] text-xs font-black shadow-[2px_2px_0px_#1A0A00]">2</span>
              Ingredientes
            </h2>

            {ingredientFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-2">
                <div className="grid flex-1 grid-cols-2 gap-2">
                  <Input placeholder="Quantidade (ex: 2 xícaras)"
                    error={errors.ingredients?.[index]?.amount?.message}
                    {...register(`ingredients.${index}.amount`)} />
                  <Input placeholder="Ingrediente"
                    error={errors.ingredients?.[index]?.name?.message}
                    {...register(`ingredients.${index}.name`)} />
                </div>
                {ingredientFields.length > 1 && (
                  <button type="button" onClick={() => removeIngredient(index)}
                    className="mt-1 rounded-lg border-2 border-[#1A0A00] p-2 text-[#1A0A00]/30 transition-colors hover:border-[#C0392B] hover:bg-[#C0392B]/10 hover:text-[#C0392B]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            <button type="button" onClick={() => appendIngredient({ amount: "", name: "" })} className={addBtnClass}>
              <Plus className="h-4 w-4" /> Adicionar ingrediente
            </button>
          </section>

          {/* Preparo */}
          <section className={sectionClass}>
            <h2 className="font-black text-[#1A0A00] flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1A0A00] bg-[#D4A017] text-xs font-black shadow-[2px_2px_0px_#1A0A00]">3</span>
              Modo de preparo
            </h2>

            {prepFields.map((field, index) => (
              <div key={field.id} className="flex items-start gap-3">
                <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#1A0A00] bg-[#C0392B] text-xs font-black text-white shadow-[2px_2px_0px_#1A0A00]">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <textarea
                    rows={2}
                    placeholder={`Passo ${index + 1}...`}
                    className="w-full resize-none rounded-xl border-[3px] border-[#1A0A00] bg-white px-3 py-2 text-sm font-semibold text-[#1A0A00] placeholder:text-[#1A0A00]/30 shadow-[2px_2px_0px_#1A0A00] focus:border-[#C0392B] focus:outline-none"
                    {...register(`preparations.${index}.description`)}
                  />
                  {errors.preparations?.[index]?.description && (
                    <span className="text-xs font-bold text-[#C0392B]">{errors.preparations[index].description?.message}</span>
                  )}
                </div>
                {prepFields.length > 1 && (
                  <button type="button" onClick={() => removePrep(index)}
                    className="mt-2 rounded-lg border-2 border-[#1A0A00] p-2 text-[#1A0A00]/30 transition-colors hover:border-[#C0392B] hover:bg-[#C0392B]/10 hover:text-[#C0392B]">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            <button type="button" onClick={() => appendPrep({ description: "" })} className={addBtnClass}>
              <Plus className="h-4 w-4" /> Adicionar passo
            </button>
          </section>

          {error && (
            <div className="rounded-xl border-[3px] border-[#C0392B] bg-[#C0392B]/10 px-4 py-3 text-sm font-bold text-[#C0392B]">
              Erro ao criar receita. Verifique os campos e tente novamente.
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex h-13 w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#8B1A1A] bg-[#C0392B] text-base font-black text-white shadow-[4px_4px_0px_#1A0A00] transition-all hover:bg-[#E74C3C] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-60"
          >
            {isPending ? "Publicando..." : "🥢 Publicar receita"}
          </button>
        </form>
      </main>
    </>
  )
}
