# 011. Vitest + Testing Library, não Jest

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Testes e logout no 401". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Vitest + Testing Library, não Jest:** mesma ferramenta do Rastreia, roda TypeScript e JSX sem Babel e é rápido. O Next não precisa estar de pé: componente é renderizado no jsdom com `next/navigation` mockado.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
