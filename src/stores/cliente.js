import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import { abrirSessaoCliente, cadastrarCliente } from '@/api/clientes'

const CHAVE = 'reservice.cliente'

function lerSalva() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE)) ?? null
  } catch {
    return null
  }
}

function lerExpiracao(token) {
  try {
    const payload = JSON.parse(
      atob(
        token
          .split('.')[1]
          .replace(/-/g, '+')
          .replace(/_/g, '/'),
      ),
    )

    return typeof payload.exp === 'number'
      ? payload.exp * 1000
      : null
  } catch {
    return null
  }
}

export const useClienteStore = defineStore('cliente', () => {
  const dados = ref(lerSalva())

  const token = computed(() => dados.value?.token ?? null)

  const clienteId = computed(
    () => dados.value?.clienteId ?? null,
  )

  const clienteNome = computed(
    () => dados.value?.clienteNome ?? '',
  )

  const clienteTelefone = computed(
    () => dados.value?.clienteTelefone ?? '',
  )

  const expiraEm = computed(() =>
    token.value
      ? lerExpiracao(token.value)
      : null,
  )

  function tokenValido() {
    if (!token.value) return false

    const exp = expiraEm.value

    return exp === null || exp > Date.now()
  }

  const logado = computed(
    () => Boolean(token.value) && tokenValido(),
  )

  function salvar(sessao) {
    dados.value = sessao

    localStorage.setItem(
      CHAVE,
      JSON.stringify(sessao),
    )
  }

  async function entrar({ telefone, senha }) {
    const resposta =
      await abrirSessaoCliente({
        telefone,
        senha,
      })

    salvar({
      ...resposta,
      clienteTelefone: telefone,
    })
  }

  async function criarConta({
    nome,
    telefone,
    senha,
  }) {
    await cadastrarCliente({
      nome,
      telefone,
      senha,
    })

    // Após o cadastro, abre a sessão automaticamente.
    await entrar({
      telefone,
      senha,
    })
  }

  function sair() {
    dados.value = null
    localStorage.removeItem(CHAVE)
  }

  return {
    token,
    clienteId,
    clienteNome,
    clienteTelefone,
    expiraEm,
    logado,
    tokenValido,
    criarConta,
    entrar,
    sair,
  }
})