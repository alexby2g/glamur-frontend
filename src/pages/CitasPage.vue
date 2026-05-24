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
            {{ descripcionCombo(props.row.servicio) }}
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
    <q-dialog
      v-model="dialog"
      persistent
      :maximized="$q.screen.lt.md"
    >
      <q-card class="dialog-card dialog-flex">

        <!-- HEADER -->
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

        <!-- BODY -->
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
              clearable
              input-debounce="0"
              label="Cliente *"
              outlined
              dense
              rounded
              bg-color="white"
              @filter="filtrarClientes"
            >
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

            <!-- SERVICIO GENERAL -->
            <q-input
              v-model="form.categoria_servicio"
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
              option-label="label"
              option-value="value"
              use-input
              clearable
              input-debounce="0"
              label="Combo *"
              outlined
              dense
              rounded
              bg-color="white"
              @filter="filtrarServicios"
              @update:model-value="seleccionarServicio"
            >
              <template #option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label class="text-weight-bold text-pink-8">
                      {{ scope.opt.servicio.nombre }}
                    </q-item-label>

                    <q-item-label caption>
                      {{ scope.opt.servicio.descripcion }}
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side>
                    <q-badge color="green" rounded>
                      Bs {{ money(scope.opt.servicio.precio) }}
                    </q-badge>
                  </q-item-section>
                </q-item>
              </template>

              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No se encontraron combos
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- DETALLE DEL COMBO -->
            <q-input
              v-model="form.detalle_servicio"
              label="Detalle del combo"
              outlined
              dense
              rounded
              readonly
              bg-color="white"
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

            <!-- ESTADO -->
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

        <!-- ACTIONS FIJAS -->
        <q-card-actions align="right" class="dialog-actions">

          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            v-close-popup
          />

          <q-btn
            v-if="form.id && form.estado !== 'concluida'"
            label="Finalizar"
            icon="check"
            color="positive"
            unelevated
            rounded
            :disable="saving"
            @click="finalizarDesdeDialog"
          />

          <q-btn
            v-if="form.id"
            label="Eliminar"
            icon="delete"
            color="negative"
            unelevated
            rounded
            :disable="saving"
            @click="removeDesdeDialog"
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
    <q-dialog
      v-model="dialogPago"
      persistent
      :maximized="$q.screen.lt.sm"
    >
      <q-card class="dialog-card-small dialog-flex">

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
    <q-dialog
      v-model="dialogHistorial"
      :maximized="$q.screen.lt.sm"
    >
      <q-card class="dialog-card-historial dialog-flex">

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
import { computed, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

defineOptions({
  name: 'CitasPage'
})

const $q = useQuasar()

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

const comboSeleccionado = ref(null)

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
  categoria_servicio: 'CEJAS Y PESTAÑAS',
  servicio: '',
  detalle_servicio: '',
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

const combosBase = [
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'CLEAN BROWS',
    descripcion: 'Depilación + Visagismo',
    precio: 25,
    activo: true
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'BROWS PRO',
    descripcion: 'Henna + Depilación y Visagismo',
    precio: 80,
    activo: true
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'LAMI BROWS',
    descripcion: 'Laminado + Vitaminas + Depilación y Visagismo',
    precio: 80,
    activo: true
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'LASH PERFECT',
    descripcion: 'Lifting + Tinte efecto rimel',
    precio: 85,
    activo: true
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'PERFECT BROWS',
    descripcion: 'Laminado + Henna + Depilación + Visagismo',
    precio: 135,
    activo: true
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'GLOW UP EXPRESS',
    descripcion: 'Laminado + Henna + Depilación y Visagismo + Lifting + Tinte efecto rimel',
    precio: 220,
    activo: true
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'PERFECT EXPRESS',
    descripcion: 'Henna + Depilación y Visagismo + Lifting + Tinte efecto rimel',
    precio: 165,
    activo: true
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'LASH & BROWS EXPRESS',
    descripcion: 'Laminado + Lifting + Tinte efecto rimel + Vitaminas + Depilación y Visagismo',
    precio: 165,
    activo: true
  },
  {
    categoria: 'CEJAS Y PESTAÑAS',
    nombre: 'RETOQUE BROWS PRO',
    descripcion: 'Henna',
    precio: 40,
    activo: true
  }
]

