# Arquitetura

```
Navegador ──▶ Next.js (App Router) ──axios──▶ API Go (panda-cooking-go-api)
```

## Stack

| Parte | Escolha |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilo | Tailwind CSS 4 |
| Dados do servidor | TanStack Query (cache, loading, refetch) |
| Estado de login | Zustand com `persist` |
| Formulários | React Hook Form + Zod |
| HTTP | axios com interceptors (token e 401) |
| Ícones | lucide-react |
| Testes | Vitest + Testing Library (jsdom) |

## Pastas

```
src/app          páginas (uma pasta por rota)
src/components   ui/ (Button, Card, Input), layout/ (Header), recipe/ (card, comentários, favoritar)
src/hooks        hooks do TanStack Query (useRecipes, useFavorites)
src/services     uma função por chamada da API, agrupadas por recurso
src/store        auth.store.ts (usuário e token)
src/types        tipos que espelham as respostas da API
src/proxy.ts     redireciona rota protegida sem login e rota de login com sessão
src/test         setup dos testes
```

Os testes ficam ao lado do arquivo testado (`api.ts` → `api.test.ts`, `page.tsx` → `page.test.tsx`). Componente é testado pelo que o usuário vê (texto, label, papel do botão), com a API mockada no service e o `next/navigation` mockado.

Regras:

- Página não chama `api` direto: usa um hook ou um service.
- Tipo novo da API entra em `src/types` com os mesmos nomes de campo (`snake_case`).
- A URL da API vem de `NEXT_PUBLIC_API_URL`.

## Autenticação hoje

O login chama `POST /auth`, guarda o token no `localStorage` (usado pelo axios) e num cookie `@pandaToken` (lido pelo `proxy.ts` para proteger rotas). Os riscos disso estão em [SECURITY.md](SECURITY.md#tokens).

Quando a API responde 401, o interceptor do axios chama `clearAuth()` (apaga `localStorage`, cookie e o estado do Zustand) e manda para `/auth/login` com navegação completa, que também descarta o cache das queries. O 401 do próprio `POST /auth` (senha errada) fica de fora: ele é tratado no formulário.
