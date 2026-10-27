<script setup>
import AppLogo from './AppLogo.vue'
</script>

<!-- Cabeçalho comum: logo à esquerda, conteúdo do slot (navegação, "Voltar"...) à direita. -->
<template>
  <header class="cabecalho conteudo">
    <AppLogo />
    <slot />
  </header>
</template>

<style scoped>
.cabecalho {
  padding-top: 24px;
  padding-bottom: 24px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
</style>
