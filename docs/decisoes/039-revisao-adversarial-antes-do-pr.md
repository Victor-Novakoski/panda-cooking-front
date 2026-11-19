# 039. Revisão adversarial antes do PR

- **Data:** 2026-10
- **Status:** ativa

## Contexto

Etapa "Sessão em cookie, busca e revisão geral". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**Revisão adversarial antes do PR:** achou e corrigiu, com teste: redirecionamento para fora com tab ou quebra de linha no `?next=` (o navegador ignora esses caracteres, e "/\t/site" vira "//site"; agora o caminho é resolvido e a origem conferida); campo de busca que se apagava enquanto a URL atualizava; logout que fingia sair com a API fora do ar (o cookie traria a sessão de volta); URL editada à mão travando a lista; data da receita no fuso do servidor; erros de campo sem `aria-describedby`.

## Consequência

O porquê e o efeito foram registrados junto com a decisão, no texto acima.
