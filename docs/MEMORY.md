# Memória do projeto

Decisões e o porquê delas. Decisão nova entra aqui ([RULES.md](RULES.md#7-documentação)).

## 2026-10 — Setup

- **Mesmo fluxo do Rastreia:** `develop` + PRs, squash nas features, merge commit na versão, Conventional Commits em português, CI obrigatória antes do merge.
- **Mantido o Next.js:** o Rastreia mostra React com Vite; este mostra Next.js com App Router, o que cobre as duas vagas mais comuns de front React.
- **Lint sem warning (`--max-warnings=0`):** warning ignorado vira ruído. Onde a regra não se aplica, o `eslint-disable` fica na linha com o motivo.
- **`<img>` na foto de perfil:** a foto é uma URL de qualquer domínio; o `next/image` exigiria liberar cada domínio.
- **Next 16.2.6 → 16.3.8:** a versão antiga tinha vulnerabilidade crítica (entre elas, bypass do `proxy.ts`, que é o que protege as rotas).
- **Repositório público:** nada de código, nome de cliente ou padrão interno de outra empresa entra aqui.
