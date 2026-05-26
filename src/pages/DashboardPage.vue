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

    <!-- TARJETAS PRINCIPALES -->
    <div class="row q-col-gutter-md q-mt-md">
      <div
        class="col-12 col-sm-6 col-md-4"
        v-for="card in cards"
        :key="card.titulo"
      >
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
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
                  v-if="card.filtro"
                  dense
                  unelevated
                  no-caps
                  icon="history"
                  :label="card.boton"
                  class="card-history-btn"
                  @click.stop="abrirHistorial(card.filtro)"
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

    <!-- PANELES -->
    <div class="row q-col-gutter-md q-mt-md">

      <div class="col-12 col-md-7">
        <q-card class="panel-card">
          <q-card-section>
            <div class="row items-center justify-between">
              <div>
                <div class="panel-title">
                  Estado de citas
                </div>

                <div class="panel-subtitle">
                  Control visual de citas pendientes y concluidas
                </div>
              </div>

              <q-btn
                dense
                unelevated
                no-caps
                icon="history"
                label="Ver historial"
                class="panel-history-btn"
                @click="abrirHistorial('todas')"
              />
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

    <!-- MODAL HISTORIAL DE CITAS -->
    <q-dialog
      v-model="historialDialog"
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="history-card">

        <q-card-section class="history-header">
          <div>
            <div class="history-title">
              📋 Historial de citas
            </div>

            <div class="history-subtitle">
              Consulta todas las citas registradas por estado, fecha y hora
            </div>
          </div>

          <q-btn
            icon="close"
            flat
            round
            dense
            color="white"
            v-close-popup
          />
        </q-card-section>

        <q-card-section class="history-summary">
          <div
            class="summary-chip"
            v-for="item in resumenHistorial"
            :key="item.label"
          >
            <q-icon :name="item.icon" :color="item.color" size="24px" />
            <div>
              <div class="summary-number">{{ item.value }}</div>
              <div class="summary-label">{{ item.label }}</div>
            </div>
          </div>
        </q-card-section>

        <q-tabs
          v-model="filtroHistorial"
          dense
          active-color="pink-7"
          indicator-color="pink-7"
          align="justify"
          class="history-tabs"
        >
          <q-tab
            name="todas"
            :label="'Todas (' + totalHistorial + ')'"
          />

          <q-tab
            name="pendientes"
            :label="'Pendientes (' + totalPendientesHistorial + ')'"
          />

          <q-tab
            name="concluidas"
            :label="'Concluidas (' + totalConcluidasHistorial + ')'"
          />

          <q-tab
            name="canceladas"
            :label="'Canceladas (' + totalCanceladasHistorial + ')'"
          />
        </q-tabs>

        <q-separator />

        <q-card-section class="history-body">

          <div v-if="historialFiltrado.length === 0" class="empty-history">
            <q-icon name="event_busy" size="58px" color="grey-5" />
            <div class="empty-title">
              No hay citas para mostrar
            </div>
            <div class="empty-subtitle">
              Cuando registres citas, aparecerán en este historial.
            </div>
          </div>

          <q-list v-else separator class="history-list">
            <q-item
              v-for="cita in historialFiltrado"
              :key="citaKey(cita)"
              class="history-item"
            >
              <q-item-section avatar>
                <q-avatar :color="estadoColor(cita)" text-color="white">
                  <q-icon :name="estadoIcon(cita)" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <div class="row items-center justify-between q-col-gutter-sm">
                  <div class="history-time">
                    {{ fechaBonita(cita.fecha) }} - {{ horaBonita(cita.hora) }}
                  </div>

                  <div class="row q-gutter-xs">
                    <q-badge
                      rounded
                      :color="estadoColor(cita)"
                      text-color="white"
                      class="history-badge"
                    >
                      {{ estadoTexto(cita) }}
                    </q-badge>

                    <q-badge
                      v-if="pagoTexto(cita) !== 'Sin pago'"
                      rounded
                      :color="pagoColor(cita)"
                      text-color="white"
                      class="history-badge"
                    >
                      {{ pagoTexto(cita) }}
                    </q-badge>
                  </div>
                </div>

                <div class="history-client">
                  {{ clienteTexto(cita) }}
                </div>

                <div class="history-service">
                  {{ servicioTexto(cita) }}
                </div>

                <div
                  v-if="detalleTexto(cita)"
                  class="history-detail"
                >
                  {{ detalleTexto(cita) }}
                </div>

                <div class="history-price">
                  Bs {{ money(precioTexto(cita)) }}
                </div>
              </q-item-section>
            </q-item>
          </q-list>

        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="history-actions">
          <q-btn
            flat
            label="Cerrar"
            color="grey-7"
            v-close-popup
          />

          <q-btn
            unelevated
            icon="add"
            label="Nueva cita"
            color="pink-7"
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
const historialDialog = ref(false)
const filtroHistorial = ref('todas')
const citas = ref([])

