<template>
  <q-page class="q-pa-md">
    <div class="row items-center justify-between q-mb-md">
      <div class="text-h5">📅 Citas</div>
      <q-btn color="primary" label="Nueva Cita" icon="add" @click="openDialog" />
    </div>

    <q-table
      :rows="citas"
      :columns="columns"
      row-key="id"
      :loading="loading"
      no-data-label="No hay citas registradas"
    >
      <template #body-cell-estado="props">
        <q-td :props="props">
          <q-badge :color="colorEstado(props.row.estado)">{{ props.row.estado }}</q-badge>
        </q-td>
      </template>

      <template #body-cell-estado_pago="props">
        <q-td :props="props">
          <q-badge :color="props.row.estado_pago === 'pagado' ? 'green' : 'red'">
            {{ props.row.estado_pago || 'pendiente' }}
          </q-badge>
        </q-td>
      </template>

      <template #body-cell-actions="props">
        <q-td :props="props">
          <q-btn icon="edit" flat round color="primary" @click="edit(props.row)"><q-tooltip>Editar</q-tooltip></q-btn>
          <q-btn v-if="props.row.estado !== 'concluida'" icon="check" flat round color="green" @click="finalizar(props.row.id)"><q-tooltip>Finalizar</q-tooltip></q-btn>
          <q-btn v-if="props.row.estado_pago !== 'pagado'" icon="payments" flat round color="blue" @click="pagar(props.row)"><q-tooltip>Pagar</q-tooltip></q-btn>
          <q-btn icon="history" flat round color="purple" @click="verHistorial(props.row.id)"><q-tooltip>Historial</q-tooltip></q-btn>
          <q-btn icon="delete" flat round color="red" @click="remove(props.row.id)"><q-tooltip>Eliminar</q-tooltip></q-btn>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialog" persistent>
      <q-card style="width: 460px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">{{ form.id ? 'Editar cita' : 'Nueva cita' }}</div>
        </q-card-section>

        <q-card-section class="q-gutter-md">
          <q-select
            v-model="form.cliente_id"
            :options="clientes"
            option-label="nombre"
            option-value="id"
            emit-value
            map-options
            label="Cliente *"
            outlined
            :rules="[v => !!v || 'Seleccione un cliente']"
          />
          <q-input v-model.trim="form.servicio" label="Servicio *" outlined :rules="[v => !!v || 'Ingrese el servicio']" />
          <q-input v-model.number="form.precio" type="number" label="Precio Bs. *" outlined min="0" />
          <div class="row q-col-gutter-md">
            <div class="col-12 col-sm-6"><q-input v-model="form.fecha" type="date" label="Fecha *" outlined /></div>
            <div class="col-12 col-sm-6"><q-input v-model="form.hora" type="time" label="Hora *" outlined /></div>
          </div>
          <q-select v-model="form.estado" :options="['pendiente', 'concluida', 'cancelada']" label="Estado" outlined />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="primary" label="Guardar" :loading="saving" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogPago" persistent>
      <q-card style="width: 420px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">💰 Realizar pago</div>
        </q-card-section>
        <q-card-section class="q-gutter-md">
          <q-input v-model.number="pago.monto" type="number" label="Monto Bs." outlined min="0" />
          <q-select v-model="pago.metodo" :options="['efectivo', 'qr', 'transferencia']" label="Método de pago" outlined />
          <div v-if="pago.metodo === 'qr'" class="row justify-center q-mt-sm">
            <q-img
              src="~assets/qr.jpg"
              style="width: 230px; max-width: 100%"
              class="rounded-borders"
              fit="contain"
            />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn color="green" label="Confirmar pago" :loading="savingPago" @click="confirmarPago" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogHistorial">
      <q-card style="min-width: 520px; max-width: 95vw">
        <q-card-section class="text-h6">📜 Historial de pagos</q-card-section>
        <q-card-section>
          <q-table :rows="historial" :columns="columnsHistorial" row-key="id" dense no-data-label="Esta cita no tiene pagos" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
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

const form = ref({ id: null, cliente_id: null, servicio: '', precio: 0, fecha: '', hora: '', estado: 'pendiente' })
const pago = ref({ cita_id: null, monto: 0, metodo: 'efectivo' })

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
    citas.value = data
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  } finally {
    loading.value = false
  }
}

async function loadClientes() {
  try {
    const { data } = await api.get('/clientes')
    clientes.value = data
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  }
}

function openDialog() {
  form.value = { id: null, cliente_id: null, servicio: '', precio: 0, fecha: hoy(), hora: '', estado: 'pendiente' }
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
    const payload = { ...form.value, hora: String(form.value.hora).slice(0, 5) }
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
  pago.value = { cita_id: row.id, monto: Number(row.precio || 0), metodo: 'efectivo' }
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
    historial.value = data
    dialogHistorial.value = true
  } catch (error) {
    $q.notify({ type: 'negative', message: getErrorMessage(error) })
  }
}

function remove(id) {
  $q.dialog({ title: 'Confirmar eliminación', message: '¿Deseas eliminar esta cita?', cancel: true, persistent: true })
    .onOk(async () => {
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