const serviciosOptions = computed(() => {
  return servicios.value
    .filter(item => item.activo !== false)
    .map(item => {
      return {
        label: item.nombre,
        value: item.id || item.nombre,
        servicio: item
      }
    })
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
    label: 'Servicio / Combo',
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
    field: row => formatearHora(row.hora),
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
    field: row => mostrarMetodo(row.metodo),
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

function mostrarMetodo(value) {
  if (value === 'qr') return 'QR'
  if (value === 'efectivo') return 'Efectivo'
  if (value === 'transferencia') return 'Transferencia'

  return value || 'No definido'
}

function formatearHora(value) {
  if (!value) return ''

  return String(value).slice(0, 5)
}

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || 'Ocurrió un error'
}

function normalizarLista(data, key) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.[key])) return data[key]

  return []
}

function normalizarTexto(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function colorEstado(estado) {
  if (estado === 'concluida') return 'green'
  if (estado === 'cancelada') return 'red'

  return 'orange'
}

function descripcionCombo(nombre) {
  const combo = servicios.value.find(item => {
    return normalizarTexto(item.nombre) === normalizarTexto(nombre)
  })

  return combo?.descripcion || 'Combo Glamur'
}

async function load() {
  loading.value = true

  try {
    const { data } = await api.get('/citas')

    citas.value = normalizarLista(data, 'citas')
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

    clientes.value = normalizarLista(data, 'clientes')
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

    servicios.value = normalizarLista(data, 'servicios')

    if (!servicios.value.length) {
      servicios.value = combosBase
    }
  } catch {
    servicios.value = combosBase
  } finally {
    serviciosFiltrados.value = serviciosOptions.value
  }
}

function filtrarClientes(val, update) {
  update(() => {
    const texto = normalizarTexto(val)

    if (!texto) {
      clientesFiltrados.value = clientes.value
      return
    }

    clientesFiltrados.value = clientes.value.filter(cliente => {
      const nombre = normalizarTexto(cliente.nombre)
      const telefono = normalizarTexto(cliente.telefono)

      return nombre.includes(texto) || telefono.includes(texto)
    })
  })
}

function filtrarServicios(val, update) {
  update(() => {
    const texto = normalizarTexto(val)

    if (!texto) {
      serviciosFiltrados.value = serviciosOptions.value
      return
    }

    serviciosFiltrados.value = serviciosOptions.value.filter(option => {
      const nombre = normalizarTexto(option.servicio.nombre)
      const descripcion = normalizarTexto(option.servicio.descripcion)
      const categoria = normalizarTexto(option.servicio.categoria)

      return (
        nombre.includes(texto) ||
        descripcion.includes(texto) ||
        categoria.includes(texto)
      )
    })
  })
}

function seleccionarServicio(option) {
  if (!option) {
    comboSeleccionado.value = null
    form.value.servicio = ''
    form.value.detalle_servicio = ''
    form.value.precio = 0

    return
  }

  const item = option.servicio

  form.value.categoria_servicio = item.categoria || 'CEJAS Y PESTAÑAS'
  form.value.servicio = item.nombre || ''
  form.value.detalle_servicio = item.descripcion || item.detalle || ''
  form.value.precio = Number(item.precio || 0)
}

function buscarComboPorNombre(nombre) {
  const texto = normalizarTexto(nombre)

  return serviciosOptions.value.find(option => {
    return normalizarTexto(option.servicio.nombre) === texto
  }) || null
}

function openDialog() {
  form.value = {
    id: null,
    cliente_id: null,
    categoria_servicio: 'CEJAS Y PESTAÑAS',
    servicio: '',
    detalle_servicio: '',
    precio: 0,
    fecha: hoy(),
    hora: '',
    estado: 'pendiente'
  }

  comboSeleccionado.value = null
  clientesFiltrados.value = clientes.value
  serviciosFiltrados.value = serviciosOptions.value
  dialog.value = true
}

function edit(row) {
  form.value = {
    id: row.id,
    cliente_id: row.cliente_id || row.cliente?.id || null,
    categoria_servicio: 'CEJAS Y PESTAÑAS',
    servicio: row.servicio || '',
    detalle_servicio: descripcionCombo(row.servicio),
    precio: Number(row.precio || 0),
    fecha: row.fecha || hoy(),
    hora: row.hora ? String(row.hora).slice(0, 5) : '',
    estado: row.estado || 'pendiente'
  }

  const combo = buscarComboPorNombre(row.servicio)

  if (combo) {
    comboSeleccionado.value = combo
    seleccionarServicio(combo)
  } else {
    comboSeleccionado.value = null
  }

  clientesFiltrados.value = clientes.value
  serviciosFiltrados.value = serviciosOptions.value
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

async function finalizarDesdeDialog() {
  if (!form.value.id) return

  await finalizar(form.value.id)

  form.value.estado = 'concluida'
  dialog.value = false
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

    historial.value = normalizarLista(data, 'pagos')

    dialogHistorial.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  }
}

function remove(id, cerrarDialog = false) {
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

      if (cerrarDialog) {
        dialog.value = false
      }

      await load()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

function removeDesdeDialog() {
  if (!form.value.id) return

  remove(form.value.id, true)
}

onMounted(async () => {
  await Promise.all([
    load(),
    loadClientes(),
    loadServicios()
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
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  border-radius: 28px;
  padding: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 16px 40px rgba(233, 30, 99, 0.25);
}

/* BUTTONS */

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

/* TABLE */

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

/* DIALOGS */

.dialog-card,
.dialog-card-small,
.dialog-card-historial {
  border-radius: 24px;
  overflow: hidden;
}

.dialog-flex {
  display: flex;
  flex-direction: column;
}

.dialog-card {
  width: 560px;
  max-width: 96vw;
  max-height: 92vh;
}

.dialog-card-small {
  width: 440px;
  max-width: 96vw;
  max-height: 92vh;
}

.dialog-card-historial {
  width: 720px;
  max-width: 96vw;
  max-height: 92vh;
}

.dialog-header {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  flex: 0 0 auto;
}

.dialog-body {
  background: #ffffff;
  padding: 24px;
  overflow-y: auto;
  flex: 1 1 auto;
  min-height: 0;
  -webkit-overflow-scrolling: touch;
}

.dialog-actions {
  padding: 16px 22px;
  background: white;
  border-top: 1px solid #eeeeee;
  flex: 0 0 auto;
  position: sticky;
  bottom: 0;
  z-index: 3;
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

/* TABLET Y CELULAR */

@media (max-width: 1024px) {
  .dialog-card,
  .dialog-card-small,
  .dialog-card-historial {
    width: 100vw !important;
    max-width: 100vw !important;
    height: 100vh !important;
    max-height: 100vh !important;
    border-radius: 0;
  }

  .dialog-body {
    max-height: none;
    padding: 20px;
    padding-bottom: 120px;
  }

  .dialog-actions {
    padding: 14px;
    gap: 8px;
    flex-wrap: wrap;
  }

  .dialog-actions .q-btn {
    flex: 1 1 auto;
  }
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

  .dialog-body {
    padding: 16px;
    padding-bottom: 150px;
  }

  .dialog-actions .q-btn {
    width: 100%;
    flex: 1 1 100%;
  }

  .acciones .q-btn {
    margin-bottom: 4px;
  }
}
</style>