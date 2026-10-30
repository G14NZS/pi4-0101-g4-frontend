// Guarda as escolhas do cliente (serviço, dia, horário, nome e celular) enquanto ele
// sai do link do profissional para entrar ou criar conta, e devolve na volta.
// sessionStorage: vale só para esta aba.
const CHAVE = 'reservice.agendamentoPendente'

export function guardarPendente(pendente) {
  try {
    sessionStorage.setItem(CHAVE, JSON.stringify(pendente))
  } catch {
    // Sem armazenamento: o cliente só precisa escolher de novo.
  }
}

export function lerPendente() {
  try {
    return JSON.parse(sessionStorage.getItem(CHAVE))
  } catch {
    return null
  }
}

export function limparPendente() {
  try {
    sessionStorage.removeItem(CHAVE)
  } catch {
    // nada a limpar
  }
}
