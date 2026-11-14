<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { listarAgendamentosDoDia } from '@/api/agendamentos'
import AppAviso from '@/components/AppAviso.vue'
import AppBotao from '@/components/AppBotao.vue'
import AppIcone from '@/components/AppIcone.vue'
import NavProfissional from '@/components/NavProfissional.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import {
  formatarDiaLongo,
  formatarHora,
  formatarTelefone,
  lerData,
  paraDataIso,
} from '@/utils/formatos'

// E8 Painel de agenda do profissional (CT11 listarAgendamentosDoDia).
// A data escolhida fica na URL (?data=AAAA-MM-DD): recarregar ou voltar ao login mantém o dia.
const route = useRoute()
const router = useRouter()

const resposta = ref(null)
const carregando = ref(true)
const erro = ref('')
// Cada consulta ganha um número; resposta de uma consulta antiga (troca rápida de data) é ignorada.
let consultaAtual = 0

function hoje() {
  return paraDataIso(new Date())
}

// "2026-10-20" válida no calendário ("2026-02-30" não passa).
function dataValida(texto) {
  return typeof texto === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(texto) && paraDataIso(lerData(texto)) === texto
}

const data = computed(() => (dataValida(route.query.data) ? route.query.data : hoje()))
const ehHoje = computed(() => data.value === hoje())
const agendamentos = computed(() => resposta.value?.agendamentos ?? [])

function somarDias(texto, dias) {
  const d = lerData(texto)
  d.setDate(d.getDate() + dias)
  return paraDataIso(d)
}

function irPara(novaData) {
  if (!dataValida(novaData) || novaData === data.value) return
  router.replace({ query: { ...route.query, data: novaData } })
}

function aoEscolherData(evento) {
  // Campo apagado ou incompleto: não troca o dia.
  irPara(evento.target.value)
}

async function carregar() {
  const numero = ++consultaAtual
  const pedida = data.value
  carregando.value = true
  erro.value = ''
  resposta.value = null
  try {
    const r = await listarAgendamentosDoDia(pedida)
    if (numero === consultaAtual) resposta.value = r
  } catch (e) {
    if (numero !== consultaAtual) return
    // NAO_AUTENTICADO: o interceptor do http.js já encerrou a sessão e voltou ao login.
    if (e.erro === 'NAO_AUTENTICADO') return
    // Erro de consulta aparece como erro, nunca como dia vazio.
    erro.value = e.mensagem
  } finally {
    if (numero === consultaAtual) carregando.value = false
  }
}

watch(data, carregar, { immediate: true })
</script>

<template>
  <SiteHeader>
    <NavProfissional />
  </SiteHeader>

  <main class="conteudo pagina">
    <div class="introducao">
      <p class="sobretitulo">Painel do profissional</p>
      <h1 class="titulo">Agenda do dia</h1>
      <p>Seus atendimentos confirmados, em ordem de horário.</p>
    </div>

    <section class="cartao" aria-labelledby="dia-titulo" :aria-busy="carregando">
      <div class="dia">
        <div class="dia__nome">
          <h2 id="dia-titulo" class="cartao__titulo">{{ formatarDiaLongo(data) }}</h2>
          <span v-if="ehHoje" class="selo">Hoje</span>
        </div>

        <div class="dia__controles">
          <button
            type="button"
            class="seta"
            aria-label="Dia anterior"
            title="Dia anterior"
            @click="irPara(somarDias(data, -1))"
          >
            <AppIcone nome="seta-esquerda" :tamanho="18" espessura="2.2" />
          </button>
          <label class="seletor">
            <span class="visualmente-oculto">Escolher data</span>
            <AppIcone nome="calendario" :tamanho="18" class="seletor__icone" />
            <input type="date" :value="data" required @change="aoEscolherData" />
          </label>
          <button
            type="button"
            class="seta"
            aria-label="Próximo dia"
            title="Próximo dia"
            @click="irPara(somarDias(data, 1))"
          >
            <AppIcone nome="seta-direita" :tamanho="18" espessura="2.2" />
          </button>
          <AppBotao v-if="!ehHoje" variante="contorno" @click="irPara(hoje())">Hoje</AppBotao>
        </div>
      </div>

      <p v-if="carregando" class="estado">Carregando a agenda…</p>

      <div v-else-if="erro" class="falha">
        <AppAviso tipo="erro">
          Não foi possível carregar a agenda deste dia. {{ erro }}
        </AppAviso>
        <AppBotao variante="contorno" @click="carregar">Tentar de novo</AppBotao>
      </div>

      <div v-else-if="!agendamentos.length" class="estado estado--vazio">
        <AppIcone nome="calendario" :tamanho="28" class="estado__icone" />
        <p>Nenhum agendamento confirmado para este dia.</p>
      </div>

      <template v-else>
        <p class="contagem">
          {{ agendamentos.length }}
          {{ agendamentos.length === 1 ? 'agendamento' : 'agendamentos' }}
        </p>
        <ol class="agenda">
          <li v-for="a in agendamentos" :key="a.agendamentoId" class="item">
            <div class="item__horario">
              <time class="item__inicio" :datetime="a.inicio">{{ formatarHora(a.inicio) }}</time>
              <span class="item__fim">
                até <time :datetime="a.fim">{{ formatarHora(a.fim) }}</time>
              </span>
            </div>
            <div class="item__detalhes">
              <div class="item__cliente">{{ a.clienteNome }}</div>
              <div class="item__servico">{{ a.servicoNome }}</div>
            </div>
            <a class="item__telefone" :href="`tel:${a.clienteTelefone}`">
              {{ formatarTelefone(a.clienteTelefone) }}
            </a>
          </li>
        </ol>
      </template>
    </section>
  </main>
