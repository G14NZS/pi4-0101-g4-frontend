<script setup>
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { criarAgendamento, listarHorariosLivres } from '@/api/agendamentos'
import { listarServicos } from '@/api/servicos'
import AppAviso from '@/components/AppAviso.vue'
import AppBotao from '@/components/AppBotao.vue'
import AppIcone from '@/components/AppIcone.vue'
import CampoFormulario from '@/components/CampoFormulario.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import { useClienteStore } from '@/stores/cliente'
import { guardarPendente, lerPendente, limparPendente } from '@/utils/agendamentoPendente'
import {
  formatarDiaLongo,
  formatarDuracao,
  formatarHora,
  formatarPreco,
  formatarTelefone,
  normalizarTelefone,
  paraDataIso,
  partesDoDia,
} from '@/utils/formatos'

// Quantos dias, a partir de hoje, o cliente pode escolher.
const DIAS_VISIVEIS = 21
const NOME_MAX = 100
const MENSAGEM_INDISPONIVEL =
  'Esse horário não está mais disponível: outra pessoa agendou antes de você. Atualizamos os horários livres, escolha outro.'

const route = useRoute()
const router = useRouter()
const cliente = useClienteStore()
const slug = computed(() => route.params.profissionalSlug)

// escolha -> revisao -> confirmado
const etapa = ref('escolha')

// Página (CT3 listarServicos)
const carregando = ref(true)
const erroPagina = ref('')
const naoEncontrado = ref(false)
const profissionalNome = ref('')
const servicos = ref([])

// Escolhas
const servicoId = ref(null)
const data = ref(null)
const inicio = ref(null)

// Horários (CT5 listarHorariosLivres)
const horarios = ref([])
const carregandoHorarios = ref(false)
const erroHorarios = ref('')
const avisoIndisponivel = ref('')
const secaoHorarios = ref(null)
let pedidoHorarios = 0

// Dados do cliente
const dados = reactive({ clienteNome: '', clienteTelefone: '' })
const errosCampos = reactive({ horario: '', clienteNome: '', clienteTelefone: '' })

// Confirmação (CT7 criarAgendamento)
const enviando = ref(false)
const erroConfirmar = ref('')
const agendamento = ref(null)

const dias = computed(() => {
  const hoje = new Date()
  return Array.from({ length: DIAS_VISIVEIS }, (_, i) =>
    paraDataIso(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + i)),
  )
})

const servico = computed(() => servicos.value.find((s) => s.servicoId === servicoId.value) ?? null)

// Fim previsto pela duração do serviço, só para mostrar no resumo antes do CT7.
const fimPrevisto = computed(() => {
  if (!inicio.value || !servico.value) return ''
  const [h, m] = formatarHora(inicio.value).split(':').map(Number)
  const total = h * 60 + m + servico.value.duracaoMinutos
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
})

function rotuloDia(dia, i) {
  if (i === 0) return 'Hoje'
  if (i === 1) return 'Amanhã'
  return partesDoDia(dia).semana
}

async function carregarPagina() {
  carregando.value = true
  erroPagina.value = ''
  naoEncontrado.value = false
  try {
    const resposta = await listarServicos(slug.value)
    profissionalNome.value = resposta.profissionalNome
    servicos.value = resposta.servicos
    document.title = `Agendar com ${resposta.profissionalNome}`
  } catch (e) {
    naoEncontrado.value = e.erro === 'PROFISSIONAL_NAO_ENCONTRADO'
    erroPagina.value = e.mensagem
  } finally {
    carregando.value = false
  }
}

async function carregarHorarios() {
  if (!servicoId.value || !data.value) return
  // Só vale a resposta do último pedido (o cliente pode trocar de dia rápido).
  const pedido = ++pedidoHorarios
  carregandoHorarios.value = true
  erroHorarios.value = ''
  horarios.value = []
  try {
    const resposta = await listarHorariosLivres(slug.value, {
      servicoId: servicoId.value,
      data: data.value,
    })
    if (pedido === pedidoHorarios) horarios.value = resposta.horariosLivres
  } catch (e) {
    if (pedido === pedidoHorarios) erroHorarios.value = e.mensagem
  } finally {
    if (pedido === pedidoHorarios) carregandoHorarios.value = false
  }
}

