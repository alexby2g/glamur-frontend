import { route } from 'quasar/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory
} from 'vue-router'

import routes from './routes'

function obtenerUsuarioLocal() {
  try {
    const usuarioGuardado = localStorage.getItem('glamur_user')

    if (!usuarioGuardado) {
      return null
    }

    return JSON.parse(usuarioGuardado)
  } catch {
    return null
  }
}

function normalizarRol(rol) {
  const rolLimpio = String(rol || '').toLowerCase().trim()

  if (['admin', 'empleado'].includes(rolLimpio)) {
    return rolLimpio
  }

  return 'admin'
}

function obtenerRolUsuario() {
  const usuario = obtenerUsuarioLocal()

  return normalizarRol(usuario?.rol || 'admin')
}

function rutaInicioPorRol(rol) {
  if (rol === 'empleado') {
    return '/servicios'
  }

  return '/dashboard'
}

function empleadoPuedeEntrar(path) {
  const rutasPermitidasEmpleado = [
    '/servicios'
  ]

  return rutasPermitidasEmpleado.includes(path)
}

export default route(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  Router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('glamur_token')
    const rol = obtenerRolUsuario()

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const guestOnly = to.matched.some(record => record.meta.guestOnly)

    // Si la ruta necesita sesión y no hay token, mandar al login
    if (requiresAuth && !token) {
      next('/login')
      return
    }

    // Si ya inició sesión y quiere entrar a login/register, mandarlo a su inicio
    if (guestOnly && token) {
      next(rutaInicioPorRol(rol))
      return
    }

    // Si es empleado, bloquear rutas de administrador aunque escriba la URL manualmente
    if (requiresAuth && token && rol === 'empleado') {
      if (!empleadoPuedeEntrar(to.path)) {
        next({
          path: rutaInicioPorRol(rol),
          replace: true
        })
        return
      }
    }

    next()
  })

  return Router
})