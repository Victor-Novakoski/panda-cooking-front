# 014. 401 chama `clearAuth()` da store

- **Data:** 2026-10
- **Status:** substituída por 026 e 030

## Contexto

Etapa "Testes e logout no 401". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**401 chama `clearAuth()` da store:** a store já sabia apagar tudo (token, cookie e estado persistido); o interceptor só apagava o `localStorage`, e o cookie fazia o `proxy.ts` devolver o usuário ao painel. (Na etapa 5 o token saiu do `localStorage`; o 401 agora tenta renovar a sessão antes.)

## Consequência

Na etapa 5 o token saiu do `localStorage` (026) e o 401 passou a tentar renovar a sessão antes (030).
