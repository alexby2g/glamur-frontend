<template>
  <q-page class="q-pa-md citas-page">

    <!-- HERO -->
    <div class="page-hero q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-white">
          📅 Citas
        </div>

        <div class="text-subtitle2 text-white">
          Gestión de reservas, servicios, pagos y estados
        </div>
      </div>

      <div class="hero-actions">
        <q-btn
          class="btn-glamur-white"
          label="Servicios"
          icon="spa"
          to="/servicios"
        />

        <q-btn
          class="btn-glamur-white"
          label="Nueva Cita"
          icon="add"
          @click="openDialog()"
        />
      </div>
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
            {{ props.row.cliente?.telefono || 'Sin teléfono' }}
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
            Servicio Glamur
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
            {{ mostrarEstado(props.row.estado) }}
          </q-badge>
        </q-td>
      </template>

      <!-- PAGO -->
      <template #body-cell-estado_pago="props">
        <q-td :props="props" class="text-center">
          <q-badge
            rounded
            class="estado-badge"
            :color="props.row.estado_pago === 'pagado' ? 'green' : 'red'"
          >
            {{ mostrarPago(props.row.estado_pago) }}
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
              <q-tooltip>Finalizar cita</q-tooltip>
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
              <q-tooltip>Registrar pago</q-tooltip>
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
              <q-tooltip>Eliminar cita</q-tooltip>
            </q-btn>

          </div>
        </q-td>
      </template>

    </q-table>

    <!-- DIALOG NUEVA / EDITAR CITA -->
    <q-dialog
      v-model="dialog"
      persistent
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="dialog-card dialog-card-main">

        <!-- HEADER FIJO -->
        <q-card-section class="dialog-header row items-center">
          <div class="text-h6 text-weight-bold">
            {{ form.id ? '✏️ Editar cita' : '🗓️ Nueva cita' }}
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

        <!-- CUERPO CON SCROLL -->
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
              clearable
              label="Cliente *"
              outlined
              dense
              rounded
              bg-color="white"
              @filter="filtrarClientes"
            >
              <template #prepend>
                <q-icon name="person" color="pink" />
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-avatar color="pink" text-color="white" icon="person" />
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

              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No se encontraron clientes
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- SERVICIO / COMBO DESDE BACKEND -->
            <q-select
              v-model="form.servicioOption"
              :options="serviciosFiltrados"
              option-label="combo"
              use-input
              input-debounce="0"
              clearable
              label="Servicio o combo *"
              outlined
              dense
              rounded
              bg-color="white"
              @filter="filtrarServicios"
              @update:model-value="seleccionarServicio"
              @clear="limpiarServicio"
            >
              <template #prepend>
                <q-icon name="spa" color="pink" />
              </template>

              <template #selected-item="scope">
                <div class="text-weight-bold">
                  {{ scope.opt.combo }}
                </div>
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <q-avatar color="pink" text-color="white" icon="spa" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold">
                      {{ scope.opt.combo }}
                    </q-item-label>

                    <q-item-label caption>
                      {{ scope.opt.servicio }}
                    </q-item-label>

                    <q-item-label caption>
                      {{ scope.opt.detalle }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-badge color="green" rounded>
                      Bs {{ money(scope.opt.precio) }}
                    </q-badge>
                  </q-item-section>
                </q-item>
              </template>

              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No hay servicios registrados
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- DETALLE SOLO INFORMATIVO -->
            <q-input
              v-if="form.detalle"
              v-model="form.detalle"
              label="Detalle del servicio"
              type="textarea"
              autogrow
              outlined
              dense
              rounded
              readonly
              bg-color="white"
              class="input-readonly"
            >
              <template #prepend>
                <q-icon name="description" color="pink" />
              </template>
            </q-input>

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
            >
              <template #prepend>
                <q-icon name="payments" color="green" />
              </template>
            </q-input>

            <!-- FECHA Y HORA -->
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
                >
                  <template #prepend>
                    <q-icon name="event" color="pink" />
                  </template>
                </q-input>
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
                >
                  <template #prepend>
                    <q-icon name="schedule" color="pink" />
                  </template>
                </q-input>
              </div>
            </div>

            <!-- ESTADO -->
            <q-select
              v-model="form.estado"
              :options="estados"
              option-label="label"
              option-value="value"
              emit-value
              map-options
              label="Estado"
              outlined
              dense
              rounded
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="flag" color="pink" />
              </template>
            </q-select>

          </div>
        </q-card-section>

        <!-- BOTONES SIEMPRE VISIBLES -->
        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            class="btn-cancelar"
            label="Cancelar"
            icon="close"
            unelevated
            v-close-popup
          />

          <q-btn
            class="btn-glamur"
            :label="form.id ? 'Guardar cambios' : 'Registrar cita'"
            icon="save"
            :loading="saving"
            @click="save"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

    <!-- DIALOG PAGO -->
    <q-dialog
      v-model="dialogPago"
      persistent
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="dialog-card-small dialog-card-main">

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
            >
              <template #prepend>
                <q-icon name="payments" color="green" />
              </template>
            </q-input>

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
            class="btn-cancelar"
            label="Cancelar"
            icon="close"
            unelevated
            v-close-popup
          />

          <q-btn
            class="btn-glamur"
            label="Confirmar pago"
            icon="payments"
            :loading="savingPago"
            @click="confirmarPago"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

    <!-- DIALOG HISTORIAL -->
    <q-dialog
      v-model="dialogHistorial"
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="dialog-card-historial dialog-card-main">

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
                {{ mostrarMetodo(props.row.metodo) }}
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
            class="btn-cancelar"
            label="Cerrar"
            icon="close"
            unelevated
            v-close-popup
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'boot/axios'

defineOptions({
  name: 'CitasPage'
})

const $q = useQuasar()
const route = useRoute()
const router = useRouter()

const citas = ref([])
const clientes = ref([])
const clientesFiltrados = ref([])
const servicios = ref([])
const serviciosFiltrados = ref([])
const historial = ref([])

const dialog = ref(false)
const dialogPago = ref(false)
const dialogHistorial = ref(false)

const loading = ref(false)
const saving = ref(false)
const savingPago = ref(false)

const estados = [
  {
    label: 'Pendiente',
    value: 'pendiente'
  },
  {
    label: 'Concluida',
    value: 'concluida'
  },
  {
    label: 'Cancelada',
    value: 'cancelada'
  }
]

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

const form = ref({
  id: null,
  cliente_id: null,
  servicioOption: null,
  combo: '',
  detalle: '',
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

function normalizar(valor) {
  return String(valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function responseToArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.servicios)) return data.servicios
  if (Array.isArray(data?.clientes)) return data.clientes
  if (Array.isArray(data?.citas)) return data.citas
  if (Array.isArray(data?.pagos)) return data.pagos
  return []
}

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || 'Ocurrió un error'
}

function mapServicio(item) {
  return {
    id: item.id,
    servicio: item.servicio || item.categoria || 'CEJAS Y PESTAÑAS',
    combo: item.combo || item.nombre || '',
    detalle: item.detalle || item.descripcion || '',
    precio: Number(item.precio || 0),
    activo: item.activo !== false && item.activo !== 0 && item.activo !== '0'
  }
}

function colorEstado(estado) {
  if (estado === 'concluida') return 'green'
  if (estado === 'cancelada') return 'red'
  return 'orange'
}

function mostrarEstado(estado) {
  if (estado === 'concluida') return 'Concluida'
  if (estado === 'cancelada') return 'Cancelada'
  return 'Pendiente'
}

function mostrarPago(estado) {
  if (estado === 'pagado') return 'Pagado'
  return 'Pendiente'
}

function mostrarMetodo(metodo) {
  if (metodo === 'qr') return 'QR'
  if (metodo === 'transferencia') return 'Transferencia'
  return 'Efectivo'
}

async function load() {
  loading.value = true

  try {
    const { data } = await api.get('/citas')
    citas.value = responseToArray(data)
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

    clientes.value = responseToArray(data)
    clientesFiltrados.value = clientes.value
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  }
}

async function loadServicios() {
  try {
    const { data } = await api.get('/servicios')

    servicios.value = responseToArray(data)
      .map(mapServicio)
      .filter(item => item.activo)

    serviciosFiltrados.value = servicios.value
  } catch {
    servicios.value = []
    serviciosFiltrados.value = []

    $q.notify({
      type: 'warning',
      message: 'No se pudieron cargar los servicios. Revisa el backend o la ruta /servicios.'
    })
  }
}

function filtrarClientes(valor, update) {
  update(() => {
    const texto = normalizar(valor)

    if (!texto) {
      clientesFiltrados.value = clientes.value
      return
    }

    clientesFiltrados.value = clientes.value.filter(cliente => {
      return normalizar(cliente.nombre).includes(texto) ||
        normalizar(cliente.telefono).includes(texto)
    })
  })
}

function filtrarServicios(valor, update) {
  update(() => {
    const texto = normalizar(valor)

    if (!texto) {
      serviciosFiltrados.value = servicios.value
      return
    }

    serviciosFiltrados.value = servicios.value.filter(servicio => {
      return normalizar(servicio.servicio).includes(texto) ||
        normalizar(servicio.combo).includes(texto) ||
        normalizar(servicio.detalle).includes(texto)
    })
  })
}

function seleccionarServicio(servicio) {
  if (!servicio) {
    limpiarServicio()
    return
  }

  form.value.servicioOption = servicio
  form.value.combo = servicio.combo || ''
  form.value.detalle = servicio.detalle || ''
  form.value.precio = Number(servicio.precio || 0)
}

function limpiarServicio() {
  form.value.servicioOption = null
  form.value.combo = ''
  form.value.detalle = ''
  form.value.precio = 0
}

function openDialog(fechaSeleccionada = null) {
  form.value = {
    id: null,
    cliente_id: null,
    servicioOption: null,
    combo: '',
    detalle: '',
    precio: 0,
    fecha: fechaSeleccionada || String(route.query.fecha || '') || hoy(),
    hora: '',
    estado: 'pendiente'
  }

  dialog.value = true
}

function edit(row) {
  const servicioEncontrado = servicios.value.find(item => {
    return normalizar(item.combo) === normalizar(row.servicio)
  })

  form.value = {
    id: row.id,
    cliente_id: row.cliente_id,
    servicioOption: servicioEncontrado || null,
    combo: row.servicio || servicioEncontrado?.combo || '',
    detalle: servicioEncontrado?.detalle || '',
    precio: Number(row.precio || servicioEncontrado?.precio || 0),
    fecha: row.fecha || hoy(),
    hora: row.hora ? String(row.hora).slice(0, 5) : '',
    estado: row.estado || 'pendiente'
  }

  dialog.value = true
}

async function save() {
  if (!form.value.cliente_id) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona un cliente'
    })

    return
  }

  if (!form.value.combo) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona un servicio o combo'
    })

    return
  }

  if (!form.value.fecha || !form.value.hora) {
    $q.notify({
      type: 'warning',
      message: 'Completa la fecha y la hora'
    })

    return
  }

  if (Number(form.value.precio || 0) <= 0) {
    $q.notify({
      type: 'warning',
      message: 'El precio debe ser mayor a 0'
    })

    return
  }

  saving.value = true

  try {
    const payload = {
      cliente_id: form.value.cliente_id,
      servicio: form.value.combo,
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
  $q.dialog({
    title: 'Finalizar cita',
    message: '¿Deseas marcar esta cita como concluida?',
    persistent: true,
    ok: {
      label: 'Finalizar',
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
  })
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

    historial.value = responseToArray(data)
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

watch(
  () => route.query.fecha,
  async nuevaFecha => {
    if (nuevaFecha) {
      await loadServicios()
      openDialog(String(nuevaFecha))
      router.replace({ path: '/citas' })
    }
  }
)

onMounted(async () => {
  await Promise.all([
    load(),
    loadClientes(),
    loadServicios()
  ])

  if (route.query.fecha) {
    openDialog(String(route.query.fecha))
    router.replace({ path: '/citas' })
  }
})
</script>

<style scoped>
.citas-page {
  min-height: 100vh;
  background: #faf7fb;
}

/* HERO */

.page-hero {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  border-radius: 28px;
  padding: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 16px 40px rgba(233, 30, 99, 0.25);
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

/* BOTONES */

.btn-glamur-white {
  background: white;
  color: #c2185b;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
  box-shadow: 0 10px 24px rgba(20, 10, 30, 0.18);
}

.btn-glamur {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
  box-shadow: 0 10px 24px rgba(233, 30, 99, 0.25);
}

.btn-cancelar {
  background: #f2f2f5;
  color: #666;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
}

/* TABLA */

.tabla-glamur {
  border-radius: 24px;
  overflow: hidden;
  background: white;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
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

/* DIALOGS DESKTOP */

.dialog-card,
.dialog-card-small,
.dialog-card-historial {
  border-radius: 24px;
  overflow: hidden;
}

.dialog-card {
  width: 560px;
  max-width: 96vw;
  height: auto;
  max-height: 92dvh;
}

.dialog-card-small {
  width: 440px;
  max-width: 96vw;
  height: auto;
  max-height: 92dvh;
}

.dialog-card-historial {
  width: 720px;
  max-width: 96vw;
  height: auto;
  max-height: 92dvh;
}

.dialog-card-main {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  flex: 0 0 auto;
  z-index: 3;
}

.dialog-body {
  background: #ffffff;
  padding: 24px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.dialog-actions {
  padding: 16px 22px;
  background: white;
  border-top: 1px solid #eee;
  flex: 0 0 auto;
  z-index: 4;
  box-shadow: 0 -8px 18px rgba(20, 10, 30, 0.06);
}

.input-readonly :deep(.q-field__control) {
  border-style: dashed;
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

/* MOBILE / TABLET */

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

  .hero-actions {
    width: 100%;
    flex-direction: column;
  }

  .btn-glamur-white {
    width: 100%;
  }

  .dialog-card,
  .dialog-card-small,
  .dialog-card-historial {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    border-radius: 0 !important;
  }

  .dialog-card-main {
    display: flex !important;
    flex-direction: column !important;
    overflow: hidden !important;
  }

  .dialog-header {
    min-height: 74px;
    padding: 18px 20px;
  }

  .dialog-header .text-h6 {
    font-size: 22px;
  }

  .dialog-body {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 24px 18px 20px !important;
    -webkit-overflow-scrolling: touch;
  }

  .dialog-actions {
    flex: 0 0 auto !important;
    padding: 14px 16px calc(16px + env(safe-area-inset-bottom)) !important;
    gap: 12px;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
  }

  .dialog-actions .q-btn {
    flex: 1;
    min-height: 54px;
    font-size: 15px;
  }

  .acciones .q-btn {
    margin-bottom: 4px;
  }
}

/* ARREGLO GLOBAL PARA Q-DIALOG MAXIMIZADO EN CELULAR */
:global(.q-dialog__inner--maximized) {
  padding: 0 !important;
  overflow: hidden !important;
}

:global(.q-dialog__inner--maximized > .q-card) {
  width: 100vw !important;
  max-width: 100vw !important;
  height: 100dvh !important;
  max-height: 100dvh !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
}
</style>