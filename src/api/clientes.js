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