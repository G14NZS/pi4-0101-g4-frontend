<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import {
  cancelarAgendamento,
  listarAgendamentosDoCliente,
} from '@/api/agendamentos'
import AppAviso from '@/components/AppAviso.vue'
import AppBotao from '@/components/AppBotao.vue'
import AppIcone from '@/components/AppIcone.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import { useClienteStore } from '@/stores/cliente'
import {
  formatarDiaLongo,
  formatarHora,
  partesDoDia,
} from '@/utils/formatos'

const route = useRoute()
const cliente = useClienteStore()

const slug = computed(
  () => route.params.profissionalSlug,
)

const agendamentos = ref([])
const carregando = ref(false)
const erroLista = ref('')

const confirmandoId = ref(null)
const cancelandoId = ref(null)
const recusa = ref(null)
const sucesso = ref('')
const avisoSucesso = ref(null)

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
      erroLista.value = e.mensagem
    }
  } finally {
    carregando.value = false
  }
}

function pedirConfirmacao(id) {
  recusa.value = null
  sucesso.value = ''
  confirmandoId.value = id
}

function desistir() {
  confirmandoId.value = null
}

async function cancelar(agendamento) {
  const id = agendamento.agendamentoId

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
        (a) => a.agendamentoId !== id,
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

                <AppBotao
                  v-if="
                    confirmandoId !==
                    a.agendamentoId
                  "
                  variante="contorno"
                  class="item__cancelar"
                  :desabilitado="
                    cancelandoId !== null
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

              <div
                v-if="
                  confirmandoId ===
                  a.agendamentoId
                "
                class="confirmacao"
                role="group"
                :aria-label="
                  `Confirmar cancelamento de ${a.servicoNome}`
                "
              >
                <p>
                  Cancelar este agendamento?
                  O horário fica livre para
                  outras pessoas.
                </p>

                <div class="confirmacao__botoes">
                  <AppBotao
                    :desabilitado="
                      cancelandoId ===
                      a.agendamentoId
                    "
                    @click="cancelar(a)"
                  >
                    {{
                      cancelandoId ===
                      a.agendamentoId
                        ? 'Cancelando…'
                        : 'Sim, cancelar'
                    }}
                  </AppBotao>

                  <AppBotao
                    variante="texto"
                    :desabilitado="
                      cancelandoId ===
                      a.agendamentoId
                    "
                    @click="desistir"
                  >
                    Manter
                  </AppBotao>
                </div>
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
}
</style>
