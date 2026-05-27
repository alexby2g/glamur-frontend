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
            <img src="~assets/logo-glamur.png" alt="AUREA Beauty" />
          </q-avatar>

          <div class="q-ml-sm">
            <div class="top-title">
              AUREA
            </div>

            <div class="top-subtitle">
              Beauty Salon
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
                  Pagos y actividad del sistema
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
                      {{ n.mensaje || 'Nueva actividad registrada en AUREA Beauty.' }}
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

        <!-- USUARIO / CERRAR SESIÓN -->
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

              <q-avatar size="36px" class="user-avatar">
                <q-icon name="person" color="white" size="21px" />
              </q-avatar>

              <div class="user-info">
                <div class="user-name">
                  {{ usuarioNombre }}
                </div>

                <div class="user-role">
                  Administrador
                </div>
              </div>

            </div>
          </template>

          <q-list class="user-menu">

            <q-item>
              <q-item-section avatar>
                <q-avatar class="menu-user-avatar">
                  <q-icon name="person" color="white" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ usuarioNombre }}
                </q-item-label>

                <q-item-label caption>
                  Sesión activa
                </q-item-label>
              </q-item-section>
            </q-item>

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
          <img src="~assets/logo-glamur.png" alt="AUREA Beauty" />
        </q-avatar>

        <div class="drawer-title">
          AUREA
        </div>

        <div class="drawer-subtitle">
          Beauty Salon
        </div>

      </div>

      <!-- MENU -->
      <q-list class="menu-list">

        <q-item-label header class="menu-header">
          NAVEGACIÓN
        </q-item-label>

        <q-item
          v-for="item in menu"
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
            Servidor online
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

