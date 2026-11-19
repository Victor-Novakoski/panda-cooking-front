# 009. `API_INTERNAL_URL`

- **Data:** 2026-10
- **Status:** substituída por 027

## Contexto

Etapa "Tudo com um `docker compose up`". Registrada no antigo `docs/MEMORY.md`.

## Decisão

**`API_INTERNAL_URL`:** a página da receita busca os dados no servidor do Next. Dentro do Docker, `localhost:8080` é o próprio container do front, então o servidor usa `http://api:8080` e o navegador continua com `NEXT_PUBLIC_API_URL`. (Substituído na etapa 5 pelo `API_URL` só no servidor.)

## Consequência

Substituída na etapa 5 pelo `API_URL` só no servidor (decisão 027).
