# 027. Rota `/api/*` no Next em vez de chamar a API direto do navegador

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Sessão em cookie, busca e revisão geral". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Rota `/api/*` no Next em vez de chamar a API direto do navegador:** front e API em origens diferentes exigiriam CORS com credenciais e cookie `SameSite=None`. Pela mesma origem o cookie vai sozinho com `SameSite=Strict`, e a URL da API (`API_URL`) deixa de ir para o navegador. Substitui `NEXT_PUBLIC_API_URL` e `API_INTERNAL_URL`. Custo: um salto a mais por requisição, desprezível perto da API.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
