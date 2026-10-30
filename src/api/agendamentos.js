import http from './http'

// CT5 listarHorariosLivres: devolve { data, servicoId, horariosLivres }. Sem login.
export async function listarHorariosLivres(profissionalSlug, { servicoId, data }) {
  const { data: resposta } = await http.get(
    `/profissionais/${encodeURIComponent(profissionalSlug)}/horarios-livres`,
    { params: { servicoId, data } },
  )
  return resposta
}

// CT7 criarAgendamento: devolve o agendamento confirmado. Sem login no Backend 1.
// `clienteNome` só é obrigatório quando o telefone ainda não está cadastrado.
export async function criarAgendamento({ servicoId, inicio, clienteTelefone, clienteNome }) {
  const { data } = await http.post('/agendamentos', {
    servicoId,
    inicio,
    clienteTelefone,
    ...(clienteNome && { clienteNome }),
  })
  return data
}