function escolherServico(id) {
  if (servicoId.value === id) return
  servicoId.value = id
  inicio.value = null
  data.value ??= dias.value[0]
  carregarHorarios()
}

function escolherDia(dia) {
  if (data.value === dia) return
  data.value = dia
  inicio.value = null
  avisoIndisponivel.value = ''
  carregarHorarios()
}

function escolherHorario(horario) {
  inicio.value = horario
  errosCampos.horario = ''
  avisoIndisponivel.value = ''
}

function validar() {
  errosCampos.horario = inicio.value ? '' : 'Escolha um horário livre.'

  const nome = dados.clienteNome.trim()
  errosCampos.clienteNome = !nome
    ? 'Informe o seu nome.'
    : nome.length > NOME_MAX
      ? `O nome pode ter até ${NOME_MAX} caracteres.`
      : ''

  errosCampos.clienteTelefone = normalizarTelefone(dados.clienteTelefone)
    ? ''
    : 'Informe um celular com DDD, por exemplo (19) 98888-7777.'

  return !errosCampos.horario && !errosCampos.clienteNome && !errosCampos.clienteTelefone
}

function irPara(proxima) {
  etapa.value = proxima
  erroConfirmar.value = ''
  window.scrollTo({ top: 0 })
}

function revisar() {
  if (!validar()) return
  dados.clienteTelefone = formatarTelefone(normalizarTelefone(dados.clienteTelefone))
  irPara('revisao')
}

// Sem conta, o cliente sai para entrar ou criar uma e volta direto para a revisão.
function pedirLogin(aba) {
  guardarPendente({
    profissionalSlug: slug.value,
    servicoId: servicoId.value,
    data: data.value,
    inicio: inicio.value,
    clienteNome: dados.clienteNome.trim(),
    clienteTelefone: dados.clienteTelefone,
  })
  router.push({
    name: 'entrar-cliente',
    query: { voltar: route.fullPath, ...(aba === 'criar' && { aba }) },
  })
}

// O horário foi ocupado (ou passou) entre a escolha e a confirmação:
// volta para a escolha, avisa e busca os horários livres de novo.
async function horarioPerdido(mensagem) {
  inicio.value = null
  irPara('escolha')
  avisoIndisponivel.value = mensagem
  await carregarHorarios()
  await nextTick()
  secaoHorarios.value?.scrollIntoView({ block: 'start' })
}

async function confirmar() {
  if (!cliente.logado) return
  erroConfirmar.value = ''
  enviando.value = true
  try {
    const clienteNome = dados.clienteNome.trim()
    const clienteTelefone = normalizarTelefone(dados.clienteTelefone)
    agendamento.value = await criarAgendamento({
      servicoId: servicoId.value,
      inicio: inicio.value,
      clienteTelefone,
      clienteNome,
    })
    cliente.atualizarDados({ clienteNome, clienteTelefone })
    irPara('confirmado')
  } catch (e) {
    if (e.erro === 'HORARIO_INDISPONIVEL' || e.erro === 'DATA_INVALIDA') {
      await horarioPerdido(MENSAGEM_INDISPONIVEL)
    } else if (e.erro === 'TELEFONE_INVALIDO' || e.erro === 'NOME_OBRIGATORIO') {
      irPara('escolha')
      errosCampos[e.erro === 'TELEFONE_INVALIDO' ? 'clienteTelefone' : 'clienteNome'] = e.mensagem
    } else {
      erroConfirmar.value = e.mensagem
    }
  } finally {
    enviando.value = false
  }
}

function agendarOutro() {
  inicio.value = null
  agendamento.value = null
  irPara('escolha')
  carregarHorarios()
}

// Volta do login/cadastro do cliente com as escolhas que estavam na tela.
async function restaurarPendente() {
  const pendente = lerPendente()
  if (!pendente || pendente.profissionalSlug !== slug.value) return
  limparPendente()

  if (!servicos.value.some((s) => s.servicoId === pendente.servicoId)) return
  servicoId.value = pendente.servicoId
  data.value = dias.value.includes(pendente.data) ? pendente.data : dias.value[0]
  dados.clienteNome = pendente.clienteNome ?? ''
  dados.clienteTelefone = pendente.clienteTelefone ?? ''
  await carregarHorarios()

  if (!horarios.value.includes(pendente.inicio)) {
    if (pendente.inicio) avisoIndisponivel.value = MENSAGEM_INDISPONIVEL
    return
  }
  inicio.value = pendente.inicio
  if (cliente.logado && validar()) irPara('revisao')
}

