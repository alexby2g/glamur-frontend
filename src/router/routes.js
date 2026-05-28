import { route } from 'quasar/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory
} from 'vue-router'

import routes from './routes'

function obtenerUsuarioLocal () {
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

function normalizarRol (rol) {
  const rolLimpio = String(rol || '').toLowerCase().trim()

  if (['admin', 'empleado'].includes(rolLimpio)) {
    return rolLimpio
  }

  return 'admin'
}

function obtenerRolUsuario () {
  const usuario = obtenerUsuarioLocal()

  return normalizarRol(usuario?.rol || 'admin')
}

function rutaInicioPorRol (rol) {
  if (rol === 'empleado') {
    return '/servicios'
  }

  return '/dashboard'
}

function usuarioTienePermiso (to, rol) {
  const rutasConRoles = to.matched
    .map(record => record.meta?.roles)
    .filter(Boolean)

  if (rutasConRoles.length === 0) {
    return true
  }

  return rutasConRoles.some(roles => roles.includes(rol))
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

    if (requiresAuth && !token) {
      next('/login')
      return
    }

    if (guestOnly && token) {
      next(rutaInicioPorRol(rol))
      return
    }

    if (requiresAuth && token && !usuarioTienePermiso(to, rol)) {
      next({
        path: rutaInicioPorRol(rol),
        replace: true
      })
      return
    }

    next()
  })

  return Router
})