# Design

Visual "cartoon": bordas grossas escuras, sombra sólida deslocada e cores quentes. A referência visual é o `design-concept.html` na raiz.

## Cores

| Uso | Cor |
| --- | --- |
| Texto, bordas e sombras | `#1A0A00` |
| Vermelho principal (botões, destaques) | `#C0392B`, escuro `#8B1A1A` |
| Dourado | `#D4A017`, claro `#F0C040`, escuro `#A07010` |
| Fundos creme | `#F5E6C8`, `#FDF6E3` |

## Tipografia

Nunito (via `next/font`), títulos em `font-black`.

## Componentes

- Card: `rounded-2xl`, borda de 3px `#1A0A00`, sombra `4px 4px 0 #1A0A00`.
- Em `src/components/ui`: `Button`, `Input` e `Textarea` (com label, erro e contador), `Pagination`, `Notice` (lista vazia, erro, aviso) e `FormError`. Tela nova usa esses antes de criar outro.
- `RecipeImage` e `Avatar` mostram um emoji quando a foto falta ou não carrega.
- Botão de envio fica desabilitado enquanto a requisição não volta.
- Ação que não dá para desfazer (apagar receita ou conta) pede confirmação com um segundo botão na própria tela.
- Enquanto a lista carrega, um esqueleto do mesmo tamanho dos cards; enquanto a sessão é conferida, um espaço do mesmo tamanho no topo (nada de "Entrar" piscando para quem está logado).

## Acessibilidade

- Campo com erro tem `aria-invalid` e a mensagem ligada por `aria-describedby`; o primeiro campo com erro recebe o foco.
- Botões só com ícone têm `aria-label`; filtros e favoritar usam `aria-pressed`, a página atual usa `aria-current`.
- Testes procuram elementos pelo papel e pelo nome acessível, então um botão sem nome quebra o teste.
- Funciona a partir de 375 px de largura, sem rolagem horizontal.
