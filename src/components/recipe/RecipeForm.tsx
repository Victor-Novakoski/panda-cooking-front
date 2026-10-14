"use client"

import { useEffect, useRef, useState } from "react"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useQuery } from "@tanstack/react-query"
import { categoriesService } from "@/services/categories.service"
import type { RecipePayload } from "@/services/recipes.service"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { FormError } from "@/components/ui/FormError"
import { PhotoUpload } from "@/components/ui/PhotoUpload"
import { RecipeImage } from "./RecipeImage"
import { showApiErrors } from "@/lib/forms"
import { RECIPE, URL_MAX, VIDEO_URL_MAX } from "@/lib/limits"
import { isImageUrl, isUploadPath } from "@/lib/utils"
import { youtubeId } from "@/lib/video"
import { clearDraft, readDraft, saveDraft, type Draft } from "@/lib/draft"
import { formatTime } from "./format"
import type { Recipe } from "@/types"
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react"

const atMost = (max: number) => `Use no máximo ${max} caracteres`

export const recipeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(RECIPE.nameMin, `Use pelo menos ${RECIPE.nameMin} caracteres`)
    .max(RECIPE.nameMax, atMost(RECIPE.nameMax)),
  description: z
    .string()
    .trim()
    .min(RECIPE.descriptionMin, `Descreva melhor a receita (pelo menos ${RECIPE.descriptionMin} caracteres)`)
    .max(RECIPE.descriptionMax, atMost(RECIPE.descriptionMax)),
  // em minutos; texto no formulário, como as porções, para o campo poder ficar vazio
  time_minutes: z
    .string()
    .trim()
    .min(1, "Informe o tempo")
    .refine(
      (v) => /^\d+$/.test(v) && Number(v) >= RECIPE.timeMinutesMin && Number(v) <= RECIPE.timeMinutesMax,
      `Use um número de ${RECIPE.timeMinutesMin} a ${RECIPE.timeMinutesMax} minutos`
    ),
  portions: z
    .string()
    .trim()
    .min(1, "Informe as porções")
    .refine(
      (v) => /^\d+$/.test(v) && Number(v) >= RECIPE.portionsMin && Number(v) <= RECIPE.portionsMax,
      `Use um número de ${RECIPE.portionsMin} a ${RECIPE.portionsMax}`
    ),
  category_id: z.string().min(1, "Selecione uma categoria"),
  video_url: z
    .string()
    .trim()
    .max(VIDEO_URL_MAX, atMost(VIDEO_URL_MAX))
    .refine((v) => v === "" || youtubeId(v) !== null, "Use um link de vídeo do YouTube"),
  images: z
    .array(
      z.object({
        url: z
          .string()
          .trim()
          .min(1, "Cole o link da foto ou remova o campo")
          .max(URL_MAX, atMost(URL_MAX))
          .refine(isImageUrl, "Use um link que comece com https:// ou envie a foto do computador"),
      })
    )
    .max(RECIPE.imagesMax, `No máximo ${RECIPE.imagesMax} fotos`),
  ingredients: z
    .array(
      z.object({
        amount: z
          .string()
          .trim()
          .min(1, "Informe a quantidade")
          .max(RECIPE.ingredientAmountMax, atMost(RECIPE.ingredientAmountMax)),
        name: z
          .string()
          .trim()
          .min(1, "Informe o ingrediente")
          .max(RECIPE.ingredientNameMax, atMost(RECIPE.ingredientNameMax)),
      })
    )
    .min(1, "Adicione pelo menos um ingrediente")
    .max(RECIPE.ingredientsMax, `No máximo ${RECIPE.ingredientsMax} ingredientes`),
  preparations: z
    .array(
      z.object({
        description: z
          .string()
          .trim()
          .min(1, "Descreva o passo")
          .max(RECIPE.preparationMax, atMost(RECIPE.preparationMax)),
      })
    )
    .min(1, "Adicione pelo menos um passo")
    .max(RECIPE.preparationsMax, `No máximo ${RECIPE.preparationsMax} passos`),
})

export type RecipeFormValues = z.infer<typeof recipeSchema>

