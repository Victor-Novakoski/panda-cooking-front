// Ajuste de porções. A quantidade do ingrediente é texto livre ("500g",
// "3 colheres de sopa", "1/2 xícara", "a gosto"): o número do começo é
// multiplicado, e o que não começa com número fica como está.

const FRACTIONS: Record<string, number> = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3 }

// "1 1/2", "1/2", "1,5", "1.5", "2" ou uma fração de um caractere só
const QUANTITY = /^(\d+)\s+(\d+)\/(\d+)|^(\d+)\/(\d+)|^(\d+(?:[.,]\d+)?)|^([½¼¾⅓⅔])/

function parseQuantity(text: string): { value: number; length: number } | null {
  const m = QUANTITY.exec(text)
  if (!m) return null
  let value: number
  if (m[1]) value = Number(m[1]) + Number(m[2]) / Number(m[3])
  else if (m[4]) value = Number(m[4]) / Number(m[5])
  else if (m[6]) value = Number(m[6].replace(",", "."))
  else value = FRACTIONS[m[7]]
  if (!Number.isFinite(value) || value <= 0) return null
  return { value, length: m[0].length }
}

const NICE: [number, string][] = [
  [0.25, "1/4"],
  [1 / 3, "1/3"],
  [0.5, "1/2"],
  [2 / 3, "2/3"],
  [0.75, "3/4"],
]

// Número como se escreve numa receita: "2", "1 1/2", "3/4", "0,2", "750".
function formatQuantity(value: number) {
  // quantidade grande (gramas, mililitros) não precisa de casa decimal
  if (value >= 20) return String(Math.round(value))
  const whole = Math.floor(value + 1e-9)
  const rest = value - whole
  if (rest < 0.02) return String(whole)
  if (rest > 0.98) return String(whole + 1)
  const nice = NICE.find(([n]) => Math.abs(rest - n) < 0.02)
  if (nice) return whole ? `${whole} ${nice[1]}` : nice[1]
  return value.toFixed(1).replace(".", ",").replace(/,0$/, "")
}

// Medidas que não mudam no plural ("500 g", "2 kg", "200 ml").
const INVARIABLE = new Set(["g", "kg", "mg", "ml", "l", "cm"])

// "lata" vira "latas" e "colher" vira "colheres" quando a quantidade passa
// de uma para duas ou mais, e o contrário quando volta. Só mexe na primeira
// palavra depois do número; na dúvida, deixa como a pessoa escreveu.
function agree(rest: string, before: number, after: number) {
  const wasPlural = before >= 2
  const isPlural = after >= 2
  if (wasPlural === isPlural) return rest
  const m = /^(\s+)([a-záàâãéêíóôõúç]+)(?![a-záàâãéêíóôõúç])/i.exec(rest)
  if (!m) return rest
  const word = m[2]
  if (INVARIABLE.has(word.toLowerCase())) return rest

  let next = word
  if (isPlural) {
    if (/[aeiouáéíóú]$/i.test(word)) next = word + "s"
    else if (/[rz]$/i.test(word)) next = word + "es"
  } else if (/[rz]es$/i.test(word)) {
    next = word.slice(0, -2)
  } else if (/[aeiouáéíóú]s$/i.test(word)) {
    next = word.slice(0, -1)
  }
  return m[1] + next + rest.slice(m[0].length)
}

export function scaleAmount(amount: string, factor: number) {
  if (factor === 1 || !Number.isFinite(factor) || factor <= 0) return amount
  const quantity = parseQuantity(amount)
  if (!quantity) return amount
  const scaled = quantity.value * factor
  return formatQuantity(scaled) + agree(amount.slice(quantity.length), quantity.value, scaled)
}