const data = ref({
  total: 0,
  pendientes: 0,
  concluidas: 0,
  ingreso_dia: 0,
  ingreso_mes: 0,
  ingreso_anio: 0
})

function money(value) {
  return Number(value || 0).toFixed(2)
}

function normalizarLista(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.citas)) return payload.citas
  return []
}

function textoBase(value) {
  return String(value || '').trim()
}

function getEstado(cita) {
  return textoBase(cita?.estado || 'pendiente').toLowerCase()
}

function esConcluida(cita) {
  const estado = getEstado(cita)
  return (
    estado.includes('conclu') ||
    estado.includes('final') ||
    estado.includes('realiz') ||
    estado.includes('complet')
  )
}

function esCancelada(cita) {
  const estado = getEstado(cita)
  return (
    estado.includes('cancel') ||
    estado.includes('anulad')
  )
}

function esPendiente(cita) {
  return !esConcluida(cita) && !esCancelada(cita)
}

const totalHistorial = computed(() => citas.value.length)

const totalPendientesHistorial = computed(() => {
  return citas.value.filter(cita => esPendiente(cita)).length
})

const totalConcluidasHistorial = computed(() => {
  return citas.value.filter(cita => esConcluida(cita)).length
})

const totalCanceladasHistorial = computed(() => {
  return citas.value.filter(cita => esCancelada(cita)).length
})

const resumenHistorial = computed(() => [
  {
    label: 'Todas',
    value: totalHistorial.value,
    icon: 'event',
    color: 'pink-7'
  },
  {
    label: 'Pendientes',
    value: totalPendientesHistorial.value,
    icon: 'schedule',
    color: 'orange-7'
  },
  {
    label: 'Concluidas',
    value: totalConcluidasHistorial.value,
    icon: 'check_circle',
    color: 'green-7'
  },
  {
    label: 'Canceladas',
    value: totalCanceladasHistorial.value,
    icon: 'cancel',
    color: 'red-7'
  }
])

const historialFiltrado = computed(() => {
  let lista = [...citas.value]

  if (filtroHistorial.value === 'pendientes') {
    lista = lista.filter(cita => esPendiente(cita))
  }

  if (filtroHistorial.value === 'concluidas') {
    lista = lista.filter(cita => esConcluida(cita))
  }

  if (filtroHistorial.value === 'canceladas') {
    lista = lista.filter(cita => esCancelada(cita))
  }

  return lista.sort((a, b) => {
    const fechaA = `${a.fecha || ''} ${a.hora || ''}`
    const fechaB = `${b.fecha || ''} ${b.hora || ''}`
    return fechaB.localeCompare(fechaA)
  })
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
    filtro: 'todas',
    boton: 'Historial'
  },
  {
    titulo: 'Pendientes',
    valor: data.value.pendientes || 0,
    detalle: 'Citas por atender',
    icono: 'schedule',
    clase: 'bg-orange-7',
    filtro: 'pendientes',
    boton: 'Ver pendientes'
  },
  {
    titulo: 'Concluidas',
    valor: data.value.concluidas || 0,
    detalle: 'Citas finalizadas',
    icono: 'check_circle',
    clase: 'bg-green-7',
    filtro: 'concluidas',
    boton: 'Ver concluidas'
  },
  {
    titulo: 'Ingresos Hoy',
    valor: `Bs ${money(data.value.ingreso_dia)}`,
    detalle: 'Pagos del día',
    icono: 'payments',
    clase: 'bg-teal-7'
  },
  {
    titulo: 'Ingresos Mes',
    valor: `Bs ${money(data.value.ingreso_mes)}`,
    detalle: 'Pagos del mes',
    icono: 'calendar_month',
    clase: 'bg-blue-7'
  },
  {
    titulo: 'Ingresos Año',
    valor: `Bs ${money(data.value.ingreso_anio)}`,
    detalle: 'Pagos del año',
    icono: 'trending_up',
    clase: 'bg-purple-7'
  }
])

