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

## Pastas

```
src/app          páginas (uma pasta por rota)
src/components   ui/ (Button, Card, Input), layout/ (Header), recipe/ (card, comentários, favoritar)
src/hooks        hooks do TanStack Query (useRecipes, useFavorites)
src/services     uma função por chamada da API, agrupadas por recurso
src/store        auth.store.ts (usuário e token)
src/types        tipos que espelham as respostas da API
src/proxy.ts     redireciona rota protegida sem login e rota de login com sessão
```

Regras:

- Página não chama `api` direto: usa um hook ou um service.
- Tipo novo da API entra em `src/types` com os mesmos nomes de campo (`snake_case`).
- A URL da API vem de `NEXT_PUBLIC_API_URL`.

## Autenticação hoje

O login chama `POST /auth`, guarda o token no `localStorage` (usado pelo axios) e num cookie `@pandaToken` (lido pelo `proxy.ts` para proteger rotas). Os riscos disso estão em [SECURITY.md](SECURITY.md#tokens).
