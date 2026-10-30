# pi4-0101-g4-frontend
Front-end Projeto Integrador 4 — ReService (Vue 3 + Vite + Vue Router + Pinia + axios).

Decisões de arquitetura em `docs/adr/` e fluxos em `docs/fluxos/`.

## Rodando

O frontend conversa com o [Backend 1](../pi4-0101-g4-backend-1), que roda em Docker. Suba ele primeiro:

```sh
# na pasta do pi4-0101-g4-backend-1
docker compose up -d --build   # MySQL + API em http://localhost:8080
```

Depois, nesta pasta:

```sh
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:8080 (o padrão do Backend 1)
npm run dev            # http://localhost:5175
```

Abra **http://localhost:5175** (não `127.0.0.1`): o Backend 1 só libera CORS para essa origem
(variável `CORS_ORIGENS` no `docker-compose.yml` dele). Por isso o Vite usa a porta 5175 fixa e não sobe se ela
estiver ocupada; nesse caso, libere a porta ou acrescente a nova origem em `CORS_ORIGENS`.

Login de teste (criado pelo `db/dados-dev.sql` do Backend 1): **ana@exemplo.com / segredo123**.

## O que já funciona

| História | Tela | Contratos |
|---|---|---|
| H02.3 | Login do profissional (`/profissional/entrar`) e Meus serviços (`/profissional/servicos`) | CT1, CT2, CT3 |

O token do CT1 é um JWT com `exp`: quando ele vence, a tela volta sozinha ao login.

## Estrutura

```
src/
  api/          chamadas HTTP ao Backend 1 (http.js: instância do axios)
  stores/       stores Pinia
  router/       rotas da SPA
  layouts/      layouts compartilhados entre telas
  views/
    profissional/  telas do profissional (E1, E2, E8)
    cliente/       telas do cliente, abertas pelo link do profissional (E4, E5, E7)
  components/   componentes reutilizáveis
```
