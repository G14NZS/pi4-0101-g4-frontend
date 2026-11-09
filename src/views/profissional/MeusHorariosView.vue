<script setup>
import { computed, reactive, ref } from 'vue'

import AppAviso from '@/components/AppAviso.vue'
import AppBotao from '@/components/AppBotao.vue'
import AppIcone from '@/components/AppIcone.vue'
import CampoFormulario from '@/components/CampoFormulario.vue'
import SiteHeader from '@/components/SiteHeader.vue'

import { definirHorarios } from '@/api/horarios'

const salvando = ref(false)
const erro = ref('')
const sucesso = ref('')

const dias = [
  { valor: 'segunda', rotulo: 'Segunda-feira' },
  { valor: 'terca', rotulo: 'Terça-feira' },
  { valor: 'quarta', rotulo: 'Quarta-feira' },
  { valor: 'quinta', rotulo: 'Quinta-feira' },
  { valor: 'sexta', rotulo: 'Sexta-feira' },
  { valor: 'sabado', rotulo: 'Sábado' },
  { valor: 'domingo', rotulo: 'Domingo' },
]

const grade = reactive(
  Object.fromEntries(
    dias.map((dia) => [dia.valor, []])
  )
)

function adicionarFaixa(dia) {
  grade[dia].push({
    horaInicio: '09:00',
    horaFim: '12:00',
  })
}

function removerFaixa(dia, indice) {
  grade[dia].splice(indice, 1)
}

const horariosParaEnviar = computed(() => {
  return dias.flatMap((dia) =>
    grade[dia.valor].map((faixa) => ({
      diaSemana: dia.valor,
      horaInicio: faixa.horaInicio,
      horaFim: faixa.horaFim,
    }))
  )
})

async function salvar() {
  erro.value = ''
  sucesso.value = ''
  salvando.value = true

  try {
    await definirHorarios(horariosParaEnviar.value)

    sucesso.value = 'Horários atualizados com sucesso.'
  } catch (e) {
    if (e.erro === 'HORARIOS_SOBREPOSTOS') {
      erro.value = 'Existem horários sobrepostos na grade.'
    } else if (e.erro === 'HORARIO_INVALIDO') {
      erro.value = 'Confira os horários informados.'
    } else if (e.erro === 'DADOS_INVALIDOS') {
      erro.value = 'Alguns dados da grade são inválidos.'
    } else {
      erro.value =
        e.mensagem ?? 'Não foi possível salvar os horários.'
    }
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <SiteHeader>
    <AppBotao :to="{ name: 'home' }" variante="texto">
      <AppIcone nome="seta-esquerda" :tamanho="18" espessura="2.2" />
      Voltar
    </AppBotao>
  </SiteHeader>

  <main class="conteudo pagina">
    <div class="coluna">
      <div class="introducao">
        <h1 class="titulo">Meus horários</h1>
        <p>
          Defina os dias e horários em que você atende.
        </p>
      </div>

      <AppAviso v-if="erro" tipo="erro">
        {{ erro }}
      </AppAviso>

      <AppAviso v-if="sucesso" tipo="sucesso">
        {{ sucesso }}
      </AppAviso>

      <div class="grade">
        <section
          v-for="dia in dias"
          :key="dia.valor"
          class="cartao-dia"
        >
          <div class="cabecalho-dia">
            <div>
              <h2>{{ dia.rotulo }}</h2>

              <p v-if="grade[dia.valor].length === 0">
                Não atende neste dia.
              </p>
            </div>

            <AppBotao
              tipo="button"
              variante="texto"
              @click="adicionarFaixa(dia.valor)"
            >
              + Adicionar horário
            </AppBotao>
          </div>

          <div
            v-for="(faixa, indice) in grade[dia.valor]"
            :key="indice"
            class="faixa"
          >
            <CampoFormulario
              :id="`${dia.valor}-inicio-${indice}`"
              v-model="faixa.horaInicio"
              rotulo="Início"
              tipo="time"
              required
            />

            <CampoFormulario
              :id="`${dia.valor}-fim-${indice}`"
              v-model="faixa.horaFim"
              rotulo="Fim"
              tipo="time"
              required
            />

            <button
              type="button"
              class="remover"
              @click="removerFaixa(dia.valor, indice)"
            >
              Remover
            </button>
          </div>
        </section>
      </div>

      <section class="preview">
        <div>
          <span class="preview__rotulo">Prévia</span>
          <h2>Como o cliente vê</h2>
        </div>

        <div class="preview__dias">
          <div
            v-for="dia in dias"
            :key="dia.valor"
            class="preview__dia"
          >
            <strong>{{ dia.rotulo }}</strong>

            <span v-if="grade[dia.valor].length === 0">
              Indisponível
            </span>

            <span
              v-for="(faixa, indice) in grade[dia.valor]"
              v-else
              :key="indice"
            >
              {{ faixa.horaInicio }} às {{ faixa.horaFim }}
            </span>
          </div>
        </div>
      </section>

      <AppBotao
        tipo="button"
        tamanho="g"
        bloco
        :disabled="salvando"
        @click="salvar"
      >
        {{ salvando ? 'Salvando...' : 'Salvar horários' }}
      </AppBotao>
    </div>
  </main>
</template>

<style scoped>
.pagina {
  padding-top: 32px;
  padding-bottom: 80px;
}

.coluna {
  width: min(100%, 900px);
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

.introducao p {
  margin: 0;
  color: var(--cor-texto-suave);
}

.titulo {
  margin: 0;
  font-family: var(--fonte-titulo);
  font-size: 34px;
}

.grade {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cartao-dia,
.preview {
  background: var(--cor-superficie);
  border-radius: 24px;
  padding: 24px;
  box-shadow: var(--sombra-cartao);
}

.cabecalho-dia {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
}

.cabecalho-dia h2,
.preview h2 {
  margin: 0;
}

.cabecalho-dia p {
  margin: 4px 0 0;
  color: var(--cor-texto-suave);
}

.faixa {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 16px;
  align-items: end;
  margin-top: 16px;
}

.remover {
  min-height: 44px;
  border: none;
  background: transparent;
  color: var(--cor-destaque);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.preview {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.preview__rotulo {
  display: block;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--cor-texto-suave);
  margin-bottom: 4px;
}

.preview__dias {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.preview__dia {
  background: var(--cor-trilho);
  border-radius: 16px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview__dia span {
  color: var(--cor-texto-suave);
}

@media (max-width: 700px) {
  .cabecalho-dia {
    align-items: flex-start;
    flex-direction: column;
  }

  .faixa {
    grid-template-columns: 1fr;
  }

  .preview__dias {
    grid-template-columns: 1fr;
  }
}
</style>