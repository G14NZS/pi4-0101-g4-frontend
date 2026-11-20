<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import {
  cancelarAgendamento,
  listarAgendamentosDoCliente,
  listarHorariosLivres,
  remarcarAgendamento,
} from '@/api/agendamentos'
import AppAviso from '@/components/AppAviso.vue'
import AppBotao from '@/components/AppBotao.vue'
import AppIcone from '@/components/AppIcone.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import { useClienteStore } from '@/stores/cliente'
import {
  formatarDiaLongo,
  formatarHora,
  paraDataIso,
  partesDoDia,
} from '@/utils/formatos'

const DIAS_VISIVEIS = 21

const MENSAGEM_INDISPONIVEL =
  'Esse horário não está mais disponível. Atualizamos os horários livres para você escolher outro.'

const route = useRoute()
const cliente = useClienteStore()

const slug = computed(
  () => route.params.profissionalSlug,
)

// Lista
const agendamentos = ref([])
const carregando = ref(false)
const erroLista = ref('')

// Cancelamento
const confirmandoId = ref(null)
const cancelandoId = ref(null)
const recusa = ref(null)

// Avisos gerais
const sucesso = ref('')
const avisoSucesso = ref(null)

// Remarcação
const remarcandoId = ref(null)
const agendamentoRemarcando = ref(null)

const dataRemarcacao = ref(null)
const inicioRemarcacao = ref(null)

const horariosRemarcacao = ref([])
const carregandoHorariosRemarcacao = ref(false)
const erroRemarcacao = ref('')
const enviandoRemarcacao = ref(false)

let pedidoHorariosRemarcacao = 0

const diasRemarcacao = computed(() => {
  const hoje = new Date()

  return Array.from(
    { length: DIAS_VISIVEIS },
    (_, i) =>
      paraDataIso(
        new Date(
          hoje.getFullYear(),
          hoje.getMonth(),
          hoje.getDate() + i,
        ),
      ),
  )
})

function rotuloDiaRemarcacao(dia, i) {
  if (i === 0) return 'Hoje'
  if (i === 1) return 'Amanhã'

  return partesDoDia(dia).semana
}

async function carregar() {
  if (!cliente.logado) return

  carregando.value = true
  erroLista.value = ''
  recusa.value = null

  try {
    const resposta =
      await listarAgendamentosDoCliente(
        cliente.token,
      )

    agendamentos.value =
      resposta.agendamentos

  } catch (e) {
    if (e.erro === 'NAO_AUTENTICADO') {
      cliente.sair()

      erroLista.value =
        'Sua sessão expirou. Entre novamente.'
    } else {
      erroLista.value =
        e.mensagem
    }
  } finally {
    carregando.value = false
  }
}

// --------------------
// CANCELAMENTO
// --------------------

function pedirConfirmacao(id) {
  fecharRemarcacao()

  recusa.value = null
  sucesso.value = ''
  confirmandoId.value = id
}

function desistir() {
  confirmandoId.value = null
}

async function cancelar(agendamento) {
  const id =
    agendamento.agendamentoId

  cancelandoId.value = id
  recusa.value = null

  try {
    await cancelarAgendamento(
      id,
      cliente.token,
    )

  } catch (e) {
    if (e.erro === 'NAO_AUTENTICADO') {
      cliente.sair()

      erroLista.value =
        'Sua sessão expirou. Entre novamente.'
    } else {
      recusa.value = {
        agendamentoId: id,
        mensagem: e.mensagem,
      }
    }

    confirmandoId.value = null
    cancelandoId.value = null
    return
  }

  const descricao =
    `${agendamento.servicoNome} de ` +
    `${formatarDiaLongo(agendamento.inicio).toLowerCase()}, ` +
    `às ${formatarHora(agendamento.inicio)}`

  try {
    const resposta =
      await listarAgendamentosDoCliente(
        cliente.token,
      )

    agendamentos.value =
      resposta.agendamentos

  } catch {
    agendamentos.value =
      agendamentos.value.filter(
        (a) =>
          a.agendamentoId !== id,
      )
  }

  confirmandoId.value = null
  cancelandoId.value = null

  sucesso.value =
    `Cancelamos o agendamento ${descricao}. ` +
    'O horário ficou livre para outras pessoas.'

  await nextTick()
  avisoSucesso.value?.focus()
}

// --------------------
// REMARCAÇÃO — H10.2
// --------------------

