# Tarefas

Backlog em ordem. Só se trabalha na etapa atual; o que surgir no caminho entra aqui antes de ser feito ([RULES.md](RULES.md#1-escopo)).

**Etapa atual: 1 — Setup do repositório**

## Etapa 0 — Base do front ✅

- [x] Next.js 16, Tailwind 4, TanStack Query, Zustand, React Hook Form + Zod
- [x] Página inicial, login, cadastro, receitas, receita, nova receita e perfil
- [x] Rotas protegidas no `proxy.ts`

## Etapa 1 — Setup do repositório

- [x] Docs em `docs/` (telas, arquitetura, regras, design, tarefas, memória, segurança)
- [x] CI: lint sem warning, tipos, build, `npm audit`, gitleaks e título do PR
- [x] Dependabot para npm e Actions
- [x] Lint corrigido (7 erros)
- [x] Next 16.3.8 e axios atualizados (havia vulnerabilidade crítica no Next)
- [ ] Branch `develop`, proteção da `main` e da `develop` com os checks obrigatórios (feito pelo victor no GitHub)

## Etapa 2 — Segurança e testes

- [ ] Testes automatizados (proposta: Vitest + Testing Library, a discutir)
- [ ] 401 limpa a sessão inteira (cookie e Zustand), não só o `localStorage`
- [ ] Token: refresh em cookie `HttpOnly` (junto com a API, a discutir)
- [ ] URLs de imagem só `http`/`https`
- [ ] Limites dos formulários iguais aos da API

## Etapa 3 — Telas que faltam

- [ ] Editar e apagar receita
- [ ] Editar perfil
- [ ] Editar comentário
- [ ] Paginação e filtro por categoria (depende da API)

## Etapa 4 — Deploy

- [ ] Publicar junto com a API, sem custo
- [ ] Headers de segurança
