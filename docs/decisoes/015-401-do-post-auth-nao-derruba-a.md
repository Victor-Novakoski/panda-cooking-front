# 015. 401 do `POST /auth` não derruba a sessão

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Testes e logout no 401". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**401 do `POST /auth` não derruba a sessão:** ali é senha errada, não sessão vencida. Antes, o redirecionamento recarregava a página de login e a mensagem "Email ou senha incorretos" nunca aparecia.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