async function abrirRemarcacao(agendamento) {
  confirmandoId.value = null
  recusa.value = null
  sucesso.value = ''

  remarcandoId.value =
    agendamento.agendamentoId

  agendamentoRemarcando.value =
    agendamento

  inicioRemarcacao.value = null
  erroRemarcacao.value = ''
  horariosRemarcacao.value = []

  const dataAtual =
    agendamento.inicio?.slice(0, 10)

  dataRemarcacao.value =
    diasRemarcacao.value.includes(dataAtual)
      ? dataAtual
      : diasRemarcacao.value[0]

  await carregarHorariosRemarcacao()
}

function fecharRemarcacao() {
  pedidoHorariosRemarcacao++

  remarcandoId.value = null
  agendamentoRemarcando.value = null

  dataRemarcacao.value = null
  inicioRemarcacao.value = null

  horariosRemarcacao.value = []
  erroRemarcacao.value = ''

  carregandoHorariosRemarcacao.value = false
  enviandoRemarcacao.value = false
}

async function carregarHorariosRemarcacao() {
  const agendamento =
    agendamentoRemarcando.value

  if (
    !agendamento ||
    !dataRemarcacao.value
  ) {
    return
  }

  const pedido =
    ++pedidoHorariosRemarcacao

  carregandoHorariosRemarcacao.value = true
  erroRemarcacao.value = ''
  horariosRemarcacao.value = []
  inicioRemarcacao.value = null

  try {
    const resposta =
      await listarHorariosLivres(
        agendamento.profissionalSlug,
        {
          servicoId:
            agendamento.servicoId,

          data:
            dataRemarcacao.value,
        },
      )

    if (
      pedido ===
      pedidoHorariosRemarcacao
    ) {
      horariosRemarcacao.value =
        resposta.horariosLivres
    }

  } catch (e) {
    if (
      pedido ===
      pedidoHorariosRemarcacao
    ) {
      erroRemarcacao.value =
        e.mensagem
    }
  } finally {
    if (
      pedido ===
      pedidoHorariosRemarcacao
    ) {
      carregandoHorariosRemarcacao.value =
        false
    }
  }
}

async function escolherDiaRemarcacao(dia) {
  if (
    dataRemarcacao.value === dia
  ) {
    return
  }

  dataRemarcacao.value = dia
  inicioRemarcacao.value = null
  erroRemarcacao.value = ''

  await carregarHorariosRemarcacao()
}

function escolherHorarioRemarcacao(horario) {
  inicioRemarcacao.value = horario
  erroRemarcacao.value = ''
}

async function confirmarRemarcacao() {
  const agendamento =
    agendamentoRemarcando.value

  if (
    !agendamento ||
    !inicioRemarcacao.value
  ) {
    erroRemarcacao.value =
      'Escolha um novo horário.'

    return
  }

  enviandoRemarcacao.value = true
  erroRemarcacao.value = ''

  try {
    const remarcado =
      await remarcarAgendamento(
        agendamento.agendamentoId,
        inicioRemarcacao.value,
        cliente.token,
      )

    const novaDescricao =
      `${formatarDiaLongo(remarcado.inicio).toLowerCase()}, ` +
      `às ${formatarHora(remarcado.inicio)}`

    await carregar()

    fecharRemarcacao()

    sucesso.value =
      `Agendamento remarcado com sucesso para ${novaDescricao}.`

    await nextTick()
    avisoSucesso.value?.focus()

  } catch (e) {
    if (
      e.erro === 'NAO_AUTENTICADO'
    ) {
      cliente.sair()

      fecharRemarcacao()

      erroLista.value =
        'Sua sessão expirou. Entre novamente.'

      return
    }

    if (
      e.erro === 'HORARIO_INDISPONIVEL' ||
      e.erro === 'DATA_INVALIDA'
    ) {
      erroRemarcacao.value =
        MENSAGEM_INDISPONIVEL

      await carregarHorariosRemarcacao()

      return
    }

    erroRemarcacao.value =
      e.mensagem
  } finally {
    enviandoRemarcacao.value = false
  }
}

onMounted(() => {
  if (cliente.logado) {
    carregar()
  }
})
</script>

