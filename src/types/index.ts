// Formatos que a API devolve (api/openapi.yaml no repositório da API).

export interface User {
  id: string
  name: string
  email: string
  // vazio quando a pessoa não tem foto
  image_profile: string
  is_adm: boolean
  created_at?: string
}

// O que é público de quem escreveu a receita ou o comentário.
export interface Author {
  id: string
  name: string
  image_profile: string
}

export interface Category {
  id: number
  name: string
}

export interface ImageRecipe {
  id: number
  url: string
}

export interface IngredientRecipe {
  id: number
  name: string
  amount: string
}

export interface Preparation {
  id: number
  description: string
}

// Receita como vem na listagem: sem itens, só a primeira foto.
export interface RecipeSummary {
  id: string
  name: string
  description: string
  time: string
  portions: number
  // vazio quando a receita não tem foto
  image_url: string
  category: Category
  author: Author
  created_at: string
}

export interface Recipe {
  id: string
  name: string
  description: string
  time: string
  portions: number
  category: Category
  author: Author
  images: ImageRecipe[]
  ingredients: IngredientRecipe[]
  preparations: Preparation[]
  created_at: string
  updated_at: string
}

export interface Comment {
  id: number
  description: string
  recipe_id: string
  user: Author
  created_at: string
  updated_at: string
}

export interface Page<T> {
  items: T[]
  page: number
  per_page: number
  total: number
  total_pages: number
}

export interface AuthResult {
  access_token: string
  token_type: "Bearer"
  // validade do access token, em segundos
  expires_in: number
  user: User
}
