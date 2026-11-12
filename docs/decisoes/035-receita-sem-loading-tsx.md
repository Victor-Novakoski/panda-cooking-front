# 035. Receita sem `loading.tsx`

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Sessão em cookie, busca e revisão geral". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Receita sem `loading.tsx`:** com ele a resposta começava antes de saber se a receita existe, e a receita apagada voltava 200 com `noindex` em vez de 404. O card clicado fica esmaecido enquanto a página carrega (`useLinkStatus`).

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
