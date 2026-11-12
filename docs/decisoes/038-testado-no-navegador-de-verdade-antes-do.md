# 038. Testado no navegador de verdade antes do PR

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Sessão em cookie, busca e revisão geral". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Testado no navegador de verdade antes do PR:** os testes do Vitest cobrem as partes; um passeio no Chromium (login, renovação no 401, favoritar, comentar, criar, editar e apagar receita, logout entre abas, cadastro e apagar conta, 404, celular a 375 px) conferiu o conjunto sem erro no console nem violação de CSP.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
