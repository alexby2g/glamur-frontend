<template>
  <q-page class="q-pa-md historial-page">
    <!-- HERO -->
    <div class="historial-hero q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-primary">
          Historial
        </div>
        <div class="text-grey-7">
          Clientes, citas/servicios y pagos eliminados del sistema
        </div>
      </div>

      <div class="hero-actions">
        <q-btn
          icon="restore"
          label="Recuperar todo"
          class="btn-recuperar"
          unelevated
          :loading="loadingAction"
          @click="restaurarTodo"
        />

        <q-btn
          icon="delete_sweep"
          label="Limpiar historial"
          class="btn-limpiar"
          unelevated
          :loading="loadingAction"
          @click="limpiarHistorial"
        />
      </div>
    </div>

    <!-- CONTENIDO -->
    <div class="row q-col-gutter-lg">
      <!-- CLIENTES ELIMINADOS -->
      <div class="col-12 col-lg-6">
        <q-card class="historial-card">
          <q-card-section class="card-title-row">
            <div>
              <div class="text-h6 text-weight-bold">Clientes eliminados</div>
              <div class="text-caption text-grey-7">Clientes enviados al historial</div>
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
              :loading="loading"
              :rows-per-page-options="[5, 10, 20]"
              no-data-label="No hay clientes eliminados"
            >
              <template #body-cell-nombre="props">
                <q-td :props="props">
                  <div class="text-weight-bold text-pink-8">
                    {{ props.row.nombre || 'Sin nombre' }}
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
                    dense
                    unelevated
                    color="positive"
                    icon="restore"
                    @click="restaurarCliente(props.row.id)"
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
      <div class="col-12 col-lg-6">
        <q-card class="historial-card">
          <q-card-section class="card-title-row">
            <div>
              <div class="text-h6 text-weight-bold">Citas / servicios borrados</div>
              <div class="text-caption text-grey-7">Citas eliminadas que pueden recuperarse</div>
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
              :loading="loading"
              :rows-per-page-options="[5, 10, 20]"
              no-data-label="No hay citas o servicios eliminados"
            >
              <template #body-cell-servicio="props">
                <q-td :props="props">
                  <div class="text-weight-bold text-purple-8">
                    {{ props.row.servicio || 'Sin servicio' }}
                  </div>
                  <div class="text-caption text-grey-7">
                    Cliente: {{ props.row.cliente?.nombre || 'Sin cliente' }}
                  </div>
                </q-td>
              </template>

              <template #body-cell-precio="props">
                <q-td :props="props">
                  <b class="text-green-8">Bs {{ money(props.row.precio) }}</b>
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
                    dense
                    unelevated
                    color="positive"
                    icon="restore"
                    @click="restaurarCita(props.row.id)"
                  >
                    <q-tooltip>Recuperar cita</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- PAGOS ELIMINADOS -->
      <div class="col-12">
        <q-card class="historial-card pagos-card">
          <q-card-section class="card-title-row">
            <div>
              <div class="text-h6 text-weight-bold">Pagos eliminados</div>
              <div class="text-caption text-grey-7">Pagos borrados que pueden recuperarse</div>
            </div>

            <q-badge color="green" rounded>
              {{ pagosEliminados.length }}
            </q-badge>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-table
              class="tabla-historial"
              :rows="pagosEliminados"
              :columns="columnsPagos"
              row-key="id"
              flat
              bordered
              dense
              :loading="loading"
              :rows-per-page-options="[5, 10, 20, 50]"
              no-data-label="No hay pagos eliminados"
            >
              <template #body-cell-cliente="props">
                <q-td :props="props">
                  <div class="text-weight-bold text-pink-8">
                    {{ nombreClientePago(props.row) }}
                  </div>
                  <div class="text-caption text-grey-7">
                    Cita #{{ props.row.cita_id || 'N/D' }}
                  </div>
                </q-td>
              </template>

              <template #body-cell-servicio="props">
                <q-td :props="props">
                  {{ props.row.cita?.servicio || props.row.servicio || 'Sin servicio' }}
                </q-td>
              </template>

              <template #body-cell-monto="props">
                <q-td :props="props">
                  <b class="text-green-8">Bs {{ money(props.row.monto) }}</b>
                </q-td>
              </template>

              <template #body-cell-metodo="props">
                <q-td :props="props">
                  <q-badge color="blue" rounded class="text-uppercase">
                    {{ props.row.metodo || 'No definido' }}
                  </q-badge>
                </q-td>
              </template>

              <template #body-cell-estado="props">
                <q-td :props="props">
                  <q-badge color="green" rounded class="text-capitalize">
                    {{ props.row.estado || 'pagado' }}
                  </q-badge>
                </q-td>
              </template>

              <template #body-cell-fecha_pago="props">
                <q-td :props="props">
                  {{ formatDate(props.row.fecha_pago) }}
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
                    dense
                    unelevated
                    color="positive"
                    icon="restore"
                    @click="restaurarPago(props.row.id)"
                  >
                    <q-tooltip>Recuperar pago</q-tooltip>
                  </q-btn>
                </q-td>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- MENSAJE VACÍO -->
    <div v-if="!loading && totalEliminados === 0" class="empty-state q-mt-xl">
      <q-icon name="history" size="72px" color="pink-4" />
      <div class="text-h6 text-weight-bold text-pink-7 q-mt-sm">
        No hay elementos en el historial
      </div>
      <div class="text-grey-7">
        Cuando elimines clientes, citas o pagos, aparecerán aquí para poder recuperarlos.
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

defineOptions({ name: 'HistorialPage' })

const $q = useQuasar()

const loading = ref(false)
const loadingAction = ref(false)

const clientesEliminados = ref([])
const citasEliminadas = ref([])
const pagosEliminados = ref([])

