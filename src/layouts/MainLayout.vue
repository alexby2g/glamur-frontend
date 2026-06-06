<template>
  <q-layout view="lHh Lpr lFf" class="main-layout">

    <!-- HEADER -->
    <q-header class="main-header">
      <q-toolbar class="toolbar">

        <q-btn
          flat
          dense
          round
          icon="menu"
          color="white"
          class="menu-toggle"
          @click="drawer = !drawer"
        />

        <q-toolbar-title class="row items-center no-wrap">

          <q-avatar class="top-logo" size="42px">
            <img
              :src="logoSistema"
              :alt="nombreCorto"
              @error="usarLogoBase"
            />
          </q-avatar>

          <div class="q-ml-sm">
            <div class="top-title">
              {{ marcaPrincipal }}
            </div>

            <div class="top-subtitle">
              {{ marcaSubtitulo }}
            </div>
          </div>

        </q-toolbar-title>

        <!-- NOTIFICACIONES -->
        <q-btn
          flat
          dense
          round
          icon="notifications"
          color="white"
          class="notification-btn q-mr-sm"
        >
          <q-badge
            v-if="noLeidas > 0"
            color="red"
            floating
            rounded
          >
            {{ noLeidas > 9 ? '9+' : noLeidas }}
          </q-badge>

          <q-menu
            class="notification-menu"
            anchor="bottom right"
            self="top right"
          >
            <div class="notification-header">
              <div>
                <div class="notification-title">
                  🔔 Notificaciones
                </div>

                <div class="notification-subtitle">
                  Actividad de {{ nombreCorto }}
                </div>
              </div>

              <q-btn
                v-if="notificaciones.length > 0"
                flat
                dense
                round
                icon="done_all"
                color="white"
                @click="marcarTodasLeidas"
              >
                <q-tooltip>Marcar todas como leídas</q-tooltip>
              </q-btn>
            </div>

            <q-separator />

            <q-scroll-area class="notification-scroll">
              <div
                v-if="notificaciones.length === 0"
                class="empty-notifications"
              >
                <q-icon name="notifications_none" size="42px" />

                <div class="text-weight-bold q-mt-sm">
                  Sin notificaciones
                </div>

                <div class="text-caption">
                  Cuando se registre un pago aparecerá aquí.
                </div>
              </div>

              <q-list v-else separator>
                <q-item
                  v-for="n in notificaciones"
                  :key="n.id"
                  clickable
                  class="notification-item"
                  :class="{ 'notification-unread': !n.leido }"
                  @click="marcarComoLeida(n)"
                >
                  <q-item-section avatar>
                    <q-avatar
                      :class="n.leido ? 'notif-avatar-read' : 'notif-avatar-unread'"
                    >
                      <q-icon
                        :name="n.tipo === 'pago' ? 'payments' : 'notifications'"
                        color="white"
                      />
                    </q-avatar>
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold">
                      {{ n.titulo || 'Notificación' }}
                    </q-item-label>

                    <q-item-label caption lines="2">
                      {{ n.mensaje || ('Nueva actividad registrada en ' + nombreCorto + '.') }}
                    </q-item-label>

                    <q-item-label caption class="notification-date">
                      {{ formatearFecha(n.created_at) }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side v-if="!n.leido">
                    <q-icon name="fiber_manual_record" color="pink" size="12px" />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-scroll-area>
          </q-menu>
        </q-btn>

        <!-- USUARIO / PERFIL / CERRAR SESIÓN -->
        <q-btn-dropdown
          flat
          dense
          no-caps
          color="white"
          dropdown-icon="expand_more"
          class="user-dropdown"
        >
          <template #label>
            <div class="row items-center no-wrap user-label">

              <q-avatar
                size="36px"
                class="user-avatar"
                :class="{ 'has-user-photo': tieneFotoPerfil }"
              >
                <img
                  v-if="tieneFotoPerfil"
                  :src="usuarioFotoPerfil"
                  :alt="usuarioNombre"
                />

                <q-icon
                  v-else
                  name="person"
                  color="white"
                  size="21px"
                />
              </q-avatar>

              <div class="user-info">
                <div class="user-name">
                  {{ usuarioNombre }}
                </div>

                <div class="user-role">
                  {{ usuarioRolTexto }}
                </div>
              </div>

            </div>
          </template>

          <q-list class="user-menu">

            <q-item>
              <q-item-section avatar>
                <q-avatar
                  size="48px"
                  class="menu-user-avatar"
                  :class="{ 'has-user-photo': tieneFotoPerfil }"
                >
                  <img
                    v-if="tieneFotoPerfil"
                    :src="usuarioFotoPerfil"
                    :alt="usuarioNombre"
                  />

                  <q-icon
                    v-else
                    name="person"
                    color="white"
                  />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ usuarioNombre }}
                </q-item-label>

                <q-item-label caption>
                  {{ usuarioRolTexto }} · Sesión activa
                </q-item-label>

                <q-item-label caption class="profile-status">
                  {{ tieneFotoPerfil ? 'Foto de perfil configurada' : 'Sin foto de perfil' }}
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-separator />

            <q-item
              clickable
              :disable="subiendoFotoPerfil"
              @click="seleccionarArchivoFoto"
            >
              <q-item-section avatar>
                <q-icon name="photo_camera" color="pink-7" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">
                  Cambiar foto de perfil
                </q-item-label>

                <q-item-label caption>
                  JPG, PNG o WEBP. Se comprimirá automáticamente.
                </q-item-label>
              </q-item-section>

              <q-item-section side v-if="subiendoFotoPerfil">
                <q-spinner color="pink" size="22px" />
              </q-item-section>
            </q-item>

            <q-item
              v-if="tieneFotoPerfil"
              clickable
              :disable="subiendoFotoPerfil"
              @click="confirmarEliminarFotoPerfil"
            >
              <q-item-section avatar>
                <q-icon name="delete" color="negative" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-negative text-weight-bold">
                  Eliminar foto
                </q-item-label>

                <q-item-label caption>
                  Volver al avatar por defecto.
                </q-item-label>
              </q-item-section>
            </q-item>

            <input
              ref="fotoPerfilInput"
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              class="hidden-file-input"
              @change="procesarFotoPerfil"
            />

            <q-separator />

            <q-item clickable v-close-popup @click="cerrarSesion">
              <q-item-section avatar>
                <q-icon name="logout" color="negative" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-negative text-weight-bold">
                  Cerrar sesión
                </q-item-label>
              </q-item-section>
            </q-item>

          </q-list>
        </q-btn-dropdown>

      </q-toolbar>
    </q-header>

    <!-- SIDEBAR -->
    <q-drawer
      v-model="drawer"
      show-if-above
      :width="250"
      class="premium-drawer"
    >

      <!-- BRAND -->
      <div class="drawer-brand">

        <q-avatar class="drawer-logo" size="72px">
          <img
            :src="logoSistema"
            :alt="nombreCorto"
            @error="usarLogoBase"
          />
        </q-avatar>

        <div class="drawer-title">
          {{ marcaPrincipal }}
        </div>

        <div class="drawer-subtitle">
          {{ marcaSubtitulo }}
        </div>

        <div class="drawer-slogan">
          {{ sloganNegocio }}
        </div>

      </div>

      <!-- MENU -->
      <q-list class="menu-list">

        <q-item-label header class="menu-header">
          {{ usuarioEsAdmin ? 'NAVEGACIÓN ADMIN' : 'MENÚ EMPLEADO' }}
        </q-item-label>

        <q-item
          v-for="item in menuFiltrado"
          :key="item.label"
          clickable
          :to="item.to"
          class="menu-item"
          active-class="menu-active"
        >

          <q-item-section avatar>
            <div class="menu-icon-box">
              <q-icon :name="item.icon" size="22px" />
            </div>
          </q-item-section>

          <q-item-section>
            <div class="menu-label">
              {{ item.label }}
            </div>
          </q-item-section>

        </q-item>

      </q-list>

      <!-- FOOTER -->
      <div class="drawer-footer">

        <div class="status-dot"></div>

        <div>
          <div class="footer-title">
            {{ usuarioRolTexto }}
          </div>

          <div class="footer-subtitle">
            Render + Neon activo
          </div>
        </div>

      </div>

    </q-drawer>

    <!-- CONTENT -->
    <q-page-container class="page-container">
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
import { api } from 'boot/axios'
import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { App as CapacitorApp } from '@capacitor/app'
import logoBase from 'assets/logo-glamur.png'

