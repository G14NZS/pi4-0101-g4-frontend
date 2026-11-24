# pi4-0101-g4-frontend — Reservice Web SPA (v1.0)

Interface web Single Page Application (SPA) do sistema **Reservice**, construída em **Vue.js** (ADR 0003 e ADR 0004) com Vite e servida em produção por **Nginx**.

- **Repositório:** https://github.com/G14NZS/pi4-0101-g4-frontend.git

---

## Funcionalidades e Telas Implementadas

### Área Pública e Portal do Cliente (`src/views/cliente/`)
- **`HomeView.vue`:** Página inicial de apresentação e acesso rápido.
- **`AgendarView.vue`:** Fluxo público de agendamento pelo link do profissional (`/profissionais/:slug`), seleção de serviço, data e horários livres (`CT3`, `CT5`, `CT7`).
- **`EntrarClienteView.vue`:** Identificação simplificada pelo telefone e reconhecimento automático de clientes recorrentes (`CT6`).
- **`MeusAgendamentosView.vue`:** Consulta de agendamentos futuros (`CT8`), cancelamento com liberação imediata de horário (`CT9`) e remarcação (`CT10`).

### Painel do Profissional (`src/views/profissional/`)
- **`EntrarProfissionalView.vue`:** Autenticação via e-mail e senha com armazenamento de token JWT (`CT1`).
- **`MeusServicosView.vue`:** Cadastro e listagem de serviços do profissional (`CT2`, `CT3`).
- **`AgendaDoDiaView.vue`:** Visualização diária dos agendamentos ativos do profissional (`CT11`).

---

## Estrutura de Pastas

- `src/api/` — Clientes HTTP (`http.js`, `erros.js`, `sessoes.js`, `servicos.js`, `clientes.js`, `agendamentos.js`).
- `src/components/` — Componentes reutilizáveis (`AppAviso.vue`, `AppBotao.vue`, `AppIcone.vue`, `AppLogo.vue`, `CampoFormulario.vue`, `NavProfissional.vue`, `PreviaAgendamento.vue`, `SiteHeader.vue`).
- `src/router/index.js` — Configuração de rotas SPA e guardas de navegação.
- `src/stores/` — Gerenciamento de estado (`sessao.js` e `cliente.js`).
- `src/utils/` — Formatação de datas/telefones (`formatos.js`) e persistência temporária (`agendamentoPendente.js`).
- `nginx.conf` e `Dockerfile` — Empacotamento estático e roteamento SPA em produção.

---

## Execução Local e Produção

```sh
# 1. Configurar variáveis de ambiente
cp .env.example .env

# 2. Instalar dependências e rodar em modo desenvolvimento
npm install
npm run dev

# 3. Gerar build de produção
npm run build
```

Quando executado via `docker compose up -d --build` a partir do repositório `pi4-0101-g4-backend-1`, o front-end fica acessível em **`http://localhost:5175`**.