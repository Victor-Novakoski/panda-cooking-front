# Memória do projeto

Decisões e o porquê delas. Decisão nova entra aqui ([RULES.md](RULES.md#7-documentação)).

## 2026-10 — Setup

- **Mesmo fluxo do Rastreia:** `develop` + PRs, squash nas features, merge commit na versão, Conventional Commits em português, CI obrigatória antes do merge.
- **Mantido o Next.js:** o Rastreia mostra React com Vite; este mostra Next.js com App Router, o que cobre as duas vagas mais comuns de front React.
- **Lint sem warning (`--max-warnings=0`):** warning ignorado vira ruído. Onde a regra não se aplica, o `eslint-disable` fica na linha com o motivo.
- **`<img>` na foto de perfil:** a foto é uma URL de qualquer domínio; o `next/image` exigiria liberar cada domínio.
- **Next 16.2.6 → 16.3.8:** a versão antiga tinha vulnerabilidade crítica (entre elas, bypass do `proxy.ts`, que é o que protege as rotas).
- **Repositório público:** nada de código, nome de cliente ou padrão interno de outra empresa entra aqui.
- **Dependabot sem versão major:** o primeiro PR dele subiu ESLint 10 e TypeScript 7 juntos, e o `eslint-config-next` ainda não funciona com o ESLint 10. Major é atualizada à mão, num PR próprio.

## 2026-10 — Tudo com um `docker compose up`

- **Compose fica no repositório da API:** banco, migração e seed são dela. O front é montado de `../panda-cooking-front` e roda `next dev` num `node:22-alpine`, sem Dockerfile próprio por enquanto; a imagem de produção entra no deploy.
- **`API_INTERNAL_URL`:** a página da receita busca os dados no servidor do Next. Dentro do Docker, `localhost:8080` é o próprio container do front, então o servidor usa `http://api:8080` e o navegador continua com `NEXT_PUBLIC_API_URL`.
- **`WATCHPACK_POLLING`:** no Docker do Windows e do Mac a pasta montada não avisa o container de arquivo alterado; com polling o hot reload funciona.
