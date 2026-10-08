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
- **`API_INTERNAL_URL`:** a página da receita busca os dados no servidor do Next. Dentro do Docker, `localhost:8080` é o próprio container do front, então o servidor usa `http://api:8080` e o navegador continua com `NEXT_PUBLIC_API_URL`. (Substituído na etapa 5 pelo `API_URL` só no servidor.)
- **`WATCHPACK_POLLING`:** no Docker do Windows e do Mac a pasta montada não avisa o container de arquivo alterado; com polling o hot reload funciona.

## 2026-10 — Testes e logout no 401

- **Vitest + Testing Library, não Jest:** mesma ferramenta do Rastreia, roda TypeScript e JSX sem Babel e é rápido. O Next não precisa estar de pé: componente é renderizado no jsdom com `next/navigation` mockado.
- **Testes ao lado do código:** `api.test.ts` junto de `api.ts`; achar o teste de um arquivo não exige procurar outra pasta.
- **Job separado na CI (`Testes (Vitest)`):** falha de teste aparece com nome próprio no PR, separada de lint e build.
- **401 chama `clearAuth()` da store:** a store já sabia apagar tudo (token, cookie e estado persistido); o interceptor só apagava o `localStorage`, e o cookie fazia o `proxy.ts` devolver o usuário ao painel. (Na etapa 5 o token saiu do `localStorage`; o 401 agora tenta renovar a sessão antes.)
- **401 do `POST /auth` não derruba a sessão:** ali é senha errada, não sessão vencida. Antes, o redirecionamento recarregava a página de login e a mensagem "Email ou senha incorretos" nunca aparecia.
- **Token do login só na chamada do perfil:** antes ia para `api.defaults` e ficava no axios depois do logout.

## 2026-10 — Telas de edição

- **Um `RecipeForm` para criar e editar:** as duas telas tinham o mesmo formulário; a edição só preenche os valores com `recipeToForm` e chama outra rota. Regra nova de validação vale para as duas.
- **Edição salva tudo com `PUT /recipes/:id`:** a API troca a receita inteira numa transação. Com as rotas por item, o front teria que comparar o que mudou e fazer várias chamadas, e uma falha no meio deixaria a receita pela metade.
- **Fotos extras preservadas:** o formulário edita só a foto principal; as outras fotos da receita vão junto no `PUT` como estavam. (Na etapa 5 o formulário passou a editar todas as fotos.)
- **`router.refresh()` depois de salvar:** a página da receita é renderizada no servidor; sem o refresh o navegador mostraria a versão em cache.
- **Apagar pede confirmação na própria tela:** um segundo botão ("Sim, apagar") no lugar do `window.confirm`, que não segue o visual e não dá para testar no jsdom.
- **Comentários buscados no navegador (`GET /recipes/:id/comments`):** a resposta da receita nunca trouxe comentários, então a lista ficava sempre vazia. Buscar no cliente deixa editar e apagar atualizarem a lista sem recarregar a página.
- **Editar comentário no lugar:** o comentário vira caixa de texto no próprio card; uma tela só para isso seria exagero. O admin pode apagar qualquer comentário, mas editar só o autor, igual à API.
- **`skipHydration` na store de sessão:** com a sessão lida do `localStorage` já no primeiro render, o HTML do navegador não batia com o do servidor (que não tem usuário) e o React acusava erro de hidratação nas páginas renderizadas no servidor. Agora o `Providers` chama `rehydrate()` depois de montar. (Na etapa 5 a store deixou de salvar no navegador, e o `skipHydration` saiu junto.)
- **Foto vazia remove a foto:** o formulário manda `image_profile: ""` e a API (que agora diferencia "não mandou" de "vazio") apaga a foto.

## 2026-10 — Sessão em cookie, busca e revisão geral

