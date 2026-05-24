<template>
  <q-page class="historial-page">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <div class="page-title">
          Historial
        </div>

        <div class="page-subtitle">
          Clientes y citas/servicios eliminados del sistema
        </div>
      </div>

      <div class="header-actions">
        <q-btn
          class="btn-restore-all"
          icon="restore"
          label="Recuperar todo"
          :loading="restoringAll"
          @click="restaurarTodo"
        />

        <q-btn
          class="btn-clean"
          icon="delete_sweep"
          label="Limpiar historial"
          :loading="cleaning"
          @click="limpiarHistorial"
        />
      </div>
    </div>

    <q-linear-progress
      v-if="loading"
      indeterminate
      color="pink"
      class="q-mb-md"
    />

    <div class="row q-col-gutter-lg">

      <!-- CLIENTES ELIMINADOS -->
      <div class="col-12 col-md-6">
        <q-card class="historial-card">

          <q-card-section class="card-title-row">
            <div>
              <div class="card-title">
                Clientes eliminados
              </div>

              <div class="card-subtitle">
                Clientes enviados al historial
              </div>
            </div>

            <q-badge color="pink" rounded>
              {{ clientesEliminados.length }}
            </q-badge>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-table
              class="tabla-historial"
              :rows="clientesEliminados"
              :columns="columnsClientes"
              row-key="id"
              flat
              bordered
              dense
              :rows-per-page-options="[5, 10, 20]"
              no-data-label="No hay clientes eliminados"
            >
              <template #body-cell-nombre="props">
                <q-td :props="props">
                  <div class="text-weight-bold text-pink-8">
                    {{ props.row.nombre || 'Sin nombre' }}
                  </div>

                  <div class="text-caption text-grey-7">
                    {{ props.row.telefono || 'Sin teléfono' }}
                  </div>
                </q-td>
              </template>

              <template #body-cell-telefono="props">
                <q-td :props="props">
                  {{ props.row.telefono || 'Sin teléfono' }}
                </q-td>
              </template>

              <template #body-cell-deleted_at="props">
                <q-td :props="props">
                  {{ formatDate(props.row.deleted_at) }}
                </q-td>
              </template>

              <template #body-cell-actions="props">
                <q-td :props="props" class="text-center">
                  <q-btn
                    round
                    unelevated
                    size="sm"
                    color="positive"
                    icon="restore"
                    :loading="restoringId === `cliente-${props.row.id}`"
                    @click="restaurarCliente(props.row)"
                  >
                    <q-tooltip>Recuperar cliente</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>

        </q-card>
      </div>

      <!-- CITAS ELIMINADAS -->
      <div class="col-12 col-md-6">
        <q-card class="historial-card">

          <q-card-section class="card-title-row">
            <div>
              <div class="card-title">
                Citas / servicios borrados
              </div>

              <div class="card-subtitle">
                Citas eliminadas que pueden recuperarse
              </div>
            </div>

            <q-badge color="purple" rounded>
              {{ citasEliminadas.length }}
            </q-badge>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-table
              class="tabla-historial"
              :rows="citasEliminadas"
              :columns="columnsCitas"
              row-key="id"
              flat
              bordered
              dense
              :rows-per-page-options="[5, 10, 20]"
              no-data-label="No hay servicios eliminados"
            >
              <template #body-cell-servicio="props">
                <q-td :props="props">
                  <div class="text-weight-bold text-purple-8">
                    {{ props.row.servicio || 'Servicio sin nombre' }}
                  </div>

                  <div class="text-caption text-grey-7">
                    Cliente: {{ props.row.cliente?.nombre || 'Sin cliente' }}
                  </div>
                </q-td>
              </template>

              <template #body-cell-precio="props">
                <q-td :props="props">
                  <b class="text-green-8">
                    Bs {{ money(props.row.precio) }}
                  </b>
                </q-td>
              </template>

              <template #body-cell-deleted_at="props">
                <q-td :props="props">
                  {{ formatDate(props.row.deleted_at) }}
                </q-td>
              </template>

              <template #body-cell-actions="props">
                <q-td :props="props" class="text-center">
                  <q-btn
                    round
                    unelevated
                    size="sm"
                    color="positive"
                    icon="restore"
                    :loading="restoringId === `cita-${props.row.id}`"
                    @click="restaurarCita(props.row)"
                  >
                    <q-tooltip>Recuperar cita</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>

        </q-card>
      </div>

    </div>

    <!-- VACÍO -->
    <div
      v-if="!loading && clientesEliminados.length === 0 && citasEliminadas.length === 0"
      class="empty-state"
    >
      <q-icon name="history" size="80px" color="pink-4" />

      <div class="empty-title">
        No hay elementos en el historial
      </div>

      <div class="empty-text">
        Cuando elimines clientes o citas, aparecerán aquí para poder recuperarlos.
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date } from 'quasar'

defineOptions({
  name: 'HistorialPage'
})

const $q = useQuasar()

const loading = ref(false)
const cleaning = ref(false)
const restoringAll = ref(false)
const restoringId = ref(null)

const clientesEliminados = ref([])
const citasEliminadas = ref([])

