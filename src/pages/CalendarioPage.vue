<template>
  <q-page class="calendario-page q-pa-md">

    <!-- HEADER -->
    <div class="calendar-hero q-mb-lg">
      <div>
        <div class="hero-badge">
          Calendario administrativo
        </div>

        <div class="hero-title">
          📅 Calendario Glamur
        </div>

        <div class="hero-subtitle">
          Control mensual de citas pendientes, concluidas y canceladas
        </div>
      </div>

      <div class="hero-actions">
        <q-btn
          class="btn-white"
          icon="chevron_left"
          label="Anterior"
          @click="mesAnterior"
        />

        <q-btn
          class="btn-white"
          icon-right="chevron_right"
          label="Siguiente"
          @click="mesSiguiente"
        />
      </div>
    </div>

    <!-- MES ACTUAL -->
    <div class="month-bar q-mb-md">
      <div>
        <div class="month-title">
          {{ nombreMes }} {{ anio }}
        </div>

        <div class="month-subtitle">
          Haz clic en una fecha para ver sus citas o registrar una nueva cita.
        </div>
      </div>

      <q-btn
        class="btn-glamur"
        icon="today"
        label="Hoy"
        @click="irHoy"
      />
    </div>

    <!-- RESUMEN -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="summary-card">
          <q-card-section>
            <div class="summary-label">Total citas</div>
            <div class="summary-number">{{ resumenMes.total }}</div>
            <div class="summary-caption">Citas del mes</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="summary-card pending">
          <q-card-section>
            <div class="summary-label">Pendientes</div>
            <div class="summary-number">{{ resumenMes.pendientes }}</div>
            <div class="summary-caption">Por atender</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="summary-card done">
          <q-card-section>
            <div class="summary-label">Concluidas</div>
            <div class="summary-number">{{ resumenMes.concluidas }}</div>
            <div class="summary-caption">Realizadas</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="summary-card cancelled">
          <q-card-section>
            <div class="summary-label">Canceladas</div>
            <div class="summary-number">{{ resumenMes.canceladas }}</div>
            <div class="summary-caption">No realizadas</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- LEYENDA -->
    <div class="legend-card q-mb-md">
      <div class="legend-item">
        <span class="dot dot-pending"></span>
        Pendiente
      </div>

      <div class="legend-item">
        <span class="dot dot-done"></span>
        Concluida / Realizada
      </div>

      <div class="legend-item">
        <span class="dot dot-cancelled"></span>
        Cancelada
      </div>
    </div>

    <!-- LOADING -->
    <q-linear-progress
      v-if="loading"
      indeterminate
      color="pink"
      class="q-mb-md"
    />

    <!-- CALENDARIO -->
    <q-card class="calendar-card">
      <div class="week-grid">
        <div
          v-for="diaSemana in diasSemana"
          :key="diaSemana"
          class="week-name"
        >
          {{ diaSemana }}
        </div>
      </div>

      <div class="calendar-grid">
        <div
          v-for="blank in espaciosVacios"
          :key="`blank-${blank}`"
          class="day-box empty"
        ></div>

        <div
          v-for="dia in diasDelMes"
          :key="dia.fecha"
          class="day-box"
          :class="{
            today: dia.fecha === fechaHoy,
            selected: dia.fecha === diaSeleccionado,
            hasCitas: dia.citas.length > 0
          }"
          @click="seleccionarDia(dia.fecha)"
        >
          <div class="day-header">
            <div class="day-number">
              {{ dia.dia }}
            </div>

            <q-badge
              v-if="dia.citas.length > 0"
              rounded
              class="day-count"
              :class="colorClaseDia(dia)"
            >
              {{ dia.citas.length }}
            </q-badge>
          </div>

          <div class="day-events">
            <div
              v-for="cita in dia.citas.slice(0, 3)"
              :key="cita.id"
              class="event-pill"
              :class="colorClaseEstado(cita.estado)"
            >
              <span class="event-time">
                {{ horaCorta(cita.hora) }}
              </span>

              <span class="event-name">
                {{ cita.cliente?.nombre || 'Sin cliente' }}
              </span>
            </div>

            <div
              v-if="dia.citas.length > 3"
              class="more-events"
            >
              +{{ dia.citas.length - 3 }} más
            </div>
          </div>
        </div>
      </div>
    </q-card>

    <!-- MODAL DÍA -->
    <q-dialog v-model="dialog">
      <q-card class="dialog-card">

        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="dialog-title">
              📅 {{ formatoFechaLarga(diaSeleccionado) }}
            </div>

            <div class="dialog-subtitle">
              {{ citasDia.length }} cita(s) registrada(s)
            </div>
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

          <div
            v-if="citasDia.length === 0"
            class="empty-day"
          >
            <q-icon name="event_available" size="54px" color="pink-5" />
            <div class="empty-title">No hay citas este día</div>
            <div class="empty-text">
              Puedes registrar una nueva cita usando esta fecha automáticamente.
            </div>
          </div>

          <div
            v-for="cita in citasDia"
            :key="cita.id"
            class="appointment-card"
          >
            <div class="appointment-left">
              <q-avatar
                :class="colorClaseEstado(cita.estado)"
                text-color="white"
                size="44px"
              >
                <q-icon name="event" />
              </q-avatar>

              <div>
                <div class="appointment-client">
                  {{ cita.cliente?.nombre || 'Sin cliente' }}
                </div>

                <div class="appointment-service">
                  {{ cita.servicio || 'Sin servicio' }}
                </div>

                <div class="appointment-detail">
                  {{ horaCorta(cita.hora) }} · Bs {{ money(cita.precio) }}
                </div>
              </div>
            </div>

            <q-badge
              rounded
              class="status-badge"
              :class="colorClaseEstado(cita.estado)"
            >
              {{ textoEstado(cita.estado) }}
            </q-badge>
          </div>

        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            flat
            label="Cerrar"
            color="grey-7"
            v-close-popup
          />

          <q-btn
            class="btn-glamur"
            icon="add"
            label="Nueva cita"
            @click="nuevaCita"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

