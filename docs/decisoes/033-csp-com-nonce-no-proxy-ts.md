# 033. CSP com nonce no `proxy.ts`

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Sessão em cookie, busca e revisão geral". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**CSP com nonce no `proxy.ts`:** o Next só aplica nonce nos próprios scripts com a página renderizada a cada requisição, por isso todas as páginas são dinâmicas. Hash ou `'unsafe-inline'` não protegeriam do mesmo jeito.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
