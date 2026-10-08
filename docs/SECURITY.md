# Segurança do front

A lista completa de riscos fica na API: [panda-cooking-go-api/docs/SECURITY.md](https://github.com/Victor-Novakoski/panda-cooking-go-api/blob/develop/docs/SECURITY.md). Aqui ficam os que dependem do front. Checklist por mudança em [RULES.md](RULES.md#3-segurança).

Situação revisada em 07/10/2026, na etapa 5 (sessão em cookie e revisão geral).

**Legenda:** ✅ feito · 🟡 parcial · 🔴 pendente

| Risco | Situação | Como está |
| --- | --- | --- |
| Roubo de sessão por XSS | ✅ | Access token só em memória (15 min); refresh token em cookie `HttpOnly` que o JavaScript não lê. Nada da sessão no `localStorage`. |
| XSS | ✅ | React escapa texto; nenhum `dangerouslySetInnerHTML`. CSP com nonce por requisição e `'strict-dynamic'`: script injetado não roda. Links de foto só `https`. |
| CSRF | ✅ | Cookie de refresh `SameSite=Strict` e só em `/api/auth`. A rota `/api` recusa requisição que muda dados vinda de outra origem (403), e as rotas de dados exigem o `Authorization`, que outro site não consegue mandar. |
| Clickjacking | ✅ | `frame-ancestors 'none'` e `X-Frame-Options: DENY`. |
| Redirecionamento aberto | ✅ | O `?next=` do login é resolvido como o navegador faria e só vale se continuar no próprio site (`safeNextPath`); `//outro.site`, `https://...` e truques com tab ou quebra de linha (`/%09/outro.site`) voltam para o painel. |
| Vazamento de dados entre usuários | ✅ | Dados de quem está logado ficam sob `["me"]` no cache e saem no login, logout e ao apagar a conta, inclusive nas outras abas. |
| Validação no front | ✅ | Zod com os mesmos limites da API (`src/lib/limits.ts`); erros 422 da API aparecem no campo certo. Quem protege de verdade é a API. |
| Envio duplicado | ✅ | Botão de envio desabilitado enquanto a requisição não volta; favoritar é otimista e não repete. |
| Abuso pela rota `/api` | ✅ | Corpo limitado a 1 MiB, tempo limite de 15 s, só headers necessários repassados. Limites por IP ficam na API. |
| Imagens de terceiros | ✅ | `next/image` só otimiza `images.unsplash.com` (o servidor não busca URL qualquer); as outras carregam direto no navegador, sem `Referer`. |
| Headers de segurança | ✅ | CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` e HSTS (atrás de HTTPS) no `proxy.ts`. Sem `X-Powered-By`. |
| Dependências vulneráveis | ✅ | `npm audit` na CI (falha com alta ou crítica no que vai para produção) e Dependabot semanal. |
| Segredos no repositório | ✅ | gitleaks na CI varre todo o histórico. `.env*` no `.gitignore`; a única variável (`API_URL`) só existe no servidor. |
| IP de quem acessa | 🟡 | Só o último endereço do `X-Forwarded-For` vai para a API (o que o proxy anotou), mas sem proxy na frente o Next mantém o header que o cliente mandou. Em produção, o proxy reverso na frente do front precisa sobrescrever esse header (o Caddy faz isso por padrão); senão, dá para burlar o limite por IP da API. Fica para o deploy. |

## CSP

```
default-src 'self'; script-src 'self' 'nonce-…' 'strict-dynamic'; style-src 'self' 'unsafe-inline';
img-src 'self' data: blob: https:; font-src 'self'; connect-src 'self'; object-src 'none';
base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests
```

- `style-src 'unsafe-inline'`: o React e o `next/image` usam atributo `style`; CSS injetado não executa código.
- `img-src https:`: as fotos vêm de links informados pelos usuários.
- Em desenvolvimento entram `'unsafe-eval'` e `ws:` (usados pelo hot reload) e sai o `upgrade-insecure-requests`.
- Testado em `src/proxy.test.ts`.
