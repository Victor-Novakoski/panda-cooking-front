# Panda Cooking — Front

Front-end de uma rede de receitas: navegar e buscar receitas, publicar as suas com fotos, ingredientes e modo de preparo, comentar e favoritar.

API: [panda-cooking-go-api](https://github.com/Victor-Novakoski/panda-cooking-go-api).

[![CI](https://github.com/Victor-Novakoski/panda-cooking-front/actions/workflows/ci.yml/badge.svg?branch=develop)](https://github.com/Victor-Novakoski/panda-cooking-front/actions/workflows/ci.yml)

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS 4 · TanStack Query · Zustand · React Hook Form + Zod · GitHub Actions

## Rodando local

O jeito mais simples é subir tudo junto pelo repositório da API: clone os dois lado a lado e rode `docker compose up --build` dentro de `panda-cooking-go-api` (veja o [README dela](https://github.com/Victor-Novakoski/panda-cooking-go-api#rodando-local)). O front abre em `http://localhost:3000` e recarrega ao salvar; os usuários de demonstração entram com a senha `panda-cooking-demo`.

Sem Docker, com Node 22+ e a API rodando:

```bash
cp .env.example .env.local
npm install
npm run dev
```

| Comando | O que faz |
| --- | --- |
| `npm run dev` | servidor de desenvolvimento |
| `npm run lint` | ESLint, sem aceitar warning |
| `npm run typecheck` | TypeScript |
| `npm run build` | build de produção |

## Documentação

- [Telas](docs/PRD.md)
- [Arquitetura](docs/ARCHITECTURE.md)
- [Design](docs/DESIGN.md)
- [Regras](docs/RULES.md): código, segurança e fluxo de git
- [Segurança](docs/SECURITY.md)
- [Tarefas](docs/TASKS.md) e [Memória](docs/MEMORY.md)
