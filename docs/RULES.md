# Regras do projeto

Regras que valem para qualquer mudança. Se uma regra atrapalhar, ela é discutida e alterada aqui, não ignorada em silêncio.

## 1. Escopo

- Toda funcionalidade nova precisa estar no [PRD](PRD.md) e em [TASKS.md](TASKS.md) antes de ser implementada.
- Uma tarefa por vez. Melhorias que aparecerem no caminho viram item novo em TASKS, não entram de carona.
- Nada de dependência, serviço ou camada nova "para o futuro". Entra quando uma tarefa precisar.

## 2. Código

- Respeitar as pastas e regras de [ARCHITECTURE.md](ARCHITECTURE.md): página usa hook ou service, nunca `api` direto.
- TypeScript estrito; nada de `any` sem comentário dizendo o porquê.
- Componentes e cores seguem [DESIGN.md](DESIGN.md).
- Identificadores em inglês; textos da tela, comentários, docs e commits em português.
- `npm run lint`, `npm run typecheck` e `npm test` limpos, sem warning.

## 3. Segurança

Checklist para toda mudança (detalhes em [SECURITY.md](SECURITY.md)):

- [ ] Formulário valida com Zod usando os mesmos limites da API (é só para o usuário; quem protege é a API).
- [ ] Nada de `dangerouslySetInnerHTML` com dado do usuário; link e imagem vindos do usuário só com `http`/`https`.
- [ ] Rota que exige login está no `proxy.ts`.
- [ ] Nenhum segredo no código: no front tudo é público, inclusive `NEXT_PUBLIC_*`.
- [ ] Dependência nova é necessária, mantida e passa no `npm audit`.
- [ ] Nada de código, nome de cliente ou padrão interno de outra empresa no repositório.

## 4. Testes

- Vitest + Testing Library; `npm test` roda tudo e a CI exige verde.
- Correção de bug vem com um teste que falha sem a correção.
- Teste fica ao lado do arquivo testado e testa comportamento (o que aparece na tela, o que vai para a API), não detalhe de implementação.
- Nada de rede de verdade nos testes: mocka o service ou o adapter do axios.
- `npm run build` passando antes de qualquer commit.

## 5. API

- Rota nova da API entra primeiro no repositório da API; o front só consome o que já está na `develop` de lá.

## 6. Git

- **Branches:** `main` é o que está publicado; `develop` junta o trabalho pronto para a próxima versão. Ninguém faz push direto nas duas: tudo entra por pull request.
- **Fluxo:** criar a branch a partir da `develop` com o mesmo tipo do commit (`feat/busca-de-receitas`, `fix/...`, `docs/...`, `chore/...`, `ci/...`), abrir PR para a `develop` e fazer merge com os checks verdes. A branch é apagada automaticamente depois do merge.
- **Versão:** quando a `develop` fecha uma etapa, abrir PR da `develop` para a `main`.
- **Como fazer o merge:** feature → `develop` com squash (um commit por PR); `develop` → `main` sempre com merge commit, nunca rebase ou squash, para as duas branches não divergirem. Para atualizar a branch de feature, `git pull --rebase origin develop`.
- `main` e `develop` sempre funcionando: buildam e passam no lint.
- **Conventional Commits:** mensagem no formato `tipo: assunto em português, minúsculo`. Tipos: `feat` (funcionalidade), `fix` (correção), `docs`, `test`, `refactor`, `perf`, `style`, `build`, `ci`, `chore`, `revert`. Escopo opcional, ex.: `feat(perfil): editar foto`. Mudança que quebra compatibilidade leva `!`: `feat!: ...`.
- O título do PR segue o mesmo formato, porque o squash usa o título como commit; a CI confere.
- Commits pequenos, um assunto por commit.
- Nunca commitar `.env`, `.next` ou `node_modules`.

## 7. Documentação

- Mudou tela, rota, variável de ambiente ou decisão de arquitetura: atualizar o doc correspondente no mesmo commit.
- Decisão relevante (escolha de lib, trade-off, algo que foi descartado) vai para [MEMORY.md](MEMORY.md).
- Tarefa concluída é marcada em [TASKS.md](TASKS.md).

## Definição de pronto

Uma tarefa só está pronta quando: funciona com `docker compose up`, tem testes, passa no lint, o checklist de segurança foi revisado, OpenAPI e docs estão atualizados e o item está marcado em TASKS.
