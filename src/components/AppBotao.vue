<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const props = defineProps({
  // Com `to`, vira um link do Vue Router; sem, um <button>.
  to: { type: [String, Object], default: null },
  tipo: { type: String, default: 'button' },
  // primario | contorno | texto | claro | contorno-claro
  variante: { type: String, default: 'primario' },
  // p (44px) | m (48px) | g (52px)
  tamanho: { type: String, default: 'p' },
  bloco: { type: Boolean, default: false },
  desabilitado: { type: Boolean, default: false },
})

const classes = computed(() => [
  'botao',
  `botao--${props.variante}`,
  `botao--${props.tamanho}`,
  { 'botao--bloco': props.bloco },
])
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="classes">
    <slot />
  </RouterLink>
  <button v-else :type="tipo" :class="classes" :disabled="desabilitado">
    <slot />
  </button>
</template>

<style scoped>
.botao {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1.5px solid transparent;
  border-radius: 999px;
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 0.15s,
    color 0.15s;
}

.botao:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.botao--p {
  min-height: 44px;
  padding: 0 20px;
}

.botao--m {
  min-height: 48px;
  padding: 0 24px;
}

.botao--g {
  min-height: 52px;
  padding: 0 24px;
}

.botao--bloco {
  display: flex;
  width: 100%;
}

.botao--primario {
  background: var(--cor-destaque);
  color: #fff;
  border-color: var(--cor-destaque);
}

.botao--primario.botao--g {
  padding: 0 28px;
}

.botao--primario:hover:not(:disabled) {
  background: var(--cor-destaque-hover);
  border-color: var(--cor-destaque-hover);
  color: #fff;
}

.botao--contorno {
  background: transparent;
  color: var(--cor-texto);
  border-color: var(--cor-texto);
}

.botao--contorno:hover {
  background: rgba(22, 32, 28, 0.05);
  color: var(--cor-texto);
}

.botao--texto {
  background: transparent;
  color: var(--cor-texto);
  padding: 0 16px;
}

.botao--texto:hover {
  color: var(--cor-destaque);
}

.botao--claro {
  background: #fff;
  color: var(--cor-texto);
  border-color: #fff;
}

.botao--claro:hover {
  background: var(--cor-destaque-claro);
  color: var(--cor-texto);
}

.botao--contorno-claro {
  background: transparent;
  color: #fff;
  border-color: #fff;
}

.botao--contorno-claro:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}
</style>