const columnsClientes = [
  {
    name: 'nombre',
    label: 'Cliente',
    field: 'nombre',
    align: 'left',
    sortable: true
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    field: row => row.telefono || 'Sin teléfono',
    align: 'left'
  },
  {
    name: 'deleted_at',
    label: 'Eliminado',
    field: 'deleted_at',
    align: 'left',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

const columnsCitas = [
  {
    name: 'servicio',
    label: 'Servicio',
    field: 'servicio',
    align: 'left',
    sortable: true
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: row => row.fecha || 'Sin fecha',
    align: 'left'
  },
  {
    name: 'precio',
    label: 'Precio',
    field: 'precio',
    align: 'left'
  },
  {
    name: 'deleted_at',
    label: 'Eliminado',
    field: 'deleted_at',
    align: 'left',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

function money(value) {
  return Number(value || 0).toFixed(2)
}

function formatDate(value) {
  if (!value) return 'Sin fecha'

  return date.formatDate(value, 'DD/MM/YYYY HH:mm')
}

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || 'Ocurrió un error'
}

async function loadHistorial() {
  loading.value = true

  try {
    const { data } = await api.get('/historial/eliminados')

    clientesEliminados.value = data?.clientes_eliminados || []
    citasEliminadas.value = data?.citas_eliminadas || []
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    loading.value = false
  }
}

function restaurarCliente(cliente) {
  $q.dialog({
    title: 'Recuperar cliente',
    message: `¿Deseas recuperar al cliente "${cliente.nombre}"?`,
    persistent: true,
    ok: {
      label: 'Recuperar',
      color: 'positive',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    restoringId.value = `cliente-${cliente.id}`

    try {
      await api.put(`/historial/clientes/${cliente.id}/restaurar`)

      $q.notify({
        type: 'positive',
        message: 'Cliente recuperado correctamente'
      })

      await loadHistorial()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    } finally {
      restoringId.value = null
    }
  })
}

function restaurarCita(cita) {
  $q.dialog({
    title: 'Recuperar cita',
    message: `¿Deseas recuperar el servicio "${cita.servicio}"?`,
    persistent: true,
    ok: {
      label: 'Recuperar',
      color: 'positive',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    restoringId.value = `cita-${cita.id}`

    try {
      await api.put(`/historial/citas/${cita.id}/restaurar`)

      $q.notify({
        type: 'positive',
        message: 'Cita recuperada correctamente'
      })

      await loadHistorial()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    } finally {
      restoringId.value = null
    }
  })
}

function restaurarTodo() {
  if (clientesEliminados.value.length === 0 && citasEliminadas.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay elementos para recuperar'
    })

    return
  }

  $q.dialog({
    title: 'Recuperar todo',
    message: '¿Deseas recuperar todos los clientes y citas eliminadas?',
    persistent: true,
    ok: {
      label: 'Recuperar todo',
      color: 'positive',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    restoringAll.value = true

    try {
      await api.put('/historial/restaurar-todo')

      $q.notify({
        type: 'positive',
        message: 'Todo el historial fue recuperado correctamente'
      })

      await loadHistorial()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    } finally {
      restoringAll.value = false
    }
  })
}

function limpiarHistorial() {
  if (clientesEliminados.value.length === 0 && citasEliminadas.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay historial para limpiar'
    })

    return
  }

  $q.dialog({
    title: 'Limpiar historial',
    message: 'Esto eliminará definitivamente los clientes y citas del historial. Esta acción no se puede deshacer.',
    persistent: true,
    ok: {
      label: 'Eliminar definitivamente',
      color: 'negative',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    cleaning.value = true

    try {
      await api.delete('/historial/limpiar')

      $q.notify({
        type: 'positive',
        message: 'Historial limpiado correctamente'
      })

      await loadHistorial()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    } finally {
      cleaning.value = false
    }
  })
}

onMounted(loadHistorial)
</script>

<style scoped>
.historial-page {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(233, 30, 99, 0.10), transparent 32%),
    linear-gradient(180deg, #f5f7ff 0%, #fff7fb 100%);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 26px;
}

.page-title {
  font-size: 36px;
  font-weight: 900;
  color: #1565c0;
  line-height: 1.1;
}

.page-subtitle {
  margin-top: 6px;
  color: #5f6775;
  font-size: 15px;
}

.header-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-restore-all {
  background: linear-gradient(135deg, #00a86b, #00897b);
  color: white;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 16px;
  box-shadow: 0 10px 25px rgba(0, 137, 123, 0.25);
}

.btn-clean {
  background: linear-gradient(135deg, #283593, #c62828);
  color: white;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 16px;
  box-shadow: 0 10px 25px rgba(198, 40, 40, 0.25);
}

.historial-card {
  border-radius: 24px;
  overflow: hidden;
  background: white;
  box-shadow: 0 16px 40px rgba(80, 70, 120, 0.13);
  border: 1px solid rgba(233, 30, 99, 0.08);
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 21px;
  font-weight: 900;
  color: #111827;
}

.card-subtitle {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

.tabla-historial {
  border-radius: 16px;
  overflow: hidden;
}

.tabla-historial :deep(.q-table thead tr) {
  background: linear-gradient(135deg, #fce4ec, #f3e5f5);
  color: #880e4f;
}

.tabla-historial :deep(.q-table th) {
  font-weight: 900;
}

.empty-state {
  margin-top: 60px;
  text-align: center;
  color: #6b7280;
}

.empty-title {
  margin-top: 12px;
  font-size: 24px;
  font-weight: 900;
  color: #c2185b;
}

.empty-text {
  margin-top: 4px;
  font-size: 14px;
}

@media (max-width: 700px) {
  .historial-page {
    padding: 14px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-title {
    font-size: 30px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .q-btn {
    width: 100%;
  }
}
</style>