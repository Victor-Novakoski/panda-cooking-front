# 010. `WATCHPACK_POLLING`

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Tudo com um `docker compose up`". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**`WATCHPACK_POLLING`:** no Docker do Windows e do Mac a pasta montada não avisa o container de arquivo alterado; com polling o hot reload funciona.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