</template>

<style scoped>
.pagina {
  padding-top: 16px;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.introducao {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.introducao p {
  margin: 0;
  color: var(--cor-texto-suave);
}

.introducao .sobretitulo {
  font-weight: 600;
  color: var(--cor-destaque);
  font-size: 14px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.titulo {
  margin: 0;
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: 36px;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.cartao {
  background: var(--cor-superficie);
  border-radius: 24px;
  padding: 32px;
  box-shadow: var(--sombra-cartao);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cartao__titulo {
  margin: 0;
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: 24px;
  letter-spacing: -0.01em;
}

/* Cabeçalho do dia e troca de data */
.dia {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.dia__nome {
  display: flex;
  align-items: center;
  gap: 12px;
}

.selo {
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--cor-destaque-claro);
  color: var(--cor-destaque-hover);
  font-size: 14px;
  font-weight: 700;
}

.dia__controles {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.seta {
  display: inline-grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1.5px solid var(--cor-borda);
  border-radius: 12px;
  background: var(--cor-superficie);
  color: var(--cor-texto);
  cursor: pointer;
}

.seta:hover {
  border-color: var(--cor-destaque);
  color: var(--cor-destaque-hover);
}

.seta:focus-visible,
.seletor:focus-within {
  outline: 2px solid var(--cor-destaque);
  outline-offset: 2px;
}

.seletor {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 12px;
  border: 1.5px solid var(--cor-borda-campo);
  border-radius: 12px;
  background: var(--cor-superficie);
}

.seletor__icone {
  color: var(--cor-destaque);
}

.seletor input {
  border: 0;
  background: transparent;
  font: inherit;
  color: var(--cor-texto);
  outline: none;
}

.visualmente-oculto {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

/* Estados */
.estado {
  margin: 0;
  padding: 32px 16px;
  text-align: center;
  color: var(--cor-texto-mudo);
  background: var(--cor-fundo);
  border-radius: 16px;
}

.estado--vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.estado--vazio p {
  margin: 0;
}

.estado__icone {
  color: var(--cor-destaque);
}

.falha {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
}

.contagem {
  margin: 0;
  font-size: 15px;
  color: var(--cor-texto-mudo);
}

/* Lista */
.agenda {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item {
  display: grid;
  grid-template-columns: 92px minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  padding: 16px 20px;
  border: 1.5px solid var(--cor-borda);
  border-radius: 14px;
}

.item__horario {
  display: flex;
  flex-direction: column;
  padding-right: 16px;
  border-right: 1.5px solid var(--cor-borda);
}

.item__inicio {
  font-family: var(--fonte-titulo);
  font-size: 22px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.item__fim {
  font-size: 14px;
  color: var(--cor-texto-mudo);
  font-variant-numeric: tabular-nums;
}

.item__cliente {
  font-weight: 700;
  overflow-wrap: anywhere;
}

.item__servico {
  color: var(--cor-texto-suave);
  overflow-wrap: anywhere;
}

.item__telefone {
  font-weight: 600;
  color: var(--cor-destaque);
  text-decoration: none;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}

.item__telefone:hover {
  text-decoration: underline;
}

@media (max-width: 600px) {
  .cartao {
    padding: 22px 20px;
  }

  .titulo {
    font-size: 30px;
  }

  .item {
    grid-template-columns: 72px minmax(0, 1fr);
    gap: 4px 14px;
    padding: 14px 16px;
  }

  .item__horario {
    grid-row: span 2;
    padding-right: 12px;
  }

  .item__telefone {
    grid-column: 2;
  }
}
</style>
