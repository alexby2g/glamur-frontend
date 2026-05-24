<template>
  <q-page class="q-pa-lg clientes-page">

    <!-- HEADER -->
    <div class="page-header q-mb-lg">
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
        class="btn-glamur"
        unelevated
        rounded
        @click="openDialog"
      />
    </div>

    <!-- TABLA -->
    <q-card class="card-table">
      <q-table
        :rows="clientes"
        :columns="columns"
        row-key="id"
        :loading="loading"
        no-data-label="No hay clientes registrados"
        flat
        bordered
        :rows-per-page-options="[5, 10, 20, 50]"
      >
        <!-- NOMBRE -->
        <template #body-cell-nombre="props">
          <q-td :props="props">
            <div class="text-weight-bold text-pink-7">
              {{ props.row.nombre || 'Sin nombre' }}
            </div>

            <div class="text-caption text-grey-7">
              Cliente Glamur
            </div>
          </q-td>
        </template>

        <!-- TELÉFONO -->
        <template #body-cell-telefono="props">
          <q-td :props="props">
            <div class="telefono-box">
              <q-icon name="phone" color="green" size="18px" />

              <span>
                {{ props.row.telefono || 'Sin número' }}
              </span>
            </div>
          </q-td>
        </template>

        <!-- ACCIONES -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <div class="acciones">
              <q-btn
                icon="edit"
                round
                unelevated
                size="sm"
                color="primary"
                @click="edit(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>

              <q-btn
                icon="delete"
                round
                unelevated
                size="sm"
                color="negative"
                @click="remove(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- DIALOG -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="dialog-card">

        <q-card-section class="dialog-header row items-center">
          <div class="text-h6 text-weight-bold">
            {{ form.id ? '✏️ Editar cliente' : '👤 Nuevo cliente' }}
          </div>

          <q-space />

          <q-btn
            icon="close"
            flat
            round
            dense
            color="white"
            v-close-popup
          />
        </q-card-section>

        <q-card-section class="dialog-body">
          <div class="q-gutter-md">
            <q-input
              v-model.trim="form.nombre"
              label="Nombre completo *"
              outlined
              rounded
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="person" color="pink" />
              </template>
            </q-input>

            <q-input
              v-model.trim="form.telefono"
              label="Número de teléfono *"
              outlined
              rounded
              bg-color="white"
              type="tel"
            >
              <template #prepend>
                <q-icon name="phone" color="green" />
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            v-close-popup
          />

          <q-btn
            class="btn-glamur"
            label="Guardar"
            :loading="saving"
            @click="save"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

defineOptions({
  name: 'ClientesPage'
})

const $q = useQuasar()

const clientes = ref([])
const dialog = ref(false)
const loading = ref(false)
const saving = ref(false)

const form = ref({
  id: null,
  nombre: '',
  telefono: ''
})

const columns = [
  {
    name: 'nombre',
    label: 'Nombre completo',
    field: 'nombre',
    align: 'left',
    sortable: true
  },
  {
    name: 'telefono',
    label: 'Número de teléfono',
    field: 'telefono',
    align: 'left'
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || 'Ocurrió un error'
}

async function load() {
  loading.value = true

  try {
    const { data } = await api.get('/clientes')

    clientes.value = Array.isArray(data)
      ? data
      : (data?.data || [])
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    loading.value = false
  }
}

function openDialog() {
  form.value = {
    id: null,
    nombre: '',
    telefono: ''
  }

  dialog.value = true
}

function edit(row) {
  form.value = {
    id: row.id,
    nombre: row.nombre || '',
    telefono: row.telefono || ''
  }

  dialog.value = true
}

async function save() {
  if (!form.value.nombre.trim()) {
    $q.notify({
      type: 'warning',
      message: 'El nombre completo es obligatorio'
    })

    return
  }

  if (!form.value.telefono.trim()) {
    $q.notify({
      type: 'warning',
      message: 'El número de teléfono es obligatorio'
    })

    return
  }

  saving.value = true

  try {
    const payload = {
      nombre: form.value.nombre.trim(),
      telefono: form.value.telefono.trim(),
      email: null
    }

    if (form.value.id) {
      await api.put(`/clientes/${form.value.id}`, payload)

      $q.notify({
        type: 'positive',
        message: 'Cliente actualizado correctamente'
      })
    } else {
      await api.post('/clientes', payload)

      $q.notify({
        type: 'positive',
        message: 'Cliente registrado correctamente'
      })
    }

    dialog.value = false

    await load()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    saving.value = false
  }
}

function remove(row) {
  $q.dialog({
    title: 'Eliminar cliente',
    message: `¿Deseas eliminar a "${row.nombre}"? Se enviará al historial y podrás recuperarlo después.`,
    persistent: true,
    ok: {
      label: 'Eliminar',
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
      await api.delete(`/clientes/${row.id}`)

      $q.notify({
        type: 'positive',
        message: 'Cliente enviado al historial correctamente'
      })

      await load()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

onMounted(load)
</script>

<style scoped>
.clientes-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(233, 30, 99, 0.10), transparent 32%),
    linear-gradient(180deg, #fff7fb 0%, #f7f7fb 100%);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.btn-glamur {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
  box-shadow: 0 12px 28px rgba(233, 30, 99, 0.26);
}

.card-table {
  border-radius: 24px;
  overflow: hidden;
  background: white;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
}

.card-table :deep(.q-table thead tr) {
  background: linear-gradient(135deg, #fce4ec, #f3e5f5);
  color: #880e4f;
}

.card-table :deep(.q-table th) {
  font-weight: 900;
  font-size: 13px;
}

.card-table :deep(.q-table tbody tr:hover) {
  background: #fff0f6;
}

.telefono-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #2e7d32;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.dialog-card {
  width: 460px;
  max-width: 95vw;
  border-radius: 24px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
}

.dialog-body {
  background: white;
  padding: 24px;
}

.dialog-actions {
  padding: 16px 22px;
  background: white;
  border-top: 1px solid #eeeeee;
}

@media (max-width: 600px) {
  .clientes-page {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header .q-btn {
    width: 100%;
  }

  .dialog-card {
    width: 100%;
    max-width: 100%;
    border-radius: 20px;
  }

  .dialog-actions {
    flex-wrap: wrap;
    gap: 10px;
  }

  .dialog-actions .q-btn {
    width: 100%;
  }
}
</style>