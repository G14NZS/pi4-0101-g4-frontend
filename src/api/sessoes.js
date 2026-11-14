import http from './http'

// CT1 abrirSessao: devolve { token, profissionalId, profissionalNome, profissionalSlug }.
export async function abrirSessao({ email, senha }) {
  const { data } = await http.post('/sessoes', { email, senha })
  return data
}