// Campos com o mesmo nome no formulário e no JSON da API (erros 422 por campo).
const apiFields = Object.keys(recipeSchema.shape)
const apiLists = ["images", "ingredients", "preparations"]

export const emptyRecipeForm: RecipeFormValues = {
  name: "",
  description: "",
  time_minutes: "",
  portions: "",
  category_id: "",
  video_url: "",
  images: [],
  ingredients: [{ amount: "", name: "" }],
  preparations: [{ description: "" }],
}

// Preenche o formulário com uma receita que já existe (tela de edição).
export function recipeToForm(recipe: Recipe): RecipeFormValues {
  return {
    name: recipe.name,
    description: recipe.description,
    time_minutes: String(recipe.time_minutes),
    portions: String(recipe.portions),
    category_id: String(recipe.category.id),
    video_url: recipe.video_url,
    images: recipe.images.map(({ url }) => ({ url })),
    ingredients: recipe.ingredients.length
      ? recipe.ingredients.map(({ amount, name }) => ({ amount, name }))
      : emptyRecipeForm.ingredients,
    preparations: recipe.preparations.length
      ? recipe.preparations.map(({ description }) => ({ description }))
      : emptyRecipeForm.preparations,
  }
}

// A ordem das listas é mantida: o erro da API em "images[1].url" cai no
// mesmo campo do formulário.
export function toRecipePayload(data: RecipeFormValues): RecipePayload {
  return {
    name: data.name,
    description: data.description,
    time_minutes: Number(data.time_minutes),
    portions: Number(data.portions),
    category_id: Number(data.category_id),
    video_url: data.video_url,
    images: data.images,
    ingredients: data.ingredients,
    preparations: data.preparations,
  }
}

const sectionClass =
  "flex flex-col gap-4 rounded-2xl border-[3px] border-[#1A0A00] bg-white p-6 shadow-[4px_4px_0px_#1A0A00]"
const addBtnClass =
  "flex items-center gap-1.5 self-start rounded-xl border-[3px] border-[#1A0A00] bg-[#F5E6C8] px-4 py-2 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] transition-all hover:bg-[#D4A017] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:pointer-events-none disabled:opacity-40"
const removeBtnClass =
  "mt-1 rounded-lg border-2 border-[#1A0A00] p-2 text-[#1A0A00]/30 transition-colors hover:border-[#C0392B] hover:bg-[#C0392B]/10 hover:text-[#C0392B]"
const listErrorClass = "text-xs font-bold text-[#C0392B]"
const moveBtnClass =
  "rounded-md border-2 border-transparent p-0.5 text-[#1A0A00]/40 transition-colors hover:border-[#1A0A00] hover:bg-[#F5E6C8] hover:text-[#1A0A00] disabled:pointer-events-none disabled:opacity-20"

interface RecipeFormProps {
  defaultValues?: RecipeFormValues
  // Manda a receita para a API. Se der erro, o formulário mostra a mensagem
  // de cada campo recusado.
  onSubmit: (payload: RecipePayload) => Promise<unknown>
  errorFallback: string
  submitLabel: string
  pendingLabel: string
  // Onde guardar o rascunho neste navegador (só na criação). Sem a chave,
  // o formulário não guarda nada.
  draftKey?: string
}

// Formulário vazio: não vale guardar como rascunho.
function isBlank(values: RecipeFormValues) {
  return JSON.stringify(values) === JSON.stringify(emptyRecipeForm)
}

