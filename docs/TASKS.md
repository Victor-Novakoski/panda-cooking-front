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

## Etapa 6 — Melhorias de uso

Lista levantada navegando pelo site no computador e no celular (13/10/2026). O que mexe no banco tem o par em [TASKS.md da API](https://github.com/Victor-Novakoski/panda-cooking-go-api/blob/develop/docs/TASKS.md).

**Feito**

- [x] Página inicial: sai o texto de apoio do topo, fica só o biscoito da sorte
- [x] Capa da receita vira carrossel com todas as fotos (antes a capa ficava de fora e, com duas fotos, a segunda aparecia sozinha, sem setas); a foto aparece inteira, com a sobra desfocada
- [x] Imprimir receita: botão na página; no papel saem só o nome, os ingredientes e o modo de preparo

**Design (só front)**

- [x] No celular, ingredientes antes do modo de preparo (antes vinham depois dos comentários)
- [x] Página inicial para quem está logado: os convites para criar conta viram "Publicar uma receita" e "Minhas receitas" (decidido no servidor, pelo cookie de sessão, sem piscar)
- [x] Topo da página inicial no celular: título menor e panda mascote visível
- [x] Botão "Cadastrar" no cabeçalho do celular: decidido deixar como está, só "Entrar" (não cabe ao lado de "Início" e "Receitas", e o topo da página inicial já tem "Criar conta grátis")
- [x] Nome do autor inteiro nos cartões ("Chef Maria Silva" aparecia como "por Chef")
- [x] Capa da receita com foto em pé: decidido deixar como está, a foto inteira com faixas desfocadas dos lados

**Funcionalidades só no front**

- [x] Modo cozinha: um passo por vez em letra grande, tela sem apagar (`navigator.wakeLock`) e ingredientes à mão
- [x] Compartilhar: botão que abre o compartilhamento do celular (`navigator.share`) ou copia o link
- [x] Página pública do autor (`/users/[id]`), aberta pelo nome dele na página da receita. Nome e foto vêm das próprias receitas, porque a API ainda não tem rota de perfil público: quem não publicou nada não tem página
- [ ] Link para a página do autor também nos cartões e nos comentários (o cartão inteiro já é um link para a receita)

**Funcionalidades que dependem da API**

- [ ] Tempo em minutos: o site formata sempre igual ("40 min", "1h 30min") e o formulário pede número; hoje é texto livre e aparece "40", "20 minutos", "3 horas"
- [ ] Ajustar porções: "− 4 porções +" na receita recalculando as quantidades dos ingredientes
- [ ] Ordenar a lista (mais novas, mais favoritadas, mais rápidas) e filtrar por tempo
- [ ] Avaliação com estrelas (1 a 5) na receita e a média nos cartões
- [ ] Vídeo da receita por link do YouTube, numa seção própria abaixo da descrição
- [ ] Categorias pelo admin: botão "Nova categoria" na página de receitas, só para admin
- [ ] Recuperar senha: telas de "esqueci a senha" e de nova senha

**Ambiente local**

- [ ] O service worker de outro projeto que também roda em `localhost:3000` (Nossos Lugares) guarda `/_next/static/*` para sempre e entrega JavaScript antigo ao Panda (erro "isImageUrl is not a function"). Correção na origem: registrar aquele service worker só em produção. Enquanto isso, limpar os dados de `localhost:3000` no navegador