onMounted(async () => {
  await carregarPagina()
  if (erroPagina.value) return
  if (cliente.logado) {
    dados.clienteNome = cliente.clienteNome
    dados.clienteTelefone = cliente.clienteTelefone ? formatarTelefone(cliente.clienteTelefone) : ''
  }
  await restaurarPendente()
})

function sairCliente() {
  cliente.sair()
}
</script>

<template>
  <SiteHeader>
    <div v-if="cliente.logado" class="usuario">
      <span class="usuario__nome">
        <AppIcone nome="usuario" :tamanho="18" />
        {{ cliente.clienteNome }}
      </span>
      <AppBotao variante="texto" @click="sairCliente">
        <AppIcone nome="sair" :tamanho="18" />
        Sair
      </AppBotao>
    </div>
  </SiteHeader>

  <main class="conteudo pagina">
    <!-- Carregando / erro do CT3 -->
    <p v-if="carregando" class="estado">Carregando a agenda…</p>

    <div v-else-if="erroPagina" class="coluna-estreita">
      <div class="cartao estado-cartao">
        <AppIcone nome="alerta" :tamanho="36" class="estado-cartao__icone" />
        <h1 class="cartao__titulo">
          {{ naoEncontrado ? 'Link não encontrado' : 'Não foi possível abrir a agenda' }}
        </h1>
        <p v-if="naoEncontrado">
          Confira o endereço que o profissional te enviou. Pode ter faltado alguma letra.
        </p>
        <AppAviso v-else tipo="erro">{{ erroPagina }}</AppAviso>
        <AppBotao v-if="!naoEncontrado" variante="contorno" @click="carregarPagina">
          Tentar de novo
        </AppBotao>
      </div>
    </div>

    <!-- Etapa 1: escolha de serviço, dia, horário e dados -->
    <template v-else-if="etapa === 'escolha'">
      <div class="introducao">
        <p class="sobretitulo">Agendar horário</p>
        <h1 class="titulo">{{ profissionalNome }}</h1>
        <p>Escolha o serviço, o dia e um horário livre.</p>
      </div>

      <div class="grade">
        <form class="passos" novalidate @submit.prevent="revisar">
          <!-- Serviço -->
          <section class="cartao" aria-labelledby="passo-servico">
            <h2 id="passo-servico" class="cartao__titulo">
              <span class="numero">1</span> Serviço
            </h2>

            <div v-if="!servicos.length" class="vazio">
              <AppIcone nome="lista" :tamanho="28" class="vazio__icone" />
              <p>Este profissional ainda não cadastrou serviços para agendamento.</p>
            </div>

            <ul v-else class="servicos">
              <li v-for="item in servicos" :key="item.servicoId">
                <button
                  type="button"
                  :aria-pressed="item.servicoId === servicoId"
                  :class="['servico', { 'servico--ativo': item.servicoId === servicoId }]"
                  @click="escolherServico(item.servicoId)"
                >
                  <span>
                    <span class="servico__nome">{{ item.servicoNome }}</span>
                    <span class="servico__duracao">
                      <AppIcone nome="relogio" :tamanho="15" />
                      {{ formatarDuracao(item.duracaoMinutos) }}
                    </span>
                  </span>
                  <span class="servico__preco">{{ formatarPreco(item.preco) }}</span>
                </button>
              </li>
            </ul>
          </section>

          <!-- Dia e horário -->
          <section
            ref="secaoHorarios"
            class="cartao"
            aria-labelledby="passo-horario"
            :aria-busy="carregandoHorarios"
          >
            <h2 id="passo-horario" class="cartao__titulo">
              <span class="numero">2</span> Dia e horário
            </h2>

            <p v-if="!servicoId" class="dica">Escolha um serviço para ver os horários livres.</p>

            <template v-else>
              <div class="dias" role="group" aria-label="Dia">
                <button
                  v-for="(dia, i) in dias"
                  :key="dia"
                  type="button"
                  :aria-pressed="dia === data"
                  :aria-label="formatarDiaLongo(dia)"
                  :class="['dia', { 'dia--ativo': dia === data }]"
                  @click="escolherDia(dia)"
                >
                  <span class="dia__semana">{{ rotuloDia(dia, i) }}</span>
                  <span class="dia__numero">{{ partesDoDia(dia).dia }}</span>
                  <span class="dia__mes">{{ partesDoDia(dia).mes }}</span>
                </button>
              </div>

              <p class="dia-escolhido">
                <AppIcone nome="calendario" :tamanho="16" />
                {{ formatarDiaLongo(data) }}
              </p>

              <AppAviso v-if="avisoIndisponivel" tipo="erro">{{ avisoIndisponivel }}</AppAviso>

              <p v-if="carregandoHorarios" class="dica">Buscando horários livres…</p>

              <template v-else-if="erroHorarios">
                <AppAviso tipo="erro">{{ erroHorarios }}</AppAviso>
                <AppBotao variante="contorno" @click="carregarHorarios">Tentar de novo</AppBotao>
              </template>

              <div v-else-if="!horarios.length" class="vazio">
                <AppIcone nome="relogio" :tamanho="28" class="vazio__icone" />
                <p>Nenhum horário livre neste dia. Experimente outro dia.</p>
              </div>

              <div v-else class="horarios" role="group" aria-label="Horário">
                <button
                  v-for="horario in horarios"
                  :key="horario"
                  type="button"
                  :aria-pressed="horario === inicio"
                  :class="['horario', { 'horario--ativo': horario === inicio }]"
                  @click="escolherHorario(horario)"
                >
                  {{ formatarHora(horario) }}
                </button>
              </div>

              <span v-if="errosCampos.horario" class="erro-campo" role="alert">
                {{ errosCampos.horario }}
              </span>
            </template>
          </section>

          <!-- Dados do cliente -->
          <section class="cartao" aria-labelledby="passo-dados">
            <h2 id="passo-dados" class="cartao__titulo">
              <span class="numero">3</span> Seus dados
            </h2>
            <CampoFormulario
              id="cliente-nome"
              v-model="dados.clienteNome"
              rotulo="Nome"
              placeholder="Maria Souza"
              autocomplete="name"
              :erro="errosCampos.clienteNome"
              :maxlength="NOME_MAX"
              required
            />
            <CampoFormulario
              id="cliente-telefone"
              v-model="dados.clienteTelefone"
              rotulo="Celular"
              tipo="tel"
              placeholder="(19) 98888-7777"
              dica="É para ele que enviamos o lembrete por SMS 3 horas antes."
              autocomplete="tel"
              inputmode="tel"
              :erro="errosCampos.clienteTelefone"
              required
            />
          </section>

          <AppBotao
            tipo="submit"
            tamanho="g"
            bloco
            :desabilitado="!servicos.length"
          >
            Revisar agendamento
            <AppIcone nome="seta-direita" :tamanho="18" espessura="2.2" />
          </AppBotao>
        </form>

        <!-- Resumo ao lado (desktop) -->
        <aside class="cartao resumo" aria-label="Resumo">
          <h2 class="cartao__titulo">Resumo</h2>
          <dl class="detalhes">
            <div>
              <dt>Serviço</dt>
              <dd>{{ servico?.servicoNome ?? '—' }}</dd>
            </div>
            <div>
              <dt>Dia</dt>
              <dd>{{ servico && data ? formatarDiaLongo(data) : '—' }}</dd>
            </div>
            <div>
              <dt>Horário</dt>
              <dd>{{ inicio ? `${formatarHora(inicio)} às ${fimPrevisto}` : '—' }}</dd>
            </div>
            <div v-if="servico">
              <dt>Valor</dt>
              <dd>{{ formatarPreco(servico.preco) }}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </template>

    <!-- Etapa 2: revisão e confirmação -->
    <div v-else-if="etapa === 'revisao'" class="coluna-estreita">
      <div class="introducao introducao--centro">
        <p class="sobretitulo">Quase lá</p>
        <h1 class="titulo">Confira o agendamento</h1>
      </div>

      <div class="cartao">
        <dl class="detalhes">
          <div>
            <dt>Profissional</dt>
            <dd>{{ profissionalNome }}</dd>
          </div>
          <div>
            <dt>Serviço</dt>
            <dd>{{ servico.servicoNome }} · {{ formatarDuracao(servico.duracaoMinutos) }}</dd>
          </div>
          <div>
            <dt>Dia</dt>
            <dd>{{ formatarDiaLongo(data) }}</dd>
          </div>
          <div>
            <dt>Horário</dt>
            <dd>{{ formatarHora(inicio) }} às {{ fimPrevisto }}</dd>
          </div>
          <div>
            <dt>Valor</dt>
            <dd>{{ formatarPreco(servico.preco) }}</dd>
          </div>
          <div>
            <dt>Nome</dt>
            <dd>{{ dados.clienteNome }}</dd>
          </div>
          <div>
            <dt>Celular</dt>
            <dd>{{ dados.clienteTelefone }}</dd>
          </div>
        </dl>

        <AppAviso v-if="erroConfirmar" tipo="erro">{{ erroConfirmar }}</AppAviso>

        <template v-if="cliente.logado">
          <AppBotao tamanho="g" bloco :desabilitado="enviando" @click="confirmar">
            <AppIcone nome="check" :tamanho="18" espessura="2.2" />
            {{ enviando ? 'Confirmando…' : 'Confirmar agendamento' }}
          </AppBotao>
        </template>

        <template v-else>
          <AppAviso tipo="info">
            Para confirmar, entre na sua conta ou crie uma. Suas escolhas ficam guardadas e você
            volta direto para cá.
          </AppAviso>
          <div class="acoes">
            <AppBotao tamanho="g" bloco @click="pedirLogin('entrar')">Entrar e confirmar</AppBotao>
            <AppBotao variante="contorno" tamanho="g" bloco @click="pedirLogin('criar')">
              Criar conta
            </AppBotao>
          </div>
        </template>

        <AppBotao variante="texto" :desabilitado="enviando" @click="irPara('escolha')">
          <AppIcone nome="seta-esquerda" :tamanho="18" espessura="2.2" />
          Voltar e alterar
        </AppBotao>
      </div>
    </div>

    <!-- Etapa 3: confirmado (resposta do CT7) -->
    <div v-else class="coluna-estreita">
      <div class="cartao confirmado" role="status">
        <AppIcone nome="check" :tamanho="56" espessura="1.8" class="confirmado__icone" />
        <h1 class="titulo">Agendamento confirmado!</h1>
        <p class="confirmado__texto">
          {{ agendamento.clienteNome }}, seu horário com {{ profissionalNome }} está reservado.
        </p>

        <dl class="detalhes">
          <div>
            <dt>Serviço</dt>
            <dd>{{ agendamento.servicoNome }}</dd>
          </div>
          <div>
            <dt>Dia</dt>
            <dd>{{ formatarDiaLongo(agendamento.inicio) }}</dd>
          </div>
          <div>
            <dt>Horário</dt>
            <dd>{{ formatarHora(agendamento.inicio) }} às {{ formatarHora(agendamento.fim) }}</dd>
          </div>
        </dl>

        <AppAviso tipo="info">
          Você recebe um lembrete por SMS 3 horas antes do horário.
        </AppAviso>

        <AppBotao variante="contorno" tamanho="g" bloco @click="agendarOutro">
          Agendar outro horário
        </AppBotao>
      </div>
    </div>
  </main>
