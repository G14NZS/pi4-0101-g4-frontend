import http from './http'

// CT2 cadastrarServico: o profissional vem do token (enviado pelo interceptor do http.js).
export async function cadastrarServico({ servicoNome, duracaoMinutos, preco }) {
  const { data } = await http.post('/servicos', { servicoNome, duracaoMinutos, preco })
  return data
}

// CT3 listarServicos: devolve { profissionalNome, profissionalTelefone, servicos }.
export async function listarServicos(profissionalSlug) {
  const { data } = await http.get(`/profissionais/${encodeURIComponent(profissionalSlug)}/servicos`)
  return data
}
