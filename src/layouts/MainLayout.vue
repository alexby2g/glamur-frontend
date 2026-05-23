<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="header-app">
      <q-toolbar class="toolbar-app">
        <q-btn flat dense round icon="menu" class="btn-menu" @click="toggleLeftDrawer" />

        <q-avatar class="logo-app">
          <img src="../assets/logo-electrofrio.png">
        </q-avatar>

        <q-toolbar-title class="titulo-app">
          Glamur Agenda
        </q-toolbar-title>
      </q-toolbar>
    </q-header>
<template> <q-layout view="lHh Lpr lFf"> <q-header elevated class="bg-primary"> <q-toolbar> <q-btn flat dense round icon="menu" @click="toggleLeftDrawer" /> <q-toolbar-title>Glamur Agenda</q-toolbar-title> </q-toolbar> </q-header> <q-drawer v-model="leftDrawerOpen" show-if-above bordered> <q-list> <q-item-label header>Panel principal</q-item-label> <q-item clickable v-ripple to="/dashboard" exact> <q-item-section avatar><q-icon name="dashboard" /></q-item-section> <q-item-section>Dashboard</q-item-section> </q-item> <q-item clickable v-ripple to="/clientes" exact> <q-item-section avatar><q-icon name="people" /></q-item-section> <q-item-section>Clientes</q-item-section> </q-item> <q-item clickable v-ripple to="/citas" exact> <q-item-section avatar><q-icon name="event" /></q-item-section> <q-item-section>Citas</q-item-section> </q-item> <q-item clickable v-ripple to="/pagos" exact> <q-item-section avatar><q-icon name="payments" /></q-item-section> <q-item-section>Pagos</q-item-section> </q-item> <q-item clickable v-ripple to="/calendario" exact> <q-item-section avatar><q-icon name="calendar_month" /></q-item-section> <q-item-section>Calendario</q-item-section> </q-item> </q-list> </q-drawer> <q-page-container> <router-view /> </q-page-container> </q-layout> </template> <script setup> import { ref } from 'vue' defineOptions({ name: 'MainLayout' }) const leftDrawerOpen = ref(false) const toggleLeftDrawer = () => { leftDrawerOpen.value = !leftDrawerOpen.value } </script> actualiza// <template> <q-page class="q-pa-md"> <div class="row items-center justify-between q-mb-md"> <div class="text-h5">👥 Clientes</div> <q-btn color="primary" icon="add" label="Nuevo" @click="openDialog" /> </div> <q-table :rows="clientes" :columns="columns" row-key="id" :loading="loading" no-data-label="No hay clientes registrados" > <template #body-cell-actions="props"> <q-td :props="props"> <q-btn icon="edit" flat round color="primary" @click="edit(props.row)"> <q-tooltip>Editar</q-tooltip> </q-btn> <q-btn icon="delete" flat round color="red" @click="remove(props.row.id)"> <q-tooltip>Eliminar</q-tooltip> </q-btn> </q-td> </template> </q-table> <q-dialog v-model="dialog" persistent> <q-card style="width: 420px; max-width: 95vw"> <q-card-section> <div class="text-h6">{{ form.id ? 'Editar cliente' : 'Nuevo cliente' }}</div> </q-card-section> <q-card-section class="q-gutter-md"> <q-input v-model.trim="form.nombre" label="Nombre *" outlined autofocus :rules="[v => !!v || 'El nombre es obligatorio']" /> <q-input v-model.trim="form.telefono" label="Teléfono" outlined /> <q-input v-model.trim="form.email" label="Email" outlined type="email" /> </q-card-section> <q-card-actions align="right"> <q-btn flat label="Cancelar" v-close-popup /> <q-btn color="primary" label="Guardar" :loading="saving" @click="save" /> </q-card-actions> </q-card> </q-dialog> </q-page> </template> <script setup> import { ref, onMounted } from 'vue' import { useQuasar } from 'quasar' import { api } from 'boot/axios' defineOptions({ name: 'ClientesPage' }) const $q = useQuasar() const clientes = ref([]) const dialog = ref(false) const loading = ref(false) const saving = ref(false) const form = ref({ id: null, nombre: '', telefono: '', email: '' }) const columns = [ { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true }, { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' }, { name: 'email', label: 'Email', field: 'email', align: 'left' }, { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' } ] function getErrorMessage(error) { const data = error?.response?.data if (data?.errors) return Object.values(data.errors).flat().join(' ') return data?.message || data?.error || 'Ocurrió un error' } async function load() { loading.value = true try { const { data } = await api.get('/clientes') clientes.value = data } catch (error) { $q.notify({ type: 'negative', message: getErrorMessage(error) }) } finally { loading.value = false } } function openDialog() { form.value = { id: null, nombre: '', telefono: '', email: '' } dialog.value = true } function edit(row) { form.value = { id: row.id, nombre: row.nombre || '', telefono: row.telefono || '', email: row.email || '' } dialog.value = true } async function save() { if (!form.value.nombre) { $q.notify({ type: 'negative', message: 'El nombre es obligatorio' }) return } saving.value = true try { if (form.value.id) { await api.put(/clientes/${form.value.id}, form.value) $q.notify({ type: 'positive', message: 'Cliente actualizado correctamente' }) } else { await api.post('/clientes', form.value) $q.notify({ type: 'positive', message: 'Cliente registrado correctamente' }) } dialog.value = false await load() } catch (error) { $q.notify({ type: 'negative', message: getErrorMessage(error) }) } finally { saving.value = false } } function remove(id) { $q.dialog({ title: 'Confirmar eliminación', message: '¿Deseas eliminar este cliente?', cancel: true, persistent: true }).onOk(async () => { try { await api.delete(/clientes/${id}) $q.notify({ type: 'positive', message: 'Cliente eliminado correctamente' }) await load() } catch (error) { $q.notify({ type: 'negative', message: getErrorMessage(error) }) } }) } onMounted(load) </script>
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered class="drawer-app">
      <q-list padding>
        <q-item-label header class="menu-title">
          Panel principal
        </q-item-label>

        <q-item
          v-for="item in menu"
          :key="item.to"
          clickable
          v-ripple
          :to="item.to"
          exact
          class="menu-item"
          active-class="menu-activo"
        >
          <q-item-section avatar>
            <q-icon :name="item.icon" class="menu-icon" />
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold">
              {{ item.label }}
            </q-item-label>

            <q-item-label v-if="item.caption" caption>
              {{ item.caption }}
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container class="page-bg">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({ name: 'MainLayout' })

