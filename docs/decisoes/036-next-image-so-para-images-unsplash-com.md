# 036. `next/image` só para `images.unsplash.com`

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Sessão em cookie, busca e revisão geral". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**`next/image` só para `images.unsplash.com`:** liberar qualquer host faria o servidor do front baixar URL qualquer a pedido de qualquer um. As outras fotos carregam direto no navegador, sem `Referer`.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
