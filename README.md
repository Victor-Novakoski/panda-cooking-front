# Panda Cooking — Front

Rede de receitas: navegar e buscar receitas, publicar as suas com fotos, ingredientes e modo de preparo, comentar e favoritar.

Este é o front, em Next.js. A API, em Go, está em [panda-cooking-go-api](https://github.com/Victor-Novakoski/panda-cooking-go-api).

[![CI](https://github.com/Victor-Novakoski/panda-cooking-front/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/Victor-Novakoski/panda-cooking-front/actions/workflows/ci.yml)

## Destaques

- **Sessão sem token no navegador:** o access token (15 min) fica só em memória e o refresh token num cookie `HttpOnly`, `SameSite=Strict`. Ao recarregar, a sessão volta pelo cookie; com o token vencido, o front renova uma vez e repete a requisição, mesmo com várias saindo ao mesmo tempo.
- **Mesma origem para a API:** o navegador só fala com o próprio front; uma rota do Next repassa `/api/*` para a API, com conferência de origem (CSRF), limite de corpo e tempo limite. Sem CORS, e a URL da API nunca vai para o navegador.
- **CSP com nonce** e headers de segurança gerados a cada requisição no `proxy.ts`; rotas com login redirecionadas ainda no servidor.
- **Busca, filtro por categoria e paginação na URL:** dá para compartilhar o link, e voltar da receita traz a lista como estava.
- **Formulários com os mesmos limites da API** (React Hook Form + Zod); erros de validação da API aparecem no campo certo, inclusive em listas (`ingredients[2].amount`).
- **Login e logout acompanhados entre abas**, e o cache de dados do usuário descartado na troca de conta.
- **Página da receita renderizada no servidor**, com título e prévia para link compartilhado, e 404 de verdade para receita que não existe.
- **178 testes** com Vitest e Testing Library, testando o que o usuário vê; CI com lint sem warning, tipos, build, `npm audit` e gitleaks.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · TanStack Query · Zustand · React Hook Form + Zod · axios · Vitest + Testing Library · GitHub Actions

## Como funciona

```
Navegador ──/api/*──▶ Next.js ──▶ API Go ──▶ PostgreSQL
           ◀─ HTML ── Next.js (páginas públicas renderizadas no servidor)
```

| Página | Rota | Login |
| --- | --- | --- |
| Início, com as receitas mais novas | `/` | — |
| Receitas: busca, categoria e paginação | `/dashboard` | — |
| Receita: fotos, ingredientes, preparo, comentários | `/recipes/[id]` | para comentar e favoritar |
| Nova receita, editar e apagar a sua | `/recipes/new`, `/recipes/[id]/edit` | ✅ |
| Perfil: minhas receitas e favoritas | `/profile` | ✅ |
| Editar perfil e apagar conta | `/profile/edit` | ✅ |

Detalhes em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) e [docs/SECURITY.md](docs/SECURITY.md).

## Rodando local

O jeito mais simples é subir tudo junto pelo repositório da API: clone os dois lado a lado e rode `docker compose up --build` dentro de `panda-cooking-go-api` (veja o [README dela](https://github.com/Victor-Novakoski/panda-cooking-go-api#rodando-local)). O site abre em `http://localhost:3000` e recarrega ao salvar.

Para entrar, use `maria@pandacooking.com` com a senha `panda-cooking-demo` (ou crie uma conta).

Sem Docker para o front, com Node 22+ e a API rodando em `http://localhost:8080`:

```bash
cp .env.example .env.local   # API_URL=http://localhost:8080
npm install
npm run dev
```

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run lint` | ESLint, sem aceitar warning |
| `npm run typecheck` | TypeScript |
| `npm test` | testes (Vitest + Testing Library); `npm run test:watch` para rodar enquanto edita |
| `npm run build` e `npm start` | build e servidor de produção |

## Documentação

- [Telas](docs/PRD.md)
- [Arquitetura](docs/ARCHITECTURE.md): renderização, sessão e repasse `/api`
- [Segurança](docs/SECURITY.md): riscos, CSP e o que fica para o deploy
- [Design](docs/DESIGN.md)
- [Regras](docs/RULES.md): código, segurança, testes e fluxo de git
- [Tarefas](docs/TASKS.md) e [Memória](docs/MEMORY.md): o que foi feito e o porquê de cada decisão
