const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),

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
        path: 'pagos',
        name: 'pagos',
        component: () => import('pages/PagosPage.vue')
      },

      {
        path: 'calendario',
        name: 'calendario',
        component: () => import('pages/CalendarioPage.vue')
      },

      {
        path: 'historial',
        name: 'historial',
        component: () => import('pages/HistorialPage.vue')
      }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes