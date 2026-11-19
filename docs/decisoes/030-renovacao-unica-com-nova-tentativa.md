# 030. Renovação única com nova tentativa

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Sessão em cookie, busca e revisão geral". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Renovação única com nova tentativa:** várias requisições com o token vencido esperam a mesma renovação; cada troca invalida o refresh token anterior, e a API só tolera o reúso por 20 segundos (duas abas); fora disso, entende como token copiado e derruba a sessão. Uma renovação por vez evita gastar trocas à toa.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
