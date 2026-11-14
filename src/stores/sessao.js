import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { abrirSessao } from '@/api/sessoes'

const CHAVE = 'reservice.sessao'

function lerSalva() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) ?? null
  } catch {
    return null
  }
}

// Lê o campo `exp` do JWT, se houver. Sem `exp` legível, quem decide é o Backend 1 (401).
function lerExpiracao(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null
  } catch {
    return null
  }
}

export const useSessaoStore = defineStore('sessao', () => {
  const dados = ref(lerSalva())

  const token = computed(() => dados.value?.token ?? null)
  const profissionalNome = computed(() => dados.value?.profissionalNome ?? '')
  const profissionalSlug = computed(() => dados.value?.profissionalSlug ?? '')
  // Momento (ms) em que o token vence, ou null se não der para saber.
  const expiraEm = computed(() => (token.value ? lerExpiracao(token.value) : null))

  function tokenValido() {
    if (!token.value) return false
    const exp = expiraEm.value
    return exp === null || exp > Date.now()
  }

  async function entrar(credenciais) {
    const resposta = await abrirSessao(credenciais)
    dados.value = resposta
    localStorage.setItem(CHAVE, JSON.stringify(resposta))
  }

  function sair() {
    dados.value = null
    localStorage.removeItem(CHAVE)
  }

  return { token, profissionalNome, profissionalSlug, expiraEm, tokenValido, entrar, sair }
})
