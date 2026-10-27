<script setup>
import AppIcone from './AppIcone.vue'

defineProps({
  // erro | info
  tipo: { type: String, default: 'info' },
})
</script>

<template>
  <div :role="tipo === 'erro' ? 'alert' : undefined" :class="['aviso', `aviso--${tipo}`]">
    <AppIcone :nome="tipo === 'erro' ? 'alerta' : 'info'" class="aviso__icone" />
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
</style>
