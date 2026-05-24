<template>
  <q-page class="q-pa-md citas-page">

    <!-- HERO -->
    <div class="page-hero q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-white">
          📅 Citas
        </div>

        <div class="text-subtitle2 text-white">
          Gestión de reservas, pagos, combos y estados
        </div>
      </div>

      <q-btn
        class="btn-glamur-white"
        label="Nueva Cita"
        icon="add"
        @click="openDialog"
      />
    </div>

    <!-- TABLA -->
    <q-table
      class="tabla-glamur"
      :rows="citas"
      :columns="columns"
      row-key="id"
      :loading="loading"
      no-data-label="No hay citas registradas"
      flat
      bordered
      :rows-per-page-options="[5, 10, 20, 50]"
    >

      <!-- CLIENTE -->
      <template #body-cell-cliente="props">
        <q-td :props="props">
          <div class="text-weight-bold text-pink-7">
            {{ props.row.cliente?.nombre || 'Sin cliente' }}
          </div>

          <div class="text-caption text-grey-7">
            Cliente Glamur
          </div>
        </q-td>
      </template>

      <!-- SERVICIO -->
      <template #body-cell-servicio="props">
        <q-td :props="props">
          <div class="text-weight-bold">
            {{ props.row.servicio || 'Sin servicio' }}
          </div>

          <div class="text-caption text-grey-7">
            CEJAS Y PESTAÑAS
          </div>
        </q-td>
      </template>

      <!-- PRECIO -->
      <template #body-cell-precio="props">
        <q-td :props="props">
          <div class="text-weight-bold text-green-8">
            Bs {{ money(props.row.precio) }}
          </div>
        </q-td>
      </template>

      <!-- ESTADO -->
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

      <!-- ESTADO PAGO -->
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

      <!-- ACCIONES -->
      <template #body-cell-actions="props">
        <q-td :props="props" class="text-center">
          <div class="acciones">

            <q-btn
              round
              unelevated
              size="sm"
              color="primary"
              icon="edit"
              @click="edit(props.row)"
            >
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

            <q-btn
              round
              unelevated
              size="sm"
              color="purple"
              icon="history"
              @click="verHistorial(props.row.id)"
            >
              <q-tooltip>Historial de pagos</q-tooltip>
            </q-btn>

            <q-btn
              round
              unelevated
              size="sm"
              color="negative"
              icon="delete"
              @click="remove(props.row.id)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>

          </div>
        </q-td>
      </template>

    </q-table>

    <!-- DIALOG NUEVA / EDITAR CITA -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="dialog-card">

        <q-card-section class="dialog-header row items-center">
          <div class="text-h6 text-weight-bold">
            {{ form.id ? '✏️ Editar cita' : '📅 Nueva cita' }}
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

            <!-- CLIENTE -->
            <q-select
              v-model="form.cliente_id"
              :options="clientesFiltrados"
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
              use-input
              input-debounce="0"
              label="Cliente *"
              outlined
              dense
              rounded
              bg-color="white"
              clearable
              @filter="filterClientes"
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-avatar color="pink-6" text-color="white" icon="person" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold">
                      {{ scope.opt.nombre }}
                    </q-item-label>

                    <q-item-label caption>
                      {{ scope.opt.telefono || 'Sin teléfono' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- SERVICIO GENERAL -->
            <q-input
              v-model="form.categoria"
              label="Servicio"
              outlined
              dense
              rounded
              readonly
              bg-color="white"
            />

            <!-- COMBO -->
            <q-select
              v-model="comboSeleccionado"
              :options="serviciosFiltrados"
              option-label="nombre"
              use-input
              input-debounce="0"
              label="Combo *"
              outlined
              dense
              rounded
              bg-color="white"
              clearable
              @filter="filterServicios"
              @update:model-value="seleccionarServicio"
            >
              <template #selected>
                <span v-if="comboSeleccionado">
                  {{ comboSeleccionado.nombre }}
                </span>

                <span v-else class="text-grey-6">
                  Selecciona un combo
                </span>
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label class="text-weight-bold">
                      {{ scope.opt.nombre }}
                    </q-item-label>

                    <q-item-label caption>
                      {{ scope.opt.descripcion }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-badge color="pink-7" rounded>
                      Bs {{ money(scope.opt.precio) }}
                    </q-badge>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- NOMBRE DEL COMBO SELECCIONADO -->
            <q-input
              v-model="form.servicio"
              label="Nombre del combo seleccionado *"
              outlined
              dense
              rounded
              readonly
              bg-color="white"
            />

            <!-- DESCRIPCIÓN DEL COMBO -->
            <q-input
              v-model="form.descripcion"
              label="Detalle del combo"
              type="textarea"
              outlined
              dense
              rounded
              readonly
              bg-color="white"
              autogrow
            />

            <!-- PRECIO -->
            <q-input
              v-model.number="form.precio"
              type="number"
              label="Precio Bs. *"
              outlined
              dense
              rounded
              min="0"
              bg-color="white"
            />

            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.fecha"
                  type="date"
                  label="Fecha *"
                  outlined
                  dense
                  rounded
                  bg-color="white"
                />
              </div>

              <div class="col-12 col-sm-6">
                <q-input
                  v-model="form.hora"
                  type="time"
                  label="Hora *"
                  outlined
                  dense
                  rounded
                  bg-color="white"
                />
              </div>
            </div>

            <q-select
              v-model="form.estado"
              :options="['pendiente', 'concluida', 'cancelada']"
              label="Estado"
              outlined
              dense
              rounded
              bg-color="white"
            />

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

    <!-- DIALOG PAGO -->
    <q-dialog v-model="dialogPago" persistent>
      <q-card class="dialog-card-small">

        <q-card-section class="dialog-header row items-center">
          <div class="text-h6 text-weight-bold">
            💰 Realizar pago
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
              v-model.number="pago.monto"
              type="number"
              label="Monto Bs."
              outlined
              dense
              rounded
              min="0"
              bg-color="white"
            />

            <q-select
              v-model="pago.metodo"
              :options="metodosPago"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Método de pago"
              outlined
              dense
              rounded
              bg-color="white"
            />

            <div v-if="pago.metodo === 'qr'" class="qr-box">
              <q-img
                src="~assets/qr.jpg"
                class="qr-img"
                fit="contain"
              />

              <div class="text-caption text-grey-7 q-mt-sm">
                Escanea el QR para realizar el pago.
              </div>
            </div>

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
            label="Confirmar pago"
            :loading="savingPago"
            @click="confirmarPago"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

    <!-- DIALOG HISTORIAL -->
    <q-dialog v-model="dialogHistorial">
      <q-card class="dialog-card-historial">

        <q-card-section class="dialog-header row items-center">
          <div class="text-h6 text-weight-bold">
            📜 Historial de pagos
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
          <q-table
            class="tabla-glamur tabla-historial"
            :rows="historial"
            :columns="columnsHistorial"
            row-key="id"
            dense
            flat
            bordered
            no-data-label="Esta cita no tiene pagos registrados"
          >
            <template #body-cell-monto="props">
              <q-td :props="props">
                <b class="text-green-8">
                  Bs {{ money(props.row.monto) }}
                </b>
              </q-td>
            </template>

            <template #body-cell-metodo="props">
              <q-td :props="props">
                {{ formatMetodoPago(props.row.metodo) }}
              </q-td>
            </template>

            <template #body-cell-estado="props">
              <q-td :props="props">
                <q-badge color="green" rounded>
                  {{ props.row.estado || 'pagado' }}
                </q-badge>
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            flat
            label="Cerrar"
            color="grey-7"
            v-close-popup
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
  name: 'CitasPage'
})

const $q = useQuasar()

const citas = ref([])
const clientes = ref([])
const clientesFiltrados = ref([])
const historial = ref([])

const dialog = ref(false)
const dialogPago = ref(false)
const dialogHistorial = ref(false)

const loading = ref(false)
const saving = ref(false)
const savingPago = ref(false)

const comboSeleccionado = ref(null)
const serviciosFiltrados = ref([])

const metodosPago = [
  {
    label: 'Efectivo',
    value: 'efectivo'
  },
  {
    label: 'QR',
    value: 'qr'
  },
  {
    label: 'Transferencia',
    value: 'transferencia'
  }
]

const combosServicios = [
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'CLEAN BROWS',
    descripcion: 'Depilación + Visagismo',
    precio: 25
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'BROWS PRO',
    descripcion: 'Henna + Depilación y Visagismo',
    precio: 80
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'LAMI BROWS',
    descripcion: 'Laminado + Vitaminas + Depilación y Visagismo',
    precio: 80
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'LASH PERFECT',
    descripcion: 'Lifting + Tinte efecto rimel',
    precio: 85
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'PERFECT BROWS',
    descripcion: 'Laminado + Henna + Depilación + Visagismo',
    precio: 135
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'GLOW UP EXPRESS',
    descripcion: 'Laminado + Henna + Depilación y Visagismo + Lifting + Tinte efecto rimel',
    precio: 220
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'PERFECT EXPRESS',
    descripcion: 'Henna + Depilación y Visagismo + Lifting + Tinte efecto rimel',
    precio: 165
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'LASH & BROWS EXPRESS',
    descripcion: 'Laminado + Lifting + Tinte efecto rimel + Vitaminas + Depilación y Visagismo',
    precio: 165
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'RETOQUE BROWS PRO',
    descripcion: 'Henna',
    precio: 40
  }
]

