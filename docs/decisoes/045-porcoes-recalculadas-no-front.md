# 045. Porções recalculadas no front

- **Data:** 2026-10-13
- **Status:** ativa

## Contexto

Lista de melhorias levantada navegando pelo site no computador e no celular (etapa 6, 13/10/2026). Registrada no antigo `docs/TASKS.md`.

## Decisão

Ajustar porções não precisou da API: o front lê o número do começo da quantidade ("500g", "3 colheres de sopa", "1/2 xícara") e acerta o plural da medida; o que não começa com número ("a gosto") fica como está.

## Consequência

A regra mora em `src/lib/portions.ts`, com teste. Vale também no modo cozinha e na impressão.
