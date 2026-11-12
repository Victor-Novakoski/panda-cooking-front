# 024. `skipHydration` na store de sessão

- **Data:** 2026-10
- **Status:** substituída por 026

## Contexto

Etapa "Telas de edição". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**`skipHydration` na store de sessão:** com a sessão lida do `localStorage` já no primeiro render, o HTML do navegador não batia com o do servidor (que não tem usuário) e o React acusava erro de hidratação nas páginas renderizadas no servidor. Agora o `Providers` chama `rehydrate()` depois de montar. (Na etapa 5 a store deixou de salvar no navegador, e o `skipHydration` saiu junto.)

## Consequência

Na etapa 5 a store deixou de salvar no navegador (026) e o `skipHydration` saiu junto.
