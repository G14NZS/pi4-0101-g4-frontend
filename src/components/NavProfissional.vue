<script setup>
import { RouterLink, useRouter } from 'vue-router'

import AppBotao from './AppBotao.vue'
import AppIcone from './AppIcone.vue'
import { useSessaoStore } from '@/stores/sessao'

// Navegação das telas do profissional (E1, E2, E8): links, nome de quem entrou e "Sair".
const router = useRouter()
const sessao = useSessaoStore()

function sair() {
  sessao.sair()
  router.push({ name: 'entrar-profissional' })
}
</script>

<template>
  <div class="nav">
    <nav class="nav__links" aria-label="Painel do profissional">
      <RouterLink :to="{ name: 'agenda-do-dia' }" class="nav__link">
        <AppIcone nome="calendario" :tamanho="18" />
        Agenda do dia
      </RouterLink>
      <RouterLink :to="{ name: 'meus-servicos' }" class="nav__link">
        <AppIcone nome="lista" :tamanho="18" />
        Meus serviços
      </RouterLink>
    </nav>
    <div class="nav__usuario">
      <span class="nav__nome">
        <AppIcone nome="usuario" :tamanho="18" />
        {{ sessao.profissionalNome }}
      </span>
      <AppBotao variante="texto" @click="sair">
        <AppIcone nome="sair" :tamanho="18" />
        Sair
      </AppBotao>
    </div>
  </div>
</template>

<style scoped>
.nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 24px;
}

.nav__links,
.nav__usuario {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  font-weight: 600;
  color: var(--cor-texto-suave);
  text-decoration: none;
}

.nav__link:hover {
  color: var(--cor-destaque-hover);
}

.nav__link.router-link-exact-active {
  background: var(--cor-destaque-claro);
  color: var(--cor-destaque-hover);
}

.nav__link:focus-visible {
  outline: 2px solid var(--cor-destaque);
  outline-offset: 2px;
}

.nav__nome {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-right: 4px;
  font-weight: 600;
  color: var(--cor-texto-suave);
}

@media (max-width: 600px) {
  .nav__nome {
    display: none;
  }

  .nav__link {
    padding: 0 10px;
  }
}
</style>