function abrirHistorial(filtro) {
  filtroHistorial.value = filtro || 'todas'
  historialDialog.value = true
}

function citaKey(cita) {
  return cita?.id || `${cita?.fecha || 'fecha'}-${cita?.hora || 'hora'}-${clienteTexto(cita)}`
}

function clienteTexto(cita) {
  return (
    cita?.cliente?.nombre ||
    cita?.cliente_nombre ||
    cita?.nombre_cliente ||
    cita?.cliente ||
    'Cliente no registrado'
  )
}

function servicioTexto(cita) {
  return (
    cita?.servicio ||
    cita?.combo ||
    cita?.nombre_servicio ||
    cita?.servicio_nombre ||
    cita?.descripcion_servicio ||
    'Sin servicio'
  )
}

function detalleTexto(cita) {
  return (
    cita?.detalle ||
    cita?.detalle_servicio ||
    cita?.descripcion ||
    cita?.observacion ||
    ''
  )
}

function precioTexto(cita) {
  return (
    cita?.precio ||
    cita?.monto ||
    cita?.total ||
    0
  )
}

function fechaBonita(fecha) {
  if (!fecha) return 'Sin fecha'

  const partes = String(fecha).split('-')

  if (partes.length === 3) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`
  }

  return fecha
}

function horaBonita(hora) {
  if (!hora) return 'Sin hora'

  const texto = String(hora)

  if (texto.length >= 5) {
    return texto.slice(0, 5)
  }

  return texto
}

function estadoTexto(cita) {
  if (esCancelada(cita)) return 'Cancelada'
  if (esConcluida(cita)) return 'Concluida'
  return 'Pendiente'
}

function estadoColor(cita) {
  if (esCancelada(cita)) return 'red-7'
  if (esConcluida(cita)) return 'green-7'
  return 'orange-7'
}

function estadoIcon(cita) {
  if (esCancelada(cita)) return 'cancel'
  if (esConcluida(cita)) return 'check_circle'
  return 'schedule'
}

function pagoTexto(cita) {
  const pago = textoBase(
    cita?.estado_pago ||
    cita?.pago_estado ||
    cita?.estadoPago ||
    ''
  )

  if (!pago) return 'Sin pago'

  if (pago.toLowerCase().includes('pag')) return 'Pagado'
  if (pago.toLowerCase().includes('pend')) return 'Pago pendiente'

  return pago
}

function pagoColor(cita) {
  const pago = pagoTexto(cita).toLowerCase()

  if (pago.includes('pagado')) return 'green-7'
  if (pago.includes('pend')) return 'orange-7'

  return 'grey-7'
}

async function load() {
  loading.value = true

  try {
    const [dashboardResult, citasResult] = await Promise.allSettled([
      api.get('/dashboard'),
      api.get('/citas')
    ])

    if (dashboardResult.status === 'fulfilled') {
      const res = dashboardResult.value

      data.value = {
        total: Number(res.data?.total || 0),
        pendientes: Number(res.data?.pendientes || 0),
        concluidas: Number(res.data?.concluidas || 0),
        ingreso_dia: Number(res.data?.ingreso_dia || 0),
        ingreso_mes: Number(res.data?.ingreso_mes || 0),
        ingreso_anio: Number(res.data?.ingreso_anio || 0)
      }
    } else {
      throw dashboardResult.reason
    }

    if (citasResult.status === 'fulfilled') {
      citas.value = normalizarLista(citasResult.value.data)
    } else {
      citas.value = []

      $q.notify({
        type: 'warning',
        message: 'El dashboard cargó, pero no se pudo cargar el historial de citas.'
      })
    }
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
  min-height: 145px;
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

.card-history-btn {
  margin-top: 10px;
  border-radius: 999px;
  background: rgba(233, 30, 99, 0.1);
  color: #c2185b;
  font-weight: 800;
  padding: 4px 12px;
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

.panel-history-btn {
  border-radius: 999px;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 800;
  padding: 7px 14px;
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

.history-card {
  width: 900px;
  max-width: 96vw;
  border-radius: 26px;
  overflow: hidden;
}

.history-header {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  padding: 22px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-title {
  font-size: 24px;
  font-weight: 900;
}

.history-subtitle {
  font-size: 13px;
  opacity: 0.9;
  margin-top: 3px;
}

.history-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  background: #fff7fb;
  padding: 16px;
}

.summary-chip {
  border-radius: 18px;
  background: white;
  border: 1px solid rgba(233, 30, 99, 0.1);
  padding: 13px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.summary-number {
  font-size: 18px;
  font-weight: 900;
  color: #222;
}

.summary-label {
  font-size: 12px;
  color: #777;
  font-weight: 700;
}

.history-tabs {
  background: white;
  color: #777;
  font-weight: 800;
}

.history-body {
  max-height: 55vh;
  overflow-y: auto;
  padding: 18px;
  background: #fff;
}

.history-list {
  border-radius: 18px;
  overflow: hidden;
}

.history-item {
  border-radius: 18px;
  margin-bottom: 10px;
  background: #fff7fb;
  border: 1px solid rgba(233, 30, 99, 0.08);
  padding: 14px;
}

.history-time {
  font-size: 14px;
  color: #222;
  font-weight: 900;
}

.history-client {
  font-size: 15px;
  font-weight: 900;
  color: #c2185b;
  margin-top: 4px;
}

.history-service {
  font-size: 13px;
  color: #444;
  font-weight: 700;
  margin-top: 2px;
}

.history-detail {
  font-size: 12px;
  color: #777;
  margin-top: 2px;
}

.history-price {
  font-size: 13px;
  color: #2e7d32;
  font-weight: 900;
  margin-top: 5px;
}

.history-badge {
  font-weight: 800;
  padding: 5px 8px;
}

.empty-history {
  text-align: center;
  padding: 40px 20px;
}

.empty-title {
  font-size: 20px;
  font-weight: 900;
  color: #c2185b;
  margin-top: 10px;
}

.empty-subtitle {
  font-size: 13px;
  color: #777;
  margin-top: 4px;
}

.history-actions {
  padding: 14px 18px;
  background: white;
}

@media (max-width: 700px) {
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

  .stat-card {
    min-height: auto;
  }

  .stat-value {
    font-size: 24px;
  }

  .card-history-btn {
    width: 100%;
  }

  .panel-history-btn {
    width: 100%;
    margin-top: 12px;
  }

  .panel-card .row.items-center.justify-between {
    align-items: flex-start;
    flex-direction: column;
  }

  .ingreso-total {
    font-size: 30px;
  }

  .history-card {
    width: 100%;
    max-width: 100%;
    border-radius: 0;
  }

  .history-header {
    padding: 18px;
  }

  .history-title {
    font-size: 22px;
  }

  .history-summary {
    grid-template-columns: repeat(2, 1fr);
  }

  .summary-chip {
    padding: 11px;
  }

  .history-body {
    max-height: calc(100vh - 285px);
    padding: 12px;
  }

  .history-item {
    padding: 12px;
  }

  .history-actions {
    position: sticky;
    bottom: 0;
    z-index: 2;
  }
}
</style>