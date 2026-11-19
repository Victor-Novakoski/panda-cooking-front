# 026. Access token em memória, refresh em cookie `HttpOnly`

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Sessão em cookie, busca e revisão geral". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Access token em memória, refresh em cookie `HttpOnly`:** com o token no `localStorage`, qualquer XSS levava a sessão por 24h. Agora um XSS não acha token guardado, e o que ficar na memória vence em 15 minutos. Substitui o `persist` e o `skipHydration` da store: sem nada salvo no navegador, não há o que hidratar.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
