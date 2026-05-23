<template>
  <q-layout view="lHh Lpr lFf">

    <q-header elevated class="bg-pink">
      <q-toolbar>

        <q-btn
          flat
          dense
          round
          icon="menu"
          @click="drawer = !drawer"
        />

        <q-toolbar-title>
          Glamur
        </q-toolbar-title>

      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawer"
      show-if-above
      bordered
    >

      <q-list>

        <q-item-label header>
          Menú Principal
        </q-item-label>

        <q-item clickable to="/dashboard">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>

          <q-item-section>
            Dashboard
          </q-item-section>
        </q-item>

        <q-item clickable to="/clientes">
          <q-item-section avatar>
            <q-icon name="people" />
          </q-item-section>

          <q-item-section>
            Clientes
          </q-item-section>
        </q-item>

        <q-item clickable to="/citas">
          <q-item-section avatar>
            <q-icon name="event" />
          </q-item-section>

          <q-item-section>
            Citas
          </q-item-section>
        </q-item>

        <q-item clickable to="/calendario">
          <q-item-section avatar>
            <q-icon name="calendar_month" />
          </q-item-section>

          <q-item-section>
            Calendario
          </q-item-section>
        </q-item>

        <q-item clickable to="/pagos">
          <q-item-section avatar>
            <q-icon name="payments" />
          </q-item-section>

          <q-item-section>
            Pagos
          </q-item-section>
        </q-item>

        <q-item clickable to="/historial">
          <q-item-section avatar>
            <q-icon name="history" />
          </q-item-section>

          <q-item-section>
            Historial
          </q-item-section>
        </q-item>

      </q-list>

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
      drawer: false
    }
  }
}
</script>