const totalEliminados = computed(() => {
  return clientesEliminados.value.length + citasEliminadas.value.length + pagosEliminados.value.length
})

const columnsClientes = [
  { name: 'nombre', label: 'Cliente', field: 'nombre', align: 'left', sortable: true },
  { name: 'telefono', label: 'Teléfono', field: 'telefono', align: 'left' },
  { name: 'deleted_at', label: 'Eliminado', field: 'deleted_at', align: 'left', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

const columnsCitas = [
  { name: 'servicio', label: 'Servicio', field: 'servicio', align: 'left', sortable: true },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'precio', label: 'Precio', field: 'precio', align: 'left' },
  { name: 'deleted_at', label: 'Eliminado', field: 'deleted_at', align: 'left', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

const columnsPagos = [
  { name: 'cliente', label: 'Cliente', field: 'cliente', align: 'left', sortable: true },
  { name: 'servicio', label: 'Servicio', field: 'servicio', align: 'left' },
  { name: 'monto', label: 'Monto', field: 'monto', align: 'left', sortable: true },
  { name: 'metodo', label: 'Método', field: 'metodo', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'fecha_pago', label: 'Fecha pago', field: 'fecha_pago', align: 'left', sortable: true },
  { name: 'deleted_at', label: 'Eliminado', field: 'deleted_at', align: 'left', sortable: true },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

function money(value) {
  return Number(value || 0).toFixed(2)
}

function formatDate(value) {
  if (!value) return 'Sin fecha'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return date.toLocaleString('es-BO', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function nombreClientePago(row) {
  return row?.cita?.cliente?.nombre || row?.cliente?.nombre || row?.nombre_cliente || 'Sin cliente'
}

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
    const { data } = await api.get('/historial/eliminados')

    clientesEliminados.value = data?.clientes_eliminados || data?.clientes || []
    citasEliminadas.value = data?.citas_eliminadas || data?.citas || []
    pagosEliminados.value = data?.pagos_eliminados || data?.pagos || []
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    loading.value = false
  }
}

async function restaurarCliente(id) {
  loadingAction.value = true

  try {
    await api.put(`/historial/clientes/${id}/restaurar`)
    $q.notify({ type: 'positive', message: 'Cliente recuperado correctamente' })
    await load()
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  } finally {
    loadingAction.value = false
  }
}

async function restaurarCita(id) {
  loadingAction.value = true

  try {
    await api.put(`/historial/citas/${id}/restaurar`)
    $q.notify({ type: 'positive', message: 'Cita recuperada correctamente' })
    await load()
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  } finally {
    loadingAction.value = false
  }
}

async function restaurarPago(id) {
  loadingAction.value = true

  try {
    await api.put(`/historial/pagos/${id}/restaurar`)
    $q.notify({ type: 'positive', message: 'Pago recuperado correctamente' })
    await load()
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  } finally {
    loadingAction.value = false
  }
}

function restaurarTodo() {
  if (totalEliminados.value === 0) {
    $q.notify({ type: 'info', message: 'No hay elementos para recuperar' })
    return
  }

  $q.dialog({
    title: 'Recuperar todo',
    message: '¿Deseas recuperar todos los clientes, citas y pagos eliminados?',
    persistent: true,
    ok: { label: 'Recuperar', color: 'positive', unelevated: true },
    cancel: { label: 'Cancelar', flat: true, color: 'grey-7' }
  }).onOk(async () => {
    loadingAction.value = true

    try {
      await api.put('/historial/restaurar-todo')
      $q.notify({ type: 'positive', message: 'Historial recuperado correctamente' })
      await load()
    } catch (error) {
      $q.notify({ type: 'negative', message: getErrorMessage(error) })
    } finally {
      loadingAction.value = false
    }
  })
}

function limpiarHistorial() {
  if (totalEliminados.value === 0) {
    $q.notify({ type: 'info', message: 'No hay historial para limpiar' })
    return
  }

  $q.dialog({
    title: 'Limpiar historial',
    message: 'Esta acción eliminará definitivamente clientes, citas y pagos del historial. ¿Deseas continuar?',
    persistent: true,
    ok: { label: 'Eliminar definitivo', color: 'negative', unelevated: true },
    cancel: { label: 'Cancelar', flat: true, color: 'grey-7' }
  }).onOk(async () => {
    loadingAction.value = true

    try {
      await api.delete('/historial/limpiar')
      $q.notify({ type: 'positive', message: 'Historial limpiado correctamente' })
      await load()
    } catch (error) {
      $q.notify({ type: 'negative', message: getErrorMessage(error) })
    } finally {
      loadingAction.value = false
    }
  })
}

onMounted(load)
</script>

<style scoped>
.historial-page {
  min-height: 100vh;
  background: #fbf7fc;
}

.historial-hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn-recuperar,
.btn-limpiar {
  color: white;
  font-weight: 900;
  border-radius: 14px;
  padding: 10px 18px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.18);
}

.btn-recuperar {
  background: linear-gradient(135deg, #00a884, #00897b);
}

.btn-limpiar {
  background: linear-gradient(135deg, #3f51b5, #c62828);
}

.historial-card {
  border-radius: 22px;
  overflow: hidden;
  background: white;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.10);
}

.pagos-card {
  max-width: 100%;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
  font-size: 13px;
}

.tabla-historial :deep(.q-table tbody tr:hover) {
  background: #fff0f6;
}

.empty-state {
  text-align: center;
  padding: 28px 12px;
}

@media (max-width: 700px) {
  .historial-page {
    padding: 12px;
  }

  .historial-hero {
    flex-direction: column;
  }

  .hero-actions,
  .hero-actions .q-btn {
    width: 100%;
  }

  .historial-card {
    border-radius: 18px;
  }
}
</style>
