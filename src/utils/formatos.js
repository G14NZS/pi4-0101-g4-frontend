// Formatação para a tela dos campos dos contratos (preço, duração, datas e telefone).

const formatoPreco = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatarPreco(preco) {
  return formatoPreco.format(Number(preco))
}

export function formatarDuracao(minutos) {
  const horas = Math.floor(minutos / 60)
  const resto = minutos % 60
  if (!horas) return `${resto} min`
  return resto ? `${horas} h ${resto} min` : `${horas} h`
}

// Datas vão sem fuso, no horário de Brasília (visão geral). Montamos tudo pelos
// componentes locais para não passar por UTC.
function doisDigitos(n) {
  return String(n).padStart(2, '0')
}

// Date -> "2026-10-20"
export function paraDataIso(data) {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`
}

// "2026-10-20" ou "2026-10-20T14:00:00" -> Date local
export function lerData(texto) {
  const [ano, mes, dia] = texto.slice(0, 10).split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

const formatoDiaLongo = new Intl.DateTimeFormat('pt-BR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})
const formatoDiaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
const formatoMes = new Intl.DateTimeFormat('pt-BR', { month: 'short' })

// "2026-10-20" -> "Terça-feira, 20 de outubro"
export function formatarDiaLongo(texto) {
  const formatado = formatoDiaLongo.format(lerData(texto))
  return formatado.charAt(0).toUpperCase() + formatado.slice(1)
}

// "2026-10-20" -> { semana: "ter", dia: 20, mes: "out" }
export function partesDoDia(texto) {
  const data = lerData(texto)
  return {
    semana: formatoDiaSemana.format(data).replace('.', ''),
    dia: data.getDate(),
    mes: formatoMes.format(data).replace('.', ''),
  }
}

// "2026-10-20T14:00:00" -> "14:00"
export function formatarHora(dataHora) {
  return dataHora.slice(11, 16)
}

// Telefone vai como +55, DDD e número, só dígitos (visão geral).
// Aceita "(19) 98888-7777", "19988887777" ou "+55 19 98888-7777"; devolve null se não der.
export function normalizarTelefone(texto) {
  let digitos = String(texto).replace(/\D/g, '')
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith('55')) {
    digitos = digitos.slice(2)
  }
  if (digitos.length !== 10 && digitos.length !== 11) return null
  if (digitos.startsWith('0')) return null
  return `+55${digitos}`
}

// "+5519988887777" -> "(19) 98888-7777"
export function formatarTelefone(telefone) {
  const digitos = String(telefone).replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')
  if (digitos.length < 10) return telefone
  const ddd = digitos.slice(0, 2)
  const numero = digitos.slice(2)
  const corte = numero.length - 4
  return `(${ddd}) ${numero.slice(0, corte)}-${numero.slice(corte)}`
}
