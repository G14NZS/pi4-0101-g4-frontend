import http from './http'

// CT5 listarHorariosLivres:
// devolve { data, servicoId, horariosLivres }. Sem login.
export async function listarHorariosLivres(
  profissionalSlug,
  { servicoId, data },
) {
  const { data: resposta } = await http.get(
    `/profissionais/${encodeURIComponent(profissionalSlug)}/horarios-livres`,
    {
      params: {
        servicoId,
        data,
      },
    },
  )

  return resposta
}

// CT7 criarAgendamento:
// cria um agendamento para o cliente autenticado.
export async function criarAgendamento({
  servicoId,
  inicio,
  token,
}) {
  const { data } = await http.post(
    '/agendamentos',
    {
      servicoId,
      inicio,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      sessaoCliente: true,
    },
  )

  return data
}

// CT11 listarAgendamentosDoDia:
// devolve { data, agendamentos } do profissional autenticado.
export async function listarAgendamentosDoDia(data) {
  const { data: resposta } = await http.get(
    '/agendamentos',
    {
      params: {
        data,
      },
    },
  )

  return resposta
}

// CT8 listarAgendamentosDoCliente:
// devolve os agendamentos futuros e confirmados
// pertencentes ao cliente autenticado.
export async function listarAgendamentosDoCliente(token) {
  const { data } = await http.get(
    '/agendamentos/do-cliente',
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      sessaoCliente: true,
    },
  )

  return data
}

// CT9 cancelarAgendamento:
// cancela um agendamento pertencente ao cliente autenticado.
export async function cancelarAgendamento(
  agendamentoId,
  token,
) {
  const { data } = await http.patch(
    `/agendamentos/${encodeURIComponent(agendamentoId)}/cancelamento`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      sessaoCliente: true,
    },
  )

  return data
}

// H10 remarcarAgendamento:
// altera o horário de um agendamento pertencente
// ao cliente autenticado.
export async function remarcarAgendamento(
  agendamentoId,
  inicio,
  token,
) {
  const { data } = await http.patch(
    `/agendamentos/${encodeURIComponent(agendamentoId)}/remarcacao`,
    {
      inicio,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      sessaoCliente: true,
    },
  )

  return data
}