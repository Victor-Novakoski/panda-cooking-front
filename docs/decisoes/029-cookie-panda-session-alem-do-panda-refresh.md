# 029. Cookie `panda_session` além do `panda_refresh`

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Sessão em cookie, busca e revisão geral". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Cookie `panda_session` além do `panda_refresh`:** o refresh token só vai para `/api/auth`, então as páginas não o recebem. O `panda_session` (sem segredo nenhum) diz ao `proxy.ts` e ao layout que existe sessão: rota protegida redireciona no servidor e quem nunca entrou não gasta uma chamada de renovação.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
