<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

defineOptions({
  name: 'CitasPage'
})

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
  {
    name: 'cliente',
    label: 'Cliente',
    field: row => row.cliente?.nombre || 'Sin cliente',
    align: 'left',
    sortable: true
  },
  {
    name: 'servicio',
    label: 'Servicio',
    field: 'servicio',
    align: 'left'
  },
  {
    name: 'precio',
    label: 'Precio',
    field: 'precio',
    align: 'left'
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: 'fecha',
    align: 'left',
    sortable: true
  },
  {
    name: 'hora',
    label: 'Hora',
    field: 'hora',
    align: 'left'
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center'
  },
  {
    name: 'estado_pago',
    label: 'Pago',
    field: 'estado_pago',
    align: 'center'
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

const columnsHistorial = [
  {
    name: 'monto',
    label: 'Monto',
    field: 'monto',
    align: 'left'
  },
  {
    name: 'metodo',
    label: 'Método',
    field: 'metodo',
    align: 'left'
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'left'
  },
  {
    name: 'fecha_pago',
    label: 'Fecha pago',
    field: 'fecha_pago',
    align: 'left'
  }
]

function money(value) {
  return Number(value || 0).toFixed(2)
}

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || 'Ocurrió un error'
}

function colorEstado(estado) {
  if (estado === 'concluida') return 'green'
  if (estado === 'cancelada') return 'red'
  return 'orange'
}

async function load() {
  loading.value = true

  try {
    const { data } = await api.get('/citas')

    citas.value = Array.isArray(data)
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

async function loadClientes() {
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

  if (
    !form.value.cliente_id ||
    !form.value.servicio ||
    !form.value.fecha ||
    !form.value.hora
  ) {
    $q.notify({
      type: 'warning',
      message: 'Completa todos los campos obligatorios'
    })

    return
  }

  saving.value = true

  try {

    const payload = {
      cliente_id: form.value.cliente_id,
      servicio: form.value.servicio,
      precio: Number(form.value.precio || 0),
      fecha: form.value.fecha,
      hora: String(form.value.hora).slice(0, 5),
      estado: form.value.estado
    }

    if (form.value.id) {

      await api.put(`/citas/${form.value.id}`, payload)

      $q.notify({
        type: 'positive',
        message: 'Cita actualizada correctamente'
      })

    } else {

      await api.post('/citas', payload)

      $q.notify({
        type: 'positive',
        message: 'Cita registrada correctamente'
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

async function finalizar(id) {

  try {

    await api.put(`/citas/finalizar/${id}`)

    $q.notify({
      type: 'positive',
      message: 'Cita finalizada correctamente'
    })

    await load()

  } catch (error) {

    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })

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

  if (!pago.value.monto || Number(pago.value.monto) <= 0) {

    $q.notify({
      type: 'warning',
      message: 'El monto debe ser mayor a 0'
    })

    return
  }

  savingPago.value = true

  try {

    await api.post('/pagos', {
      cita_id: pago.value.cita_id,
      monto: Number(pago.value.monto),
      metodo: pago.value.metodo
    })

    dialogPago.value = false

    $q.notify({
      type: 'positive',
      message: 'Pago registrado correctamente'
    })

    await load()

  } catch (error) {

    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })

  } finally {
    savingPago.value = false
  }
}

async function verHistorial(id) {

  try {

    const { data } = await api.get(`/pagos/historial/${id}`)

    historial.value = Array.isArray(data)
      ? data
      : (data?.data || [])

    dialogHistorial.value = true

  } catch (error) {

    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })

  }
}

function remove(id) {

  $q.dialog({
    title: 'Eliminar cita',
    message: '¿Seguro que deseas eliminar esta cita?',
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

      await api.delete(`/citas/${id}`)

      $q.notify({
        type: 'positive',
        message: 'Cita eliminada correctamente'
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

onMounted(async () => {

  await Promise.all([
    load(),
    loadClientes()
  ])

})
</script>