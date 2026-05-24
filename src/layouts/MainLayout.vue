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
            <q-icon name="spa" color="white" size="24px" />
          </q-avatar>

          <div class="q-ml-sm">
            <div class="top-title">Glamur</div>
            <div class="top-subtitle">
              Sistema de gestión
            </div>
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

    <!-- SIDEBAR -->
    <q-drawer
      v-model="drawer"
      show-if-above
      :width="245"
      class="premium-drawer"
    >

      <!-- BRAND -->
      <div class="drawer-brand">

        <q-avatar class="drawer-logo" size="72px">
          <q-icon name="spa" color="white" size="38px" />
        </q-avatar>

        <div class="drawer-title">
          Glamur
        </div>

        <div class="drawer-subtitle">
          Panel administrativo
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

    <!-- PAGE -->
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
        },

        {
          label: 'Historial Clientes',
          icon: 'manage_search',
          to: '/historial-clientes'
        }
      ]
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

.top-action {
  background: rgba(255,255,255,0.08);
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
  font-size: 27px;
  font-weight: 900;
  color: white;
}

.drawer-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255,255,255,0.62);
}

/* MENU */

.menu-list {
  padding: 0 12px 110px;
}

.menu-header {
  color: rgba(255,255,255,0.48) !important;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 1.2px;
  padding-left: 10px;
}

/* ITEM */

.menu-item {
  width: 100%;
  min-height: 62px;

  margin-bottom: 12px;

  border-radius: 20px;

  color: white !important;

  background:
    rgba(255,255,255,0.08);

  font-weight: 800;

  transition: all 0.25s ease;

  padding-left: 8px;
  padding-right: 8px;
}

.menu-item:hover {
  color: white !important;

  background:
    rgba(233,30,99,0.25);

  transform: translateX(4px);

  box-shadow:
    0 10px 24px rgba(233,30,99,0.18);
}

/* ACTIVE */

.menu-active {
  color: white !important;

  background:
    linear-gradient(
      135deg,
      #e91e63,
      #9c27b0
    ) !important;

  box-shadow:
    0 12px 28px rgba(233,30,99,0.35);
}

/* ICON */

.menu-icon-box {
  width: 46px;
  height: 46px;

  border-radius: 16px;

  display: grid;
  place-items: center;

  background:
    rgba(255,255,255,0.12);

  color: white;
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
    1px solid rgba(255,255,255,0.08);
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
  color: white;
}

.footer-subtitle {
  font-size: 11px;
  color: rgba(255,255,255,0.58);
}

/* PAGE */

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

}
</style>