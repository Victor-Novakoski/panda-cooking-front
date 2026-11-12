# 018. Edição salva tudo com `PUT /recipes/:id`

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Telas de edição". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Edição salva tudo com `PUT /recipes/:id`:** a API troca a receita inteira numa transação. Com as rotas por item, o front teria que comparar o que mudou e fazer várias chamadas, e uma falha no meio deixaria a receita pela metade.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