export default {
  name: 'MainLayout',

  data () {
    return {
      drawer: false,

      usuarioNombre: 'Administrador',

      notificaciones: [],
      noLeidas: 0,
      intervaloNotificaciones: null,
      notificacionesInicializadas: false,
      ultimaNotificacionMostradaId: Number(localStorage.getItem('glamur_last_notification_id') || 0),

      menu: [
        {
          label: 'Dashboard',
          icon: 'dashboard',
          to: '/dashboard'
        },

        {
          label: 'Clientes',
          icon: 'people',
          to: '/clientes'
        },

        {
          label: 'Citas',
          icon: 'event',
          to: '/citas'
        },

        {
          label: 'Servicios',
          icon: 'spa',
          to: '/servicios'
        },

        {
          label: 'Calendario',
          icon: 'calendar_month',
          to: '/calendario'
        },

        {
          label: 'Pagos',
          icon: 'payments',
          to: '/pagos'
        },

        {
          label: 'Historial',
          icon: 'history',
          to: '/historial'
        },

        {
          label: 'Historial Clientes',
          icon: 'manage_search',
          to: '/historial-clientes'
        }
      ]
    }
  },

  mounted () {
    this.cargarUsuario()
    this.prepararNotificacionesCelular()
    this.cargarNotificaciones()

    this.intervaloNotificaciones = setInterval(() => {
      this.cargarNotificaciones()
    }, 8000)
  },

  beforeUnmount () {
    if (this.intervaloNotificaciones) {
      clearInterval(this.intervaloNotificaciones)
    }
  },

  methods: {
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
            name: 'Pagos AUREA Beauty',
            description: 'Notificaciones de pagos registrados en AUREA Beauty',
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
              title: notificacion?.titulo || 'AUREA Beauty',
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

    cargarUsuario () {
      const usuarioGuardado = localStorage.getItem('glamur_user')

      if (!usuarioGuardado) {
        this.usuarioNombre = 'Administrador'
        return
      }

      try {
        const usuario = JSON.parse(usuarioGuardado)

        this.usuarioNombre =
          usuario?.nombre ||
          usuario?.usuario ||
          'Administrador'
      } catch {
        this.usuarioNombre = 'Administrador'
      }
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

/* GENERAL */

.main-layout {
  background: #f6f7fb;
}

/* HEADER */

.main-header {
  background:
    linear-gradient(
      135deg,
      #15111f,
      #241329 45%,
      #e91e63
    );

  box-shadow:
    0 10px 30px rgba(15, 10, 25, 0.35);
}

.toolbar {
  min-height: 70px;
  padding: 0 18px;
}

.menu-toggle {
  background: rgba(255,255,255,0.08);
}

.top-logo {
  background:
    linear-gradient(
      135deg,
      #e91e63,
      #9c27b0
    );

  box-shadow:
    0 8px 22px rgba(233,30,99,0.4);
}

.top-title {
  font-size: 21px;
  font-weight: 900;
  color: white;
  line-height: 20px;
}

.top-subtitle {
  font-size: 11px;
  color: rgba(255,255,255,0.72);
}

/* NOTIFICACIONES */

.notification-btn {
  background: rgba(255,255,255,0.08);
}

.notification-btn:hover {
  background: rgba(255,255,255,0.14);
}

.notification-menu {
  width: 360px;
  max-width: 94vw;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 18px 50px rgba(20,10,30,0.28);
}

.notification-header {
  padding: 16px;
  background:
    linear-gradient(
      135deg,
      #15111f,
      #e91e63
    );
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
  color: rgba(255,255,255,0.72);
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
  background:
    linear-gradient(
      135deg,
      #e91e63,
      #9c27b0
    );
}

.notif-avatar-read {
  background: #9e9e9e;
}

.notification-date {
  margin-top: 4px;
  color: #9e9e9e;
}

/* USUARIO HEADER */

.user-dropdown {
  min-height: 44px;
  border-radius: 18px;
  padding: 4px 8px;
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(248,215,161,0.18);
}

.user-dropdown:hover {
  background: rgba(255,255,255,0.14);
}

.user-label {
  gap: 9px;
}

.user-avatar {
  background:
    linear-gradient(
      135deg,
      #e91e63,
      #b8860b
    );

  box-shadow:
    0 8px 20px rgba(233,30,99,0.35);
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
  color: rgba(255,236,200,0.78);
}

.user-menu {
  min-width: 235px;
  border-radius: 18px;
  overflow: hidden;
}

.menu-user-avatar {
  background:
    linear-gradient(
      135deg,
      #e91e63,
      #b8860b
    );
}

/* SIDEBAR */

.premium-drawer {
  background: #15111f !important;
  color: white !important;
  border: none;

  box-shadow:
    12px 0 35px rgba(20,10,30,0.28);
}

.premium-drawer :deep(.q-drawer__content) {
  background: #15111f !important;
  color: white !important;
}

/* BRAND */

.drawer-brand {
  padding: 28px 18px 24px;
  text-align: center;
}

.drawer-logo {
  background:
    linear-gradient(
      135deg,
      #e91e63,
      #9c27b0
    );

  box-shadow:
    0 16px 35px rgba(233,30,99,0.45);
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

/* MENU */

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

/* ITEM */

.menu-item {
  width: 100%;
  min-height: 64px;

  margin-bottom: 14px;

  border-radius: 22px;

  color: white !important;

  background:
    linear-gradient(
      135deg,
      #2a1b35,
      #1c1428
    );

  border:
    1px solid rgba(248, 215, 161, 0.25);

  font-weight: 800;

  transition: all 0.25s ease;

  padding-left: 8px;
  padding-right: 8px;

  box-shadow:
    0 10px 24px rgba(20,10,30,0.30);
}

.menu-item:hover {
  color: white !important;

  background:
    linear-gradient(
      135deg,
      #e91e63,
      #b8860b
    );

  transform: translateX(5px);

  box-shadow:
    0 14px 30px rgba(233,30,99,0.38);
}

/* ACTIVE */

.menu-active {
  color: white !important;

  background:
    linear-gradient(
      135deg,
      #e91e63,
      #b8860b
    ) !important;

  border:
    1px solid rgba(248, 215, 161, 0.45);

  box-shadow:
    0 14px 34px rgba(233,30,99,0.45);
}

/* ICON */

.menu-icon-box {
  width: 46px;
  height: 46px;

  border-radius: 16px;

  display: grid;
  place-items: center;

  background:
    rgba(233,30,99,0.22);

  color: white;

  box-shadow:
    inset 0 0 0 1px rgba(255,255,255,0.12);
}

.menu-active .menu-icon-box {
  background:
    rgba(255,255,255,0.20);
}

/* LABEL */

.menu-label {
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0.2px;
  color: white !important;
}

/* FOOTER */

.drawer-footer {
  position: absolute;

  left: 14px;
  right: 14px;
  bottom: 18px;

  padding: 13px;

  border-radius: 18px;

  display: flex;
  align-items: center;
  gap: 12px;

  background:
    rgba(255,255,255,0.08);

  border:
    1px solid rgba(248,215,161,0.15);
}

.status-dot {
  width: 13px;
  height: 13px;

  background: #00e676;

  border-radius: 50%;

  box-shadow:
    0 0 18px rgba(0,230,118,0.85);
}

.footer-title {
  font-size: 13px;
  font-weight: 900;
  color: #f8d7a1;
}

.footer-subtitle {
  font-size: 11px;
  color: rgba(255, 236, 200, 0.75);
}

/* CONTENT */

.page-container {
  background: #f6f7fb;
}

/* MOBILE */

@media (max-width: 600px) {

  .toolbar {
    min-height: 62px;
    padding: 0 10px;
  }

  .top-title {
    font-size: 18px;
  }

  .top-subtitle {
    display: none;
  }

  .user-info {
    display: none;
  }

  .user-dropdown {
    padding: 4px;
    border-radius: 50%;
  }

  .drawer-title {
    font-size: 24px;
  }

  .menu-item {
    min-height: 56px;
  }

  .notification-menu {
    width: 92vw;
  }

}

</style>