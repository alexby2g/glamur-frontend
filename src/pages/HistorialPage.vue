<template>
  <q-page class="q-pa-lg historial-page">

    <!-- HEADER -->
    <div class="page-header q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-primary">
          🕘 Historial
        </div>

        <div class="text-grey-7">
          Clientes, citas y servicios enviados al historial
        </div>
      </div>

      <q-btn
        class="btn-glamur"
        icon="refresh"
        label="Actualizar"
        unelevated
        rounded
        :loading="loading"
        @click="loadAll"
      />
    </div>

    <!-- CLIENTES ELIMINADOS -->
    <q-card class="historial-card q-mb-xl">
      <q-card-section class="section-header">
        <div>
          <div class="text-h5 text-weight-bold">
            👥 Clientes eliminados
          </div>

          <div class="text-grey-7">
            Clientes enviados al historial
          </div>
        </div>

        <q-badge class="count-badge" rounded>
          {{ clientesEliminados.length }}
        </q-badge>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <q-table
          class="tabla-glamur"
          :rows="clientesEliminados"
          :columns="columnsClientes"
          row-key="id"
          :loading="loadingClientes"
          no-data-label="No hay clientes eliminados"
          flat
          bordered
          :rows-per-page-options="[5, 10, 20, 50]"
        >
          <template #body-cell-nombre="props">
            <q-td :props="props">
              <div class="text-weight-bold text-pink-7">
                {{ props.row.nombre || 'Sin nombre' }}
              </div>

              <div class="text-caption text-grey-7">
                Cliente eliminado
              </div>
            </q-td>
          </template>

          <template #body-cell-telefono="props">
            <q-td :props="props">
              <div class="telefono-box">
                <q-icon name="phone" color="green" size="18px" />
                <span>{{ props.row.telefono || 'Sin teléfono' }}</span>
              </div>
            </q-td>
          </template>

          <template #body-cell-deleted_at="props">
            <q-td :props="props">
              {{ formatDate(props.row.deleted_at) }}
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <div class="acciones">
                <q-btn
                  round
                  unelevated
                  size="sm"
                  color="positive"
                  icon="restore"
                  @click="recuperarCliente(props.row)"
                >
                  <q-tooltip>Recuperar cliente</q-tooltip>
                </q-btn>

                <q-btn
                  round
                  unelevated
                  size="sm"
                  color="negative"
                  icon="delete_forever"
                  @click="eliminarClienteDefinitivo(props.row)"
                >
                  <q-tooltip>Eliminar definitivamente</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- CITAS / SERVICIOS BORRADOS -->
    <q-card class="historial-card">
      <q-card-section class="section-header">
        <div>
          <div class="text-h5 text-weight-bold">
            📅 Citas / servicios borrados
          </div>

          <div class="text-grey-7">
            Citas eliminadas que pueden recuperarse o eliminarse definitivamente
          </div>
        </div>

        <q-badge class="count-badge purple" rounded>
          {{ citasEliminadas.length }}
        </q-badge>
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pa-none">
        <q-table
          class="tabla-glamur"
          :rows="citasEliminadas"
          :columns="columnsCitas"
          row-key="id"
          :loading="loadingCitas"
          no-data-label="No hay citas o servicios eliminados"
          flat
          bordered
          :rows-per-page-options="[5, 10, 20, 50]"
        >
          <template #body-cell-servicio="props">
            <q-td :props="props">
              <div class="text-weight-bold text-purple-7">
                {{ props.row.servicio || 'Sin servicio' }}
              </div>

              <div class="text-caption text-grey-7">
                Cliente: {{ props.row.cliente?.nombre || props.row.cliente_nombre || 'Sin cliente' }}
              </div>
            </q-td>
          </template>

          <template #body-cell-fecha="props">
            <q-td :props="props">
              {{ props.row.fecha || 'Sin fecha' }}
            </q-td>
          </template>

          <template #body-cell-precio="props">
            <q-td :props="props">
              <div class="text-weight-bold text-green-8">
                Bs {{ money(props.row.precio) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-deleted_at="props">
            <q-td :props="props">
              {{ formatDate(props.row.deleted_at) }}
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <div class="acciones">
                <q-btn
                  round
                  unelevated
                  size="sm"
                  color="positive"
                  icon="restore"
                  @click="recuperarCita(props.row)"
                >
                  <q-tooltip>Recuperar cita</q-tooltip>
                </q-btn>

                <q-btn
                  round
                  unelevated
                  size="sm"
                  color="negative"
                  icon="delete_forever"
                  @click="eliminarCitaDefinitiva(props.row)"
                >
                  <q-tooltip>Eliminar definitivamente</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

defineOptions({
  name: 'HistorialPage'
})

const $q = useQuasar()

const clientesEliminados = ref([])
const citasEliminadas = ref([])

const loadingClientes = ref(false)
const loadingCitas = ref(false)

const loading = computed(() => loadingClientes.value || loadingCitas.value)

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
    field: 'telefono',
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
    field: 'fecha',
    align: 'left',
    sortable: true
  },
  {
    name: 'precio',
    label: 'Precio',
    field: 'precio',
    align: 'left',
    sortable: true
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

const rutas = {
  historialEliminados: '/historial/eliminados',

  recuperarCliente: id => `/historial/clientes/${id}/restaurar`,
  recuperarCita: id => `/historial/citas/${id}/restaurar`,
  recuperarPago: id => `/historial/pagos/${id}/restaurar`,

  eliminarClienteDefinitivo: id => `/historial/clientes/${id}/eliminar`,
  eliminarCitaDefinitiva: id => `/historial/citas/${id}/eliminar`,
  eliminarPagoDefinitivo: id => `/historial/pagos/${id}/eliminar`,

  limpiarHistorial: '/historial/limpiar'
}

function responseToArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.clientes_eliminados)) return data.clientes_eliminados
  if (Array.isArray(data?.citas_eliminadas)) return data.citas_eliminadas
  if (Array.isArray(data?.pagos_eliminados)) return data.pagos_eliminados
  return []
}

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || error?.message || 'Ocurrió un error'
}

