// Limites dos campos, iguais aos da API (internal/service/inputs.go).
// Conferir aqui primeiro só poupa a ida até a API; quem decide é ela.

export const USER = {
  nameMin: 2,
  nameMax: 80,
  emailMax: 254,
  passwordMin: 10,
  passwordMax: 128,
  // limite do bcrypt: letra com acento ocupa 2 bytes
  passwordMaxBytes: 72,
} as const

export const URL_MAX = 2048

export const RECIPE = {
  nameMin: 3,
  nameMax: 120,
  descriptionMin: 10,
  descriptionMax: 2000,
  timeMax: 50,
  portionsMin: 1,
  portionsMax: 100,
  imagesMax: 10,
  ingredientsMax: 50,
  ingredientNameMax: 80,
  ingredientAmountMax: 60,
  preparationsMax: 50,
  preparationMax: 1000,
} as const

export const COMMENT_MAX = 1000

export const SEARCH_MAX = 100

export const PER_PAGE = {
  recipes: 12,
  comments: 10,
} as const
