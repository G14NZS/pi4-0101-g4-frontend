import http from './http'

export async function cadastrarCliente({ nome, telefone, senha }) {
  const { data } = await http.post('/clientes', {
    nome,
    telefone,
    senha,
  })

  return data
}

export async function abrirSessaoCliente({ telefone, senha }) {
  const { data } = await http.post('/clientes/sessoes', {
    telefone,
    senha,
  })

  return data
}
export async function solicitarRecuperacaoSenha(telefone) {
  const { data } = await http.post(
    '/clientes/recuperacao-senha',
    { telefone },
  )

  return data
}

export async function confirmarRecuperacaoSenha({
  telefone,
  codigo,
  novaSenha,
}) {
  const { data } = await http.post(
    '/clientes/recuperacao-senha/confirmar',
    {
      telefone,
      codigo,
      novaSenha,
    },
  )

  return data
}