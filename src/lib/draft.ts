// Rascunho do formulário de receita, guardado só neste navegador. O
// localStorage pode não existir ou recusar gravar (aba anônima, cota
// cheia): nesse caso o formulário funciona do mesmo jeito, só sem rascunho.

export interface Draft<T> {
  values: T
  // quando foi guardado (ISO)
  savedAt: string
}

export function readDraft<T>(key: string): Draft<T> | null {
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return null
    const draft = JSON.parse(raw) as Draft<T>
    if (!draft || typeof draft !== "object" || !draft.values || typeof draft.savedAt !== "string") return null
    return draft
  } catch {
    return null
  }
}

export function saveDraft<T>(key: string, values: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify({ values, savedAt: new Date().toISOString() }))
  } catch {
    // sem espaço ou sem permissão: segue sem rascunho
  }
}

export function clearDraft(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // idem
  }
}
