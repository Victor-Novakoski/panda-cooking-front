# 021. Apagar pede confirmação na própria tela

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Telas de edição". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Apagar pede confirmação na própria tela:** um segundo botão ("Sim, apagar") no lugar do `window.confirm`, que não segue o visual e não dá para testar no jsdom.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
