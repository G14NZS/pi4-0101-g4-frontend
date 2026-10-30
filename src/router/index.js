import { createRouter, createWebHistory } from 'vue-router'

import { useSessaoStore } from '@/stores/sessao'
import HomeView from '@/views/HomeView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { titulo: 'ReService' },
  },
  {
    path: '/profissional/entrar',
    name: 'entrar-profissional',
    component: () => import('@/views/profissional/EntrarProfissionalView.vue'),
    meta: { titulo: 'Entrar como profissional' },
  },
  {
    path: '/profissional/servicos',
    name: 'meus-servicos',
    component: () => import('@/views/profissional/MeusServicosView.vue'),
    meta: { titulo: 'Meus serviços', requerLogin: true },
  },
  {
    path: '/cliente/entrar',
    name: 'entrar-cliente',
    component: () => import('@/views/cliente/EntrarClienteView.vue'),
    meta: { titulo: 'Área do cliente' },
  },
  {
    // Link do profissional (E4): aberto sem login, por exemplo /p/ana-unhas.
    path: '/p/:profissionalSlug',
    name: 'agendar',
    component: () => import('@/views/cliente/AgendarView.vue'),
    meta: { titulo: 'Agendar horário' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const sessao = useSessaoStore()

  if (to.meta.requerLogin && !sessao.tokenValido()) {
    // Tinha token, mas venceu: avisa na tela de login.
    const expirou = Boolean(sessao.token)
    sessao.sair()
    return {
      name: 'entrar-profissional',
      query: { voltar: to.fullPath, ...(expirou && { expirou: '1' }) },
    }
  }

  // Já logado não precisa ver o login de novo.
  if (to.name === 'entrar-profissional' && sessao.tokenValido()) {
    return { name: 'meus-servicos' }
  }
})

router.afterEach((to) => {
  document.title = to.meta.titulo ?? 'ReService'
})

export default router