const valoresBaseConfiguracion = {
  nombre_negocio: 'AUREA Beauty Salon',
  nombre_corto: 'AUREA Beauty',
  slogan: 'Sistema inteligente para salones de belleza',
  telefono: '',
  whatsapp: '',
  direccion: '',
  mensaje_whatsapp: 'Hola, quiero información sobre los servicios de AUREA Beauty Salon.',
  logo_url: '',
  moneda: 'Bs',
  activo: true
}

export default {
  name: 'MainLayout',

  data () {
    return {
      drawer: false,
      backButtonListener: null,
      ultimoIntentoSalir: 0,

      usuarioNombre: 'Administrador',
      usuarioRol: 'admin',
      usuarioEmpleadoId: null,
      usuarioFotoPerfil: '',
      subiendoFotoPerfil: false,

      configuracion: {
        ...valoresBaseConfiguracion
      },

      notificaciones: [],
      noLeidas: 0,
      intervaloNotificaciones: null,
      notificacionesInicializadas: false,
      ultimaNotificacionMostradaId: Number(localStorage.getItem('glamur_last_notification_id') || 0),

      menu: [
        {
          label: 'Dashboard',
          icon: 'dashboard',
          to: '/dashboard',
          roles: ['admin']
        },

        {
          label: 'Clientes',
          icon: 'people',
          to: '/clientes',
          roles: ['admin']
        },

        {
          label: 'Empleados',
          icon: 'groups',
          to: '/empleados',
          roles: ['admin']
        },

        {
          label: 'Citas',
          icon: 'event',
          to: '/citas',
          roles: ['admin']
        },

        {
          label: 'Mis citas',
          icon: 'event_available',
          to: '/mis-citas',
          roles: ['empleado']
        },

        {
          label: 'Servicios',
          icon: 'spa',
          to: '/servicios',
          roles: ['admin', 'empleado']
        },

        {
          label: 'Calendario',
          icon: 'calendar_month',
          to: '/calendario',
          roles: ['admin']
        },

        {
          label: 'Pagos',
          icon: 'payments',
          to: '/pagos',
          roles: ['admin']
        },

        {
          label: 'Caja diaria',
          icon: 'point_of_sale',
          to: '/caja-diaria',
          roles: ['admin']
        },

        {
          label: 'Reporte empleados',
          icon: 'analytics',
          to: '/reporte-empleados',
          roles: ['admin']
        },

        {
          label: 'Historial',
          icon: 'history',
          to: '/historial',
          roles: ['admin']
        },

        {
          label: 'Historial Clientes',
          icon: 'manage_search',
          to: '/historial-clientes',
          roles: ['admin']
        },

        {
          label: 'Configuración',
          icon: 'settings',
          to: '/configuracion',
          roles: ['admin']
        }
      ]
    }
  },

  computed: {
    usuarioEsAdmin () {
      return this.usuarioRol === 'admin'
    },

    usuarioEsEmpleado () {
      return this.usuarioRol === 'empleado'
    },

    usuarioRolTexto () {
      if (this.usuarioRol === 'admin') {
        return 'Administrador'
      }

      if (this.usuarioRol === 'empleado') {
        return 'Empleado'
      }

      return 'Usuario'
    },

    tieneFotoPerfil () {
      return Boolean(this.usuarioFotoPerfil)
    },

    menuFiltrado () {
      return this.menu.filter((item) => {
        if (!item.roles || item.roles.length === 0) {
          return true
        }

        return item.roles.includes(this.usuarioRol)
      })
    },

    nombreNegocio () {
      return this.configuracion.nombre_negocio || valoresBaseConfiguracion.nombre_negocio
    },

    nombreCorto () {
      return this.configuracion.nombre_corto || valoresBaseConfiguracion.nombre_corto
    },

    sloganNegocio () {
      return this.configuracion.slogan || valoresBaseConfiguracion.slogan
    },

    logoSistema () {
      return this.configuracion.logo_url || logoBase
    },

    marcaPrincipal () {
      const partes = String(this.nombreCorto || 'AUREA Beauty').trim().split(' ')
      return partes[0] || 'AUREA'
    },

    marcaSubtitulo () {
      const texto = String(this.nombreCorto || 'AUREA Beauty')
        .replace(this.marcaPrincipal, '')
        .trim()

      return texto || 'Beauty Salon'
    }
  },

  mounted () {
    this.cargarConfiguracionNegocio()
    this.cargarUsuario()
    this.cargarUsuarioDesdeServidor()
    this.prepararNotificacionesCelular()
    this.cargarNotificaciones()
    this.configurarBotonAtrasAndroid()

    window.addEventListener('aurea-configuracion-actualizada', this.recibirConfiguracionActualizada)

    this.intervaloNotificaciones = setInterval(() => {
      this.cargarNotificaciones()
    }, 8000)
  },

  beforeUnmount () {
    if (this.intervaloNotificaciones) {
      clearInterval(this.intervaloNotificaciones)
    }

    if (this.backButtonListener) {
      this.backButtonListener.remove()
      this.backButtonListener = null
    }

    window.removeEventListener('aurea-configuracion-actualizada', this.recibirConfiguracionActualizada)
  },

  methods: {
    rutaPrincipalSegunRol () {
      return this.usuarioEsEmpleado ? '/mis-citas' : '/dashboard'
    },

    estaEnRutaPrincipal () {
      return this.$route.path === this.rutaPrincipalSegunRol()
    },

    async configurarBotonAtrasAndroid () {
      if (!Capacitor.isNativePlatform()) {
        return
      }

      try {
        if (this.backButtonListener) {
          await this.backButtonListener.remove()
          this.backButtonListener = null
        }

        this.backButtonListener = await CapacitorApp.addListener('backButton', () => {
          this.manejarBotonAtrasAndroid()
        })
      } catch (error) {
        console.log('No se pudo configurar el botón atrás:', error)
      }
    },

    cerrarVentanaEmergenteGlobal () {
      const selectoresVentanas = [
        '.q-dialog__inner',
        '.q-menu',
        '.q-position-engine',
        '.q-dialog',
        '.q-popup-proxy'
      ]

      const ventanaAbierta = selectoresVentanas.some((selector) => {
        return Boolean(document.querySelector(selector))
      })

      if (!ventanaAbierta) {
        return false
      }

      document.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true
      }))

      window.dispatchEvent(new KeyboardEvent('keyup', {
        key: 'Escape',
        code: 'Escape',
        keyCode: 27,
        which: 27,
        bubbles: true,
        cancelable: true
      }))

      return true
    },

    manejarBotonAtrasAndroid () {
      const rutaActual = this.$route.path
      const rutaPrincipal = this.rutaPrincipalSegunRol()

      /*
       * Orden correcto del botón atrás en Android:
       * 1. Si hay una ventana emergente, menú o popup abierto, se cierra primero.
       * 2. Si el drawer está abierto en celular, se cierra.
       * 3. Si está en otro módulo, vuelve a Dashboard o Mis citas.
       * 4. Si ya está en la ruta principal, doble atrás para salir.
       */
      if (this.cerrarVentanaEmergenteGlobal()) {
        return
      }

      if (this.drawer && this.$q.screen.lt.md) {
        this.drawer = false
        return
      }

      if (rutaActual === '/login') {
        CapacitorApp.exitApp()
        return
      }

      if (rutaActual !== rutaPrincipal) {
        this.$router.replace(rutaPrincipal)

        this.$q.notify({
          type: 'info',
          icon: 'home',
          message: this.usuarioEsEmpleado
            ? 'Volviste a Mis citas'
            : 'Volviste al Dashboard',
          position: 'bottom',
          timeout: 1200
        })

        return
      }

      const ahora = Date.now()

      if (ahora - this.ultimoIntentoSalir < 2200) {
        CapacitorApp.exitApp()
        return
      }

      this.ultimoIntentoSalir = ahora

      this.$q.notify({
        type: 'warning',
        icon: 'touch_app',
        message: 'Presiona atrás otra vez para salir de AUREA Beauty',
        position: 'bottom',
        timeout: 2000
      })
    },

    normalizarRol (rol) {
      const rolLimpio = String(rol || '').toLowerCase().trim()

      if (['admin', 'empleado'].includes(rolLimpio)) {
        return rolLimpio
      }

      return 'admin'
    },

    aplicarUsuario (usuario = {}) {
      this.usuarioNombre =
        usuario?.nombre ||
        usuario?.usuario ||
        'Administrador'

      this.usuarioRol = this.normalizarRol(usuario?.rol || 'admin')
      this.usuarioEmpleadoId = usuario?.empleado_id || null
      this.usuarioFotoPerfil = usuario?.foto_perfil || ''
    },

    actualizarUsuarioLocal (usuario = {}) {
      const usuarioActual = this.obtenerUsuarioLocal()

      const nuevoUsuario = {
        ...usuarioActual,
        ...usuario
      }

      localStorage.setItem('glamur_user', JSON.stringify(nuevoUsuario))
      this.aplicarUsuario(nuevoUsuario)
    },

    obtenerUsuarioLocal () {
      try {
        const usuarioGuardado = localStorage.getItem('glamur_user')
        return usuarioGuardado ? JSON.parse(usuarioGuardado) : {}
      } catch {
        return {}
      }
    },

    redirigirSiRutaNoPermitida () {
      const rutaActual = this.$route.path

      if (this.usuarioEsAdmin) {
        return
      }

      const rutasPermitidas = this.menuFiltrado.map((item) => item.to)

      if (!rutasPermitidas.includes(rutaActual)) {
        this.$router.replace('/mis-citas')
      }
    },

    normalizarConfiguracion (configuracion = {}) {
      return {
        ...valoresBaseConfiguracion,
        ...configuracion,
        activo: configuracion?.activo === undefined ? true : Boolean(configuracion.activo)
      }
    },

    aplicarConfiguracion (configuracion = {}) {
      this.configuracion = this.normalizarConfiguracion(configuracion)
    },

    guardarConfiguracionLocal (configuracion = {}) {
      localStorage.setItem(
        'aurea_configuracion',
        JSON.stringify(this.normalizarConfiguracion(configuracion))
      )
    },

    cargarConfiguracionLocal () {
      try {
        const guardado = localStorage.getItem('aurea_configuracion')
        return guardado ? JSON.parse(guardado) : null
      } catch {
        return null
      }
    },

    recibirConfiguracionActualizada (event) {
      this.aplicarConfiguracion(event?.detail || valoresBaseConfiguracion)
    },

    async cargarConfiguracionNegocio () {
      try {
        const { data } = await api.get('/configuracion')
        const configuracion = data?.configuracion || data || valoresBaseConfiguracion

        this.aplicarConfiguracion(configuracion)
        this.guardarConfiguracionLocal(configuracion)
      } catch {
        const local = this.cargarConfiguracionLocal()
        this.aplicarConfiguracion(local || valoresBaseConfiguracion)
      }
    },

    usarLogoBase (event) {
      if (event?.target) {
        event.target.src = logoBase
      }
    },

    cargarUsuario () {
      const usuarioGuardado = localStorage.getItem('glamur_user')

      if (!usuarioGuardado) {
        this.aplicarUsuario({
          nombre: 'Administrador',
          rol: 'admin',
          empleado_id: null,
          foto_perfil: ''
        })

        return
      }

      try {
        const usuario = JSON.parse(usuarioGuardado)
        this.aplicarUsuario(usuario)
        this.redirigirSiRutaNoPermitida()
      } catch {
        this.aplicarUsuario({
          nombre: 'Administrador',
          rol: 'admin',
          empleado_id: null,
          foto_perfil: ''
        })
      }
    },

    async cargarUsuarioDesdeServidor () {
      try {
        const { data } = await api.get('/me')
        const usuario = data?.usuario || data || null

        if (usuario) {
          localStorage.setItem('glamur_user', JSON.stringify(usuario))
          this.aplicarUsuario(usuario)
          this.redirigirSiRutaNoPermitida()
        }
      } catch {
        // Si falla, usamos el usuario guardado en localStorage.
      }
    },

    seleccionarArchivoFoto () {
      if (this.subiendoFotoPerfil) {
        return
      }

      if (this.$refs.fotoPerfilInput) {
        this.$refs.fotoPerfilInput.value = ''
        this.$refs.fotoPerfilInput.click()
      }
    },

    async procesarFotoPerfil (event) {
      const archivo = event?.target?.files?.[0]

      if (!archivo) {
        return
      }

      const tiposPermitidos = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp'
      ]

      if (!tiposPermitidos.includes(archivo.type)) {
        this.$q.notify({
          type: 'negative',
          message: 'Formato inválido. Usa una imagen JPG, PNG o WEBP.'
        })

        return
      }

      if (archivo.size > 8 * 1024 * 1024) {
        this.$q.notify({
          type: 'negative',
          message: 'La imagen es muy pesada. Usa una foto menor a 8 MB.'
        })

        return
      }

      this.subiendoFotoPerfil = true

      try {
        const fotoBase64 = await this.comprimirImagenPerfil(archivo)

        const { data } = await api.put('/perfil/foto', {
          foto_perfil: fotoBase64
        })

        const usuario = data?.usuario || null

        if (usuario) {
          this.actualizarUsuarioLocal(usuario)
        } else {
          this.usuarioFotoPerfil = fotoBase64
          this.actualizarUsuarioLocal({
            foto_perfil: fotoBase64
          })
        }

        this.$q.notify({
          type: 'positive',
          icon: 'photo_camera',
          message: 'Foto de perfil actualizada correctamente'
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: this.getErrorMessage(error, 'No se pudo actualizar la foto de perfil')
        })
      } finally {
        this.subiendoFotoPerfil = false

        if (event?.target) {
          event.target.value = ''
        }
      }
    },

    comprimirImagenPerfil (archivo) {
      return new Promise((resolve, reject) => {
        const lector = new FileReader()

        lector.onload = () => {
          const imagen = new Image()

          imagen.onload = () => {
            try {
              const maxDimension = 800
              let width = imagen.width
              let height = imagen.height

              if (width > height && width > maxDimension) {
                height = Math.round((height * maxDimension) / width)
                width = maxDimension
              } else if (height > maxDimension) {
                width = Math.round((width * maxDimension) / height)
                height = maxDimension
              }

              const canvas = document.createElement('canvas')
              canvas.width = width
              canvas.height = height

              const ctx = canvas.getContext('2d')
              ctx.fillStyle = '#ffffff'
              ctx.fillRect(0, 0, width, height)
              ctx.drawImage(imagen, 0, 0, width, height)

              const calidades = [0.85, 0.75, 0.65, 0.55, 0.45]
              let resultado = ''

              for (const calidad of calidades) {
                resultado = canvas.toDataURL('image/jpeg', calidad)

                if (resultado.length <= 2800000) {
                  resolve(resultado)
                  return
                }
              }

              reject(new Error('La imagen sigue siendo muy pesada. Usa una foto más pequeña.'))
            } catch (error) {
              reject(error)
            }
          }

          imagen.onerror = () => {
            reject(new Error('No se pudo leer la imagen seleccionada.'))
          }

          imagen.src = lector.result
        }

        lector.onerror = () => {
          reject(new Error('No se pudo cargar el archivo seleccionado.'))
        }

        lector.readAsDataURL(archivo)
      })
    },

    confirmarEliminarFotoPerfil () {
      this.$q.dialog({
        title: 'Eliminar foto de perfil',
        message: '¿Deseas eliminar tu foto de perfil actual?',
        persistent: true,
        ok: {
          label: 'Sí, eliminar',
          color: 'negative',
          unelevated: true
        },
        cancel: {
          label: 'Cancelar',
          color: 'grey-7',
          flat: true
        }
      }).onOk(() => {
        this.eliminarFotoPerfil()
      })
    },

    async eliminarFotoPerfil () {
      this.subiendoFotoPerfil = true

      try {
        const { data } = await api.delete('/perfil/foto')
        const usuario = data?.usuario || null

        if (usuario) {
          this.actualizarUsuarioLocal(usuario)
        } else {
          this.actualizarUsuarioLocal({
            foto_perfil: ''
          })
        }

        this.$q.notify({
          type: 'positive',
          message: 'Foto de perfil eliminada correctamente'
        })
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: this.getErrorMessage(error, 'No se pudo eliminar la foto de perfil')
        })
      } finally {
        this.subiendoFotoPerfil = false
      }
    },

    getErrorMessage (error, fallback = 'Ocurrió un error') {
      const data = error?.response?.data

      if (data?.errors) {
        return Object.values(data.errors).flat().join(' ')
      }

      return data?.message || data?.error || error?.message || fallback
    },

    async prepararNotificacionesCelular () {
      if (!Capacitor.isNativePlatform()) {
        return
      }

      try {
        const permisoActual = await LocalNotifications.checkPermissions()

        let permisoFinal = permisoActual

        if (permisoActual.display !== 'granted') {
          permisoFinal = await LocalNotifications.requestPermissions()
        }

        if (permisoFinal.display !== 'granted') {
          return
        }

        if (Capacitor.getPlatform() === 'android') {
          await LocalNotifications.createChannel({
            id: 'glamur_pagos',
            name: `Pagos ${this.nombreCorto}`,
            description: `Notificaciones de pagos registrados en ${this.nombreCorto}`,
            importance: 5,
            visibility: 1,
            sound: 'default'
          })
        }
      } catch {
        // La app sigue funcionando aunque el celular bloquee las notificaciones.
      }
    },

    async notificarEnCelular (notificacion) {
      if (!Capacitor.isNativePlatform()) {
        return
      }

      try {
        const permiso = await LocalNotifications.checkPermissions()

        if (permiso.display !== 'granted') {
          return
        }

        const idSeguro = Number(notificacion?.id || Date.now()) % 2147483647

        await LocalNotifications.schedule({
          notifications: [
            {
              id: idSeguro,
              title: notificacion?.titulo || this.nombreCorto,
              body: notificacion?.mensaje || 'Nueva notificación registrada',
              schedule: {
                at: new Date(Date.now() + 1000)
              },
              channelId: 'glamur_pagos'
            }
          ]
        })
      } catch {
        // Evitamos romper la app si Android no permite mostrar la notificación.
      }
    },

    guardarUltimaNotificacionMostrada (id) {
      const idNumerico = Number(id || 0)

      if (!idNumerico) {
        return
      }

      this.ultimaNotificacionMostradaId = idNumerico
      localStorage.setItem('glamur_last_notification_id', String(idNumerico))
    },

    async cargarNotificaciones () {
      try {
        const { data } = await api.get('/notificaciones')

        this.notificaciones = Array.isArray(data?.notificaciones)
          ? data.notificaciones
          : []

        this.noLeidas = Number(data?.no_leidas || 0)

        const primeraNotificacion = this.notificaciones[0]
        const primeraId = Number(primeraNotificacion?.id || 0)

        if (!this.notificacionesInicializadas) {
          if (primeraId) {
            this.guardarUltimaNotificacionMostrada(primeraId)
          }

          this.notificacionesInicializadas = true
          return
        }

        if (
          primeraNotificacion &&
          primeraId &&
          primeraId !== this.ultimaNotificacionMostradaId &&
          !primeraNotificacion.leido
        ) {
          this.$q.notify({
            type: 'positive',
            icon: primeraNotificacion.tipo === 'pago' ? 'payments' : 'notifications_active',
            position: 'top-right',
            message: primeraNotificacion?.mensaje || 'Nueva notificación registrada'
          })

          await this.notificarEnCelular(primeraNotificacion)
          this.guardarUltimaNotificacionMostrada(primeraId)
        }

        this.notificacionesInicializadas = true
      } catch {
        // No mostramos error para no molestar al usuario cada 8 segundos.
      }
    },

    async marcarComoLeida (notificacion) {
      if (!notificacion || notificacion.leido) return

      try {
        await api.put(`/notificaciones/${notificacion.id}/leer`)
        await this.cargarNotificaciones()
      } catch {
        this.$q.notify({
          type: 'negative',
          message: 'No se pudo marcar la notificación como leída'
        })
      }
    },

    async marcarTodasLeidas () {
      try {
        await api.put('/notificaciones/leer-todas')

        this.$q.notify({
          type: 'positive',
          message: 'Notificaciones marcadas como leídas'
        })

        await this.cargarNotificaciones()
      } catch {
        this.$q.notify({
          type: 'negative',
          message: 'No se pudieron actualizar las notificaciones'
        })
      }
    },

    formatearFecha (fecha) {
      if (!fecha) return ''

      return new Date(fecha).toLocaleString('es-BO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    cerrarSesion () {
      this.$q.dialog({
        title: 'Cerrar sesión',
        message: '¿Deseas cerrar tu sesión actual?',
        persistent: true,
        ok: {
          label: 'Sí, cerrar sesión',
          color: 'negative',
          unelevated: true
        },
        cancel: {
          label: 'Cancelar',
          color: 'grey-7',
          flat: true
        }
      }).onOk(async () => {
        try {
          await api.post('/logout')
        } catch {
          // Si Render está dormido o falla, igual cerramos localmente.
        } finally {
          localStorage.removeItem('glamur_token')
          localStorage.removeItem('glamur_user')
          localStorage.removeItem('glamur_last_notification_id')

          this.$q.notify({
            type: 'positive',
            message: 'Sesión cerrada correctamente'
          })

          this.$router.replace('/login')
        }
      })
    }
  }
}
</script>

