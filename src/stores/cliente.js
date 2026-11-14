import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

// Ainda não existe contrato de conta do cliente no Backend 1 (o CT7 é sem login).
// Enquanto isso, a conta fica só neste navegador: guardamos nome, celular e e-mail
// (nunca a senha). Quando o contrato existir, só `entrar` e `criarConta` mudam.
const CHAVE_SESSAO = 'reservice.cliente'
const CHAVE_CONTAS = 'reservice.contasCliente'

function ler(chave, padrao) {
  try {
    return JSON.parse(localStorage.getItem(chave)) ?? padrao
  } catch {
    return padrao
  }
}

function gravar(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor))
  } catch {
    // Sem armazenamento (aba anônima, bloqueio): a sessão vale só enquanto a página estiver aberta.
  }
}

// Mesmo formato de erro que as telas recebem do http.js.
function erro(codigo, mensagem) {
  return { status: 0, erro: codigo, mensagem }
}

export const useClienteStore = defineStore('cliente', () => {
  const dados = ref(ler(CHAVE_SESSAO, null))

  const logado = computed(() => Boolean(dados.value))
  const clienteNome = computed(() => dados.value?.clienteNome ?? '')
  const clienteTelefone = computed(() => dados.value?.clienteTelefone ?? '')

  function abrir(conta) {
    dados.value = conta
    gravar(CHAVE_SESSAO, conta)
  }

  async function criarConta({ clienteNome, clienteTelefone, email }) {
    const contas = ler(CHAVE_CONTAS, {})
    const chave = email.toLowerCase()
    if (contas[chave]) {
      throw erro('EMAIL_JA_CADASTRADO', 'Já existe uma conta com esse e-mail. Entre com ela.')
    }
    const conta = { clienteNome, clienteTelefone, email: chave }
    contas[chave] = conta
    gravar(CHAVE_CONTAS, contas)
    abrir(conta)
  }

  // TODO: conferir a senha no Backend 1 quando o contrato de login do cliente existir.
  async function entrar({ email }) {
    const conta = ler(CHAVE_CONTAS, {})[email.toLowerCase()]
    if (!conta) {
      throw erro('CONTA_NAO_ENCONTRADA', 'Não encontramos uma conta com esse e-mail. Crie a sua.')
    }
    abrir(conta)
  }

  // Mantém o nome e o celular usados no último agendamento.
  function atualizarDados({ clienteNome, clienteTelefone }) {
    if (!dados.value) return
    const conta = { ...dados.value, clienteNome, clienteTelefone }
    const contas = ler(CHAVE_CONTAS, {})
    contas[conta.email] = conta
    gravar(CHAVE_CONTAS, contas)
    abrir(conta)
  }

  function sair() {
    dados.value = null
    try {
      localStorage.removeItem(CHAVE_SESSAO)
    } catch {
      // nada a limpar
    }
  }

  return { logado, clienteNome, clienteTelefone, criarConta, entrar, atualizarDados, sair }
})
