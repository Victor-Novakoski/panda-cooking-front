# Tarefas

Backlog em ordem. Só se trabalha na etapa atual; o que surgir no caminho entra aqui antes de ser feito ([RULES.md](RULES.md#1-escopo)).

**Etapa atual: 4 — Deploy** (as etapas 1 a 3 e 5 estão prontas)

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
- [x] Branch `develop`, proteção da `main` e da `develop` com os checks obrigatórios (feito pelo victor no GitHub)

## Etapa 1.1 — Tudo com um `docker compose up`

- [x] Sobe junto com banco e API pelo compose do repositório da API, com hot reload
- [x] ~~Página renderizada no servidor usa `API_INTERNAL_URL`~~: substituído pelo `API_URL` só no servidor (etapa 5)

## Etapa 2 — Segurança e testes

- [x] Testes automatizados com Vitest + Testing Library, rodando na CI (job `Testes (Vitest)`)
- [x] 401 limpa a sessão inteira (cookie e Zustand), não só o `localStorage`; senha errada no login mostra o erro em vez de recarregar a página
- [x] Token: access token em memória e refresh em cookie `HttpOnly` (etapa 5)
- [x] URLs de imagem só `http`/`https` (formulário de receita e de perfil)
- [x] Limites dos formulários iguais aos da API (`src/lib/limits.ts`)

## Etapa 3 — Telas que faltam

- [x] Editar e apagar receita (`/recipes/[id]/edit`, formulário igual ao da criação, salva tudo de uma vez)
- [x] Editar perfil (`/profile/edit`, nome e foto, com opção de remover a foto)
- [x] Comentários listados na receita, com editar no lugar para o autor e apagar para autor ou admin
- [x] Erro de hidratação: a sessão salva só é lida depois do primeiro render
- [x] Paginação e filtro por categoria

## Etapa 4 — Deploy

- [ ] Publicar junto com a API, sem custo (proxy reverso precisa sobrescrever o `X-Forwarded-For`, ver [SECURITY.md](SECURITY.md))
- [x] Headers de segurança e CSP com nonce (feito na etapa 5, no `proxy.ts`)
- [ ] Prints das telas no README (tirar com as fotos do seed carregando)

## Etapa 5 — Sessão em cookie, busca e revisão geral ✅

- [x] Access token só em memória; sessão volta ao recarregar pelo refresh token em cookie `HttpOnly`, com renovação única e nova tentativa no 401
- [x] Rota `/api/*` no Next repassando para a API: mesma origem, sem CORS, `API_URL` só no servidor
- [x] Conferência de origem, limite de corpo e tempo limite na rota `/api`
- [x] Login e logout acompanhados entre abas (`BroadcastChannel`); quem sai vai para a home
- [x] CSP com nonce, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` e HSTS no `proxy.ts`
- [x] Busca, categoria e página na URL; perfil com abas paginadas e contagem
- [x] Erros 422 da API no campo certo do formulário; 409 de e-mail já cadastrado no campo de e-mail
- [x] Cadastro entra direto; apagar conta; página de receita com fotos extras, autor e data
- [x] Página inicial com as receitas mais novas; 404 de verdade para receita que não existe
- [x] `next/image` só otimiza o host do seed; foto que não carrega vira emoji
- [x] Testes de sessão, repasse, CSP, formulários, paginação e telas (178 no Vitest)
