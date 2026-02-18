import { createRouter, createWebHistory } from '@ionic/vue-router'
import type { RouteRecordRaw } from 'vue-router'
import TabsLayout from '@/views/TabsLayout.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/home',
  },
  {
    path: '/tabs/',
    component: TabsLayout,
    children: [
      {
        path: '',
        redirect: '/tabs/home',
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/HomePage.vue'),
      },
      {
        path: 'mascotas',
        name: 'Mascotas',
        component: () => import('@/views/MascotasPage.vue'),
      },
      {
        path: 'perdidas',
        name: 'Perdidas',
        component: () => import('@/views/PerdidasPage.vue'),
      },
      {
        path: 'perfil',
        name: 'Perfil',
        component: () => import('@/views/ProfilePage.vue'),
      },
    ],
  },
  // Detail pages (outside tabs for full-screen experience)
  {
    path: '/mascotas/:id',
    name: 'MascotaDetail',
    component: () => import('@/views/MascotaDetailPage.vue'),
  },
  {
    path: '/perdidas/:id',
    name: 'PerdidaDetail',
    component: () => import('@/views/PerdidaDetailPage.vue'),
  },
  {
    path: '/publicar',
    name: 'Publicar',
    component: () => import('@/views/PublicarPage.vue'),
  },
  {
    path: '/editar-mascota/:id',
    name: 'EditarMascota',
    component: () => import('@/views/PublicarPage.vue'),
  },
  {
    path: '/editar-perdida/:id',
    name: 'EditarPerdida',
    component: () => import('@/views/PublicarPerdidaPage.vue'),
  },
  {
    path: '/publicar-perdida',
    name: 'PublicarPerdida',
    component: () => import('@/views/PublicarPerdidaPage.vue'),
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsPage.vue'),
  },
  {
    path: '/notifications',
    name: 'Notifications',
    component: () => import('@/views/NotificationsPage.vue'),
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginPage.vue'),
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterPage.vue'),
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: () => import('@/views/OnboardingPage.vue'),
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const seenOnboarding = localStorage.getItem('seenOnboarding')
  if (!seenOnboarding && to.path !== '/onboarding') {
    next('/onboarding')
  } else {
    next()
  }
})

export default router