const form = ref({
  id: null,
  cliente_id: null,
  categoria: 'CEJAS Y PESTAÑAS',
  servicio: '',
  descripcion: '',
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
    label: 'Combo',
    field: 'servicio',
    align: 'left',
    sortable: true
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
    field: row => row.fecha_pago || 'Sin fecha',
    align: 'left'
  }
]

function money(value) {
  return Number(value || 0).toFixed(2)
}

function hoy() {
  return new Date().toISOString().slice(0, 10)
}

function normalizar(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

function formatMetodoPago(metodo) {
  if (metodo === 'qr') return 'QR'
  if (metodo === 'efectivo') return 'Efectivo'
  if (metodo === 'transferencia') return 'Transferencia'
  return metodo || 'No definido'
}

function filterClientes(val, update) {
  update(() => {
    const buscar = normalizar(val)

    if (!buscar) {
      clientesFiltrados.value = clientes.value
      return
    }

    clientesFiltrados.value = clientes.value.filter(cliente => {
      return normalizar(cliente.nombre).includes(buscar) ||
        normalizar(cliente.telefono).includes(buscar)
    })
  })
}

function filterServicios(val, update) {
  update(() => {
    const buscar = normalizar(val)

    if (!buscar) {
      serviciosFiltrados.value = combosServicios
      return
    }

    serviciosFiltrados.value = combosServicios.filter(servicio => {
      return normalizar(servicio.nombre).includes(buscar) ||
        normalizar(servicio.descripcion).includes(buscar) ||
        normalizar(servicio.categoria).includes(buscar)
    })
  })
}

function seleccionarServicio(servicio) {
  if (!servicio) {
    form.value.servicio = ''
    form.value.descripcion = ''
    form.value.precio = 0
    return
  }

  form.value.categoria = servicio.categoria
  form.value.servicio = servicio.nombre
  form.value.descripcion = servicio.descripcion
  form.value.precio = servicio.precio
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

    clientesFiltrados.value = clientes.value
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  }
}

