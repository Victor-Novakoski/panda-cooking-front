// Aviso geral do formulário (erro que não é de um campo só).
export function FormError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="rounded-xl border-[3px] border-[#C0392B] bg-[#C0392B]/10 px-4 py-3 text-sm font-bold text-[#C0392B]"
    >
      {message}
    </div>
  )
}
