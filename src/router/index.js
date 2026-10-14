import { createRouter, createWebHistory } from 'vue-router'

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
    path: '/cliente/entrar',
    name: 'entrar-cliente',
    component: () => import('@/views/cliente/EntrarClienteView.vue'),
    meta: { titulo: 'Área do cliente' },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = to.meta.titulo ?? 'ReService'
})

export default router
