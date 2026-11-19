# 032. `endedHere` na store

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Sessão em cookie, busca e revisão geral". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**`endedHere` na store:** ao sair ou apagar a conta, a página protegida aberta mandava para o login (o `useRequireAuth` via a sessão acabar) antes da navegação para a home. A marca diferencia "a pessoa saiu aqui" de "a sessão acabou sozinha ou em outra aba".

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
