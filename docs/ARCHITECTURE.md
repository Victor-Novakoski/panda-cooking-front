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
src/components     ui/ (Input, Textarea, Pagination, Notice), layout/ (Header, AuthLayout),
                   recipe/ (card, formulário, comentários, favoritar, imagem), user/ (Avatar)
src/hooks          hooks do TanStack Query (useRecipes, useFavorites) e useRequireAuth
src/lib            sessão, repasse /api (bff.ts), busca no servidor (server-api.ts),
                   limites dos formulários (limits.ts), erros da API no formulário (forms.ts)
src/services       uma função por chamada da API, agrupadas por recurso
src/store          auth.store.ts (usuário, access token e situação da sessão)
src/types          tipos que espelham as respostas da API
src/proxy.ts       CSP, headers de segurança e redirecionamento das rotas com login
src/test           setup e utilitários dos testes
```

Os testes ficam ao lado do arquivo testado (`api.ts` → `api.test.ts`, `page.tsx` → `page.test.tsx`). Componente é testado pelo que o usuário vê (texto, label, papel do botão), com a API mockada no service e o `next/navigation` mockado.

Regras:

- Página não chama `api` direto: usa um hook ou um service.
- Tipo novo da API entra em `src/types` com os mesmos nomes de campo (`snake_case`).
- Limite novo de formulário entra em `src/lib/limits.ts`, igual ao da API.
- Dado que depende de quem está logado fica sob a chave `["me"]` do TanStack Query, para sair do cache no login e no logout.

## Renderização

| Página | Onde busca os dados | Por quê |
| --- | --- | --- |
| `/` e `/recipes/[id]` | servidor (`server-api.ts`) | conteúdo público: chega pronto no HTML, com título e prévia para link compartilhado |
| `/dashboard` | navegador | busca, categoria e página mudam sem recarregar; ficam na URL (`?q=&categoria=&pagina=`) |
| perfil, nova receita, edições | navegador | dependem de quem está logado |

Todas as páginas são dinâmicas: o `proxy.ts` gera um nonce novo por requisição para a CSP, e o layout lê o cookie da sessão.

## Sessão

```
login ──▶ API devolve access token (15 min) no corpo + cookies panda_refresh e panda_session
          access token: só na memória (Zustand)
          panda_refresh: HttpOnly, SameSite=Strict, só em /api/auth (o JavaScript não lê)
          panda_session: HttpOnly, só diz ao servidor do Next que existe sessão
```

- **Ao abrir a página:** o layout (no servidor) vê se existe `panda_session`. Se existe, o navegador chama `POST /api/auth/refresh` e recebe um access token novo; se não, já sabe que está deslogado, sem chamada nenhuma.
- **Token vencido:** a API responde 401, o interceptor renova uma vez (várias requisições ao mesmo tempo esperam a mesma renovação) e repete a requisição. Se a renovação também der 401, a sessão acabou e vai para o login, voltando depois para a mesma página.
- **API fora do ar:** a sessão fica como `unavailable` e as páginas avisam, em vez de mandar para o login (a sessão pode continuar válida).
- **Várias abas:** login e logout são avisados às outras abas por `BroadcastChannel`; cada uma tem o próprio access token em memória.
- **Rotas com login:** o `proxy.ts` manda para o login quem chega sem o cookie, ainda no servidor; o `useRequireAuth` cobre a sessão que acaba com a página aberta.

## Repasse `/api`

`src/lib/bff.ts` repassa método, caminho, query e corpo para a API, com só os headers necessários (`Authorization`, `Cookie`, `Content-Type`, `Accept`, `X-Forwarded-For`, `X-Request-Id`) e devolve os `Set-Cookie` da API. Antes de repassar:

- recusa com 403 requisição que muda dados vinda de outra origem (mesma regra do `CrossOriginProtection` da API, já que o `Origin` do navegador não é repassado);
- recusa corpo maior que 1 MiB (413);
- desiste depois de 15 segundos (504) e devolve 502 se a API não responder.

## Imagens

Fotos são links informados pelos usuários. O `next/image` otimiza só as do `images.unsplash.com` (as do seed); as outras são carregadas direto, sem enviar `Referer`. Link inválido ou que não carrega vira um emoji no lugar da foto (`RecipeImage`, `Avatar`).
