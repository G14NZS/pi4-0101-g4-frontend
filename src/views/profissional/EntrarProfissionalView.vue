<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

import AppAviso from '@/components/AppAviso.vue'
import AppBotao from '@/components/AppBotao.vue'
import AppIcone from '@/components/AppIcone.vue'
import CampoFormulario from '@/components/CampoFormulario.vue'
import SiteHeader from '@/components/SiteHeader.vue'

const destaques = [
  { icone: 'lista', texto: 'Cadastre seus serviços com duração e preço.' },
  { icone: 'relogio', texto: 'Defina os dias e horários em que atende.' },
  { icone: 'calendario', texto: 'Acompanhe a agenda do dia em ordem de horário.' },
]

const email = ref('')
const senha = ref('')
const erro = ref('')

function entrar() {
  erro.value = ''
  // TODO: chamar CT1 abrirSessao quando o contrato do Backend 1 estiver disponível.
  // Em caso de falha, mostrar a mensagem: erro.value = e.mensagem
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
    <div class="cartao">
      <div class="cartao__lateral">
        <div class="lateral__cabecalho">
          <p class="sobretitulo">Painel do profissional</p>
          <h1 class="lateral__titulo">Sua agenda, do jeito que você atende.</h1>
        </div>
        <ul class="destaques">
          <li v-for="item in destaques" :key="item.icone" class="destaque">
            <AppIcone :nome="item.icone" :tamanho="22" class="destaque__icone" />
            <span>{{ item.texto }}</span>
          </li>
        </ul>
      </div>

      <form class="cartao__formulario" @submit.prevent="entrar">
        <div class="formulario__cabecalho">
          <h2 class="formulario__titulo">Entrar</h2>
          <p>Use o e-mail e a senha da sua conta de profissional.</p>
        </div>

        <AppAviso v-if="erro" tipo="erro">{{ erro }}</AppAviso>

        <CampoFormulario
          id="prof-email"
          v-model="email"
          rotulo="E-mail"
          tipo="email"
          placeholder="ana@exemplo.com"
          autocomplete="username"
          required
        />
        <CampoFormulario
          id="prof-senha"
          v-model="senha"
          rotulo="Senha"
          tipo="password"
          autocomplete="current-password"
          required
        />

        <AppBotao tipo="submit" tamanho="g" bloco>Entrar no painel</AppBotao>

        <p class="nota">
          Ainda não tem acesso? As contas de profissional são criadas pela equipe do sistema.
        </p>
        <p class="nota nota--escura">
          É cliente?
          <RouterLink :to="{ name: 'entrar-cliente' }" class="link-forte">
            Entre na área do cliente
          </RouterLink>
        </p>
      </form>
    </div>
  </main>
</template>

<style scoped>
.pagina {
  padding-top: 32px;
  padding-bottom: 80px;
}

.cartao {
  display: flex;
  flex-wrap: wrap;
  border-radius: 28px;
  overflow: hidden;
  background: var(--cor-superficie);
  box-shadow: var(--sombra-cartao);
}

/* Lateral escura */
.cartao__lateral {
  flex: 1 1 380px;
  min-width: 0;
  background: var(--cor-texto);
  color: #fff;
  padding: 48px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.lateral__cabecalho {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sobretitulo {
  margin: 0;
  font-weight: 600;
  color: var(--cor-destaque-sobre-escuro);
  font-size: 14px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.lateral__titulo {
  margin: 0;
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: 36px;
  line-height: 1.1;
  letter-spacing: -0.01em;
}

.destaques {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.destaque {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  color: var(--cor-texto-sobre-escuro);
}

.destaque__icone {
  flex-shrink: 0;
  margin-top: 3px;
  color: var(--cor-destaque-sobre-escuro);
}

/* Formulário */
.cartao__formulario {
  flex: 1 1 420px;
  min-width: 0;
  padding: 48px;
  display: flex;
  flex-direction: column;
  gap: 22px;
  justify-content: center;
}

.formulario__cabecalho {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.formulario__cabecalho p {
  margin: 0;
  color: var(--cor-texto-suave);
}

.formulario__titulo {
  margin: 0;
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: 30px;
  letter-spacing: -0.01em;
}

.nota {
  margin: 0;
  font-size: 15px;
  color: var(--cor-texto-mudo);
}

.nota--escura {
  color: var(--cor-texto-suave);
}

.link-forte {
  font-weight: 600;
}

@media (max-width: 600px) {
  .cartao__lateral,
  .cartao__formulario {
    padding: 28px 24px;
  }

  .lateral__titulo {
    font-size: 30px;
  }
}
</style>
