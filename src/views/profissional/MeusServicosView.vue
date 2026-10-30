<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'

import { cadastrarServico, listarServicos } from '@/api/servicos'
import AppAviso from '@/components/AppAviso.vue'
import AppBotao from '@/components/AppBotao.vue'
import AppIcone from '@/components/AppIcone.vue'
import CampoFormulario from '@/components/CampoFormulario.vue'
import SiteHeader from '@/components/SiteHeader.vue'
import { useSessaoStore } from '@/stores/sessao'
import { formatarDuracao, formatarPreco } from '@/utils/formatos'

// Limites do CT2 cadastrarServico (ficha + colunas do CT15 no Backend 1).
const DURACAO_MIN = 15
const DURACAO_MAX = 480
const NOME_MAX = 100
const PRECO_MAX = 99999999.99

const router = useRouter()
const sessao = useSessaoStore()

// Lista (CT3 listarServicos)
const servicos = ref([])
const carregando = ref(true)
const erroLista = ref('')
const destacadoId = ref(null)

// Formulário (CT2 cadastrarServico)
const novo = reactive({ servicoNome: '', duracaoMinutos: '', preco: '' })
const errosCampos = reactive({ servicoNome: '', duracaoMinutos: '', preco: '' })
const erroFormulario = ref('')
const sucesso = ref('')
const enviando = ref(false)

// Aceita "35", "35,5", "35,50" e "35.50".
function lerPreco(texto) {
  const normalizado = String(texto).trim().replace(/\s/g, '').replace(',', '.')
  return /^\d+(\.\d{1,2})?$/.test(normalizado) ? Number(normalizado) : NaN
}

async function carregarServicos() {
  carregando.value = true
  erroLista.value = ''
  try {
    const resposta = await listarServicos(sessao.profissionalSlug)
    servicos.value = resposta.servicos
  } catch (e) {
    erroLista.value = e.mensagem
  } finally {
    carregando.value = false
  }
}

// Mesmas regras que o Backend 1 confere (DADOS_INVALIDOS), para avisar antes de enviar.
function validar() {
  const nome = novo.servicoNome.trim()
  errosCampos.servicoNome = !nome
    ? 'Informe o nome do serviço.'
    : nome.length > NOME_MAX
      ? `O nome do serviço pode ter até ${NOME_MAX} caracteres.`
      : ''

  const duracao = Number(novo.duracaoMinutos)
  errosCampos.duracaoMinutos =
    novo.duracaoMinutos !== '' &&
    Number.isInteger(duracao) &&
    duracao >= DURACAO_MIN &&
    duracao <= DURACAO_MAX
      ? ''
      : `A duração deve ser um número inteiro de ${DURACAO_MIN} a ${DURACAO_MAX} minutos.`

  const preco = lerPreco(novo.preco)
  errosCampos.preco =
    Number.isNaN(preco) || preco > PRECO_MAX
      ? 'Informe um preço válido, sem valor negativo (ex.: 35,00).'
      : ''

  return !errosCampos.servicoNome && !errosCampos.duracaoMinutos && !errosCampos.preco
}

async function cadastrar() {
  erroFormulario.value = ''
  sucesso.value = ''
  if (!validar()) return

  enviando.value = true
  try {
    const criado = await cadastrarServico({
      servicoNome: novo.servicoNome.trim(),
      duracaoMinutos: Number(novo.duracaoMinutos),
      preco: lerPreco(novo.preco),
    })
    sucesso.value = `"${criado.servicoNome}" foi adicionado aos seus serviços.`
    destacadoId.value = criado.servicoId
    Object.assign(novo, { servicoNome: '', duracaoMinutos: '', preco: '' })
    await carregarServicos()
  } catch (e) {
    // NAO_AUTENTICADO já leva de volta ao login (interceptor do http.js).
    if (e.erro === 'SERVICO_DUPLICADO') {
      errosCampos.servicoNome = e.mensagem
    } else {
      erroFormulario.value = e.mensagem
    }
  } finally {
    enviando.value = false
  }
}

function sair() {
  sessao.sair()
  router.push({ name: 'entrar-profissional' })
}

onMounted(carregarServicos)
</script>

