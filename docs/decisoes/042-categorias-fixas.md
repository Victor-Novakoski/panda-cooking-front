# 042. Categorias fixas

- **Data:** 2026-10-13
- **Status:** ativa

## Contexto

Lista de melhorias levantada navegando pelo site no computador e no celular (etapa 6, 13/10/2026). Registrada no antigo `docs/TASKS.md`.

## Decisão

Sem tela de categorias para o admin; as categorias continuam fixas, criadas pela migration da API.

## Consequência

O filtro por categoria usa a lista de `GET /api/categories`, sem edição.
