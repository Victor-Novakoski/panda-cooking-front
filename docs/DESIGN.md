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

- `Card`: `rounded-2xl`, borda de 3px `#1A0A00`, sombra `4px 4px 0 #1A0A00`.
- `Button` e `Input` em `src/components/ui`; tela nova usa esses antes de criar outro.
- Botão de envio fica desabilitado enquanto a requisição não volta.
