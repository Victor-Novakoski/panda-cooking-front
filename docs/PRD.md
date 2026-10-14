# PRD — Panda Cooking

O PRD completo, com público e funcionalidades, fica na API: [panda-cooking-go-api/docs/PRD.md](https://github.com/Victor-Novakoski/panda-cooking-go-api/blob/develop/docs/PRD.md).

## Telas

| Tela | Rota | Login | Situação |
| --- | --- | --- | --- |
| Página inicial (com as receitas mais novas) | `/` | — | ✅ |
| Entrar | `/auth/login` | — | ✅ |
| Criar conta (entra direto depois) | `/auth/register` | — | ✅ |
| Receitas: busca, filtro por categoria e paginação, tudo na URL | `/recipes` | — | ✅ |
| Receita (fotos, ingredientes, preparo, comentários, favoritar, compartilhar, imprimir e modo cozinha) | `/recipes/[id]` | para comentar e favoritar | ✅ |
| Página pública do autor (nome, foto e receitas, paginadas) | `/users/[id]` | — | ✅ |
| Nova receita | `/recipes/new` | ✅ | ✅ |
| Perfil (minhas receitas e favoritas, paginadas) | `/profile` | ✅ | ✅ |
| Editar e apagar receita (só quem criou) | `/recipes/[id]/edit` | ✅ | ✅ |
| Editar perfil (nome e foto) e apagar conta | `/profile/edit` | ✅ | ✅ |
| Editar e apagar comentário (na página da receita) | `/recipes/[id]` | ✅ | ✅ |
| Página não encontrada e erro inesperado | — | — | ✅ |
