# 025. Foto vazia remove a foto

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Telas de edição". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Foto vazia remove a foto:** o formulário manda `image_profile: ""` e a API (que agora diferencia "não mandou" de "vazio") apaga a foto.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