<template>
  <SiteHeader>
    <AppBotao
      :to="{
        name: 'agendar',
        params: { profissionalSlug: slug },
      }"
      variante="texto"
    >
      <AppIcone
        nome="seta-esquerda"
        :tamanho="18"
        espessura="2.2"
      />
      Agendar horário
    </AppBotao>
  </SiteHeader>

  <main class="conteudo pagina">
    <div class="coluna">

      <div class="introducao">
        <p class="sobretitulo">
          Área do cliente
        </p>

        <h1 class="titulo">
          Meus agendamentos
        </h1>

        <p>
          Consulte e cancele seus próximos
          horários.
        </p>
      </div>

      <section
        v-if="!cliente.logado"
        class="cartao"
      >
        <AppAviso tipo="info">
          Entre na sua conta para ver seus
          agendamentos.
        </AppAviso>

        <AppBotao
          :to="{
            name: 'entrar-cliente',
            query: {
              voltar: route.fullPath,
            },
          }"
          tamanho="g"
          bloco
        >
          Entrar
        </AppBotao>
      </section>

      <section
        v-else
        class="cartao"
        aria-labelledby="titulo-lista"
        :aria-busy="carregando"
      >
        <div class="cabecalho-lista">
          <div>
            <h2
              id="titulo-lista"
              class="cartao__titulo"
            >
              Próximos horários
            </h2>

            <p class="celular">
              {{ cliente.clienteNome }}
            </p>
          </div>

          <AppBotao
            variante="contorno"
            @click="carregar"
          >
            Atualizar
          </AppBotao>
        </div>

        <p
          v-if="carregando"
          class="estado"
        >
          Buscando seus agendamentos…
        </p>

        <AppAviso
          v-else-if="erroLista"
          tipo="erro"
        >
          {{ erroLista }}
        </AppAviso>

        <template v-else>
          <div
            v-if="sucesso"
            ref="avisoSucesso"
            tabindex="-1"
            class="sucesso"
          >
            <AppAviso tipo="sucesso">
              {{ sucesso }}
            </AppAviso>
          </div>

          <div
            v-if="!agendamentos.length"
            class="estado estado--vazio"
          >
            <AppIcone
              nome="calendario"
              :tamanho="28"
              class="estado__icone"
            />

            <p>
              Você não tem agendamentos futuros.
            </p>

            <AppBotao
              :to="{
                name: 'agendar',
                params: {
                  profissionalSlug: slug,
                },
              }"
              variante="contorno"
            >
              Agendar horário
            </AppBotao>
          </div>

          <ol
            v-else
            class="lista"
          >
            <li
              v-for="a in agendamentos"
              :key="a.agendamentoId"
              class="item"
            >
              <div class="item__principal">

                <div
                  class="item__dia"
                  aria-hidden="true"
                >
                  <span class="item__semana">
                    {{ partesDoDia(a.inicio).semana }}
                  </span>

                  <span class="item__numero">
                    {{ partesDoDia(a.inicio).dia }}
                  </span>

                  <span class="item__mes">
                    {{ partesDoDia(a.inicio).mes }}
                  </span>
                </div>

                <div class="item__detalhes">
                  <div class="item__servico">
                    {{ a.servicoNome }}
                  </div>

                  <div class="item__quando">
                    {{ formatarDiaLongo(a.inicio) }},

                    <span class="item__horas">
                      <time :datetime="a.inicio">
                        {{ formatarHora(a.inicio) }}
                      </time>

                      às

                      <time :datetime="a.fim">
                        {{ formatarHora(a.fim) }}
                      </time>
                    </span>
                  </div>

                  <div class="item__profissional">
                    com {{ a.profissionalNome }}
                  </div>
                </div>

                <div
                  v-if="
                    confirmandoId !== a.agendamentoId &&
                    remarcandoId !== a.agendamentoId
                  "
                  class="item__acoes"
                >
                  <AppBotao
                    variante="contorno"
                    :desabilitado="
                      cancelandoId !== null ||
                      enviandoRemarcacao
                    "
                    @click="abrirRemarcacao(a)"
                  >
                    Remarcar
                  </AppBotao>

                  <AppBotao
                    variante="texto"
                    :desabilitado="
                      cancelandoId !== null ||
                      enviandoRemarcacao
                    "
                    @click="
                      pedirConfirmacao(
                        a.agendamentoId,
                      )
                    "
                  >
                    Cancelar
                  </AppBotao>
                </div>
              </div>

              <div
                v-if="
                  remarcandoId ===
                  a.agendamentoId
                "
                class="remarcacao"
              >
                <div class="remarcacao__cabecalho">
                  <div>
                    <strong>
                      Escolha o novo horário
                    </strong>

                    <p>
                      {{ a.servicoNome }}
                      com
                      {{ a.profissionalNome }}
                    </p>
                  </div>

                  <AppBotao
                    variante="texto"
                    :desabilitado="
                      enviandoRemarcacao
                    "
                    @click="fecharRemarcacao"
                  >
                    Fechar
                  </AppBotao>
                </div>

                <div
                  class="dias-remarcacao"
                  role="group"
                  aria-label="Novo dia"
                >
                  <button
                    v-for="(dia, i) in diasRemarcacao"
                    :key="dia"
                    type="button"
                    :aria-pressed="
                      dia === dataRemarcacao
                    "
                    :class="[
                      'dia-remarcacao',
                      {
                        'dia-remarcacao--ativo':
                          dia === dataRemarcacao,
                      },
                    ]"
                    :disabled="
                      enviandoRemarcacao
                    "
                    @click="
                      escolherDiaRemarcacao(dia)
                    "
                  >
                    <span
                      class="dia-remarcacao__semana"
                    >
                      {{
                        rotuloDiaRemarcacao(
                          dia,
                          i,
                        )
                      }}
                    </span>

                    <span
                      class="dia-remarcacao__numero"
                    >
                      {{ partesDoDia(dia).dia }}
                    </span>

                    <span
                      class="dia-remarcacao__mes"
                    >
                      {{ partesDoDia(dia).mes }}
                    </span>
                  </button>
                </div>

                <p class="remarcacao__data">
                  <AppIcone
                    nome="calendario"
                    :tamanho="16"
                  />

                  {{
                    formatarDiaLongo(
                      dataRemarcacao,
                    )
                  }}
                </p>

                <p
                  v-if="carregandoHorariosRemarcacao"
                  class="estado-remarcacao"
                >
                  Buscando horários livres…
                </p>

                <template
                  v-else-if="erroRemarcacao"
                >
                  <AppAviso tipo="erro">
                    {{ erroRemarcacao }}
                  </AppAviso>

                  <AppBotao
                    v-if="
                      !horariosRemarcacao.length
                    "
                    variante="contorno"
                    :desabilitado="
                      enviandoRemarcacao
                    "
                    @click="
                      carregarHorariosRemarcacao
                    "
                  >
                    Tentar novamente
                  </AppBotao>
                </template>

                <div
                  v-else-if="
                    !horariosRemarcacao.length
                  "
                  class="estado-remarcacao"
                >
                  Nenhum horário livre neste dia.
                  Escolha outra data.
                </div>

                <div
                  v-else
                  class="horarios-remarcacao"
                  role="group"
                  aria-label="Novo horário"
                >
                  <button
                    v-for="
                      horario in horariosRemarcacao
                    "
                    :key="horario"
                    type="button"
                    :aria-pressed="
                      horario ===
                      inicioRemarcacao
                    "
                    :class="[
                      'horario-remarcacao',
                      {
                        'horario-remarcacao--ativo':
                          horario ===
                          inicioRemarcacao,
                      },
                    ]"
                    :disabled="
                      enviandoRemarcacao
                    "
                    @click="
                      escolherHorarioRemarcacao(
                        horario,
                      )
                    "
                  >
                    {{
                      formatarHora(horario)
                    }}
                  </button>
                </div>

                <div
                  v-if="inicioRemarcacao"
                  class="remarcacao__resumo"
                >
                  Novo horário:

                  <strong>
                    {{
                      formatarDiaLongo(
                        inicioRemarcacao,
                      )
                    }},
                    às
                    {{
                      formatarHora(
                        inicioRemarcacao,
                      )
                    }}
                  </strong>
                </div>

                <AppBotao
                  tamanho="g"
                  bloco
                  :desabilitado="
                    !inicioRemarcacao ||
                    enviandoRemarcacao
                  "
                  @click="
                    confirmarRemarcacao
                  "
                >
                  {{
                    enviandoRemarcacao
                      ? 'Remarcando…'
                      : 'Confirmar novo horário'
                  }}
                </AppBotao>
              </div>

              <AppAviso
                v-if="
                  recusa?.agendamentoId ===
                  a.agendamentoId
                "
                tipo="erro"
              >
                {{ recusa.mensagem }}
              </AppAviso>
            </li>
          </ol>
        </template>
      </section>
    </div>
  </main>
