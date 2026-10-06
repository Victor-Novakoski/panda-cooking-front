export interface User {
  id: string
  name: string
  email: string
  image_profile?: string
  is_adm: boolean
}

export interface Category {
  id: number
  name: string
}

export interface Ingredient {
  id: number
  name: string
}

export interface IngredientRecipe {
  id: number
  amount: string
  name: string
}

export interface ImageRecipe {
  id: number
  url: string
}

export interface Preparation {
  id: number
  description: string
}

export interface Comment {
  id: number
  description: string
  recipe_id: string
  user: Pick<User, "id" | "name" | "image_profile">
  created_at: string
  updated_at: string
}

export interface Recipe {
  id: string
  name: string
  description: string
  time: string
  portions: number
  user_id: string
  user?: Pick<User, "id" | "name" | "image_profile">
  category: Category
  images: ImageRecipe[]
  ingredients: IngredientRecipe[]
  preparations: Preparation[]
}