</template>

<style scoped>
.usuario {
  display: flex;
  align-items: center;
  gap: 8px;
}

.usuario__nome {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--cor-texto-suave);
}

.pagina {
  padding-top: 16px;
  padding-bottom: 80px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.estado {
  margin: 48px 0;
  text-align: center;
  color: var(--cor-texto-mudo);
}

.coluna-estreita {
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.introducao {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.introducao--centro {
  text-align: center;
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

.grade {
  display: grid;
  grid-template-columns: minmax(0, 7fr) minmax(0, 4fr);
  gap: 24px;
  align-items: start;
}

.passos {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cartao {
  background: var(--cor-superficie);
  border-radius: 24px;
  padding: 28px;
  box-shadow: var(--sombra-cartao);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cartao__titulo {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: 22px;
  letter-spacing: -0.01em;
}

.numero {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--cor-destaque-claro);
  color: var(--cor-destaque);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--fonte-texto);
  font-size: 16px;
}

.dica {
  margin: 0;
  color: var(--cor-texto-mudo);
}

.vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 28px 16px;
  text-align: center;
  color: var(--cor-texto-mudo);
  background: var(--cor-fundo);
  border-radius: 16px;
}

.vazio p {
  margin: 0;
  max-width: 340px;
}

.vazio__icone {
  color: var(--cor-destaque);
}

/* Serviços */
.servicos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.servico {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border: 2px solid var(--cor-borda);
  border-radius: 14px;
  background: var(--cor-superficie);
  font: inherit;
  color: var(--cor-texto);
  text-align: left;
  cursor: pointer;
}

.servico:hover {
  border-color: var(--cor-destaque);
}

.servico--ativo {
  border-color: var(--cor-destaque);
  background: var(--cor-destaque-claro);
}

.servico__nome {
  display: block;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.servico__duracao {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  color: var(--cor-texto-mudo);
}

.servico__preco {
  flex-shrink: 0;
  font-weight: 700;
}

/* Dias */
.dias {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
  scroll-snap-type: x proximity;
}

.dia {
  flex: 0 0 auto;
  width: 68px;
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  border: 1.5px solid var(--cor-borda);
  border-radius: 14px;
  background: var(--cor-superficie);
  font: inherit;
  color: var(--cor-texto);
  cursor: pointer;
  scroll-snap-align: start;
}

.dia:hover {
  border-color: var(--cor-destaque);
}

.dia--ativo,
.dia--ativo:hover {
  background: var(--cor-destaque);
  border-color: var(--cor-destaque);
  color: #fff;
}

.dia__semana,
.dia__mes {
  font-size: 13px;
  text-transform: capitalize;
}

.dia__numero {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}

.dia-escolhido {
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--cor-texto-suave);
}

/* Horários */
.horarios {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(84px, 1fr));
  gap: 8px;
}

.horario {
  min-height: 44px;
  border: 1.5px solid var(--cor-borda);
  border-radius: 10px;
  background: var(--cor-superficie);
  font: inherit;
  color: var(--cor-texto);
  cursor: pointer;
}

.horario:hover {
  border-color: var(--cor-destaque);
}

.horario--ativo,
.horario--ativo:hover {
  background: var(--cor-destaque);
  border-color: var(--cor-destaque);
  color: #fff;
  font-weight: 600;
}

.erro-campo {
  font-size: 14px;
  font-weight: 600;
  color: var(--cor-erro-texto);
}

/* Resumo */
.resumo {
  position: sticky;
  top: 24px;
}

.detalhes {
  margin: 0;
  display: flex;
  flex-direction: column;
}

.detalhes > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--cor-borda);
}

.detalhes > div:last-child {
  border-bottom: none;
}

.detalhes dt {
  color: var(--cor-texto-mudo);
}

.detalhes dd {
  margin: 0;
  font-weight: 600;
  text-align: right;
  overflow-wrap: anywhere;
}

.acoes {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Estados e confirmação */
.estado-cartao,
.confirmado {
  align-items: center;
  text-align: center;
}

.estado-cartao p,
.confirmado__texto {
  margin: 0;
  color: var(--cor-texto-suave);
}

.estado-cartao__icone {
  color: var(--cor-erro-texto);
}

.confirmado__icone {
  color: var(--cor-destaque);
}

.confirmado .detalhes,
.confirmado :deep(.aviso) {
  width: 100%;
  text-align: left;
}

@media (max-width: 860px) {
  .grade {
    grid-template-columns: minmax(0, 1fr);
  }

  /* No celular o resumo sai: a tela de revisão mostra tudo antes de confirmar. */
  .resumo {
    display: none;
  }
}

@media (max-width: 600px) {
  .cartao {
    padding: 22px 20px;
  }

  .titulo {
    font-size: 30px;
  }

  .usuario__nome {
    display: none;
  }
}
</style>