function money(value) {
  return Number(value || 0).toFixed(2)
}

function formatDate(value) {
  if (!value) return 'Sin fecha'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function loadAll() {
  loadingClientes.value = true
  loadingCitas.value = true

  try {
    const { data } = await api.get(rutas.historialEliminados)

    clientesEliminados.value = responseToArray(data?.clientes_eliminados)
    citasEliminadas.value = responseToArray(data?.citas_eliminadas)
  } catch (error) {
    clientesEliminados.value = []
    citasEliminadas.value = []

    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    loadingClientes.value = false
    loadingCitas.value = false
  }
}

function recuperarCliente(row) {
  $q.dialog({
    title: 'Recuperar cliente',
    message: `¿Deseas recuperar a "${row.nombre || 'este cliente'}"?`,
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
    try {
      await api.put(rutas.recuperarCliente(row.id))

      $q.notify({
        type: 'positive',
        message: 'Cliente recuperado correctamente'
      })

      await loadAll()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

function eliminarClienteDefinitivo(row) {
  $q.dialog({
    title: 'Eliminar definitivamente',
    message: `Esta acción no se podrá deshacer. ¿Deseas eliminar definitivamente a "${row.nombre || 'este cliente'}"?`,
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
  }).onOk(async () => {
    try {
      await api.delete(rutas.eliminarClienteDefinitivo(row.id))

      $q.notify({
        type: 'positive',
        message: 'Cliente eliminado definitivamente'
      })

      await loadAll()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

function recuperarCita(row) {
  $q.dialog({
    title: 'Recuperar cita',
    message: `¿Deseas recuperar "${row.servicio || 'esta cita'}"?`,
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
    try {
      await api.put(rutas.recuperarCita(row.id))

      $q.notify({
        type: 'positive',
        message: 'Cita recuperada correctamente'
      })

      await loadAll()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

function eliminarCitaDefinitiva(row) {
  $q.dialog({
    title: 'Eliminar definitivamente',
    message: `Esta acción no se podrá deshacer. ¿Deseas eliminar definitivamente "${row.servicio || 'esta cita'}"?`,
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
  }).onOk(async () => {
    try {
      await api.delete(rutas.eliminarCitaDefinitiva(row.id))

      $q.notify({
        type: 'positive',
        message: 'Cita eliminada definitivamente'
      })

      await loadAll()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

onMounted(loadAll)
</script>

<style scoped>
.historial-page {
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

.historial-card {
  border-radius: 28px;
  overflow: hidden;
  background: white;
  box-shadow: 0 16px 38px rgba(156, 39, 176, 0.12);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 24px;
}

.count-badge {
  background: #e91e63;
  color: white;
  font-size: 14px;
  font-weight: 900;
  padding: 8px 12px;
}

.count-badge.purple {
  background: #9c27b0;
}

.tabla-glamur {
  background: white;
}

.tabla-glamur :deep(.q-table__middle) {
  overflow-x: auto;
}

.tabla-glamur :deep(.q-table thead tr) {
  background: linear-gradient(135deg, #fce4ec, #f3e5f5);
  color: #880e4f;
}

.tabla-glamur :deep(.q-table th) {
  font-weight: 900;
  font-size: 13px;
}

.tabla-glamur :deep(.q-table tbody tr:hover) {
  background: #fff0f6;
}

.telefono-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #2e7d32;
  white-space: nowrap;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.acciones .q-btn {
  margin: 2px;
}

@media (max-width: 700px) {
  .historial-page {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-header .q-btn {
    width: 100%;
  }

  .section-header {
    align-items: flex-start;
    flex-direction: column;
    padding: 20px;
  }

  .historial-card {
    border-radius: 22px;
  }

  .tabla-glamur :deep(.q-table th),
  .tabla-glamur :deep(.q-table td) {
    padding: 8px 10px;
    font-size: 13px;
  }

  .acciones {
    gap: 6px;
  }
}
</style>