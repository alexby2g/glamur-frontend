const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/LoginPage.vue'),
    meta: {
      guestOnly: true
    }
  },

  {
    path: '/register',
    name: 'register',
    component: () => import('pages/RegisterPage.vue'),
    meta: {
      guestOnly: true
    }
  },

  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: {
      requiresAuth: true
    },

    children: [
      {
        path: '',
        redirect: '/dashboard'
      },

      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue')
      },

      {
        path: 'clientes',
        name: 'clientes',
        component: () => import('pages/ClientesPage.vue')
      },

      {
        path: 'citas',
        name: 'citas',
        component: () => import('pages/CitasPage.vue')
      },

      {
        path: 'calendario',
        name: 'calendario',
        component: () => import('pages/CalendarioPage.vue')
      },

      {
        path: 'pagos',
        name: 'pagos',
        component: () => import('pages/PagosPage.vue')
      },

      {
        path: 'historial',
        name: 'historial',
        component: () => import('pages/HistorialPage.vue')
      },

      {
        path: 'historial-clientes',
        name: 'historial-clientes',
        component: () => import('pages/HistorialClientesPage.vue')
      }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes