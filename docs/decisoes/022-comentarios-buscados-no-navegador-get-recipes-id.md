# 022. Comentários buscados no navegador (`GET /recipes/:id/comments`)

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Telas de edição". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Comentários buscados no navegador (`GET /recipes/:id/comments`):** a resposta da receita nunca trouxe comentários, então a lista ficava sempre vazia. Buscar no cliente deixa editar e apagar atualizarem a lista sem recarregar a página.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
