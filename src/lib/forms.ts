import type { FieldValues, Path, UseFormSetError } from "react-hook-form"
import { apiErrorMessage, apiFieldErrors } from "@/services/api"

interface ApiErrorOptions {
  // texto quando a API não mandou mensagem (sem conexão, erro 500)
  fallback: string
  // campos do formulário, com o mesmo nome do JSON da API
  fields: readonly string[]
  // campos que são listas: o erro da lista inteira ("adicione pelo menos
  // um item") fica em <lista>.root, como o react-hook-form espera
  lists?: readonly string[]
}

// Mostra o erro da API no formulário. Cada campo recusado ganha a mensagem
// ao lado dele (e o primeiro recebe o foco); o que não for de um campo do
// formulário vai para o aviso geral, em errors.root.server.
export function showApiErrors<T extends FieldValues>(
  error: unknown,
  setError: UseFormSetError<T>,
  { fallback, fields, lists = [] }: ApiErrorOptions
) {
  let shown = 0
  let other: string | undefined
  for (const [path, message] of Object.entries(apiFieldErrors(error))) {
    const [root, ...rest] = path.split(".")
    if (!fields.includes(root)) {
      other ??= message
      continue
    }
    const target = rest.length === 0 && lists.includes(root) ? `${root}.root` : path
    setError(target as Path<T>, { type: "server", message }, { shouldFocus: shown === 0 })
    shown++
  }
  if (shown === 0 || other) {
    setError("root.server", { type: "server", message: other ?? apiErrorMessage(error, fallback) })
  }
}
