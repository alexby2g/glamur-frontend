<template>
  <q-page class="dashboard-page">

    <!-- HERO -->
    <section class="dashboard-hero">
      <div>
        <div class="hero-badge">
          Panel administrativo
        </div>

        <div class="text-h4 text-weight-bold text-white q-mt-sm">
          📊 Dashboard Glamur
        </div>

        <div class="text-subtitle2 text-white hero-subtitle">
          Resumen general de citas, ingresos y actividad del sistema
        </div>
      </div>

      <q-btn
        icon="refresh"
        label="Actualizar"
        class="btn-refresh"
        :loading="loading"
        @click="load"
      />
    </section>

    <q-linear-progress
      v-if="loading"
      indeterminate
      color="pink"
      class="q-my-md"
    />

    <!-- TARJETAS -->
    <div class="row q-col-gutter-md q-mt-md">
      <div
        class="col-12 col-sm-6 col-md-4"
        v-for="card in cards"
        :key="card.titulo"
      >
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-start justify-between no-wrap">
              <div class="stat-info">
                <div class="stat-title">
                  {{ card.titulo }}
                </div>

                <div class="stat-value">
                  {{ card.valor }}
                </div>

                <div class="stat-detail">
                  {{ card.detalle }}
                </div>

                <q-btn
                  v-if="card.historial"
                  dense
                  unelevated
                  no-caps
                  icon="history"
                  label="Ver historial"
                  class="history-card-btn q-mt-sm"
                  @click="abrirHistorial(card.filtro, card.titulo)"
                />
              </div>

              <q-avatar :class="card.clase" size="58px">
                <q-icon :name="card.icono" size="30px" color="white" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- BOTONES RÁPIDOS DE HISTORIAL -->
    <q-card class="history-panel q-mt-md">
      <q-card-section>
        <div class="row items-center justify-between q-col-gutter-md">
          <div class="col-12 col-md-5">
            <div class="panel-title">
              Historial total de citas
            </div>

            <div class="panel-subtitle">
              Consulta rápidamente todas las citas registradas, pendientes o concluidas.
            </div>
          </div>

          <div class="col-12 col-md-7">
            <div class="history-buttons">
              <q-btn
                unelevated
                icon="list_alt"
                label="Todas"
                class="btn-history all"
                @click="abrirHistorial('todas', 'Todas las citas')"
              />

              <q-btn
                unelevated
                icon="schedule"
                label="Pendientes"
                class="btn-history pending"
                @click="abrirHistorial('pendientes', 'Citas pendientes')"
              />

              <q-btn
                unelevated
                icon="check_circle"
                label="Concluidas"
                class="btn-history done"
                @click="abrirHistorial('concluidas', 'Citas concluidas')"
              />
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- PANELES -->
    <div class="row q-col-gutter-md q-mt-md">

      <div class="col-12 col-md-7">
        <q-card class="panel-card">
          <q-card-section>
            <div class="panel-title">
              Estado de citas
            </div>

            <div class="panel-subtitle">
              Control visual de citas pendientes y concluidas
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="progress-box">
              <div class="row justify-between q-mb-xs">
                <div class="progress-label">Pendientes</div>
                <div class="progress-number">{{ data.pendientes || 0 }}</div>
              </div>

              <q-linear-progress
                rounded
                size="16px"
                color="orange"
                :value="porcentajePendientes"
              />
            </div>

            <div class="progress-box">
              <div class="row justify-between q-mb-xs">
                <div class="progress-label">Concluidas</div>
                <div class="progress-number">{{ data.concluidas || 0 }}</div>
              </div>

              <q-linear-progress
                rounded
                size="16px"
                color="green"
                :value="porcentajeConcluidas"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card class="panel-card income-card">
          <q-card-section>
            <div class="panel-title">
              Ingresos del mes
            </div>

            <div class="panel-subtitle">
              Total registrado en pagos
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="ingreso-total">
              Bs {{ money(data.ingreso_mes) }}
            </div>

            <div class="text-caption text-grey-7 q-mb-md">
              Ingreso acumulado del mes actual
            </div>

            <div class="quick-actions">
              <q-btn
                class="quick-btn"
                icon="people"
                label="Clientes"
                to="/clientes"
                unelevated
              />

              <q-btn
                class="quick-btn"
                icon="event"
                label="Citas"
                to="/citas"
                unelevated
              />

              <q-btn
                class="quick-btn"
                icon="payments"
                label="Pagos"
                to="/pagos"
                unelevated
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

    </div>

    <!-- MODAL HISTORIAL -->
    <q-dialog v-model="dialogHistorial">
      <q-card class="dialog-history">

        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">
              📋 {{ tituloHistorial }}
            </div>

            <div class="dialog-subtitle">
              {{ citasFiltradas.length }} registro(s) encontrados
            </div>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            v-close-popup
          />
        </q-card-section>

        <q-card-section class="dialog-filter-section">
          <div class="filter-buttons">
            <q-btn
              unelevated
              icon="list_alt"
              label="Todas"
              :class="filtroHistorial === 'todas' ? 'filter-active' : 'filter-btn'"
              @click="cambiarFiltro('todas', 'Todas las citas')"
            />

            <q-btn
              unelevated
              icon="schedule"
              label="Pendientes"
              :class="filtroHistorial === 'pendientes' ? 'filter-active' : 'filter-btn'"
              @click="cambiarFiltro('pendientes', 'Citas pendientes')"
            />

            <q-btn
              unelevated
              icon="check_circle"
              label="Concluidas"
              :class="filtroHistorial === 'concluidas' ? 'filter-active' : 'filter-btn'"
              @click="cambiarFiltro('concluidas', 'Citas concluidas')"
            />
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="dialog-body">
          <div v-if="citasFiltradas.length === 0" class="empty-history">
            <q-icon name="event_busy" size="58px" color="grey-5" />
            <div class="empty-title">No hay registros</div>
            <div class="empty-subtitle">
              No existen citas para este historial.
            </div>
          </div>

          <q-list v-else separator class="history-list">
            <q-item
              v-for="cita in citasFiltradas"
              :key="cita.id"
              class="history-item"
            >
              <q-item-section avatar>
                <q-avatar :color="colorEstado(cita.estado)" text-color="white">
                  <q-icon :name="iconoEstado(cita.estado)" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="history-client">
                  {{ nombreCliente(cita) }}
                </q-item-label>

                <q-item-label caption class="history-service">
                  {{ cita.servicio || cita.combo || 'Sin servicio registrado' }}
                </q-item-label>

                <q-item-label caption>
                  <q-icon name="event" size="15px" />
                  {{ formatoFecha(cita.fecha) }}

                  <span class="q-mx-xs">•</span>

                  <q-icon name="schedule" size="15px" />
                  {{ formatoHora(cita.hora) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <div class="side-info">
                  <q-badge
                    rounded
                    :color="colorEstado(cita.estado)"
                    text-color="white"
                    class="q-mb-xs"
                  >
                    {{ textoEstado(cita.estado) }}
                  </q-badge>

                  <div class="history-price">
                    Bs {{ money(cita.precio) }}
                  </div>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            flat
            label="Cerrar"
            color="grey-8"
            v-close-popup
          />

          <q-btn
            unelevated
            icon="event"
            label="Ir a citas"
            class="btn-go-citas"
            to="/citas"
            v-close-popup
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

defineOptions({ name: 'DashboardPage' })

const $q = useQuasar()
const loading = ref(false)

const data = ref({
  total: 0,
  pendientes: 0,
  concluidas: 0,
  ingreso_dia: 0,
  ingreso_mes: 0,
  ingreso_anio: 0
})

const citas = ref([])

const dialogHistorial = ref(false)
const filtroHistorial = ref('todas')
const tituloHistorial = ref('Todas las citas')

function money(value) {
  return Number(value || 0).toFixed(2)
}

function normalizarEstado(estado) {
  return String(estado || '').toLowerCase().trim()
}

function esPendiente(cita) {
  return normalizarEstado(cita.estado) === 'pendiente'
}

function esConcluida(cita) {
  const estado = normalizarEstado(cita.estado)

  return estado === 'concluida' ||
    estado === 'concluido' ||
    estado === 'finalizada' ||
    estado === 'finalizado' ||
    estado === 'realizada' ||
    estado === 'realizado'
}

function esCancelada(cita) {
  const estado = normalizarEstado(cita.estado)

  return estado === 'cancelada' ||
    estado === 'cancelado'
}

const citasOrdenadas = computed(() => {
  return [...citas.value].sort((a, b) => {
    const fechaA = `${a.fecha || ''} ${a.hora || '00:00'}`
    const fechaB = `${b.fecha || ''} ${b.hora || '00:00'}`
    return fechaB.localeCompare(fechaA)
  })
})

const citasFiltradas = computed(() => {
  if (filtroHistorial.value === 'pendientes') {
    return citasOrdenadas.value.filter(esPendiente)
  }

  if (filtroHistorial.value === 'concluidas') {
    return citasOrdenadas.value.filter(esConcluida)
  }

  return citasOrdenadas.value
})

const porcentajePendientes = computed(() => {
  const total = Number(data.value.total || 0)
  if (total === 0) return 0
  return Number(data.value.pendientes || 0) / total
})

const porcentajeConcluidas = computed(() => {
  const total = Number(data.value.total || 0)
  if (total === 0) return 0
  return Number(data.value.concluidas || 0) / total
})

const cards = computed(() => [
  {
    titulo: 'Total Citas',
    valor: data.value.total || 0,
    detalle: 'Citas registradas',
    icono: 'event',
    clase: 'bg-pink-7',
    historial: true,
    filtro: 'todas'
  },
  {
    titulo: 'Pendientes',
    valor: data.value.pendientes || 0,
    detalle: 'Citas por atender',
    icono: 'schedule',
    clase: 'bg-orange-7',
    historial: true,
    filtro: 'pendientes'
  },
  {
    titulo: 'Concluidas',
    valor: data.value.concluidas || 0,
    detalle: 'Citas finalizadas',
    icono: 'check_circle',
    clase: 'bg-green-7',
    historial: true,
    filtro: 'concluidas'
  },
  {
    titulo: 'Ingresos Hoy',
    valor: `Bs ${money(data.value.ingreso_dia)}`,
    detalle: 'Pagos del día',
    icono: 'payments',
    clase: 'bg-teal-7',
    historial: false
  },
  {
    titulo: 'Ingresos Mes',
    valor: `Bs ${money(data.value.ingreso_mes)}`,
    detalle: 'Pagos del mes',
    icono: 'calendar_month',
    clase: 'bg-blue-7',
    historial: false
  },
  {
    titulo: 'Ingresos Año',
    valor: `Bs ${money(data.value.ingreso_anio)}`,
    detalle: 'Pagos del año',
    icono: 'trending_up',
    clase: 'bg-purple-7',
    historial: false
  }
])

function abrirHistorial(filtro, titulo) {
  filtroHistorial.value = filtro
  tituloHistorial.value = titulo
  dialogHistorial.value = true
}

function cambiarFiltro(filtro, titulo) {
  filtroHistorial.value = filtro
  tituloHistorial.value = titulo
}

function nombreCliente(cita) {
  return cita.cliente?.nombre ||
    cita.cliente_nombre ||
    cita.nombre_cliente ||
    'Cliente no registrado'
}

function formatoFecha(fecha) {
  if (!fecha) return 'Sin fecha'

  const partes = String(fecha).split('-')

  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  return fecha
}

function formatoHora(hora) {
  if (!hora) return 'Sin hora'

  const texto = String(hora)

  if (texto.length >= 5) {
    return texto.slice(0, 5)
  }

  return texto
}

function colorEstado(estado) {
  const e = normalizarEstado(estado)

  if (
    e === 'concluida' ||
    e === 'concluido' ||
    e === 'finalizada' ||
    e === 'finalizado' ||
    e === 'realizada' ||
    e === 'realizado'
  ) {
    return 'green'
  }

  if (
    e === 'cancelada' ||
    e === 'cancelado'
  ) {
    return 'red'
  }

  return 'orange'
}

function iconoEstado(estado) {
  const e = normalizarEstado(estado)

  if (
    e === 'concluida' ||
    e === 'concluido' ||
    e === 'finalizada' ||
    e === 'finalizado' ||
    e === 'realizada' ||
    e === 'realizado'
  ) {
    return 'check_circle'
  }

  if (
    e === 'cancelada' ||
    e === 'cancelado'
  ) {
    return 'cancel'
  }

  return 'schedule'
}

function textoEstado(estado) {
  const e = normalizarEstado(estado)

  if (
    e === 'concluida' ||
    e === 'concluido' ||
    e === 'finalizada' ||
    e === 'finalizado' ||
    e === 'realizada' ||
    e === 'realizado'
  ) {
    return 'Concluida'
  }

  if (
    e === 'cancelada' ||
    e === 'cancelado'
  ) {
    return 'Cancelada'
  }

  return 'Pendiente'
}

async function loadDashboard() {
  const res = await api.get('/dashboard')

  data.value = {
    total: Number(res.data?.total || 0),
    pendientes: Number(res.data?.pendientes || 0),
    concluidas: Number(res.data?.concluidas || 0),
    ingreso_dia: Number(res.data?.ingreso_dia || 0),
    ingreso_mes: Number(res.data?.ingreso_mes || 0),
    ingreso_anio: Number(res.data?.ingreso_anio || 0)
  }
}

async function loadCitas() {
  const res = await api.get('/citas')
  citas.value = Array.isArray(res.data) ? res.data : []
}

async function load() {
  loading.value = true

  try {
    await Promise.all([
      loadDashboard(),
      loadCitas()
    ])
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'No se pudo cargar el dashboard'
    })
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(233, 30, 99, 0.12), transparent 34%),
    linear-gradient(180deg, #fff7fb 0%, #f7f7fb 100%);
}

.dashboard-hero {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  border-radius: 30px;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 18px 45px rgba(156, 39, 176, 0.28);
  position: relative;
  overflow: hidden;
}

.dashboard-hero::after {
  content: "";
  position: absolute;
  width: 220px;
  height: 220px;
  right: -60px;
  top: -70px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
}

.hero-badge {
  display: inline-block;
  padding: 7px 14px;
  border-radius: 999px;
  color: white;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
}

.hero-subtitle {
  opacity: 0.9;
}

.btn-refresh {
  background: white;
  color: #c2185b;
  font-weight: 800;
  border-radius: 16px;
  padding: 10px 18px;
  z-index: 1;
}

.stat-card {
  border-radius: 26px;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
  min-height: 135px;
  transition: all 0.25s ease;
  border: 1px solid rgba(233, 30, 99, 0.08);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 42px rgba(233, 30, 99, 0.18);
}

.stat-info {
  min-width: 0;
}

.stat-title {
  font-size: 13px;
  color: #777;
  font-weight: 700;
}

.stat-value {
  font-size: 28px;
  font-weight: 900;
  color: #222;
  margin-top: 4px;
}

.stat-detail {
  font-size: 12px;
  color: #888;
}

.history-card-btn {
  background: rgba(233, 30, 99, 0.10);
  color: #c2185b;
  border-radius: 999px;
  font-weight: 800;
  padding: 5px 10px;
}

.history-panel {
  border-radius: 26px;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
  border: 1px solid rgba(233, 30, 99, 0.08);
}

.history-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.btn-history {
  color: white;
  border-radius: 16px;
  font-weight: 900;
  padding: 11px 16px;
}

.btn-history.all {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
}

.btn-history.pending {
  background: linear-gradient(135deg, #ff9800, #f57c00);
}

.btn-history.done {
  background: linear-gradient(135deg, #43a047, #2e7d32);
}

.panel-card {
  border-radius: 26px;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
  overflow: hidden;
  border: 1px solid rgba(233, 30, 99, 0.08);
}

.panel-title {
  font-size: 20px;
  font-weight: 900;
  color: #c2185b;
}

.panel-subtitle {
  font-size: 13px;
  color: #777;
}

.progress-box {
  margin-bottom: 24px;
}

.progress-label {
  font-weight: 700;
  color: #444;
}

.progress-number {
  font-weight: 900;
  color: #c2185b;
}

.ingreso-total {
  font-size: 38px;
  font-weight: 900;
  color: #2e7d32;
}

.quick-actions {
  display: grid;
  gap: 10px;
}

.quick-btn {
  width: 100%;
  justify-content: flex-start;
  border-radius: 16px;
  padding: 13px;
  color: white;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  font-weight: 800;
}

.dialog-history {
  width: 920px;
  max-width: 96vw;
  border-radius: 26px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  padding: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-title {
  font-size: 22px;
  font-weight: 900;
}

.dialog-subtitle {
  font-size: 13px;
  opacity: 0.9;
  margin-top: 3px;
}

.dialog-filter-section {
  padding: 16px 20px;
  background: #fff7fb;
}

.filter-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-btn,
.filter-active {
  border-radius: 14px;
  font-weight: 800;
  padding: 9px 14px;
}

.filter-btn {
  background: white;
  color: #c2185b;
  border: 1px solid rgba(233, 30, 99, 0.18);
}

.filter-active {
  color: white;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
}

.dialog-body {
  padding: 16px 20px;
  max-height: 58vh;
  overflow-y: auto;
  background: white;
}

.history-list {
  border-radius: 18px;
  overflow: hidden;
}

.history-item {
  padding: 14px 10px;
  border-radius: 14px;
}

.history-item:hover {
  background: #fff7fb;
}

.history-client {
  font-weight: 900;
  color: #222;
  font-size: 15px;
}

.history-service {
  color: #8e24aa;
  font-weight: 700;
}

.history-price {
  color: #2e7d32;
  font-weight: 900;
  font-size: 13px;
}

.side-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.empty-history {
  min-height: 220px;
  display: grid;
  place-items: center;
  text-align: center;
  color: #777;
}

.empty-title {
  font-size: 20px;
  font-weight: 900;
  color: #c2185b;
  margin-top: 8px;
}

.empty-subtitle {
  font-size: 13px;
  color: #777;
}

.dialog-actions {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #eee;
}

.btn-go-citas {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  border-radius: 14px;
  font-weight: 900;
}

@media (max-width: 600px) {
  .dashboard-page {
    padding: 12px;
  }

  .dashboard-hero {
    padding: 22px;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    border-radius: 22px;
  }

  .btn-refresh {
    width: 100%;
  }

  .stat-value {
    font-size: 24px;
  }

  .ingreso-total {
    font-size: 30px;
  }

  .history-buttons {
    justify-content: stretch;
  }

  .btn-history {
    width: 100%;
  }

  .dialog-history {
    width: 100vw;
    max-width: 100vw;
    border-radius: 22px 22px 0 0;
  }

  .dialog-body {
    max-height: 60vh;
  }

  .history-item {
    align-items: flex-start;
  }

  .side-info {
    align-items: flex-end;
  }
}
</style>