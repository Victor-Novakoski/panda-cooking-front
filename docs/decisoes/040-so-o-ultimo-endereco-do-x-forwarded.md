# 040. Só o último endereço do `X-Forwarded-For` vai para a API

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Sessão em cookie, busca e revisão geral". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Só o último endereço do `X-Forwarded-For` vai para a API:** os anteriores vêm do cliente e podem ser inventados; o último é o que o proxy na frente do front anotou.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
