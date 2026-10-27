<script setup>
import { computed } from 'vue'

const props = defineProps({
  nome: { type: String, required: true },
  tamanho: { type: [Number, String], default: 20 },
  espessura: { type: [Number, String], default: 2 },
})

const ICONES = {
  'seta-direita': { paths: ['M5 12h14M13 6l6 6-6 6'] },
  'seta-esquerda': { paths: ['M19 12H5M11 6l-6 6 6 6'] },
  link: {
    paths: [
      'M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1',
      'M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1',
    ],
  },
  usuario: { circles: [{ cx: 12, cy: 8, r: 4 }], paths: ['M4 21c0-4 4-6 8-6s8 2 8 6'] },
  lista: { paths: ['M4 6h16M4 12h16M4 18h10'] },
  relogio: { circles: [{ cx: 12, cy: 12, r: 9 }], paths: ['M12 7v5l3 2'] },
  calendario: {
    rects: [{ x: 4, y: 5, width: 16, height: 16, rx: 3 }],
    paths: ['M4 10h16M9 3v4M15 3v4'],
  },
  alerta: { circles: [{ cx: 12, cy: 12, r: 9 }], paths: ['M12 8v5M12 16h.01'] },
  info: { circles: [{ cx: 12, cy: 12, r: 9 }], paths: ['M12 11v5M12 8h.01'] },
}

const icone = computed(() => ICONES[props.nome] ?? {})
</script>

<template>
  <svg
    :width="tamanho"
    :height="tamanho"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="espessura"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <rect v-for="(r, i) in icone.rects" :key="`r${i}`" v-bind="r" />
    <circle v-for="(c, i) in icone.circles" :key="`c${i}`" v-bind="c" />
    <path v-for="(d, i) in icone.paths" :key="`p${i}`" :d="d" />
  </svg>
</template>
