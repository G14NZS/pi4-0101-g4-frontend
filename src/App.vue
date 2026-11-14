<script setup>
import { onUnmounted, watch } from 'vue'
import { RouterView, useRouter } from 'vue-router'

import { useSessaoStore } from '@/stores/sessao'

const router = useRouter()
const sessao = useSessaoStore()

// Quando o token vence com uma tela de profissional aberta, volta para o login.
let timer = null

function encerrarSessaoVencida() {
  sessao.sair()
  const atual = router.currentRoute.value
  if (atual.meta.requerLogin) {
    router.push({ name: 'entrar-profissional', query: { expirou: '1', voltar: atual.fullPath } })
  }
}

watch(
  () => sessao.expiraEm,
  (expiraEm) => {
    clearTimeout(timer)
    if (expiraEm === null) return
    // setTimeout não aceita mais que ~24,8 dias; a guarda de rota cobre o resto.
    const espera = Math.min(expiraEm - Date.now(), 2 ** 31 - 1)
    timer = setTimeout(encerrarSessaoVencida, Math.max(espera, 0))
  },
  { immediate: true },
)

onUnmounted(() => clearTimeout(timer))
</script>

<template>
  <RouterView />
</template>
