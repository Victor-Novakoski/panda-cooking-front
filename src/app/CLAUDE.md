# src/app (e src/proxy.ts)

Páginas do App Router, uma pasta por rota; `api/[...path]/route.ts` repassa para a API (ver `src/lib/CLAUDE.md`). O `src/proxy.ts` gera a CSP e redireciona as rotas com login.

## Regras

- **Todas as páginas são dinâmicas:** o `proxy.ts` gera um nonce novo por requisição para a CSP, e o layout lê o cookie da sessão. Hash ou `'unsafe-inline'` não protegeriam do mesmo jeito.
- `/` e `/recipes/[id]` buscam no servidor (`server-api.ts`): conteúdo público, com título e prévia para link compartilhado. `/recipes` busca no navegador, com busca, categoria, tempo, ordem e página na URL (`?q=&categoria=&tempo=&ordem=&pagina=`). Perfil, nova receita e edições buscam no navegador.
- **Rota com login:** entra em `protectedRoutes` do `proxy.ts` (redireciona no servidor quem chega sem cookie) **e** usa `useRequireAuth` na página (cobre a sessão que acaba com a página aberta).
- Depois de salvar uma receita, `router.refresh()`: a página é renderizada no servidor e o navegador mostraria a versão em cache.
- Ação que não dá para desfazer pede confirmação com um segundo botão na própria tela, nunca `window.confirm`.
- Mudou a CSP, atualize `src/proxy.test.ts` e a seção CSP do `docs/SECURITY.md`.

## Prévia de link (SEO)

- `src/lib/seo.ts` guarda o endereço do site (base do `metadataBase`), a imagem padrão (`public/og.png`, 1200x630, PNG pronto, sem geração em tempo de build) e `recipeMetadata` (foto, nome e descrição da receita). Mudou o domínio, mude `SITE_URL`.
- `sitemap.ts` é `force-dynamic` e busca as receitas na API a cada pedido, com limite de tempo e devolvendo só as rotas fixas se a API falhar. No build isso deixaria o deploy refém da API, que dorme no plano grátis.
- Testar prévia: LinkedIn Post Inspector (`linkedin.com/post-inspector`) guarda cache; use "Inspect" de novo para renovar.

## Armadilhas conhecidas

- **Receita sem `loading.tsx`:** com ele a resposta começava antes de saber se a receita existe, e a receita apagada voltava 200 em vez de 404. O card clicado fica esmaecido enquanto carrega (`useLinkStatus`, em `LinkPending`).
- `next/image` só otimiza `images.unsplash.com`: liberar qualquer host faria o servidor baixar URL qualquer. As outras fotos carregam direto, sem `Referer`.
- O único `<iframe>` permitido é o player do `youtube-nocookie.com` (`frame-src`), montado com o id tirado do link, nunca com o endereço colado.
- Em desenvolvimento a CSP ganha `'unsafe-eval'` e `ws:` (hot reload) e perde o `upgrade-insecure-requests`.

## Ver também

`docs/decisoes/` 020, 021, 033, 034, 035, 036.
