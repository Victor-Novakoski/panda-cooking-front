import type { ReactElement } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { render } from "@testing-library/react"
import { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios"
import { useAuthStore } from "@/store/auth.store"
import type { Comment, Recipe, RecipeSummary, User } from "@/types"

export function renderWithClient(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const result = render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
  return { ...result, client }
}

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "maria",
    name: "Maria Silva",
    email: "maria@pandacooking.com",
    image_profile: "",
    is_adm: false,
    created_at: "2026-01-10T12:00:00Z",
    ...overrides,
  }
}

export function loginAs(overrides: Partial<User> = {}) {
  const user = makeUser(overrides)
  useAuthStore.getState().setSession(user, "token-abc")
  return user
}

export function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "r1",
    name: "Lámen do Po",
    description: "Caldo forte e macarrão fresco",
    time: "1 hora",
    portions: 2,
    category: { id: 2, name: "Massas" },
    author: { id: "maria", name: "Maria Silva", image_profile: "" },
    images: [{ id: 1, url: "https://images.unsplash.com/lamen.jpg" }],
    ingredients: [{ id: 1, amount: "200 g", name: "macarrão" }],
    preparations: [{ id: 1, description: "Cozinhe o macarrão" }],
    created_at: "2026-10-01T10:00:00Z",
    updated_at: "2026-10-01T10:00:00Z",
    ...overrides,
  }
}

export function makeSummary(overrides: Partial<RecipeSummary> = {}): RecipeSummary {
  return {
    id: "r1",
    name: "Lámen do Po",
    description: "Caldo forte e macarrão fresco",
    time: "1 hora",
    portions: 2,
    image_url: "",
    category: { id: 2, name: "Massas" },
    author: { id: "maria", name: "Maria Silva", image_profile: "" },
    created_at: "2026-10-01T10:00:00Z",
    ...overrides,
  }
}

export function makeComment(overrides: Partial<Comment> = {}): Comment {
  return {
    id: 1,
    description: "Ficou ótimo",
    recipe_id: "r1",
    user: { id: "maria", name: "Maria", image_profile: "" },
    created_at: "2026-10-01T10:00:00Z",
    updated_at: "2026-10-01T10:00:00Z",
    ...overrides,
  }
}

export function page<T>(items: T[], extra: { page?: number; total?: number; total_pages?: number } = {}) {
  return {
    items,
    page: extra.page ?? 1,
    per_page: 12,
    total: extra.total ?? items.length,
    total_pages: extra.total_pages ?? (items.length ? 1 : 0),
  }
}

// Erro como o axios lança quando a API responde com status de erro.
export function apiError(status: number, data: unknown = {}) {
  const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig
  return new AxiosError("erro", String(status), config, undefined, {
    data,
    status,
    statusText: "",
    headers: {},
    config,
  })
}