<style scoped>
.main-layout {
  background: #f6f7fb;
}

.main-header {
  background: linear-gradient(135deg, #15111f, #241329 45%, #e91e63);
  box-shadow: 0 10px 30px rgba(15, 10, 25, 0.35);
}

.toolbar {
  min-height: 70px;
  padding: 0 18px;
}

.menu-toggle {
  background: rgba(255, 255, 255, 0.08);
}

.top-logo {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  box-shadow: 0 8px 22px rgba(233, 30, 99, 0.4);
}

.top-logo img,
.drawer-logo img {
  object-fit: cover;
}

.top-title {
  font-size: 21px;
  font-weight: 900;
  color: white;
  line-height: 20px;
}

.top-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.72);
}

.notification-btn {
  background: rgba(255, 255, 255, 0.08);
}

.notification-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}

.notification-menu {
  width: 360px;
  max-width: 94vw;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 18px 50px rgba(20, 10, 30, 0.28);
}

.notification-header {
  padding: 16px;
  background: linear-gradient(135deg, #15111f, #e91e63);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.notification-title {
  font-size: 17px;
  font-weight: 900;
}

.notification-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
}

.notification-scroll {
  height: 360px;
  max-height: 70vh;
}

.empty-notifications {
  min-height: 250px;
  display: grid;
  place-items: center;
  text-align: center;
  color: #777;
  padding: 24px;
}

