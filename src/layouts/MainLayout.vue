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
          @click="drawer = !drawer"
        />

        <q-toolbar-title class="row items-center no-wrap">
          <q-avatar class="logo-avatar" size="38px">
            <q-icon name="spa" color="white" size="24px" />
          </q-avatar>

          <div class="q-ml-sm">
            <div class="app-title">Glamur</div>
            <div class="app-subtitle">Sistema de gestión</div>
          </div>
        </q-toolbar-title>

        <q-btn
          flat
          round
          dense
          icon="notifications"
          color="white"
        />

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      bordered
      class="main-drawer"
      :width="270"
    >

      <div class="drawer-brand">
        <q-avatar class="drawer-logo" size="64px">
          <q-icon name="spa" color="white" size="36px" />
        </q-avatar>

        <div class="drawer-title">Glamur</div>
        <div class="drawer-subtitle">Panel administrativo</div>
      </div>

      <q-list class="menu-list">

        <q-item-label header class="menu-header">
          Menú Principal
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
            <q-icon :name="item.icon" />
          </q-item-section>

          <q-item-section>
            {{ item.label }}
          </q-item-section>
        </q-item>

      </q-list>

      <div class="drawer-footer">
        <q-icon name="cloud_done" color="positive" />
        <span>Conectado online</span>
      </div>

    </q-drawer>

    <q-page-container>
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
        }
      ]
    }
  }
}
</script>

<style scoped>
.main-layout {
  background: #f7f7fb;
}

.main-header {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  box-shadow: 0 8px 28px rgba(156, 39, 176, 0.25);
}

.toolbar {
  min-height: 68px;
}

.logo-avatar {
  background: rgba(255, 255, 255, 0.18);
}

.app-title {
  font-weight: 900;
  font-size: 20px;
  line-height: 20px;
}

.app-subtitle {
  font-size: 11px;
  opacity: 0.85;
}

.main-drawer {
  background:
    radial-gradient(circle at top, rgba(233, 30, 99, 0.13), transparent 35%),
    #ffffff;
}

.drawer-brand {
  padding: 26px 18px 18px;
  text-align: center;
}

.drawer-logo {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  box-shadow: 0 12px 25px rgba(233, 30, 99, 0.28);
}

.drawer-title {
  margin-top: 12px;
  font-size: 24px;
  font-weight: 900;
  color: #c2185b;
}

.drawer-subtitle {
  font-size: 12px;
  color: #777;
}

.menu-list {
  padding: 0 12px;
}

.menu-header {
  color: #999;
  font-weight: 800;
  font-size: 12px;
}

.menu-item {
  margin-bottom: 8px;
  border-radius: 16px;
  color: #555;
  font-weight: 700;
  transition: all 0.22s ease;
}

.menu-item:hover {
  background: rgba(233, 30, 99, 0.08);
  color: #c2185b;
}

.menu-active {
  background: linear-gradient(135deg, #e91e63, #9c27b0) !important;
  color: white !important;
  box-shadow: 0 10px 24px rgba(233, 30, 99, 0.25);
}

.drawer-footer {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  padding: 12px;
  border-radius: 16px;
  background: #f4fff7;
  color: #2e7d32;
  font-size: 13px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 8px;
}

@media (max-width: 600px) {
  .toolbar {
    min-height: 60px;
  }

  .app-title {
    font-size: 18px;
  }

  .app-subtitle {
    display: none;
  }
}
</style>