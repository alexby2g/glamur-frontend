<template>
  <q-page class="q-pa-md citas-page">

    <!-- HERO -->
    <div class="page-hero q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-white">
          📅 Citas
        </div>

        <div class="text-subtitle2 text-white">
          Gestión de reservas, servicios, pagos y estados de {{ nombreNegocio }}
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

    <!-- BUSCADOR -->
    <q-card class="buscador-card q-mb-md" flat bordered>
      <div class="buscador-row">
        <q-input
          v-model="busqueda"
          class="buscador-input"
          outlined
          rounded
          dense
          clearable
          bg-color="white"
          debounce="200"
          placeholder="Buscar por cliente, teléfono, servicio, fecha, estado o pago..."
        >
          <template #prepend>
            <q-icon name="search" color="pink" />
          </template>
        </q-input>

        <q-badge class="buscador-badge" rounded>
          {{ citasFiltradas.length }} de {{ citas.length }}
        </q-badge>
      </div>
    </q-card>

    <!-- TABLA -->
    <q-table
      class="tabla-glamur"
      :rows="citasFiltradas"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :no-data-label="busqueda ? 'No se encontraron citas con esa búsqueda' : 'No hay citas registradas'"
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
            Servicio {{ marcaPrincipal }}
          </div>
        </q-td>
      </template>

      <!-- PRECIO -->
      <template #body-cell-precio="props">
        <q-td :props="props">
          <div class="text-weight-bold text-green-8">
            {{ currency(props.row.precio) }}
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
      :maximized="$q.screen.lt.md"
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
          <div class="form-stack">

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
              rounded
              bg-color="white"
              class="form-field"
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

            <!-- CATEGORÍAS DE SERVICIOS -->
            <div class="service-category-box">
              <div class="category-title">Selecciona una categoría</div>

              <div class="service-category-grid">
                <button
                  v-for="cat in categoriasServicios"
                  :key="cat.key"
                  type="button"
                  class="service-category-card"
                  :class="{ active: categoriaSeleccionada === cat.key }"
                  @click="seleccionarCategoria(cat.key)"
                >
                  <q-icon :name="cat.icon" class="category-icon" />
                  <span>{{ cat.label }}</span>
                  <small>{{ contarServiciosCategoria(cat.key) }} opción(es)</small>
                </button>
              </div>
            </div>

            <!-- SERVICIO / COMBO -->
            <q-select
              v-model="form.servicioOption"
              :options="serviciosFiltrados"
              option-label="combo"
              option-value="id"
              label="Servicio o combo *"
              outlined
              rounded
              clearable
              use-input
              input-debounce="0"
              class="form-field service-select"
              popup-content-class="combo-menu-glamur"
              :disable="serviciosDeCategoriaActual.length === 0"
              @filter="filtrarServicios"
              @update:model-value="seleccionarServicio"
              @clear="limpiarServicio"
            >
              <template #prepend>
                <q-icon :name="categoriaActual.icon" color="pink" class="field-icon" />
              </template>

              <template #no-option>
                <q-item>
                  <q-item-section class="text-grey-7">
                    No hay servicios en esta categoría.
                  </q-item-section>
                </q-item>
              </template>

              <template #option="scope">
                <q-item v-bind="scope.itemProps" class="combo-option">
                  <q-item-section avatar>
                    <q-avatar color="pink-1" text-color="pink" :icon="iconoServicio(scope.opt.servicio)" />
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
                    <q-item-label caption class="text-pink text-weight-bold">
                      {{ currency(scope.opt.precio) }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </template>

              <template #selected-item="scope">
                <div class="selected-service-text">
                  {{ scope.opt.combo }}
                </div>
              </template>
            </q-select>

            <!-- DETALLE DEL SERVICIO -->
            <q-input
              v-if="form.detalle"
              v-model="form.detalle"
              label="Detalle del servicio"
              outlined
              rounded
              readonly
              bg-color="white"
              class="form-field input-readonly"
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
              rounded
              min="0"
              bg-color="white"
              class="form-field"
            >
              <template #prepend>
                <q-icon name="payments" color="green" />
              </template>
            </q-input>

            <!-- FECHA Y HORA -->
            <div class="form-row">
              <q-input
                v-model="form.fecha"
                type="date"
                label="Fecha *"
                outlined
                rounded
                bg-color="white"
                class="form-field"
              >
                <template #prepend>
                  <q-icon name="event" color="pink" />
                </template>
              </q-input>

              <q-input
                v-model="form.hora"
                type="time"
                label="Hora *"
                outlined
                rounded
                bg-color="white"
                class="form-field"
              >
                <template #prepend>
                  <q-icon name="schedule" color="pink" />
                </template>
              </q-input>
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
              rounded
              bg-color="white"
              class="form-field"
            >
              <template #prepend>
                <q-icon name="flag" color="pink" />
              </template>
            </q-select>

          </div>
        </q-card-section>

        <!-- BOTONES FIJOS -->
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
      :maximized="$q.screen.lt.md"
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
          <div class="form-stack">

            <q-input
              v-model.number="pago.monto"
              type="number"
              label="Monto Bs."
              outlined
              rounded
              min="0"
              bg-color="white"
              class="form-field"
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
              rounded
              bg-color="white"
              class="form-field"
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
      :maximized="$q.screen.lt.md"
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
                  {{ currency(props.row.monto) }}
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
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'boot/axios'

defineOptions({
  name: 'CitasPage'
})

const $q = useQuasar()
const route = useRoute()
const router = useRouter()


const valoresBaseConfiguracion = {
  nombre_negocio: 'AUREA Beauty Salon',
  nombre_corto: 'AUREA Beauty',
  slogan: 'Sistema inteligente para salones de belleza',
  telefono: '',
  whatsapp: '',
  direccion: '',
  mensaje_whatsapp: 'Hola {cliente}, le escribimos de {negocio} para coordinar su cita.',
  logo_url: '',
  moneda: 'Bs',
  activo: true
}

const configuracion = ref({
  ...valoresBaseConfiguracion
})

const nombreNegocio = computed(() => {
  return configuracion.value.nombre_negocio || valoresBaseConfiguracion.nombre_negocio
})

const nombreCorto = computed(() => {
  return configuracion.value.nombre_corto || valoresBaseConfiguracion.nombre_corto
})

const monedaNegocio = computed(() => {
  return configuracion.value.moneda || valoresBaseConfiguracion.moneda
})

const marcaPrincipal = computed(() => {
  const partes = String(nombreCorto.value || 'AUREA Beauty').trim().split(' ')
  return partes[0] || 'AUREA'
})

function normalizarConfiguracionNegocio(config = {}) {
  return {
    ...valoresBaseConfiguracion,
    ...config,
    activo: config?.activo === undefined ? true : Boolean(config.activo)
  }
}

function aplicarConfiguracionNegocio(config = {}) {
  configuracion.value = normalizarConfiguracionNegocio(config)
}

function guardarConfiguracionNegocioLocal(config = {}) {
  localStorage.setItem(
    'aurea_configuracion',
    JSON.stringify(normalizarConfiguracionNegocio(config))
  )
}

function cargarConfiguracionNegocioLocal() {
  try {
    const guardado = localStorage.getItem('aurea_configuracion')
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

async function cargarConfiguracionNegocio() {
  const local = cargarConfiguracionNegocioLocal()

  if (local) {
    aplicarConfiguracionNegocio(local)
  }

  try {
    const { data } = await api.get('/configuracion')
    const config = data?.configuracion || data || valoresBaseConfiguracion

    aplicarConfiguracionNegocio(config)
    guardarConfiguracionNegocioLocal(config)
  } catch {
    if (!local) {
      aplicarConfiguracionNegocio(valoresBaseConfiguracion)
    }
  }
}

function currency(value) {
  return `${monedaNegocio.value} ${money(value)}`
}

const citas = ref([])
const busqueda = ref('')
const clientes = ref([])
const clientesFiltrados = ref([])
const servicios = ref([])
const serviciosFiltrados = ref([])
const categoriaSeleccionada = ref('cejas')

const categoriasServicios = [
  {
    key: 'cejas',
    label: 'Cejas y pestañas',
    icon: 'spa',
    match: ['cejas', 'pestañas', 'pestanas', 'brows', 'lash']
  },
  {
    key: 'maquillaje',
    label: 'Maquillaje y cabello',
    icon: 'face_retouching_natural',
    match: ['maquillaje', 'cabello', 'peinado', 'hair', 'makeup']
  },
  {
    key: 'unas',
    label: 'Uñas',
    icon: 'back_hand',
    match: ['uñas', 'unas', 'manicure', 'pedicure', 'nail']
  },
  {
    key: 'otros',
    label: 'Otros',
    icon: 'more_horiz',
    match: []
  }
]

const historial = ref([])

const dialog = ref(false)
const dialogPago = ref(false)
const dialogHistorial = ref(false)

const loading = ref(false)
const saving = ref(false)
const savingPago = ref(false)

const estados = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Concluida', value: 'concluida' },
  { label: 'Cancelada', value: 'cancelada' }
]

const metodosPago = [
  { label: 'Efectivo', value: 'efectivo' },
  { label: 'QR', value: 'qr' },
  { label: 'Transferencia', value: 'transferencia' }
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

function fechaLocal(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function hoy() {
  // Importante: no usamos toISOString porque en Bolivia después de cierta hora
  // puede adelantar la fecha por el cambio a UTC. Esto mantiene el día local.
  return fechaLocal(new Date())
}

function normalizar(valor) {
  return String(valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

const citasFiltradas = computed(() => {
  const texto = normalizar(busqueda.value)

  if (!texto) {
    return citas.value
  }

  return citas.value.filter(cita => {
    const datos = [
      cita.id,
      cita.cliente?.nombre,
      cita.cliente?.telefono,
      cita.servicio,
      cita.precio,
      cita.fecha,
      cita.hora,
      cita.estado,
      mostrarEstado(cita.estado),
      cita.estado_pago,
      mostrarPago(cita.estado_pago)
    ]

    return datos.some(dato => normalizar(dato).includes(texto))
  })
})

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

function categoriaDeServicio(nombreServicio = '') {
  const texto = normalizar(nombreServicio)

  const categoria = categoriasServicios.find(cat => {
    if (cat.key === 'otros') return false
    return cat.match.some(palabra => texto.includes(normalizar(palabra)))
  })

  return categoria?.key || 'otros'
}

const categoriaActual = computed(() => {
  return categoriasServicios.find(cat => cat.key === categoriaSeleccionada.value) || categoriasServicios[0]
})

const serviciosDeCategoriaActual = computed(() => {
  return servicios.value.filter(servicio => categoriaDeServicio(servicio.servicio) === categoriaSeleccionada.value)
})

function contarServiciosCategoria(key) {
  return servicios.value.filter(servicio => categoriaDeServicio(servicio.servicio) === key).length
}

function iconoServicio(nombreServicio) {
  const key = categoriaDeServicio(nombreServicio)
  return categoriasServicios.find(cat => cat.key === key)?.icon || 'spa'
}

function actualizarServiciosFiltrados() {
  serviciosFiltrados.value = serviciosDeCategoriaActual.value
}

function seleccionarCategoria(key) {
  categoriaSeleccionada.value = key
  limpiarServicio()
  actualizarServiciosFiltrados()
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

    actualizarServiciosFiltrados()
  } catch (error) {
    servicios.value = []
    serviciosFiltrados.value = []

    $q.notify({
      type: 'warning',
      message: getErrorMessage(error)
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
    const base = serviciosDeCategoriaActual.value

    if (!texto) {
      serviciosFiltrados.value = base
      return
    }

    serviciosFiltrados.value = base.filter(servicio => {
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

  categoriaSeleccionada.value = categoriaDeServicio(servicio.servicio)
  actualizarServiciosFiltrados()

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
  categoriaSeleccionada.value = 'cejas'
  actualizarServiciosFiltrados()

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

  const servicioTemporal = servicioEncontrado || {
    id: null,
    servicio: 'Servicio guardado',
    combo: row.servicio || '',
    detalle: '',
    precio: Number(row.precio || 0),
    activo: true
  }

  categoriaSeleccionada.value = categoriaDeServicio(servicioTemporal.servicio)
  actualizarServiciosFiltrados()

  form.value = {
    id: row.id,
    cliente_id: row.cliente_id,
    servicioOption: servicioTemporal,
    combo: row.servicio || servicioTemporal.combo || '',
    detalle: servicioTemporal.detalle || '',
    precio: Number(row.precio || servicioTemporal.precio || 0),
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
  await cargarConfiguracionNegocio()

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

/* BUSCADOR */

.buscador-card {
  border-radius: 22px;
  padding: 14px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(156, 39, 176, 0.10);
  border: 1px solid #f3d6e5;
}

.buscador-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.buscador-input {
  flex: 1;
}

.buscador-input :deep(.q-field__control) {
  min-height: 48px;
  border-radius: 24px;
}

.buscador-badge {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
  padding: 10px 14px;
  white-space: nowrap;
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

/* FORMULARIO */

.form-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-field {
  width: 100%;
  margin: 0;
}

.form-field :deep(.q-field__control) {
  min-height: 58px;
  border-radius: 28px;
}

.form-field :deep(.q-field__prepend) {
  min-width: 42px;
  padding-right: 8px;
}

.form-field :deep(.q-field__append) {
  padding-left: 6px;
}

.form-field :deep(.q-field__marginal) {
  height: 58px;
}

.form-field :deep(.q-icon) {
  font-size: 25px;
}

.form-field :deep(.q-field__label) {
  font-size: 13px;
  line-height: 1.1;
}

.form-field :deep(.q-field__native),
.form-field :deep(.q-field__input),
.form-field :deep(input) {
  font-size: 16px;
  line-height: 1.25;
  font-weight: 500;
  color: #222;
  min-height: 24px;
}

.form-field :deep(.q-field__native span) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.input-readonly :deep(.q-field__control) {
  border-style: dashed;
}

.input-readonly :deep(.q-field__native) {
  color: #222;
}

/* DIALOGS DESKTOP */

.dialog-card,
.dialog-card-small,
.dialog-card-historial {
  border-radius: 24px;
  overflow: hidden;
}

.dialog-card {
  width: 620px;
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
  padding: 22px;
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

.dialog-actions {
  padding: 14px 20px;
  background: white;
  border-top: 1px solid #eee;
  flex: 0 0 auto;
  z-index: 4;
  box-shadow: 0 -8px 18px rgba(20, 10, 30, 0.06);
}

.dialog-actions .q-btn {
  min-height: 46px;
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

@media (max-width: 900px) {
  .citas-page {
    padding: 10px;
  }

  .page-hero {
    padding: 20px;
    border-radius: 22px;
    flex-direction: column;
    align-items: stretch;
    gap: 14px;
  }

  .page-hero .text-h4 {
    font-size: 28px;
  }

  .hero-actions {
    width: 100%;
    flex-direction: column;
  }

  .btn-glamur-white {
    width: 100%;
  }

  .tabla-glamur {
    border-radius: 20px;
  }

  .dialog-card,
  .dialog-card-small,
  .dialog-card-historial {
    width: 100%;
    max-width: 100%;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }

  .dialog-header {
    min-height: 70px;
    padding: 16px 18px;
  }

  .dialog-header .text-h6 {
    font-size: 22px;
  }

  .dialog-body {
    flex: 1 1 auto !important;
    min-height: 0 !important;
    overflow-y: auto !important;
    overflow-x: hidden !important;
    padding: 22px 30px 26px !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }

  .form-stack {
    gap: 14px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .form-field :deep(.q-field__control) {
    min-height: 62px;
    border-radius: 28px;
  }

  .form-field :deep(.q-field__marginal) {
    height: 62px;
  }

  .form-field :deep(.q-field__prepend) {
    min-width: 44px;
    padding-right: 8px;
  }

  .form-field :deep(.q-field__append) {
    padding-left: 6px;
  }

  .form-field :deep(.q-icon) {
    font-size: 27px;
  }

  .form-field :deep(.q-field__label) {
    font-size: 13px;
    line-height: 1.1;
  }

  .form-field :deep(.q-field__native),
  .form-field :deep(.q-field__input),
  .form-field :deep(input) {
    font-size: 18px;
    line-height: 1.2;
    font-weight: 600;
    padding-top: 4px;
  }

  .input-readonly :deep(.q-field__native),
  .input-readonly :deep(input) {
    white-space: normal;
    overflow-wrap: anywhere;
  }

  .dialog-actions {
    flex: 0 0 auto !important;
    padding: 12px 30px calc(14px + env(safe-area-inset-bottom)) !important;
    gap: 12px;
    display: flex;
    flex-wrap: nowrap;
    justify-content: space-between;
  }

  .dialog-actions .q-btn {
    flex: 1;
    min-height: 56px;
    font-size: 14px;
    border-radius: 18px;
  }

  .acciones .q-btn {
    margin-bottom: 4px;
  }
}

@media (max-width: 700px) {
  .buscador-row {
    flex-direction: column;
    align-items: stretch;
  }

  .buscador-badge {
    width: 100%;
    justify-content: center;
    text-align: center;
  }

  .service-category-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .service-category-card {
    min-height: 76px;
    padding: 10px 6px;
  }

  .service-category-card .category-icon {
    font-size: 25px;
  }

  .service-category-card span {
    font-size: 11px;
  }

  .service-category-box {
    padding: 12px;
    margin-bottom: 12px;
  }
}

@media (max-width: 420px) {
  .dialog-body {
    padding: 20px 20px 24px !important;
  }

  .dialog-actions {
    padding-left: 20px !important;
    padding-right: 20px !important;
  }

  .form-field :deep(.q-field__control) {
    min-height: 60px;
  }

  .form-field :deep(.q-field__marginal) {
    height: 60px;
  }

  .form-field :deep(.q-field__native),
  .form-field :deep(.q-field__input),
  .form-field :deep(input) {
    font-size: 17px;
  }

  .dialog-actions .q-btn {
    min-height: 54px;
    font-size: 13px;
  }
}

/* Teléfono en horizontal: campos más bajos y scroll correcto */
@media (max-height: 520px) and (orientation: landscape) {
  .dialog-header {
    min-height: 56px;
    padding: 10px 18px;
  }

  .dialog-header .text-h6 {
    font-size: 20px;
  }

  .dialog-body {
    padding: 14px 26px 16px !important;
  }

  .form-stack {
    gap: 10px;
  }

  .form-field :deep(.q-field__control) {
    min-height: 52px;
    border-radius: 24px;
  }

  .form-field :deep(.q-field__marginal) {
    height: 52px;
  }

  .form-field :deep(.q-field__native),
  .form-field :deep(.q-field__input),
  .form-field :deep(input) {
    font-size: 16px;
  }

  .dialog-actions {
    padding-top: 8px !important;
    padding-bottom: calc(8px + env(safe-area-inset-bottom)) !important;
  }

  .dialog-actions .q-btn {
    min-height: 48px;
  }
}

/* CATEGORÍAS DENTRO DE NUEVA CITA */

.service-category-box {
  background: #fff7fb;
  border: 1px solid #f7c9dc;
  border-radius: 22px;
  padding: 14px;
  margin-bottom: 14px;
}

.category-title {
  color: #8a1248;
  font-weight: 900;
  font-size: 13px;
  margin-bottom: 10px;
}

.service-category-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.service-category-card {
  border: 1px solid #efc4d8;
  background: #ffffff;
  border-radius: 18px;
  padding: 12px 8px;
  cursor: pointer;
  color: #8a1248;
  font-weight: 900;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 86px;
  transition: all 0.2s ease;
  text-align: center;
}

.service-category-card:hover,
.service-category-card.active {
  color: white;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  border-color: transparent;
  box-shadow: 0 12px 28px rgba(233, 30, 99, 0.22);
  transform: translateY(-1px);
}

.service-category-card .category-icon {
  font-size: 28px;
}

.service-category-card span {
  font-size: 12px;
  line-height: 1.15;
}

.service-category-card small {
  font-size: 10px;
  opacity: 0.78;
  font-weight: 700;
}

/* ARREGLO GLOBAL PARA Q-DIALOG MAXIMIZADO EN CELULAR / TABLET */

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