.notification-item {
  padding-top: 12px;
  padding-bottom: 12px;
}

.notification-unread {
  background: #fff0f6;
}

.notif-avatar-unread {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
}

.notif-avatar-read {
  background: #9e9e9e;
}

.notification-date {
  margin-top: 4px;
  color: #9e9e9e;
}

.user-dropdown {
  min-height: 44px;
  border-radius: 18px;
  padding: 4px 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(248, 215, 161, 0.18);
}

.user-dropdown:hover {
  background: rgba(255, 255, 255, 0.14);
}

.user-label {
  gap: 9px;
}

.user-avatar {
  background: linear-gradient(135deg, #e91e63, #b8860b);
  box-shadow: 0 8px 20px rgba(233, 30, 99, 0.35);
  overflow: hidden;
}

.user-avatar img,
.menu-user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.has-user-photo {
  background: #ffffff !important;
  border: 2px solid rgba(248, 215, 161, 0.75);
}

.user-info {
  text-align: left;
  line-height: 14px;
}

.user-name {
  font-size: 13px;
  font-weight: 900;
  color: white;
  max-width: 135px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role {
  font-size: 10px;
  color: rgba(255, 236, 200, 0.78);
}

.user-menu {
  min-width: 285px;
  border-radius: 18px;
  overflow: hidden;
}

.menu-user-avatar {
  background: linear-gradient(135deg, #e91e63, #b8860b);
  overflow: hidden;
}

.profile-status {
  color: #c2185b;
  font-weight: 700;
}

.hidden-file-input {
  display: none;
}

.premium-drawer {
  background: #15111f !important;
  color: white !important;
  border: none;
  box-shadow: 12px 0 35px rgba(20, 10, 30, 0.28);
}

.premium-drawer :deep(.q-drawer__content) {
  background: #15111f !important;
  color: white !important;
}

.drawer-brand {
  padding: 28px 18px 20px;
  text-align: center;
}

.drawer-logo {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  box-shadow: 0 16px 35px rgba(233, 30, 99, 0.45);
}

.drawer-title {
  margin-top: 14px;
  font-size: 28px;
  font-weight: 900;
  color: #f8d7a1;
}

.drawer-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 236, 200, 0.82);
}

.drawer-slogan {
  max-width: 190px;
  margin: 8px auto 0;
  font-size: 11px;
  line-height: 1.35;
  color: rgba(255, 255, 255, 0.58);
}

.menu-list {
  padding: 0 12px 110px;
}

.menu-header {
  color: #f8d7a1 !important;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1.4px;
  padding-left: 10px;
}

.menu-item {
  width: 100%;
  min-height: 64px;
  margin-bottom: 14px;
  border-radius: 22px;
  color: white !important;
  background: linear-gradient(135deg, #2a1b35, #1c1428);
  border: 1px solid rgba(248, 215, 161, 0.25);
  font-weight: 800;
  transition: all 0.25s ease;
  padding-left: 8px;
  padding-right: 8px;
  box-shadow: 0 10px 24px rgba(20, 10, 30, 0.30);
}

.menu-item:hover {
  color: white !important;
  background: linear-gradient(135deg, #e91e63, #b8860b);
  transform: translateX(5px);
  box-shadow: 0 14px 30px rgba(233, 30, 99, 0.38);
}

.menu-active {
  color: white !important;
  background: linear-gradient(135deg, #e91e63, #b8860b) !important;
  border: 1px solid rgba(248, 215, 161, 0.45);
  box-shadow: 0 14px 34px rgba(233, 30, 99, 0.45);
}

.menu-icon-box {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(233, 30, 99, 0.22);
  color: white;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}

.menu-active .menu-icon-box {
  background: rgba(255, 255, 255, 0.20);
}

.menu-label {
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: white !important;
}

.drawer-footer {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 14px;
  min-height: 62px;
  padding: 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 11px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(248, 215, 161, 0.18);
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #4caf50;
  box-shadow: 0 0 0 6px rgba(76, 175, 80, 0.14);
}

.footer-title {
  color: white;
  font-size: 13px;
  font-weight: 900;
}

.footer-subtitle {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 11px;
}

.page-container {
  background: #f6f7fb;
}

@media (max-width: 700px) {
  .toolbar {
    min-height: 64px;
    padding: 0 10px;
  }

  .top-title {
    font-size: 17px;
  }

  .top-subtitle {
    font-size: 10px;
  }

  .top-logo {
    width: 36px !important;
    height: 36px !important;
  }

  .user-info {
    display: none;
  }

  .user-dropdown {
    padding: 4px;
  }

  .notification-menu {
    width: 330px;
  }
}
</style>