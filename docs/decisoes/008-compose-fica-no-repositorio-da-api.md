# 008. Compose fica no repositório da API

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Tudo com um `docker compose up`". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Compose fica no repositório da API:** banco, migração e seed são dela. O front é montado de `../panda-cooking-front` e roda `next dev` num `node:22-alpine`, sem Dockerfile próprio por enquanto; a imagem de produção entra no deploy.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