- **Access token em memória, refresh em cookie `HttpOnly`:** com o token no `localStorage`, qualquer XSS levava a sessão por 24h. Agora um XSS não acha token guardado, e o que ficar na memória vence em 15 minutos. Substitui o `persist` e o `skipHydration` da store: sem nada salvo no navegador, não há o que hidratar.
- **Rota `/api/*` no Next em vez de chamar a API direto do navegador:** front e API em origens diferentes exigiriam CORS com credenciais e cookie `SameSite=None`. Pela mesma origem o cookie vai sozinho com `SameSite=Strict`, e a URL da API (`API_URL`) deixa de ir para o navegador. Substitui `NEXT_PUBLIC_API_URL` e `API_INTERNAL_URL`. Custo: um salto a mais por requisição, desprezível perto da API.
- **Conferência de origem na rota `/api`:** o `Origin` do navegador não é repassado (a API veria o front, não o site de origem), então o front aplica a mesma regra do `CrossOriginProtection` da API antes de repassar.
- **Cookie `panda_session` além do `panda_refresh`:** o refresh token só vai para `/api/auth`, então as páginas não o recebem. O `panda_session` (sem segredo nenhum) diz ao `proxy.ts` e ao layout que existe sessão: rota protegida redireciona no servidor e quem nunca entrou não gasta uma chamada de renovação.
- **Renovação única com nova tentativa:** várias requisições com o token vencido esperam a mesma renovação; cada troca invalida o refresh token anterior, e a API só tolera o reúso por 20 segundos (duas abas); fora disso, entende como token copiado e derruba a sessão. Uma renovação por vez evita gastar trocas à toa.
- **Situação `unavailable`:** com a API fora do ar não dá para saber se a sessão vale; mandar para o login criaria um vai e volta com a sessão ainda válida.
- **`endedHere` na store:** ao sair ou apagar a conta, a página protegida aberta mandava para o login (o `useRequireAuth` via a sessão acabar) antes da navegação para a home. A marca diferencia "a pessoa saiu aqui" de "a sessão acabou sozinha ou em outra aba".
- **CSP com nonce no `proxy.ts`:** o Next só aplica nonce nos próprios scripts com a página renderizada a cada requisição, por isso todas as páginas são dinâmicas. Hash ou `'unsafe-inline'` não protegeriam do mesmo jeito.
- **Busca e filtros na URL:** dá para compartilhar o link, e voltar da receita traz a lista como estava. O campo de busca espera 300 ms sem digitar antes de mudar a URL.
- **Receita sem `loading.tsx`:** com ele a resposta começava antes de saber se a receita existe, e a receita apagada voltava 200 com `noindex` em vez de 404. O card clicado fica esmaecido enquanto a página carrega (`useLinkStatus`).
- **`next/image` só para `images.unsplash.com`:** liberar qualquer host faria o servidor do front baixar URL qualquer a pedido de qualquer um. As outras fotos carregam direto no navegador, sem `Referer`.
- **Limites num arquivo só (`src/lib/limits.ts`):** espelha os da API; o comentário da API aponta para ele.
- **Testado no navegador de verdade antes do PR:** os testes do Vitest cobrem as partes; um passeio no Chromium (login, renovação no 401, favoritar, comentar, criar, editar e apagar receita, logout entre abas, cadastro e apagar conta, 404, celular a 375 px) conferiu o conjunto sem erro no console nem violação de CSP.
- **Revisão adversarial antes do PR:** achou e corrigiu, com teste: redirecionamento para fora com tab ou quebra de linha no `?next=` (o navegador ignora esses caracteres, e "/\t/site" vira "//site"; agora o caminho é resolvido e a origem conferida); campo de busca que se apagava enquanto a URL atualizava; logout que fingia sair com a API fora do ar (o cookie traria a sessão de volta); URL editada à mão travando a lista; data da receita no fuso do servidor; erros de campo sem `aria-describedby`.
- **Só o último endereço do `X-Forwarded-For` vai para a API:** os anteriores vêm do cliente e podem ser inventados; o último é o que o proxy na frente do front anotou.

