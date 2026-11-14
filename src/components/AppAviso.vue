<script setup>
import AppIcone from './AppIcone.vue'

defineProps({
  // erro | info | sucesso
  tipo: { type: String, default: 'info' },
})

const ICONES = { erro: 'alerta', info: 'info', sucesso: 'check' }
const PAPEIS = { erro: 'alert', sucesso: 'status' }
</script>

<template>
  <div :role="PAPEIS[tipo]" :class="['aviso', `aviso--${tipo}`]">
    <AppIcone :nome="ICONES[tipo] ?? 'info'" class="aviso__icone" />
    <span><slot /></span>
  </div>
</template>

<style scoped>
.aviso {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 15px;
}

.aviso__icone {
  flex-shrink: 0;
  margin-top: 2px;
}

.aviso--erro {
  padding: 14px 16px;
  background: var(--cor-erro-fundo);
  border-radius: 12px;
  color: var(--cor-erro-texto);
}

.aviso--info {
  padding: 16px 18px;
  background: var(--cor-destaque-claro);
  border-radius: 16px;
  color: var(--cor-aviso-texto);
}

.aviso--sucesso {
  padding: 14px 16px;
  background: var(--cor-destaque-claro);
  border-radius: 12px;
  color: var(--cor-destaque-hover);
  font-weight: 600;
}
</style>