</template>

<style scoped>
.pagina {
  padding-top: 16px;
  padding-bottom: 80px;
  display: flex;
  justify-content: center;
}

.coluna {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  padding: 28px;
  box-shadow: var(--sombra-cartao);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cartao__titulo {
  margin: 0;
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: 22px;
  letter-spacing: -0.01em;
}

.formulario {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cabecalho-lista {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.celular {
  margin: 2px 0 0;
  color: var(--cor-texto-mudo);
  font-variant-numeric: tabular-nums;
}

.sucesso:focus {
  outline: none;
}

/* Estados */
.estado {
  margin: 0;
  padding: 28px 16px;
  text-align: center;
  color: var(--cor-texto-mudo);
  background: var(--cor-fundo);
  border-radius: 16px;
}

.estado--vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
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
  gap: 14px;
}

/* Lista */
.lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px 18px;
  border: 1.5px solid var(--cor-borda);
  border-radius: 16px;
}

.item__principal {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
}

.item__dia {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  border-radius: 12px;
  background: var(--cor-destaque-claro);
  color: var(--cor-destaque-hover);
  line-height: 1.15;
}

.item__semana,
.item__mes {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
}

.item__numero {
  font-family: var(--fonte-titulo);
  font-size: 24px;
  font-weight: 700;
}

.item__servico {
  font-weight: 700;
  overflow-wrap: anywhere;
}

.item__quando {
  color: var(--cor-texto-suave);
  font-variant-numeric: tabular-nums;
}

.item__horas {
  white-space: nowrap;
}

.item__profissional {
  font-size: 15px;
  color: var(--cor-texto-mudo);
  overflow-wrap: anywhere;
}

.confirmacao {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 12px;
  background: var(--cor-erro-fundo);
  color: var(--cor-erro-texto);
}

.confirmacao p {
  margin: 0;
  font-weight: 600;
}

.confirmacao__botoes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.item__acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.remarcacao {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
  border-radius: 14px;
  background: var(--cor-fundo);
}

.remarcacao__cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.remarcacao__cabecalho p {
  margin: 4px 0 0;
  color: var(--cor-texto-mudo);
}

.dias-remarcacao {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.dia-remarcacao {
  flex: 0 0 auto;
  width: 66px;
  padding: 9px 0;
  border: 1.5px solid var(--cor-borda);
  border-radius: 12px;
  background: var(--cor-superficie);
  color: var(--cor-texto);
  font: inherit;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.dia-remarcacao:hover {
  border-color: var(--cor-destaque);
}

.dia-remarcacao--ativo {
  background: var(--cor-destaque);
  border-color: var(--cor-destaque);
  color: #fff;
}

.dia-remarcacao__semana,
.dia-remarcacao__mes {
  font-size: 12px;
}

.dia-remarcacao__numero {
  font-size: 19px;
  font-weight: 700;
}

.remarcacao__data {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--cor-texto-suave);
  font-weight: 600;
}

.horarios-remarcacao {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fill,
      minmax(82px, 1fr)
    );
  gap: 8px;
}

.horario-remarcacao {
  min-height: 42px;
  border: 1.5px solid var(--cor-borda);
  border-radius: 10px;
  background: var(--cor-superficie);
  color: var(--cor-texto);
  font: inherit;
  cursor: pointer;
}

.horario-remarcacao:hover {
  border-color: var(--cor-destaque);
}

.horario-remarcacao--ativo {
  background: var(--cor-destaque);
  border-color: var(--cor-destaque);
  color: #fff;
  font-weight: 600;
}

.estado-remarcacao {
  margin: 0;
  padding: 16px;
  text-align: center;
  border-radius: 12px;
  background: var(--cor-superficie);
  color: var(--cor-texto-mudo);
}

.remarcacao__resumo {
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--cor-destaque-claro);
  color: var(--cor-texto-suave);
}

.remarcacao__resumo strong {
  color: var(--cor-texto);
}

@media (max-width: 600px) {
  .cartao {
    padding: 22px 20px;
  }

  .titulo {
    font-size: 30px;
  }

  .item__principal {
    grid-template-columns: 56px minmax(0, 1fr);
    gap: 6px 14px;
  }

  .item__dia {
    grid-row: span 2;
    align-self: start;
  }

  .item__cancelar {
    grid-column: 2;
    justify-self: start;
  }
  .item__acoes {
    grid-column: 2;
    justify-content: flex-start;
  }

  .remarcacao__cabecalho {
    flex-direction: column;
  }

  .horarios-remarcacao {
    grid-template-columns:
      repeat(3, 1fr);
  }
}
</style>
