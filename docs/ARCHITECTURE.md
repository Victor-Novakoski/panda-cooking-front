# Arquitetura

```
Navegador ──/api/*──▶ Next.js (proxy.ts + rota /api) ──API_URL──▶ API Go ──▶ PostgreSQL
           ◀─ HTML ── Next.js (páginas do servidor) ──API_URL──▶ API Go
```

O navegador só fala com o próprio front. Tudo o que vai para `/api/*` é repassado para a API pelo servidor do Next (`src/app/api/[...path]/route.ts`). Sendo a mesma origem, o cookie da sessão vai junto sem CORS, e a URL da API (`API_URL`) só existe no servidor.

## Stack

| Parte | Escolha |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilo | Tailwind CSS 4 |
| Dados do servidor | TanStack Query (cache, paginação, atualização otimista) |
| Sessão | Zustand, só em memória |
| Formulários | React Hook Form + Zod |
| HTTP | axios com interceptors (token e renovação no 401) |
| Ícones | lucide-react |
| Testes | Vitest + Testing Library (jsdom) |

## Pastas

```
src/app            páginas (uma pasta por rota); api/[...path] repassa para a API
src/components     ui/ (Button, Input, Textarea, Pagination, Notice, PhotoUpload), layout/ (Header, AuthLayout),
                   recipe/ (card, formulário, carrossel, modo cozinha, comentários, vídeo), user/, home/
src/hooks          hooks do TanStack Query (useRecipes, useFavorites) e useRequireAuth
src/lib            sessão, repasse /api (bff.ts), busca no servidor (server-api.ts), limites (limits.ts),
                   erros da API no formulário (forms.ts), fotos (photo.ts), porções (portions.ts)
src/services       uma função por chamada da API, agrupadas por recurso
src/store          auth.store.ts (usuário, access token e situação da sessão)
src/types          tipos que espelham as respostas da API
src/proxy.ts       CSP, headers de segurança e redirecionamento das rotas com login
src/test           setup e utilitários dos testes
```

Regras de código e de testes ficam no [`CLAUDE.md`](../CLAUDE.md); sessão e repasse `/api`, em [`src/lib/CLAUDE.md`](../src/lib/CLAUDE.md).

## Renderização

| Página | Onde busca os dados | Por quê |
| --- | --- | --- |
| `/`, `/recipes/[id]` e `/users/[id]` | servidor (`server-api.ts`) | conteúdo público: chega pronto no HTML, com título e prévia para link compartilhado |
| `/recipes` | navegador | busca, filtros, ordem e página mudam sem recarregar; ficam na URL |
| perfil, nova receita, edições | navegador | dependem de quem está logado |

Todas as páginas são dinâmicas: o `proxy.ts` gera um nonce novo por requisição para a CSP, e o layout lê o cookie da sessão.

## Sessão

O access token (15 min) fica só na memória; o refresh token é um cookie `HttpOnly` que o JavaScript não lê, e o cookie `panda_session` só avisa o servidor do Next que existe sessão. Ao abrir a página, quem tem `panda_session` renova a sessão pelo cookie; no 401, o front renova uma vez e repete a requisição.

## Imagens

Fotos são enviadas do computador (o front reduz para caber nos 900 KB da API, e a API guarda no banco) ou informadas por link `https`. O `next/image` otimiza só as do `images.unsplash.com` (as do seed); as outras são carregadas direto, sem enviar `Referer`. Link inválido ou que não carrega vira um emoji no lugar da foto (`RecipeImage`, `Avatar`).
