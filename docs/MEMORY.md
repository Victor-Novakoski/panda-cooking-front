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
- **`API_INTERNAL_URL`:** a página da receita busca os dados no servidor do Next. Dentro do Docker, `localhost:8080` é o próprio container do front, então o servidor usa `http://api:8080` e o navegador continua com `NEXT_PUBLIC_API_URL`.
- **`WATCHPACK_POLLING`:** no Docker do Windows e do Mac a pasta montada não avisa o container de arquivo alterado; com polling o hot reload funciona.

## 2026-10 — Testes e logout no 401

- **Vitest + Testing Library, não Jest:** mesma ferramenta do Rastreia, roda TypeScript e JSX sem Babel e é rápido. O Next não precisa estar de pé: componente é renderizado no jsdom com `next/navigation` mockado.
- **Testes ao lado do código:** `api.test.ts` junto de `api.ts`; achar o teste de um arquivo não exige procurar outra pasta.
- **Job separado na CI (`Testes (Vitest)`):** falha de teste aparece com nome próprio no PR, separada de lint e build.
- **401 chama `clearAuth()` da store:** a store já sabia apagar tudo (token, cookie e estado persistido); o interceptor só apagava o `localStorage`, e o cookie fazia o `proxy.ts` devolver o usuário ao painel.
- **401 do `POST /auth` não derruba a sessão:** ali é senha errada, não sessão vencida. Antes, o redirecionamento recarregava a página de login e a mensagem "Email ou senha incorretos" nunca aparecia.
- **Token do login só na chamada do perfil:** antes ia para `api.defaults` e ficava no axios depois do logout.

## 2026-10 — Telas de edição

- **Um `RecipeForm` para criar e editar:** as duas telas tinham o mesmo formulário; a edição só preenche os valores com `recipeToForm` e chama outra rota. Regra nova de validação vale para as duas.
- **Edição salva tudo com `PUT /recipes/:id`:** a API troca a receita inteira numa transação. Com as rotas por item, o front teria que comparar o que mudou e fazer várias chamadas, e uma falha no meio deixaria a receita pela metade.
- **Fotos extras preservadas:** o formulário edita só a foto principal; as outras fotos da receita vão junto no `PUT` como estavam.
- **`router.refresh()` depois de salvar:** a página da receita é renderizada no servidor; sem o refresh o navegador mostraria a versão em cache.
- **Apagar pede confirmação na própria tela:** um segundo botão ("Sim, apagar") no lugar do `window.confirm`, que não segue o visual e não dá para testar no jsdom.
- **Comentários buscados no navegador (`GET /recipes/:id/comments`):** a resposta da receita nunca trouxe comentários, então a lista ficava sempre vazia. Buscar no cliente deixa editar e apagar atualizarem a lista sem recarregar a página.
- **Editar comentário no lugar:** o comentário vira caixa de texto no próprio card; uma tela só para isso seria exagero. O admin pode apagar qualquer comentário, mas editar só o autor, igual à API.
- **`skipHydration` na store de sessão:** com a sessão lida do `localStorage` já no primeiro render, o HTML do navegador não batia com o do servidor (que não tem usuário) e o React acusava erro de hidratação nas páginas renderizadas no servidor. Agora o `Providers` chama `rehydrate()` depois de montar.
- **Foto vazia remove a foto:** o formulário manda `image_profile: ""` e a API (que agora diferencia "não mandou" de "vazio") apaga a foto.
