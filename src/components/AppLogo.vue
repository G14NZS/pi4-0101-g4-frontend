<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <RouterLink :to="{ name: 'home' }" class="logo">
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      stroke-width="2.2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      class="logo__icone"
    >
      <rect x="4" y="6" width="24" height="22" rx="5" />
      <path d="M4 13h24M11 3v6M21 3v6M12 20l3 3 6-6" />
    </svg>
    <span class="logo__nome">ReService</span>
  </RouterLink>
</template>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--cor-texto);
  text-decoration: none;
}

.logo:hover {
  color: var(--cor-texto);
}

.logo__icone {
  color: var(--cor-destaque);
}

.logo__nome {
  font-family: var(--fonte-titulo);
  font-weight: 700;
  font-size: 22px;
  letter-spacing: -0.01em;
}
</style>