defineOptions({
  name: 'CalendarioPage'
})

const router = useRouter()
const $q = useQuasar()

const citas = ref([])
const dialog = ref(false)
const diaSeleccionado = ref('')
const citasDia = ref([])
const loading = ref(false)

const fecha = ref(new Date())

const meses = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre'
]

const diasSemana = [
  'Lun',
  'Mar',
  'Mié',
  'Jue',
  'Vie',
  'Sáb',
  'Dom'
]

const nombreMes = computed(() => meses[fecha.value.getMonth()])
const anio = computed(() => fecha.value.getFullYear())

const fechaHoy = computed(() => {
  return formatoFechaISO(new Date())
})

const espaciosVacios = computed(() => {
  const year = fecha.value.getFullYear()
  const month = fecha.value.getMonth()

  const primerDia = new Date(year, month, 1).getDay()

  return primerDia === 0 ? 6 : primerDia - 1
})

const diasDelMes = computed(() => {
  const year = fecha.value.getFullYear()
  const month = fecha.value.getMonth()
  const lastDay = new Date(year, month + 1, 0).getDate()

  const dias = []

  for (let i = 1; i <= lastDay; i++) {
    const fechaStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`

    const citasDelDia = citas.value.filter((cita) => cita.fecha === fechaStr)

    dias.push({
      dia: i,
      fecha: fechaStr,
      citas: citasDelDia
    })
  }

  return dias
})

const resumenMes = computed(() => {
  const year = fecha.value.getFullYear()
  const month = String(fecha.value.getMonth() + 1).padStart(2, '0')
  const prefijo = `${year}-${month}`

  const citasMes = citas.value.filter((cita) => String(cita.fecha || '').startsWith(prefijo))

  return {
    total: citasMes.length,
    pendientes: citasMes.filter((cita) => normalizarEstado(cita.estado) === 'pendiente').length,
    concluidas: citasMes.filter((cita) => normalizarEstado(cita.estado) === 'concluida').length,
    canceladas: citasMes.filter((cita) => normalizarEstado(cita.estado) === 'cancelada').length
  }
})

function formatoFechaISO(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || 'Ocurrió un error'
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

function seleccionarDia(fechaSel) {
  diaSeleccionado.value = fechaSel
  citasDia.value = citas.value.filter((cita) => cita.fecha === fechaSel)
  dialog.value = true
}

function normalizarEstado(estado) {
  const valor = String(estado || 'pendiente').toLowerCase()

  if (valor === 'realizada') return 'concluida'
  if (valor === 'finalizada') return 'concluida'
  if (valor === 'completada') return 'concluida'
  if (valor === 'concluido') return 'concluida'
  if (valor === 'cancelado') return 'cancelada'

  return valor
}

function textoEstado(estado) {
  const valor = normalizarEstado(estado)

  if (valor === 'concluida') return 'Concluida'
  if (valor === 'cancelada') return 'Cancelada'

  return 'Pendiente'
}

function colorClaseEstado(estado) {
  const valor = normalizarEstado(estado)

  if (valor === 'concluida') return 'estado-concluida'
  if (valor === 'cancelada') return 'estado-cancelada'

  return 'estado-pendiente'
}

function colorClaseDia(dia) {
  const tieneConcluida = dia.citas.some((cita) => normalizarEstado(cita.estado) === 'concluida')
  const tieneCancelada = dia.citas.some((cita) => normalizarEstado(cita.estado) === 'cancelada')
  const tienePendiente = dia.citas.some((cita) => normalizarEstado(cita.estado) === 'pendiente')

  if (tieneCancelada && !tienePendiente && !tieneConcluida) return 'count-cancelled'
  if (tieneConcluida && !tienePendiente && !tieneCancelada) return 'count-done'

  return 'count-pending'
}

function horaCorta(hora) {
  if (!hora) return '--:--'

  return String(hora).slice(0, 5)
}

function money(value) {
  return Number(value || 0).toFixed(2)
}

function formatoFechaLarga(fechaStr) {
  if (!fechaStr) return ''

  const [year, month, day] = fechaStr.split('-')
  const date = new Date(Number(year), Number(month) - 1, Number(day))

  return date.toLocaleDateString('es-BO', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function mesAnterior() {
  fecha.value = new Date(
    fecha.value.getFullYear(),
    fecha.value.getMonth() - 1,
    1
  )
}

function mesSiguiente() {
  fecha.value = new Date(
    fecha.value.getFullYear(),
    fecha.value.getMonth() + 1,
    1
  )
}

function irHoy() {
  fecha.value = new Date()
}

function nuevaCita() {
  dialog.value = false

  router.push({
    path: '/citas',
    query: {
      fecha: diaSeleccionado.value
    }
  })
}

onMounted(async () => {
  await load()
})
</script>

<style scoped>
.calendario-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(233, 30, 99, 0.10), transparent 32%),
    linear-gradient(135deg, #f7f8ff, #fff7fb);
}

.calendar-hero {
  background:
    linear-gradient(135deg, #15111f, #68133f 48%, #e91e63);

  color: white;
  border-radius: 28px;
  padding: 28px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;

  box-shadow:
    0 18px 45px rgba(21, 17, 31, 0.30);
}

.hero-badge {
  display: inline-block;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  font-size: 13px;
  font-weight: 900;
  margin-bottom: 12px;
}

.hero-title {
  font-size: 32px;
  font-weight: 900;
  line-height: 1.1;
}

.hero-subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.82);
  font-weight: 600;
}

.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-white {
  background: white;
  color: #c2185b;
  border-radius: 16px;
  font-weight: 900;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.btn-glamur {
  background:
    linear-gradient(135deg, #e91e63, #9c27b0);

  color: white;
  border-radius: 16px;
  font-weight: 900;
  box-shadow:
    0 12px 28px rgba(233, 30, 99, 0.28);
}

.month-bar {
  background: white;
  border-radius: 22px;
  padding: 18px 20px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  box-shadow:
    0 14px 35px rgba(156, 39, 176, 0.10);
}

.month-title {
  font-size: 24px;
  font-weight: 900;
  color: #15111f;
}

.month-subtitle {
  font-size: 13px;
  color: #6b6472;
}

.summary-card {
  border-radius: 22px;
  background: white;
  box-shadow:
    0 14px 35px rgba(21, 17, 31, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
}

.summary-card.pending {
  background: #fff8e1;
}

.summary-card.done {
  background: #e8f5e9;
}

.summary-card.cancelled {
  background: #ffebee;
}

.summary-label {
  font-size: 13px;
  font-weight: 800;
  color: #6b6472;
}

.summary-number {
  margin-top: 6px;
  font-size: 34px;
  font-weight: 900;
  color: #15111f;
}

.summary-caption {
  font-size: 12px;
  color: #777;
}

.legend-card {
  background: white;
  border-radius: 18px;
  padding: 14px 16px;

  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;

  box-shadow:
    0 12px 30px rgba(21, 17, 31, 0.08);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;

  font-size: 13px;
  font-weight: 800;
  color: #4b4454;
}

.dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
}

.dot-pending {
  background: #fb8c00;
}

.dot-done {
  background: #43a047;
}

.dot-cancelled {
  background: #e53935;
}

.calendar-card {
  border-radius: 26px;
  overflow: hidden;
  background: white;
  box-shadow:
    0 18px 45px rgba(156, 39, 176, 0.12);
}

.week-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  background:
    linear-gradient(135deg, #fce4ec, #f3e5f5);
  border-bottom: 1px solid #ead7e7;
}

.week-name {
  padding: 14px 8px;
  text-align: center;
  font-weight: 900;
  color: #880e4f;
  font-size: 13px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
}

.day-box {
  min-height: 140px;
  padding: 12px;
  border-right: 1px solid #f0e6ef;
  border-bottom: 1px solid #f0e6ef;
  cursor: pointer;
  transition: all 0.22s ease;
  background: white;
}

.day-box:hover {
  background: #fff5fa;
  transform: scale(1.01);
  z-index: 2;
  box-shadow:
    0 12px 28px rgba(233, 30, 99, 0.12);
}

.day-box.empty {
  background: #fafafa;
  cursor: default;
}

.day-box.today {
  background:
    linear-gradient(135deg, #fff7fb, #fce4ec);
}

.day-box.selected {
  outline: 2px solid #e91e63;
}

.day-box.hasCitas {
  background:
    linear-gradient(180deg, #ffffff, #fff8fc);
}

.day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.day-number {
  width: 34px;
  height: 34px;
  border-radius: 12px;

  display: grid;
  place-items: center;

  font-size: 15px;
  font-weight: 900;
  color: #15111f;
}

.today .day-number {
  background:
    linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
}

.day-count {
  font-weight: 900;
  color: white;
  padding: 5px 9px;
}

.count-pending {
  background: #fb8c00;
}

.count-done {
  background: #43a047;
}

.count-cancelled {
  background: #e53935;
}

.day-events {
  margin-top: 10px;
  display: grid;
  gap: 6px;
}

.event-pill {
  padding: 6px 8px;
  border-radius: 12px;

  display: flex;
  align-items: center;
  gap: 6px;

  color: white;
  font-size: 11px;
  font-weight: 800;

  overflow: hidden;
}

.event-time {
  opacity: 0.95;
  white-space: nowrap;
}

.event-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-events {
  font-size: 11px;
  font-weight: 900;
  color: #c2185b;
}

.estado-pendiente {
  background: #fb8c00 !important;
}

.estado-concluida {
  background: #43a047 !important;
}

.estado-cancelada {
  background: #e53935 !important;
}

.dialog-card {
  width: 720px;
  max-width: 96vw;
  border-radius: 26px;
  overflow: hidden;
}

.dialog-header {
  background:
    linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  padding: 22px;
}

.dialog-title {
  font-size: 21px;
  font-weight: 900;
  text-transform: capitalize;
}

.dialog-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.82);
}

.dialog-body {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
  background: #fffafd;
}

.empty-day {
  text-align: center;
  padding: 34px 12px;
}

.empty-title {
  margin-top: 8px;
  font-size: 20px;
  font-weight: 900;
  color: #c2185b;
}

.empty-text {
  margin-top: 4px;
  color: #6b6472;
}

.appointment-card {
  background: white;
  border: 1px solid #f1dce9;
  border-radius: 20px;
  padding: 14px;

  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;

  margin-bottom: 12px;

  box-shadow:
    0 10px 24px rgba(156, 39, 176, 0.08);
}

.appointment-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.appointment-client {
  font-size: 15px;
  font-weight: 900;
  color: #15111f;
}

.appointment-service {
  font-size: 13px;
  color: #6b6472;
  max-width: 360px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.appointment-detail {
  margin-top: 2px;
  font-size: 12px;
  color: #8a7f91;
}

.status-badge {
  padding: 7px 10px;
  color: white;
  font-weight: 900;
  text-transform: capitalize;
}

.dialog-actions {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #eee;
}

@media (max-width: 900px) {
  .calendar-grid,
  .week-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .week-grid {
    display: none;
  }

  .day-box.empty {
    display: none;
  }
}

@media (max-width: 600px) {
  .calendario-page {
    padding: 10px;
  }

  .calendar-hero {
    padding: 22px;
    border-radius: 22px;
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-title {
    font-size: 27px;
  }

  .hero-actions {
    width: 100%;
  }

  .hero-actions .q-btn {
    flex: 1;
  }

  .month-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .month-bar .q-btn {
    width: 100%;
  }

  .calendar-grid {
    grid-template-columns: 1fr;
  }

  .day-box {
    min-height: auto;
  }

  .dialog-card {
    width: 100%;
    max-width: 100%;
    border-radius: 22px;
  }

  .dialog-body {
    max-height: 64vh;
  }

  .appointment-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .appointment-service {
    max-width: 100%;
  }

  .dialog-actions {
    flex-wrap: wrap;
    gap: 10px;
  }

  .dialog-actions .q-btn {
    width: 100%;
  }
}
</style>