# Tarefas

Backlog em ordem. Só se trabalha na etapa atual; o que surgir no caminho entra aqui antes de ser feito ([RULES.md](RULES.md#1-escopo)).

**Etapa atual: 3 — Telas que faltam** (falta paginação e filtro, que dependem da API)

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

## Etapa 1.1 — Tudo com um `docker compose up`

- [x] Sobe junto com banco e API pelo compose do repositório da API, com hot reload
- [x] Página renderizada no servidor usa `API_INTERNAL_URL` para achar a API dentro do Docker

## Etapa 2 — Segurança e testes

- [x] Testes automatizados com Vitest + Testing Library, rodando na CI (job `Testes (Vitest)`)
- [x] 401 limpa a sessão inteira (cookie e Zustand), não só o `localStorage`; senha errada no login mostra o erro em vez de recarregar a página
- [ ] Token: refresh em cookie `HttpOnly` (junto com a API, a discutir)
- [x] URLs de imagem só `http`/`https` (formulário de receita e de perfil)
- [ ] Limites dos formulários iguais aos da API

## Etapa 3 — Telas que faltam

- [x] Editar e apagar receita (`/recipes/[id]/edit`, formulário igual ao da criação, salva tudo de uma vez)
- [x] Editar perfil (`/profile/edit`, nome e foto, com opção de remover a foto)
- [x] Comentários listados na receita, com editar no lugar para o autor e apagar para autor ou admin
- [x] Erro de hidratação: a sessão salva só é lida depois do primeiro render
- [ ] Paginação e filtro por categoria (depende da API)

## Etapa 4 — Deploy

- [ ] Publicar junto com a API, sem custo
- [ ] Headers de segurança