function openDialog() {
  comboSeleccionado.value = null
  serviciosFiltrados.value = combosServicios

  form.value = {
    id: null,
    cliente_id: null,
    categoria: 'CEJAS Y PESTAÑAS',
    servicio: '',
    descripcion: '',
    precio: 0,
    fecha: hoy(),
    hora: '',
    estado: 'pendiente'
  }

  dialog.value = true
}

function edit(row) {
  const comboEncontrado = combosServicios.find(combo => {
    return normalizar(combo.nombre) === normalizar(row.servicio)
  })

  comboSeleccionado.value = comboEncontrado || null
  serviciosFiltrados.value = combosServicios

  form.value = {
    id: row.id,
    cliente_id: row.cliente_id,
    categoria: comboEncontrado?.categoria || 'CEJAS Y PESTAÑAS',
    servicio: row.servicio || comboEncontrado?.nombre || '',
    descripcion: comboEncontrado?.descripcion || '',
    precio: Number(row.precio || comboEncontrado?.precio || 0),
    fecha: row.fecha || hoy(),
    hora: row.hora ? String(row.hora).slice(0, 5) : '',
    estado: row.estado || 'pendiente'
  }

  dialog.value = true
}

async function save() {
  if (!form.value.cliente_id || !form.value.servicio || !form.value.fecha || !form.value.hora) {
    $q.notify({
      type: 'warning',
      message: 'Completa cliente, combo, fecha y hora'
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
  if (!pago.value.cita_id || Number(pago.value.monto || 0) <= 0) {
    $q.notify({
      type: 'warning',
      message: 'El monto del pago debe ser mayor a 0'
    })

    return
  }

  savingPago.value = true

  try {
    await api.post('/pagos', {
      cita_id: pago.value.cita_id,
      monto: Number(pago.value.monto || 0),
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
  serviciosFiltrados.value = combosServicios

  await Promise.all([
    load(),
    loadClientes()
  ])
})
</script>

<style scoped>
.citas-page {
  min-height: 100vh;
  background: #faf7fb;
}

/* HERO */

.page-hero {
  background:
    linear-gradient(
      135deg,
      #e91e63,
      #9c27b0
    );

  border-radius: 28px;
  padding: 28px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  box-shadow:
    0 16px 40px rgba(233, 30, 99, 0.25);
}

/* BOTONES */

.btn-glamur-white {
  background: white;
  color: #c2185b;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
}

.btn-glamur {
  background:
    linear-gradient(
      135deg,
      #e91e63,
      #9c27b0
    );

  color: white;
  font-weight: 800;
  border-radius: 16px;
}

/* TABLA */

.tabla-glamur {
  border-radius: 24px;
  overflow: hidden;
  background: white;

  box-shadow:
    0 14px 35px rgba(156, 39, 176, 0.12);
}

.tabla-glamur :deep(.q-table thead tr) {
  background:
    linear-gradient(
      135deg,
      #fce4ec,
      #f3e5f5
    );

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

/* DIALOGS */

.dialog-card,
.dialog-card-small,
.dialog-card-historial {
  border-radius: 24px;
  overflow: hidden;
}

.dialog-card {
  width: 560px;
  max-width: 96vw;
  max-height: 92vh;
}

.dialog-card-small {
  width: 440px;
  max-width: 96vw;
}

.dialog-card-historial {
  width: 720px;
  max-width: 96vw;
}

.dialog-header {
  background:
    linear-gradient(
      135deg,
      #e91e63,
      #9c27b0
    );

  color: white;
}

.dialog-body {
  background: #ffffff;
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
}

.dialog-actions {
  padding: 16px 22px;
  background: white;
  border-top: 1px solid #eeeeee;
}

.qr-box {
  text-align: center;
  padding: 12px;
  border: 1px dashed #e91e63;
  border-radius: 18px;
  background: #fff7fb;
}

.qr-img {
  width: 230px;
  max-width: 100%;
  border-radius: 14px;
}

/* MOBILE */

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

  .page-hero .text-h4 {
    font-size: 26px;
  }

  .btn-glamur-white {
    width: 100%;
  }

  .dialog-card,
  .dialog-card-small,
  .dialog-card-historial {
    width: 100%;
    max-width: 100%;
    border-radius: 20px;
  }

  .dialog-body {
    padding: 18px;
    max-height: 68vh;
  }

  .dialog-actions {
    flex-wrap: wrap;
    gap: 10px;
  }

  .dialog-actions .q-btn {
    width: 100%;
  }

  .acciones .q-btn {
    margin-bottom: 4px;
  }
}
</style>