const leftDrawerOpen = ref(false)

const menu = [
  { to: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { to: '/clientes', icon: 'people', label: 'Clientes' },
  { to: '/citas', icon: 'event_available', label: 'Citas' },
  { to: '/pagos', icon: 'payments', label: 'Pagos' },
  { to: '/calendario', icon: 'calendar_month', label: 'Calendario' },
  { to: '/historial', icon: 'history', label: 'Historial', caption: 'Clientes y citas borradas' }
]

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
</script>

<style scoped>
.header-app {
  background: linear-gradient(135deg, #0d47a1, #7b1fa2, #c62828) !important;
}

.toolbar-app {
  min-height: 72px;
}

.btn-menu {
  margin-right: 12px;
}

.logo-app {
  width: 52px;
  height: 52px;
  background: white;
  padding: 4px;
  margin-right: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.28);
}

.logo-app img {
  object-fit: contain;
}

.titulo-app {
  font-weight: 900;
  font-size: 24px;
  letter-spacing: 0.6px;
}

.drawer-app {
  background: linear-gradient(180deg, #ffffff, #eef4ff);
}

.menu-title {
  color: #0d47a1;
  font-weight: 900;
  letter-spacing: 1px;
  text-transform: uppercase;
}

.menu-item {
  margin: 9px 10px;
  border-radius: 20px;
  transition: all 0.25s ease;
}

.menu-item:hover {
  background: #e3f2fd;
  transform: translateX(7px);
}

.menu-icon {
  color: #0d47a1;
}

.menu-activo {
  background: linear-gradient(135deg, #0d47a1, #c62828) !important;
  color: white !important;
  border-radius: 20px;
  box-shadow: 0 10px 22px rgba(13, 71, 161, 0.30);
}

.menu-activo .q-icon,
.menu-activo .menu-icon {
  color: white !important;
}

.page-bg {
  background: linear-gradient(135deg, #eef4ff, #fff5f7);
}
</style>