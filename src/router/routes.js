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

    children: [
      {
        path: '',
        redirect: '/dashboard'
      },

      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['admin']
        }
      },

      {
        path: 'clientes',
        name: 'clientes',
        component: () => import('pages/ClientesPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['admin']
        }
      },

      {
        path: 'empleados',
        name: 'empleados',
        component: () => import('pages/EmpleadosPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['admin']
        }
      },

      {
        path: 'citas',
        name: 'citas',
        component: () => import('pages/CitasPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['admin']
        }
      },

      {
        path: 'mis-citas',
        name: 'mis-citas',
        component: () => import('pages/MisCitasPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['empleado']
        }
      },

      {
        path: 'servicios',
        name: 'servicios',
        component: () => import('pages/ServiciosPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['admin', 'empleado']
        }
      },

      {
        path: 'calendario',
        name: 'calendario',
        component: () => import('pages/CalendarioPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['admin']
        }
      },

      {
        path: 'pagos',
        name: 'pagos',
        component: () => import('pages/PagosPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['admin']
        }
      },

      {
        path: 'caja-diaria',
        name: 'caja-diaria',
        component: () => import('pages/CajaDiariaPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['admin']
        }
      },

      {
        path: 'reporte-empleados',
        name: 'reporte-empleados',
        component: () => import('pages/ReporteEmpleadosPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['admin']
        }
      },

      {
        path: 'historial',
        name: 'historial',
        component: () => import('pages/HistorialPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['admin']
        }
      },

      {
        path: 'historial-clientes',
        name: 'historial-clientes',
        component: () => import('pages/HistorialClientesPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['admin']
        }
      },

      {
        path: 'auditoria',
        name: 'auditoria',
        component: () => import('pages/AuditoriaPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['admin']
        }
      },

      {
        path: 'configuracion',
        name: 'configuracion',
        component: () => import('pages/ConfiguracionPage.vue'),
        meta: {
          requiresAuth: true,
          roles: ['admin']
        }
      }
    ]
  },

  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes