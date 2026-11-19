# 028. Conferência de origem na rota `/api`

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Sessão em cookie, busca e revisão geral". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Conferência de origem na rota `/api`:** o `Origin` do navegador não é repassado (a API veria o front, não o site de origem), então o front aplica a mesma regra do `CrossOriginProtection` da API antes de repassar.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
