<template>
  <router-view />
</template>

<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { api } from 'boot/axios'

defineOptions({
  name: 'App'
})

const router = useRouter()

let intervaloNotificaciones = null
let listenerNotificacion = null

const CANAL_ID = 'glamur_pagos'
const STORAGE_NOTIFICADAS = 'glamur_notificaciones_mostradas'

function esAppMovil() {
  return Capacitor.isNativePlatform()
}

function obtenerToken() {
  return localStorage.getItem('glamur_token') || ''
}

function obtenerIdsMostradas() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_NOTIFICADAS) || '[]')
  } catch {
    return []
  }
}

function guardarIdsMostradas(ids) {
  const idsLimpios = [...new Set(ids)].slice(-100)
  localStorage.setItem(STORAGE_NOTIFICADAS, JSON.stringify(idsLimpios))
}

function crearIdNumerico(valor) {
  const texto = String(valor || Date.now())
  let hash = 0

  for (let i = 0; i < texto.length; i++) {
    hash = (hash << 5) - hash + texto.charCodeAt(i)
    hash |= 0
  }

  return Math.abs(hash) + 1000
}

function normalizarListaNotificaciones(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.notificaciones)) return data.notificaciones
  if (Array.isArray(data?.items)) return data.items

  return []
}

function estaLeida(notificacion) {
  return (
    notificacion.leida === true ||
    notificacion.leido === true ||
    notificacion.estado === 'leida' ||
    Boolean(notificacion.read_at)
  )
}

function textoSeguro(valor, respaldo) {
  return String(valor || respaldo || '').trim()
}

function esNotificacionPago(notificacion) {
  const texto = [
    notificacion.tipo,
    notificacion.titulo,
    notificacion.mensaje,
    notificacion.descripcion
  ]
    .join(' ')
    .toLowerCase()

  return texto.includes('pago')
}

async function pedirPermisoNotificaciones() {
  if (!esAppMovil()) return false

  try {
    const permisoActual = await LocalNotifications.checkPermissions()

    if (permisoActual.display === 'granted') {
      return true
    }

    const permisoSolicitado = await LocalNotifications.requestPermissions()

    return permisoSolicitado.display === 'granted'
  } catch (error) {
    console.log('No se pudo pedir permiso de notificaciones:', error)
    return false
  }
}

async function prepararCanalNotificaciones() {
  if (!esAppMovil()) return

  const permiso = await pedirPermisoNotificaciones()

  if (!permiso) {
    console.log('Permiso de notificaciones no concedido')
    return
  }

  try {
    await LocalNotifications.createChannel({
      id: CANAL_ID,
      name: 'Pagos y avisos Glamur',
      description: 'Notificaciones de pagos, citas y avisos del sistema Glamur',
      importance: 5,
      visibility: 1,
      sound: 'default',
      vibration: true,
      lights: true,
      lightColor: '#e91e63'
    })
  } catch (error) {
    console.log('No se pudo crear el canal de notificaciones:', error)
  }

  try {
    listenerNotificacion = await LocalNotifications.addListener(
      'localNotificationActionPerformed',
      (event) => {
        const extra = event?.notification?.extra || {}
        const ruta = extra.route || '/pagos'

        router.push(ruta)
      }
    )
  } catch (error) {
    console.log('No se pudo crear el listener de notificación:', error)
  }
}

async function mostrarNotificacionMovil(notificacion) {
  if (!esAppMovil()) return

  const esPago = esNotificacionPago(notificacion)

  const titulo = textoSeguro(
    notificacion.titulo,
    esPago ? 'Pago registrado' : 'Nueva notificación Glamur'
  )

  const cuerpo = textoSeguro(
    notificacion.mensaje || notificacion.descripcion,
    esPago
      ? 'Se registró un nuevo pago en el sistema.'
      : 'Tienes una nueva notificación en Glamur.'
  )

  const ruta = esPago ? '/pagos' : '/dashboard'

  await LocalNotifications.schedule({
    notifications: [
      {
        id: crearIdNumerico(notificacion.id || `${titulo}-${cuerpo}-${Date.now()}`),
        title: titulo,
        body: cuerpo,
        channelId: CANAL_ID,
        autoCancel: true,
        schedule: {
          at: new Date(Date.now() + 700)
        },
        extra: {
          route: ruta,
          notificacion_id: notificacion.id || null
        }
      }
    ]
  })
}

async function revisarNotificacionesNuevas() {
  if (!esAppMovil()) return

  const token = obtenerToken()

  if (!token) return

  try {
    const { data } = await api.get('/notificaciones')

    const lista = normalizarListaNotificaciones(data)

    const idsMostradas = obtenerIdsMostradas()

    const nuevas = lista
      .filter((notificacion) => !estaLeida(notificacion))
      .filter((notificacion) => !idsMostradas.includes(String(notificacion.id)))
      .slice(0, 5)

    if (nuevas.length === 0) return

    for (const notificacion of nuevas) {
      await mostrarNotificacionMovil(notificacion)

      if (notificacion.id) {
        idsMostradas.push(String(notificacion.id))
      }
    }

    guardarIdsMostradas(idsMostradas)
  } catch (error) {
    console.log('No se pudieron revisar las notificaciones:', error?.message || error)
  }
}

onMounted(async () => {
  await prepararCanalNotificaciones()
  await revisarNotificacionesNuevas()

  intervaloNotificaciones = setInterval(() => {
    revisarNotificacionesNuevas()
  }, 25000)
})

onBeforeUnmount(() => {
  if (intervaloNotificaciones) {
    clearInterval(intervaloNotificaciones)
  }

  if (listenerNotificacion) {
    listenerNotificacion.remove()
  }
})
</script>