<template>
  <SiteHeader>
    <div class="usuario">
      <span class="usuario__nome">
        <AppIcone nome="usuario" :tamanho="18" />
        {{ sessao.profissionalNome }}
      </span>
      <AppBotao variante="texto" @click="sair">
        <AppIcone nome="sair" :tamanho="18" />
        Sair
      </AppBotao>
    </div>
  </SiteHeader>

  <main class="conteudo pagina">
    <div class="introducao">
      <p class="sobretitulo">Painel do profissional</p>
      <h1 class="titulo">Meus serviços</h1>
      <p>Cadastre o que você oferece. Seus clientes escolhem entre estes serviços ao agendar.</p>
    </div>

    <div class="grade">
      <form class="cartao formulario" novalidate @submit.prevent="cadastrar">
        <h2 class="cartao__titulo">Novo serviço</h2>

        <AppAviso v-if="erroFormulario" tipo="erro">{{ erroFormulario }}</AppAviso>
        <AppAviso v-if="sucesso" tipo="sucesso">{{ sucesso }}</AppAviso>

        <CampoFormulario
          id="servico-nome"
          v-model="novo.servicoNome"
          rotulo="Nome do serviço"
          placeholder="Manicure simples"
          :erro="errosCampos.servicoNome"
          :maxlength="NOME_MAX"
          required
        />
        <div class="formulario__linha">
          <CampoFormulario
            id="servico-duracao"
            v-model="novo.duracaoMinutos"
            rotulo="Duração (minutos)"
            tipo="number"
            placeholder="45"
            :dica="`De ${DURACAO_MIN} a ${DURACAO_MAX} minutos.`"
            :erro="errosCampos.duracaoMinutos"
            inputmode="numeric"
            :min="DURACAO_MIN"
            :max="DURACAO_MAX"
            step="1"
            required
          />
          <CampoFormulario
            id="servico-preco"
            v-model="novo.preco"
            rotulo="Preço (R$)"
            placeholder="35,00"
            :erro="errosCampos.preco"
            inputmode="decimal"
            required
          />
        </div>

        <AppBotao tipo="submit" tamanho="g" bloco :desabilitado="enviando">
          <AppIcone nome="mais" :tamanho="18" espessura="2.2" />
          {{ enviando ? 'Salvando…' : 'Adicionar serviço' }}
        </AppBotao>
      </form>

      <section class="cartao lista" aria-labelledby="lista-titulo" :aria-busy="carregando">
        <div class="lista__cabecalho">
          <h2 id="lista-titulo" class="cartao__titulo">Serviços oferecidos</h2>
          <span v-if="!carregando && !erroLista" class="lista__contagem">
            {{ servicos.length }} {{ servicos.length === 1 ? 'serviço' : 'serviços' }}
          </span>
        </div>

        <p v-if="carregando" class="lista__vazia">Carregando seus serviços…</p>

        <template v-else-if="erroLista">
          <AppAviso tipo="erro">{{ erroLista }}</AppAviso>
          <AppBotao variante="contorno" @click="carregarServicos">Tentar de novo</AppBotao>
        </template>

        <div v-else-if="!servicos.length" class="lista__vazia">
          <AppIcone nome="lista" :tamanho="28" class="lista__vazia-icone" />
          <p>Você ainda não cadastrou nenhum serviço. Use o formulário para adicionar o primeiro.</p>
        </div>

        <ul v-else class="servicos">
          <li
            v-for="servico in servicos"
            :key="servico.servicoId"
            :class="['servico', { 'servico--novo': servico.servicoId === destacadoId }]"
          >
            <div>
              <div class="servico__nome">{{ servico.servicoNome }}</div>
              <div class="servico__duracao">
                <AppIcone nome="relogio" :tamanho="15" />
                {{ formatarDuracao(servico.duracaoMinutos) }}
              </div>
            </div>
            <div class="servico__preco">{{ formatarPreco(servico.preco) }}</div>
          </li>
        </ul>
      </section>
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

.grade {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  gap: 24px;
  align-items: start;
}

.cartao {
  background: var(--cor-superficie);
  border-radius: 24px;
  padding: 32px;
  box-shadow: var(--sombra-cartao);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.cartao__titulo {
  margin: 0;
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: 24px;
  letter-spacing: -0.01em;
}

.formulario__linha {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

/* Lista */
.lista__cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
}

.lista__contagem {
  font-size: 15px;
  color: var(--cor-texto-mudo);
}

.lista__vazia {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 32px 16px;
  text-align: center;
  color: var(--cor-texto-mudo);
  background: var(--cor-fundo);
  border-radius: 16px;
}

.lista__vazia p {
  margin: 0;
  max-width: 340px;
}

.lista__vazia-icone {
  color: var(--cor-destaque);
}

.servicos {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.servico {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 14px 18px;
  border: 1.5px solid var(--cor-borda);
  border-radius: 14px;
}

.servico--novo {
  border-color: var(--cor-destaque);
  background: var(--cor-destaque-claro);
}

.servico__nome {
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

@media (max-width: 860px) {
  .grade {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 600px) {
  .cartao {
    padding: 22px 20px;
  }

  .titulo {
    font-size: 30px;
  }

  .formulario__linha {
    grid-template-columns: minmax(0, 1fr);
  }

  .usuario__nome {
    display: none;
  }
}
</style>
