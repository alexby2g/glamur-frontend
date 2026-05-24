<template>
  <q-layout view="lHh Lpr lFf" class="main-layout">

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
          <q-avatar class="top-logo" size="40px">
            <q-icon name="spa" color="white" size="24px" />
          </q-avatar>

          <div class="q-ml-sm">
            <div class="top-title">Glamur</div>
            <div class="top-subtitle">Sistema de gestión</div>
          </div>
        </q-toolbar-title>

        <q-btn
          flat
          round
          dense
          icon="notifications"
          color="white"
          class="top-action"
        />

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      :width="245"
      class="premium-drawer"
    >

      <div class="drawer-bg-effect"></div>

      <div class="drawer-brand">
        <q-avatar class="drawer-logo" size="70px">
          <q-icon name="spa" color="white" size="38px" />
        </q-avatar>

        <div class="drawer-title">Glamur</div>
        <div class="drawer-subtitle">Panel administrativo</div>
      </div>

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

      <div class="drawer-footer">
        <div class="status-dot"></div>

        <div>
          <div class="footer-title">Servidor online</div>
          <div class="footer-subtitle">Render + Neon activo</div>
        </div>
      </div>

    </q-drawer>

    <q-page-container class="page-container">
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>
export default {
  name: 'MainLayout',

  data () {
    return {
      drawer: false,
      menu: [
        { label: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
        { label: 'Clientes', icon: 'people', to: '/clientes' },
        { label: 'Citas', icon: 'event', to: '/citas' },
        { label: 'Calendario', icon: 'calendar_month', to: '/calendario' },
        { label: 'Pagos', icon: 'payments', to: '/pagos' },
        { label: 'Historial', icon: 'history', to: '/historial' },
        { label: 'Historial Clientes', icon: 'manage_search', to: '/historial-clientes' }
      ]
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

.top-title {
  font-size: 21px;
  font-weight: 900;
  color: white;
  line-height: 20px;
}

.top-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
}

.top-action {
  background: rgba(255, 255, 255, 0.08);
}

.premium-drawer {
  background: linear-gradient(180deg, #120f1c 0%, #1b1024 55%, #25112d 100%);
  color: white;
  border: none;
  box-shadow: 12px 0 35px rgba(20, 10, 30, 0.25);
  position: relative;
  overflow: hidden;
}

.drawer-bg-effect {
  position: absolute;
  width: 220px;
  height: 220px;
  background: rgba(233, 30, 99, 0.23);
  border-radius: 50%;
  top: -90px;
  right: -90px;
  filter: blur(8px);
}

.drawer-brand {
  position: relative;
  z-index: 1;
  padding: 28px 18px 18px;
  text-align: center;
}

.drawer-logo {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  box-shadow: 0 16px 35px rgba(233, 30, 99, 0.45);
}

.drawer-title {
  margin-top: 14px;
  font-size: 27px;
  font-weight: 900;
}

.drawer-subtitle {
  margin-top: 3px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.58);
}

.menu-list {
  position: relative;
  z-index: 1;
  padding: 0 12px 110px;
}

.menu-header {
  color: rgba(255, 255, 255, 0.42);
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1.2px;
  padding-left: 10px;
}

.menu-item {
  width: 100%;
  min-height: 62px;
  margin-bottom: 12px;
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.82);
  font-weight: 800;
  transition: all 0.25s ease;
  padding-left: 8px;
  padding-right: 8px;
}

.menu-item:hover {
  color: white;
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
  box-shadow: 0 10px 24px rgba(233, 30, 99, 0.18);
}

.menu-icon-box {
  width: 46px;
  height: 46px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.08);
}

.menu-label {
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 0.2px;
}

.menu-active {
  color: white !important;
  background: linear-gradient(135deg, #e91e63, #9c27b0) !important;
  box-shadow: 0 12px 28px rgba(233, 30, 99, 0.36);
}

.menu-active .menu-icon-box {
  background: rgba(255, 255, 255, 0.18);
}

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
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.status-dot {
  width: 13px;
  height: 13px;
  background: #00e676;
  border-radius: 50%;
  box-shadow: 0 0 18px rgba(0, 230, 118, 0.85);
}

.footer-title {
  font-size: 13px;
  font-weight: 900;
}

.footer-subtitle {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.55);
}

.page-container {
  background: #f6f7fb;
}

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
}
</style>