// Formulário de receita usado na criação e na edição.
export function RecipeForm({
  defaultValues = emptyRecipeForm,
  onSubmit,
  errorFallback,
  submitLabel,
  pendingLabel,
  draftKey,
}: RecipeFormProps) {
  // O formulário só monta no navegador (as telas esperam a sessão), então
  // dá para ler o rascunho já no primeiro render.
  const [pendingDraft, setPendingDraft] = useState<Draft<RecipeFormValues> | null>(() => {
    if (!draftKey) return null
    const draft = readDraft<RecipeFormValues>(draftKey)
    return draft && !isBlank(draft.values) ? draft : null
  })
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: categoriesService.getAll,
    staleTime: Infinity,
  })

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues,
  })

  // O <select> só mostra a categoria salva depois que as opções chegam da API.
  useEffect(() => {
    if (categories) setValue("category_id", getValues("category_id"))
  }, [categories, setValue, getValues])

  // Guarda o rascunho meio segundo depois da última mudança. Enquanto a
  // pessoa não decide o que fazer com um rascunho antigo, nada é gravado por
  // cima dele.
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  // depois de publicar, o rascunho some e não volta a ser gravado
  const [published, setPublished] = useState(false)
  const allValues = useWatch({ control })
  // começa com os valores da montagem: abrir o formulário não grava nada
  const lastSaved = useRef(JSON.stringify(allValues))
  useEffect(() => {
    if (!draftKey || pendingDraft) return
    if (published) {
      clearDraft(draftKey)
      return
    }
    const serialized = JSON.stringify(allValues)
    if (serialized === lastSaved.current) return
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      lastSaved.current = serialized
      const current = allValues as RecipeFormValues
      if (isBlank(current)) clearDraft(draftKey)
      else saveDraft(draftKey, current)
    }, 500)
    return () => clearTimeout(saveTimer.current)
  }, [allValues, draftKey, pendingDraft, published])

  function restoreDraft() {
    if (!pendingDraft) return
    // campo que faltar no rascunho (versão antiga do formulário) fica vazio
    reset({ ...emptyRecipeForm, ...pendingDraft.values })
    setPendingDraft(null)
  }

  function discardDraft() {
    if (draftKey) clearDraft(draftKey)
    setPendingDraft(null)
  }

  const images = useFieldArray({ control, name: "images" })
  const ingredients = useFieldArray({ control, name: "ingredients" })
  const preparations = useFieldArray({ control, name: "preparations" })

  const imageUrls = useWatch({ control, name: "images" })
  const description = useWatch({ control, name: "description" })
  const minutes = Number(useWatch({ control, name: "time_minutes" }))

  async function submit(data: RecipeFormValues) {
    try {
      await onSubmit(toRecipePayload(data))
      if (draftKey) clearDraft(draftKey)
      setPublished(true)
    } catch (error) {
      showApiErrors(error, setError, { fallback: errorFallback, fields: apiFields, lists: apiLists })
    }
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6" noValidate>
      {pendingDraft && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-2xl border-[3px] border-dashed border-[#D4A017] bg-[#F5E6C8] p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="text-sm font-bold text-[#1A0A00]">
            📝 Você tem uma receita não publicada
            {pendingDraft.values.name ? ` (“${pendingDraft.values.name}”)` : ""}, guardada em{" "}
            {new Date(pendingDraft.savedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}.
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={restoreDraft}
              className="rounded-xl border-[3px] border-[#1A0A00] bg-[#D4A017] px-4 py-2 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] hover:bg-[#F0C040] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Continuar de onde parei
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="rounded-xl border-[3px] border-[#1A0A00] bg-white px-4 py-2 text-sm font-black text-[#1A0A00] shadow-[3px_3px_0px_#1A0A00] hover:bg-[#FDF6E3] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
              Descartar
            </button>
          </div>
        </div>
      )}
      {/* Básico */}
      <section className={sectionClass}>
        <SectionTitle number={1}>Informações básicas</SectionTitle>

        <Input
          id="name"
          label="Nome da receita"
          placeholder="Ex: Ramen do Mestre Po"
          error={errors.name?.message}
          {...register("name")}
        />

        <Textarea
          id="description"
          label="Descrição"
          rows={3}
          placeholder="Descreva sua receita..."
          error={errors.description?.message}
          counter={{ length: description?.trim().length ?? 0, max: RECIPE.descriptionMax }}
          {...register("description")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            id="time_minutes"
            label="Tempo (minutos)"
            type="number"
            inputMode="numeric"
            min={RECIPE.timeMinutesMin}
            max={RECIPE.timeMinutesMax}
            placeholder="Ex: 45"
            // a partir de uma hora, mostra como o tempo vai aparecer na receita
            hint={minutes >= 60 && minutes <= RECIPE.timeMinutesMax ? `Aparece como ${formatTime(minutes)}` : undefined}
            error={errors.time_minutes?.message}
            {...register("time_minutes")}
          />
          <Input
            id="portions"
            label="Porções"
            type="number"
            inputMode="numeric"
            min={RECIPE.portionsMin}
            max={RECIPE.portionsMax}
            placeholder="Ex: 4"
            error={errors.portions?.message}
            {...register("portions")}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="category_id" className="text-xs font-extrabold uppercase tracking-widest text-[#1A0A00]">
            Categoria
          </label>
          <select
            id="category_id"
            aria-invalid={!!errors.category_id || undefined}
            className="h-11 w-full rounded-xl border-[3px] border-[#1A0A00] bg-white px-3 text-sm font-semibold text-[#1A0A00] shadow-[2px_2px_0px_#1A0A00] focus:border-[#C0392B] focus:outline-none"
            {...register("category_id")}
          >
            <option value="">Selecione...</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.category_id && <span className={listErrorClass}>{errors.category_id.message}</span>}
        </div>
      </section>

      {/* Fotos */}
      <section className={sectionClass}>
        <SectionTitle number={2}>Fotos e vídeo</SectionTitle>
        <p className="-mt-2 text-xs font-semibold text-[#1A0A00]/50">
          Opcional. Até {RECIPE.imagesMax} fotos, do computador ou por link (https); a primeira é a capa.
        </p>

        {images.fields.map((field, index) => {
          const url = imageUrls?.[index]?.url?.trim() ?? ""
          return (
            <div key={field.id} className="flex items-start gap-2">
              <div className="relative mt-1 h-11 w-11 shrink-0 overflow-hidden rounded-lg border-2 border-[#1A0A00] bg-[#F5E6C8]">
                {isImageUrl(url) ? (
                  <RecipeImage key={url} src={url} alt="" fallback="🖼️" fill sizes="44px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-lg" aria-hidden>
                    🖼️
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-1">
                {isUploadPath(url) ? (
                  <>
                    <input type="hidden" {...register(`images.${index}.url`)} />
                    <p className="flex h-11 items-center rounded-xl border-[3px] border-dashed border-[#1A0A00]/30 px-3 text-sm font-bold text-[#1A0A00]/60">
                      {index === 0 ? "Capa: foto enviada do computador" : `Foto ${index + 1}: enviada do computador`}
                    </p>
                  </>
                ) : (
                  <Input
                    placeholder="https://..."
                    aria-label={index === 0 ? "Link da foto de capa" : `Link da foto ${index + 1}`}
                    error={errors.images?.[index]?.url?.message}
                    {...register(`images.${index}.url`)}
                  />
                )}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => images.move(index, 0)}
                    className="self-start text-xs font-black text-[#C0392B] hover:underline"
                  >
                    Usar como capa
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => images.remove(index)}
                aria-label={`Remover foto ${index + 1}`}
                className={removeBtnClass}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          )
        })}
        <ListError message={errors.images?.root?.message ?? errors.images?.message} />

        <div className="flex flex-wrap items-start gap-3">
          <PhotoUpload
            label="Enviar do computador"
            max={RECIPE.imagesMax - images.fields.length}
            onUploaded={(urls) => images.append(urls.map((url) => ({ url })))}
          />
          <button
            type="button"
            onClick={() => images.append({ url: "" })}
            disabled={images.fields.length >= RECIPE.imagesMax}
            className={addBtnClass}
          >
            <Plus className="h-4 w-4" /> Adicionar link
          </button>
        </div>

        <Input
          id="video_url"
          label="Vídeo (opcional)"
          type="url"
          inputMode="url"
          placeholder="https://www.youtube.com/watch?v=..."
          hint="Link de um vídeo do YouTube mostrando o preparo."
          error={errors.video_url?.message}
          {...register("video_url")}
        />
      </section>

      {/* Ingredientes */}
      <section className={sectionClass}>
        <SectionTitle number={3}>Ingredientes</SectionTitle>

        {ingredients.fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <div className="grid flex-1 grid-cols-2 gap-2">
              <Input
                placeholder="Quantidade (ex: 2 xícaras)"
                aria-label={`Quantidade do ingrediente ${index + 1}`}
                error={errors.ingredients?.[index]?.amount?.message}
                {...register(`ingredients.${index}.amount`)}
              />
              <Input
                placeholder="Ingrediente"
                aria-label={`Ingrediente ${index + 1}`}
                error={errors.ingredients?.[index]?.name?.message}
                {...register(`ingredients.${index}.name`)}
              />
            </div>
            {ingredients.fields.length > 1 && (
              <>
                <MoveButtons
                  label="ingrediente"
                  index={index}
                  count={ingredients.fields.length}
                  onMove={(to) => ingredients.move(index, to)}
                />
                <button
                  type="button"
                  onClick={() => ingredients.remove(index)}
                  aria-label={`Remover ingrediente ${index + 1}`}
                  className={removeBtnClass}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        ))}
        <ListError message={errors.ingredients?.root?.message ?? errors.ingredients?.message} />

        <button
          type="button"
          onClick={() => ingredients.append({ amount: "", name: "" })}
          disabled={ingredients.fields.length >= RECIPE.ingredientsMax}
          className={addBtnClass}
        >
          <Plus className="h-4 w-4" /> Adicionar ingrediente
        </button>
      </section>

      {/* Preparo */}
      <section className={sectionClass}>
        <SectionTitle number={4}>Modo de preparo</SectionTitle>

        {preparations.fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-3">
            <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#1A0A00] bg-[#C0392B] text-xs font-black text-white shadow-[2px_2px_0px_#1A0A00]">
              {index + 1}
            </span>
            <div className="flex-1">
              <Textarea
                rows={2}
                placeholder={`Passo ${index + 1}...`}
                aria-label={`Passo ${index + 1}`}
                error={errors.preparations?.[index]?.description?.message}
                {...register(`preparations.${index}.description`)}
              />
            </div>
            {preparations.fields.length > 1 && (
              <>
                <MoveButtons
                  label="passo"
                  index={index}
                  count={preparations.fields.length}
                  onMove={(to) => preparations.move(index, to)}
                />
                <button
                  type="button"
                  onClick={() => preparations.remove(index)}
                  aria-label={`Remover passo ${index + 1}`}
                  className={removeBtnClass}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        ))}
        <ListError message={errors.preparations?.root?.message ?? errors.preparations?.message} />

        <button
          type="button"
          onClick={() => preparations.append({ description: "" })}
          disabled={preparations.fields.length >= RECIPE.preparationsMax}
          className={addBtnClass}
        >
          <Plus className="h-4 w-4" /> Adicionar passo
        </button>
      </section>

      <FormError message={errors.root?.server?.message} />

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-13 w-full items-center justify-center gap-2 rounded-xl border-[3px] border-[#8B1A1A] bg-[#C0392B] text-base font-black text-white shadow-[4px_4px_0px_#1A0A00] transition-all hover:bg-[#E74C3C] active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-60"
      >
        {isSubmitting ? pendingLabel : submitLabel}
      </button>
    </form>
  )
}

function SectionTitle({ number, children }: { number: number; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 font-black text-[#1A0A00]">
      <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#1A0A00] bg-[#D4A017] text-xs font-black shadow-[2px_2px_0px_#1A0A00]">
        {number}
      </span>
      {children}
    </h2>
  )
}

// Setas para trocar o item de lugar com o de cima ou o de baixo.
function MoveButtons({ label, index, count, onMove }: { label: string; index: number; count: number; onMove: (to: number) => void }) {
  return (
    <div className="mt-0.5 flex flex-col">
      <button
        type="button"
        onClick={() => onMove(index - 1)}
        disabled={index === 0}
        aria-label={`Subir ${label} ${index + 1}`}
        className={moveBtnClass}
      >
        <ChevronUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => onMove(index + 1)}
        disabled={index === count - 1}
        aria-label={`Descer ${label} ${index + 1}`}
        className={moveBtnClass}
      >
        <ChevronDown className="h-4 w-4" />
      </button>
    </div>
  )
}

function ListError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <span role="alert" className={listErrorClass}>
      {message}
    </span>
  )
}
