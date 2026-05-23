<template>
  <q-page class="q-pa-lg clientes-page">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-primary">
          👥 Clientes
        </div>
        <div class="text-grey-7">
          Registro y administración de clientes
        </div>
      </div>

      <q-btn
        icon="add"
        label="Nuevo Cliente"
        class="btn-electrofrio"
        unelevated
        rounded
        @click="openDialog"
      />
    </div>

    <q-card class="card-table">
      <q-table
        :rows="clientes"
        :columns="columns"
        row-key="id"
        :loading="loading"
        no-data-label="No hay clientes registrados"
        flat
      >
        <template #body-cell-actions="props">
          <q-td :props="props">
            <q-btn icon="edit" flat round color="primary" @click="edit(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn icon="delete" flat round color="negative" @click="remove(props.row)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="dialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="dialog-header">
          <div class="text-h6 text-weight-bold">
            {{ form.id ? 'Editar cliente' : 'Nuevo cliente' }}
          </div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-input v-model.trim="form.nombre" label="Nombre *" outlined rounded />
          <q-input v-model.trim="form.telefono" label="Teléfono" outlined rounded />
          <q-input v-model.trim="form.email" label="Email" outlined rounded type="email" />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn class="btn-electrofrio" label="Guardar" :loading="saving" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

defineOptions({ name: 'ClientesPage' })

const $q = useQuasar()
const clientes = ref([])
const dialog = ref(false)
const loading = ref(false)
const saving = ref(false)

const form = ref({ id: null, nombre: '', telefono: '', email: '' })

const columns = [
  { name: 'nombre', label: 'Nombre', field: 'nombre', align: 'left', sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' },
  { name: 'email', label: 'Email', field: 'email', align: 'left' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

function getErrorMessage(error) {
  const data = error?.response?.data
  if (data?.errors) return Object.values(data.errors).flat().join(' ')
  return data?.message || data?.error || 'Ocurrió un error'
}

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/clientes')
    clientes.value = data
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  } finally {
    loading.value = false
  }
}

function openDialog() {
  form.value = { id: null, nombre: '', telefono: '', email: '' }
  dialog.value = true
}

function edit(row) {
  form.value = {
    id: row.id,
    nombre: row.nombre || '',
    telefono: row.telefono || '',
    email: row.email || ''
  }
  dialog.value = true
}

async function save() {
  if (!form.value.nombre) {
    $q.notify({ type: 'negative', message: 'El nombre es obligatorio' })
    return
  }

  saving.value = true
  try {
    if (form.value.id) {
      await api.put(`/clientes/${form.value.id}`, form.value)
      $q.notify({ type: 'positive', message: 'Cliente actualizado correctamente' })
    } else {
      await api.post('/clientes', form.value)
      $q.notify({ type: 'positive', message: 'Cliente registrado correctamente' })
    }

    dialog.value = false
    await load()
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  } finally {
    saving.value = false
  }
}

function guardarHistorialCliente(cliente) {
  const historial = JSON.parse(localStorage.getItem('clientes_eliminados') || '[]')

  historial.unshift({
    ...cliente,
    fecha_eliminacion: new Date().toLocaleString()
  })

  localStorage.setItem('clientes_eliminados', JSON.stringify(historial))
}

function remove(row) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Deseas eliminar a ${row.nombre}? Se guardará en historial.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      guardarHistorialCliente(row)
      await api.delete(`/clientes/${row.id}`)
      $q.notify({ type: 'positive', message: 'Cliente eliminado y guardado en historial' })
      await load()
    } catch (error) {
      $q.notify({ type: 'negative', message: getErrorMessage(error) })
    }
  })
}

onMounted(load)
</script>

<style scoped>
.clientes-page {
  min-height: 100vh;
}

.card-table {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 14px 35px rgba(13, 71, 161, 0.12);
}

.dialog-card {
  width: 440px;
  max-width: 95vw;
  border-radius: 24px;
}

.dialog-header {
  background: linear-gradient(135deg, #0d47a1, #c62828);
  color: white;
}
</style>