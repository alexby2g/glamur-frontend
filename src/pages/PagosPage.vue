<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">💰 Pagos</div>
      <q-btn color="cyan" icon="refresh" label="Actualizar" @click="load" />
    </div>

    <q-table :rows="pagos" :columns="columns" row-key="id" :loading="loading" no-data-label="No hay pagos registrados">
      <template #body-cell-estado="props">
        <q-td :props="props">
          <q-badge :color="props.row.estado === 'pagado' ? 'green' : 'orange'">{{ props.row.estado }}</q-badge>
        </q-td>
      </template>
      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn icon="receipt" flat round color="blue" @click="verFactura(props.row.id)"><q-tooltip>Factura</q-tooltip></q-btn>
          <q-btn icon="history" flat round color="purple" @click="verHistorial(props.row.cita_id)"><q-tooltip>Historial</q-tooltip></q-btn>
          <q-btn icon="delete" flat round color="red" @click="remove(props.row.id)"><q-tooltip>Eliminar pago</q-tooltip></q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogFactura">
      <q-card style="min-width: 420px; max-width: 95vw">
        <q-card-section class="text-h6">🧾 Factura</q-card-section>
        <q-card-section v-if="factura" class="q-gutter-sm">
          <div><b>Cliente:</b> {{ factura.cliente }}</div>
          <div><b>Servicio:</b> {{ factura.servicio }}</div>
          <div><b>Fecha cita:</b> {{ factura.fecha_cita }} {{ factura.hora_cita }}</div>
          <div><b>Monto:</b> Bs {{ Number(factura.monto || 0).toFixed(2) }}</div>
          <div><b>Método:</b> {{ factura.metodo }}</div>
          <div><b>Estado:</b> {{ factura.estado }}</div>
          <div><b>Fecha pago:</b> {{ factura.fecha_pago }}</div>
        </q-card-section>
        <q-card-actions align="right"><q-btn flat label="Cerrar" v-close-popup /></q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogHistorial">
      <q-card style="min-width: 520px; max-width: 95vw">
        <q-card-section class="text-h6">📜 Historial de pagos</q-card-section>
        <q-card-section>
          <q-table :rows="historial" :columns="columnsHistorial" row-key="id" dense no-data-label="Sin pagos para esta cita" />
        </q-card-section>
        <q-card-actions align="right"><q-btn flat label="Cerrar" v-close-popup /></q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

defineOptions({ name: 'PagosPage' })

const $q = useQuasar()
const pagos = ref([])
const factura = ref(null)
const historial = ref([])
const dialogFactura = ref(false)
const dialogHistorial = ref(false)
const loading = ref(false)

const columns = [
  { name: 'cliente', label: 'Cliente', field: row => row.cita?.cliente?.nombre || 'Sin cliente', align: 'left' },
  { name: 'servicio', label: 'Servicio', field: row => row.cita?.servicio || '', align: 'left' },
  { name: 'monto', label: 'Monto', field: row => `Bs ${Number(row.monto || 0).toFixed(2)}`, align: 'left' },
  { name: 'metodo', label: 'Método', field: 'metodo', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'fecha_pago', label: 'Fecha', field: 'fecha_pago', align: 'left' },
  { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' }
]

const columnsHistorial = [
  { name: 'monto', label: 'Monto', field: row => `Bs ${Number(row.monto || 0).toFixed(2)}`, align: 'left' },
  { name: 'metodo', label: 'Método', field: 'metodo', align: 'left' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'left' },
  { name: 'fecha_pago', label: 'Fecha', field: 'fecha_pago', align: 'left' }
]

function getErrorMessage(error) {
  const data = error?.response?.data
  if (data?.errors) return Object.values(data.errors).flat().join(' ')
  return data?.message || data?.error || 'Ocurrió un error'
}

async function load() {
  loading.value = true
  try {
    const { data } = await api.get('/pagos')
    pagos.value = data
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  } finally {
    loading.value = false
  }
}

async function verFactura(id) {
  try {
    const { data } = await api.get(`/pagos/factura/${id}`)
    factura.value = data
    dialogFactura.value = true
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  }
}

async function verHistorial(citaId) {
  try {
    const { data } = await api.get(`/pagos/historial/${citaId}`)
    historial.value = data
    dialogHistorial.value = true
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  }
}

function remove(id) {
  $q.dialog({ title: 'Confirmar eliminación', message: '¿Deseas eliminar este pago?', cancel: true, persistent: true })
    .onOk(async () => {
      try {
        await api.delete(`/pagos/${id}`)
        $q.notify({ type: 'positive', message: 'Pago eliminado correctamente' })
        await load()
      } catch (error) {
        $q.notify({ type: 'negative', message: getErrorMessage(error) })
      }
    })
}

onMounted(load)
</script>
