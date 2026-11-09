import http from './http'

export function definirHorarios(horarios) {
  return http.put('/horarios', {
    horarios,
  })
}

export function listarHorariosLivres({
  profissionalId,
  data,
  duracaoMinutos,
}) {
  return http.get('/horarios/livres', {
    params: {
      profissionalId,
      data,
      duracaoMinutos,
    },
  })
}