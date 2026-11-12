# src/lib

Sessão (`session.ts`), repasse `/api` (`bff.ts`), busca no servidor (`server-api.ts`), limites dos formulários (`limits.ts`), erros da API no formulário (`forms.ts`), fotos (`photo.ts`), porções (`portions.ts`) e chaves do TanStack Query (`query-keys.ts`).

## Regras

- **Sessão:** o access token (15 min) fica só em memória, na store do Zustand. O refresh token é cookie `HttpOnly` que o JavaScript não lê; o `panda_session` (sem segredo) só avisa o servidor do Next que existe sessão. Nada da sessão no `localStorage`.
- **Renovação única:** no 401, o interceptor renova uma vez e repete a requisição; várias requisições ao mesmo tempo esperam a mesma renovação. Cada troca invalida o refresh token anterior, e a API só tolera reúso por 20 s; fora disso, derruba a sessão.
- 401 do `POST /api/auth/login` é senha errada, não sessão vencida: não renova nem redireciona.
- **API fora do ar:** a sessão fica `unavailable` e as páginas avisam; não mande para o login (a sessão pode continuar válida).
- `endedHere` diferencia "a pessoa saiu aqui" (vai para a home) de "a sessão acabou sozinha ou em outra aba" (vai para o login). Login e logout são avisados às outras abas por `BroadcastChannel`.
- Dado de quem está logado fica sob `ME_KEY` (`["me"]`), para sair do cache no login, no logout e ao apagar a conta.
- **Repasse `/api` (`bff.ts`):** repassa só `Authorization`, `Cookie`, `Content-Type`, `Accept`, `X-Forwarded-For` e `X-Request-Id`, e devolve os `Set-Cookie` da API. Recusa requisição que muda dados vinda de outra origem (403, a mesma regra do `CrossOriginProtection` da API, já que o `Origin` não é repassado), corpo acima de 1 MiB (413) e desiste em 15 s (504; 502 se a API não responder).
- Do `X-Forwarded-For` só vai o **último** endereço (o que o proxy anotou); os anteriores podem ser inventados pelo cliente.
- `limits.ts` espelha `internal/service/inputs.go` da API. Mudou um, mude o outro.

## Armadilhas conhecidas

- **Fotos:** `photo.ts` reduz a foto para no máximo 1600 px e converte para WebP (ou JPEG) até caber nos 900 KB da API, antes de enviar para `/api/uploads`. Foto por link continua valendo.
- **Porções:** `portions.ts` lê o número do começo da quantidade ("500g", "1/2 xícara") e acerta o plural; o que não começa com número ("a gosto") fica igual.
- Redirecionamento do `?next=` do login: o caminho é resolvido como o navegador faria e a origem é conferida (`safeNextPath`); tab e quebra de linha no meio (`/%09/site`) viram `//site` no navegador.

## Ver também

`docs/decisoes/` 015, 026–032, 037, 040, 045.
