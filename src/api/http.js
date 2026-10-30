import axios from 'axios'

import router from '@/router'
import { useSessaoStore } from '@/stores/sessao'
import { MENSAGEM_PADRAO, MENSAGENS_DE_ERRO } from './erros'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' },
})

// Operações com login (CT2, CT4, CT11) levam `Authorization: Bearer {token}` do CT1.
http.interceptors.request.use((config) => {
  const { token } = useSessaoStore()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Todo erro do Backend 1 vem como { erro: CODIGO, mensagem: texto para a tela }.
// Normalizamos para que as telas sempre recebam { status, erro, mensagem }.
http.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error
    const erro = response?.data?.erro ?? (response ? 'ERRO_DESCONHECIDO' : 'ERRO_DE_REDE')

    // Token vencido ou inválido: encerra a sessão e volta para o login.
    if (erro === 'NAO_AUTENTICADO') {
      useSessaoStore().sair()
      const atual = router.currentRoute.value
      if (atual.name !== 'entrar-profissional') {
        router.push({
          name: 'entrar-profissional',
          query: { expirou: '1', voltar: atual.fullPath },
        })
      }
    }

    return Promise.reject({
      status: response?.status ?? 0,
      erro,
      mensagem: response?.data?.mensagem ?? MENSAGENS_DE_ERRO[erro] ?? MENSAGEM_PADRAO,
    })
  },
)

export default http
