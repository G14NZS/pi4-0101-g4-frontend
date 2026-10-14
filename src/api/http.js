import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Todo erro do Backend 1 vem como { erro: CODIGO, mensagem: texto para a tela }.
// Normalizamos para que as telas sempre recebam { status, erro, mensagem }.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error
    return Promise.reject({
      status: response?.status ?? 0,
      erro: response?.data?.erro ?? 'ERRO_DE_REDE',
      mensagem: response?.data?.mensagem ?? 'Não foi possível falar com o servidor.',
    })
  },
)

export default http
