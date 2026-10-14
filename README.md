# pi4-0101-g4-frontend
Front-end Projeto Integrador 4 — ReService (Vue 3 + Vite + Vue Router + Pinia + axios).

Decisões de arquitetura em `docs/adr/` e fluxos em `docs/fluxos/`.

## Rodando

```sh
npm install
cp .env.example .env   # ajuste VITE_API_URL para o Backend 1
npm run dev
```

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
