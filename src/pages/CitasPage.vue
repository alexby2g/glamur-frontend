<template>
  <q-page class="q-pa-md citas-page">
    <div class="page-hero q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-white">
          📅 Citas
        </div>
        <div class="text-subtitle2 text-white">
          Gestión de reservas, pagos y estados
        </div>
      </div>

      <q-btn
        class="btn-glamur-white"
        label="Nueva Cita"
        icon="add"
        @click="openDialog"
      />
    </div>

    <q-table
      class="tabla-glamur"
      :rows="citas"
      :columns="columns"
      row-key="id"
      :loading="loading"
      no-data-label="No hay citas registradas"
      flat
      bordered
    >
      <template #body-cell-cliente="props">
        <q-td :props="props">
          <div class="text-weight-bold text-pink-7">
            {{ props.row.cliente?.nombre || 'Sin cliente' }}
          </div>
          <div class="text-caption text-grey-7">
            Cliente de Glamur
          </div>
        </q-td>
      </template>

      <template #body-cell-precio="props">
        <q-td :props="props">
          <div class="text-weight-bold text-green-8">
            Bs {{ Number(props.row.precio || 0).toFixed(2) }}
          </div>
        </q-td>
      </template>

      <template #body-cell-estado="props">
        <q-td :props="props" class="text-center">
          <q-badge
            rounded
            class="estado-badge"
            :color="colorEstado(props.row.estado)"
          >
            {{ props.row.estado || 'pendiente' }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-estado_pago="props">
        <q-td :props="props" class="text-center">
          <q-badge
            rounded
            class="estado-badge"
            :color="props.row.estado_pago === 'pagado' ? 'green' : 'red'"
          >
            {{ props.row.estado_pago || 'pendiente' }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props" class="text-center">
          <div class="acciones">
            <q-btn round unelevated size="sm" color="primary" icon="edit" @click="edit(props.row)">
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn
              v-if="props.row.estado !== 'concluida'"
              round
              unelevated
              size="sm"
              color="positive"
              icon="check"
              @click="finalizar(props.row.id)"
            >
              <q-tooltip>Finalizar</q-tooltip>
            </q-btn>

            <q-btn
              v-if="props.row.estado_pago !== 'pagado'"
              round
              unelevated
              size="sm"
              color="blue"
              icon="payments"
              @click="pagar(props.row)"
            >
              <q-tooltip>Pagar</q-tooltip>
            </q-btn>

            <q-btn round unelevated size="sm" color="purple" icon="history" @click="verHistorial(props.row.id)">
              <q-tooltip>Historial</q-tooltip>
            </q-btn>

            <q-btn round unelevated size="sm" color="negative" icon="delete" @click="remove(props.row.id)">
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </div>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog" persistent>
      <q-card class="dialog-card">
        <q-card-section class="dialog-header row items-center">
          <div class="text-h6">
            {{ form.id ? 'Editar cita' : 'Nueva cita' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-scroll-area class="dialog-scroll">
          <q-card-section class="q-gutter-md q-pt-lg">
            <q-select
              v-model="form.cliente_id"
              :options="clientes"
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
              label="Cliente *"
              outlined
              dense
              rounded
              :rules="[v => !!v || 'Seleccione un cliente']"
            />

            <q-input
              v-model.trim="form.servicio"
              label="Servicio *"
              outlined
              dense
              rounded
              :rules="[v => !!v || 'Ingrese el servicio']"
            />

            <q-input
              v-model.number="form.precio"
              type="number"
              label="Precio Bs. *"
              outlined
              dense
              rounded
              min="0"
            />

            <div class="row q-col-gutter-md form-row-responsive">
              <div class="col-12 col-sm-6">
                <q-input v-model="form.fecha" type="date" label="Fecha *" outlined dense rounded />
              </div>

              <div class="col-12 col-sm-6">
                <q-input v-model="form.hora" type="time" label="Hora *" outlined dense rounded />
              </div>
            </div>

            <q-select
              v-model="form.estado"
              :options="['pendiente', 'concluida', 'cancelada']"
              label="Estado"
              outlined
              dense
              rounded
            />
          </q-card-section>
        </q-scroll-area>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn class="btn-glamur" label="Guardar" :loading="saving" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogPago" persistent>
      <q-card class="dialog-card-small">
        <q-card-section class="dialog-header row items-center">
          <div class="text-h6">💰 Realizar pago</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-gutter-md q-pt-lg">
          <q-input v-model.number="pago.monto" type="number" label="Monto Bs." outlined dense rounded min="0" />

          <q-select
            v-model="pago.metodo"
            :options="['efectivo', 'qr', 'transferencia']"
            label="Método de pago"
            outlined
            dense
            rounded
          />

          <div v-if="pago.metodo === 'qr'" class="row justify-center q-mt-sm">
            <q-img
              src="~assets/qr.jpg"
              style="width: 230px; max-width: 100%"
              class="rounded-borders qr-img"
              fit="contain"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn class="btn-glamur" label="Confirmar pago" :loading="savingPago" @click="confirmarPago" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogHistorial">
      <q-card class="dialog-card-historial">
        <q-card-section class="dialog-header row items-center">
          <div class="text-h6">📜 Historial de pagos</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-table
            class="tabla-glamur"
            :rows="historial"
            :columns="columnsHistorial"
            row-key="id"
            dense
            flat
            bordered
            no-data-label="Esta cita no tiene pagos"
          />
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Cerrar" color="grey-7" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

defineOptions({ name: 'CitasPage' })

const $q = useQuasar()
const citas = ref([])
const clientes = ref([])
const historial = ref([])
const dialog = ref(false)
const dialogPago = ref(false)
const dialogHistorial = ref(false)
const loading = ref(false)
const saving = ref(false)
const savingPago = ref(false)

const form = ref({
  id: null,
  cliente_id: null,
  servicio: '',
  precio: 0,
  fecha: '',
  hora: '',
  estado: 'pendiente'
})

const pago = ref({
  cita_id: null,
  monto: 0,
  metodo: 'efectivo'
})

const columns = [
  { name: 'cliente', label: 'Cliente', field: row => row.cliente?.nombre || 'Sin cliente', align: 'left', sortable: true },
  { name: 'servicio', label: 'Servicio', field: 'servicio', align: 'left' },
  { name: 'precio', label: 'Precio', field: row => `Bs ${Number(row.precio || 0).toFixed(2)}`, align: 'left' },
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left', sortable: true },
  { name: 'hora', label: 'Hora', field: 'hora', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'estado_pago', label: 'Pago', field: 'estado_pago', align: 'center' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

const columnsHistorial = [
  { name: 'monto', label: 'Monto', field: row => `Bs ${Number(row.monto || 0).toFixed(2)}`, align: 'left' },
  { name: 'metodo', label: 'Método', field: 'metodo', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'fecha_pago', label: 'Fecha pago', field: 'fecha_pago', align: 'left' }
]

function getErrorMessage(error) {
  const data = error?.response?.data
  if (data?.errors) return Object.values(data.errors).flat().join(' ')
  return data?.message || data?.error || 'Ocurrió un error'
}

function colorEstado(estado) {
  if (estado === 'concluida') return 'green'
  if (estado === 'cancelada') return 'red'
  return 'orange'
}

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/citas')
    citas.value = Array.isArray(data) ? data : (data?.data || [])
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  } finally {
    loading.value = false
  }
}

async function loadClientes() {
  try {
    const { data } = await api.get('/clientes')
    clientes.value = Array.isArray(data) ? data : (data?.data || [])
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  }
}

function openDialog() {
  form.value = {
    id: null,
    cliente_id: null,
    servicio: '',
    precio: 0,
    fecha: hoy(),
    hora: '',
    estado: 'pendiente'
  }

  dialog.value = true
}

function edit(row) {
  form.value = {
    id: row.id,
    cliente_id: row.cliente_id,
    servicio: row.servicio || '',
    precio: Number(row.precio || 0),
    fecha: row.fecha || hoy(),
    hora: row.hora ? String(row.hora).slice(0, 5) : '',
    estado: row.estado || 'pendiente'
  }

  dialog.value = true
}

async function save() {
  if (!form.value.cliente_id || !form.value.servicio || !form.value.fecha || !form.value.hora) {
    $q.notify({ type: 'negative', message: 'Completa cliente, servicio, fecha y hora' })
    return
  }

  saving.value = true

  try {
    const payload = {
      ...form.value,
      hora: String(form.value.hora).slice(0, 5)
    }

    if (form.value.id) {
      await api.put(`/citas/${form.value.id}`, payload)
      $q.notify({ type: 'positive', message: 'Cita actualizada correctamente' })
    } else {
      await api.post('/citas', payload)
      $q.notify({ type: 'positive', message: 'Cita registrada correctamente' })
    }

    dialog.value = false
    await load()
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  } finally {
    saving.value = false
  }
}

async function finalizar(id) {
  try {
    await api.put(`/citas/finalizar/${id}`)
    $q.notify({ type: 'positive', message: 'Cita finalizada correctamente' })
    await load()
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  }
}

function pagar(row) {
  pago.value = {
    cita_id: row.id,
    monto: Number(row.precio || 0),
    metodo: 'efectivo'
  }

  dialogPago.value = true
}

async function confirmarPago() {
  savingPago.value = true

  try {
    await api.post('/pagos', pago.value)
    dialogPago.value = false
    $q.notify({ type: 'positive', message: 'Pago realizado correctamente' })
    await load()
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  } finally {
    savingPago.value = false
  }
}

async function verHistorial(id) {
  try {
    const { data } = await api.get(`/pagos/historial/${id}`)
    historial.value = Array.isArray(data) ? data : (data?.data || [])
    dialogHistorial.value = true
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  }
}

function remove(id) {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Deseas eliminar esta cita?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/citas/${id}`)
      $q.notify({ type: 'positive', message: 'Cita eliminada correctamente' })
      await load()
    } catch (error) {
      $q.notify({ type: 'negative', message: getErrorMessage(error) })
    }
  })
}

onMounted(async () => {
  await Promise.all([load(), loadClientes()])
})
</script>

<style scoped>
.citas-page {
  min-height: 100vh;
  background: #faf7fb;
}

.page-hero {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  border-radius: 26px;
  padding: 26px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 16px 40px rgba(233, 30, 99, 0.25);
}

.btn-glamur-white {
  background: white;
  color: #c2185b;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
}

.btn-glamur {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 800;
  border-radius: 16px;
}

.tabla-glamur {
  border-radius: 24px;
  overflow: hidden;
  background: white;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
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

.estado-badge {
  padding: 6px 10px;
  font-weight: 800;
  text-transform: capitalize;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.dialog-card,
.dialog-card-small,
.dialog-card-historial {
  border-radius: 24px;
  overflow: hidden;
}

.dialog-card {
  width: 520px;
  max-width: 95vw;
  max-height: 92vh;
}

.dialog-card-small {
  width: 430px;
  max-width: 95vw;
}

.dialog-card-historial {
  width: 680px;
  max-width: 95vw;
}

.dialog-header {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
}

.dialog-scroll {
  max-height: 68vh;
}

.dialog-actions {
  padding: 14px 18px 18px;
  background: white;
  border-top: 1px solid #eeeeee;
}

.qr-img {
  border: 1px solid #eee;
  padding: 8px;
}

@media (max-width: 600px) {
  .citas-page {
    padding: 10px;
  }

  .page-hero {
    padding: 20px;
    border-radius: 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .btn-glamur-white {
    width: 100%;
  }

  .form-row-responsive {
    flex-direction: column;
  }

  .form-row-responsive > div {
    width: 100% !important;
    max-width: 100% !important;
  }

  .dialog-actions {
    flex-wrap: wrap;
    gap: 10px;
  }

  .dialog-actions .q-btn {
    flex: 1;
  }

  .acciones .q-btn {
    margin-bottom: 4px;
  }
}
</style>