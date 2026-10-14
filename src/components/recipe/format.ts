export function portionsLabel(portions: number) {
  return portions === 1 ? "1 porção" : `${portions} porções`
}

// Tempo de preparo: a API guarda em minutos, e o site mostra sempre do
// mesmo jeito ("40 min", "1h", "1h 30min").
export function formatTime(minutes: number) {
  if (!Number.isFinite(minutes) || minutes < 1) return "—"
  const total = Math.round(minutes)
  if (total < 60) return `${total} min`
  const hours = Math.floor(total / 60)
  const rest = total % 60
  return rest === 0 ? `${hours}h` : `${hours}h ${rest}min`
}
