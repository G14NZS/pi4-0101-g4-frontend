<script setup>
import { reactive, ref } from 'vue'
import { useRoute } from 'vue-router'

import AppAviso from '@/components/AppAviso.vue'
import AppBotao from '@/components/AppBotao.vue'
import AppIcone from '@/components/AppIcone.vue'
import CampoFormulario from '@/components/CampoFormulario.vue'
import SiteHeader from '@/components/SiteHeader.vue'

const route = useRoute()

// A tela inicial abre direto na aba "Criar conta" com ?aba=criar.
const aba = ref(route.query.aba === 'criar' ? 'criar' : 'entrar')

const login = reactive({ email: '', senha: '' })
const cadastro = reactive({ nome: '', telefone: '', email: '', senha: '' })

function entrar() {
  // TODO: integrar com o Backend 1 quando o contrato de login do cliente existir.
}

function criarConta() {
  // TODO: integrar com o Backend 1 quando o contrato de cadastro do cliente existir.
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
        <h1 class="titulo">Área do cliente</h1>
        <p>Veja, cancele ou remarque seus agendamentos.</p>
      </div>

      <div class="cartao">
        <div role="tablist" aria-label="Entrar ou criar conta" class="abas">
          <button
            id="aba-entrar"
            type="button"
            role="tab"
            aria-controls="painel-entrar"
            :aria-selected="aba === 'entrar'"
            :class="['aba', { 'aba--ativa': aba === 'entrar' }]"
            @click="aba = 'entrar'"
          >
            Entrar
          </button>
          <button
            id="aba-criar"
            type="button"
            role="tab"
            aria-controls="painel-criar"
            :aria-selected="aba === 'criar'"
            :class="['aba', { 'aba--ativa': aba === 'criar' }]"
            @click="aba = 'criar'"
          >
            Criar conta
          </button>
        </div>

        <form
          v-if="aba === 'entrar'"
          id="painel-entrar"
          role="tabpanel"
          aria-labelledby="aba-entrar"
          class="formulario"
          @submit.prevent="entrar"
        >
          <CampoFormulario
            id="login-email"
            v-model="login.email"
            rotulo="E-mail"
            tipo="email"
            placeholder="voce@exemplo.com"
            autocomplete="username"
            required
          />
          <CampoFormulario
            id="login-senha"
            v-model="login.senha"
            rotulo="Senha"
            tipo="password"
            autocomplete="current-password"
            required
          />
          <AppBotao tipo="submit" tamanho="g" bloco>Entrar</AppBotao>
          <p class="troca">
            Ainda não tem conta?
            <button type="button" class="troca__botao" @click="aba = 'criar'">Criar conta</button>
          </p>
        </form>

        <form
          v-else
          id="painel-criar"
          role="tabpanel"
          aria-labelledby="aba-criar"
          class="formulario"
          @submit.prevent="criarConta"
        >
          <CampoFormulario
            id="cad-nome"
            v-model="cadastro.nome"
            rotulo="Nome"
            placeholder="Maria Souza"
            autocomplete="name"
            required
          />
          <CampoFormulario
            id="cad-telefone"
            v-model="cadastro.telefone"
            rotulo="Celular"
            tipo="tel"
            placeholder="(19) 98888-7777"
            dica="É para ele que enviamos o lembrete por SMS."
            autocomplete="tel"
            required
          />
          <CampoFormulario
            id="cad-email"
            v-model="cadastro.email"
            rotulo="E-mail"
            tipo="email"
            placeholder="voce@exemplo.com"
            autocomplete="email"
            required
          />
          <CampoFormulario
            id="cad-senha"
            v-model="cadastro.senha"
            rotulo="Senha"
            tipo="password"
            dica="Mínimo de 8 caracteres."
            autocomplete="new-password"
            minlength="8"
            required
          />
          <AppBotao tipo="submit" tamanho="g" bloco>Criar conta</AppBotao>
          <p class="troca">
            Já tem conta?
            <button type="button" class="troca__botao" @click="aba = 'entrar'">Entrar</button>
          </p>
        </form>
      </div>

      <AppAviso tipo="info">
        Para marcar um horário novo, abra o link que o profissional te enviou. Se você ainda não
        estiver logado, pedimos o login na hora de confirmar.
      </AppAviso>
    </div>
  </main>
</template>

<style scoped>
.pagina {
  padding-top: 32px;
  padding-bottom: 80px;
  display: flex;
  justify-content: center;
}

.coluna {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.introducao {
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: center;
}

.introducao p {
  margin: 0;
  color: var(--cor-texto-suave);
}

.titulo {
  margin: 0;
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: 34px;
  letter-spacing: -0.01em;
}

.cartao {
  background: var(--cor-superficie);
  border-radius: 24px;
  padding: 28px;
  box-shadow: var(--sombra-cartao);
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* Abas */
.abas {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px;
  padding: 4px;
  background: var(--cor-trilho);
  border-radius: 999px;
}

.aba {
  min-height: 44px;
  border: none;
  border-radius: 999px;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  background: transparent;
  color: var(--cor-texto);
}

.aba--ativa {
  background: var(--cor-superficie);
  box-shadow: 0 1px 3px rgba(22, 32, 28, 0.15);
}

/* Formulários */
.formulario {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.troca {
  margin: 0;
  text-align: center;
  font-size: 15px;
  color: var(--cor-texto-suave);
}

.troca__botao {
  border: none;
  background: none;
  padding: 0;
  font: inherit;
  font-weight: 600;
  color: var(--cor-destaque);
  text-decoration: underline;
  cursor: pointer;
}

.troca__botao:hover {
  color: var(--cor-destaque-hover);
}

@media (max-width: 600px) {
  .cartao {
    padding: 20px;
  }
}
</style>
