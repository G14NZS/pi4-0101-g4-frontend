<script setup>
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

// <input type="number"> devolve número pelo v-model.
const modelo = defineModel({ type: [String, Number], default: '' })

const props = defineProps({
  id: { type: String, required: true },
  rotulo: { type: String, required: true },
  tipo: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  dica: { type: String, default: '' },
  erro: { type: String, default: '' },
})

const descritoPor = computed(
  () =>
    [props.erro && `${props.id}-erro`, props.dica && `${props.id}-dica`]
      .filter(Boolean)
      .join(' ') || undefined,
)
</script>

<!-- Atributos extras (required, autocomplete, minlength...) vão direto para o <input>. -->
<template>
  <div class="campo">
    <label :for="id" class="campo__rotulo">{{ rotulo }}</label>
    <input
      :id="id"
      v-model="modelo"
      :type="tipo"
      :placeholder="placeholder"
      :aria-describedby="descritoPor"
      :aria-invalid="erro ? 'true' : undefined"
      :class="['campo__entrada', { 'campo__entrada--erro': erro }]"
      v-bind="$attrs"
    />
    <span v-if="erro" :id="`${id}-erro`" class="campo__erro">{{ erro }}</span>
    <span v-if="dica" :id="`${id}-dica`" class="campo__dica">{{ dica }}</span>
  </div>
</template>

<style scoped>
.campo {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.campo__rotulo {
  font-weight: 600;
  font-size: 15px;
}

.campo__entrada {
  width: 100%;
  min-height: 48px;
  padding: 0 14px;
  border: 1.5px solid var(--cor-borda-campo);
  border-radius: 12px;
  font: inherit;
  color: var(--cor-texto);
  background: var(--cor-superficie);
}

.campo__entrada:focus-visible {
  border-color: var(--cor-destaque);
  outline-offset: 0;
}

.campo__entrada--erro {
  border-color: var(--cor-erro-texto);
}

.campo__erro {
  font-size: 14px;
  font-weight: 600;
  color: var(--cor-erro-texto);
}

.campo__dica {
  font-size: 14px;
  color: var(--cor-texto-mudo);
}
</style>
