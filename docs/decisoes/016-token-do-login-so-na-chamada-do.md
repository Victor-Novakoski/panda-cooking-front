# 016. Token do login só na chamada do perfil

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Testes e logout no 401". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Token do login só na chamada do perfil:** antes ia para `api.defaults` e ficava no axios depois do logout.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
