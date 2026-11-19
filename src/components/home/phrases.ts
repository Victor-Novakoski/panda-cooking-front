// Frases do Mestre Shifu e do Po, as mesmas do Panda Cooking original.
export const PHRASES = [
  "Tudo é possível quando você tem paz interior.",
  "Não há ingrediente secreto. É só você.",
  "Sirva com um sorriso.",
  "O arrependimento não produz macarrão.",
  "Ontem é história, amanhã é um mistério, mas hoje é um presente. É por isso que eles chamam de presente.",
  "Não há coincidências neste mundo.",
  "Sua mente é como a água, meu amigo. Quando está agitada, é difícil ver. Mas se você permitir que se acalme, a resposta se tornará evidente.",
  "Para fazer algo especial, você deve acreditar que é especial.",
  "A única coisa que importa é o que você decide se tornar.",
] as const

export function randomPhrase(random = Math.random) {
  return Math.floor(random() * PHRASES.length)
}

// Sorteia outra frase, nunca a que já está na tela.
export function nextPhrase(current: number, random = Math.random) {
  const offset = 1 + Math.floor(random() * (PHRASES.length - 1))
  return (current + offset) % PHRASES.length
}
