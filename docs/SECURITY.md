# Segurança do front

A lista completa de riscos fica na API: [panda-cooking-go-api/docs/SECURITY.md](https://github.com/Victor-Novakoski/panda-cooking-go-api/blob/develop/docs/SECURITY.md). Aqui ficam os que dependem do front. Checklist por mudança em [RULES.md](RULES.md#3-segurança).

Situação revisada em 06/10/2026, na etapa 2 (testes e logout no 401).

**Legenda:** ✅ feito · 🟡 parcial · 🔴 pendente

| Risco | Situação | O que falta |
| --- | --- | --- |
| Validação no front | 🟡 | Zod nos formulários; alinhar os limites com a API quando ela definir os máximos. |
| Tokens | 🔴 | Ver abaixo. |
| XSS | 🟡 | React escapa texto. Falta aceitar só `http`/`https` nas URLs de imagem informadas pelo usuário. |
| Envio duplicado | 🟡 | Conferir em cada formulário se o botão fica desabilitado durante o envio. |
| Dependências vulneráveis | ✅ | `npm audit` na CI (falha com alta ou crítica no que vai para produção) e Dependabot semanal. |
| Segredos no repositório | ✅ | gitleaks na CI varre todo o histórico. `.env*` no `.gitignore`. |
| Headers de segurança | 🔴 | `Content-Security-Policy`, `X-Frame-Options` e `Referrer-Policy` no `next.config.ts` (etapa do deploy). |

## Tokens

Hoje o token fica no `localStorage` e num cookie que o JavaScript lê. Qualquer XSS rouba a sessão por 24h, e não há como revogar.

Quando a API responde 401, o front encerra a sessão inteira: `localStorage`, cookie e estado do Zustand (antes só o `localStorage` era apagado, e o `proxy.ts` ainda via o cookie e devolvia o usuário para o painel). Coberto em `src/services/api.test.ts`.

Proposta (a discutir na etapa 2): access token curto na memória + refresh token em cookie `HttpOnly`, `Secure` e `SameSite`, como no Rastreia. Precisa de mudança na API junto.
