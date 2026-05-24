<template>
  <q-page class="q-pa-md calendario-page">

    <div class="calendar-hero q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-white">
          📅 Calendario Glamur
        </div>

        <div class="text-subtitle2 text-white">
          Control mensual de citas, estados y extractos
        </div>
      </div>

      <div class="hero-actions">
        <q-btn
          class="btn-white"
          icon="picture_as_pdf"
          label="Extracto PDF"
          :loading="descargandoPdf"
          @click="descargarExtractoPDF"
        />

        <q-btn
          class="btn-white"
          icon="refresh"
          label="Actualizar"
          :loading="loading"
          @click="load"
        />
      </div>
    </div>

    <q-card class="calendar-card">

      <q-card-section class="calendar-toolbar">
        <q-btn
          round
          unelevated
          icon="chevron_left"
          class="nav-btn"
          @click="mesAnterior"
        />

        <div class="month-title">
          {{ nombreMes }} {{ anio }}
        </div>

        <q-btn
          round
          unelevated
          icon="chevron_right"
          class="nav-btn"
          @click="mesSiguiente"
        />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div class="legend q-mb-md">
          <div class="legend-item">
            <span class="dot dot-green"></span>
            Realizadas
          </div>

          <div class="legend-item">
            <span class="dot dot-yellow"></span>
            Pendientes
          </div>

          <div class="legend-item">
            <span class="dot dot-red"></span>
            Canceladas
          </div>
        </div>

        <div class="week-grid q-mb-sm">
          <div
            v-for="dia in diasSemana"
            :key="dia"
            class="week-day"
          >
            {{ dia }}
          </div>
        </div>

        <div class="calendar-grid">

          <div
            v-for="n in espaciosInicio"
            :key="`empty-${n}`"
            class="day-box empty-day"
          ></div>

          <div
            v-for="dia in diasDelMes"
            :key="dia.fecha"
            class="day-box"
            :class="claseDia(dia)"
            @click="seleccionarDia(dia.fecha)"
          >
            <div class="day-number">
              {{ dia.dia }}
            </div>

            <div
              v-if="dia.citas.length > 0"
              class="day-summary"
            >
              <q-badge
                rounded
                class="summary-badge"
                :color="colorPrincipalDia(dia)"
              >
                {{ dia.citas.length }} cita(s)
              </q-badge>

              <div class="mini-states">
                <span
                  v-if="resumenDia(dia).concluidas > 0"
                  class="mini mini-green"
                >
                  {{ resumenDia(dia).concluidas }}
                </span>

                <span
                  v-if="resumenDia(dia).pendientes > 0"
                  class="mini mini-yellow"
                >
                  {{ resumenDia(dia).pendientes }}
                </span>

                <span
                  v-if="resumenDia(dia).canceladas > 0"
                  class="mini mini-red"
                >
                  {{ resumenDia(dia).canceladas }}
                </span>
              </div>
            </div>

            <div
              v-else
              class="text-caption text-grey-6 q-mt-sm"
            >
              Libre
            </div>
          </div>

        </div>
      </q-card-section>

    </q-card>

    <q-dialog v-model="dialog">
      <q-card class="dialog-card">

        <q-card-section class="dialog-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">
              📅 {{ fechaBonita(diaSeleccionado) }}
            </div>

            <div class="text-caption">
              {{ citasDia.length }} cita(s) registradas
            </div>
          </div>

          <q-space />

          <q-btn
            flat
            round
            dense
            icon="close"
            color="white"
            v-close-popup
          />
        </q-card-section>

        <q-card-section class="dialog-body">

          <div
            v-if="citasDia.length === 0"
            class="empty-box"
          >
            <q-icon name="event_available" size="46px" color="pink-6" />

            <div class="text-weight-bold q-mt-sm">
              No hay citas este día
            </div>

            <div class="text-caption text-grey-7">
              Puedes registrar una nueva cita con esta fecha.
            </div>
          </div>

          <q-list
            v-else
            separator
            class="citas-list"
          >
            <q-item
              v-for="cita in citasDia"
              :key="cita.id"
              class="cita-item"
            >
              <q-item-section avatar>
                <q-avatar :color="colorEstado(cita.estado)" text-color="white">
                  <q-icon name="event" />
                </q-avatar>
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ horaBonita(cita.hora) }} - {{ cita.cliente?.nombre || 'Sin cliente' }}
                </q-item-label>

                <q-item-label caption>
                  {{ cita.servicio }}
                </q-item-label>

                <q-item-label caption>
                  Bs {{ money(cita.precio) }}
                </q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-badge
                  rounded
                  :color="colorEstado(cita.estado)"
                  class="estado-badge"
                >
                  {{ cita.estado || 'pendiente' }}
                </q-badge>

                <q-badge
                  rounded
                  class="estado-badge q-mt-xs"
                  :color="cita.estado_pago === 'pagado' ? 'green' : 'orange'"
                >
                  {{ cita.estado_pago || 'pendiente' }}
                </q-badge>
              </q-item-section>
            </q-item>
          </q-list>

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
            label="Nueva Cita"
            icon="add"
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
const loading = ref(false)
const descargandoPdf = ref(false)

const dialog = ref(false)
const diaSeleccionado = ref('')
const citasDia = ref([])

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
  'Dom',
  'Lun',
  'Mar',
  'Mié',
  'Jue',
  'Vie',
  'Sáb'
]

const nombreMes = computed(() => meses[fecha.value.getMonth()])
const anio = computed(() => fecha.value.getFullYear())
const mesNumero = computed(() => fecha.value.getMonth() + 1)

const espaciosInicio = computed(() => {
  return new Date(anio.value, fecha.value.getMonth(), 1).getDay()
})

const diasDelMes = computed(() => {
  const year = anio.value
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

function resumenDia(dia) {
  const pendientes = dia.citas.filter((cita) => cita.estado === 'pendiente').length

  const concluidas = dia.citas.filter((cita) => {
    return cita.estado === 'concluida' || cita.estado === 'finalizada' || cita.estado === 'realizada'
  }).length

  const canceladas = dia.citas.filter((cita) => cita.estado === 'cancelada').length

  return {
    pendientes,
    concluidas,
    canceladas
  }
}

function claseDia(dia) {
  if (dia.citas.length === 0) return ''

  const resumen = resumenDia(dia)

  return {
    'has-citas': true,
    'day-green': resumen.concluidas > 0 && resumen.pendientes === 0 && resumen.canceladas === 0,
    'day-yellow': resumen.pendientes > 0 && resumen.canceladas === 0,
    'day-red': resumen.canceladas > 0
  }
}

function colorPrincipalDia(dia) {
  const resumen = resumenDia(dia)

  if (resumen.canceladas > 0) return 'red'
  if (resumen.pendientes > 0) return 'orange'
  if (resumen.concluidas > 0) return 'green'

  return 'grey'
}

function colorEstado(estado) {
  if (estado === 'concluida' || estado === 'finalizada' || estado === 'realizada') return 'green'
  if (estado === 'cancelada') return 'red'

  return 'orange'
}

function seleccionarDia(fechaSel) {
  diaSeleccionado.value = fechaSel
  citasDia.value = citas.value.filter((cita) => cita.fecha === fechaSel)
  dialog.value = true
}

function mesAnterior() {
  fecha.value = new Date(anio.value, fecha.value.getMonth() - 1, 1)
  load()
}

function mesSiguiente() {
  fecha.value = new Date(anio.value, fecha.value.getMonth() + 1, 1)
  load()
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

function money(value) {
  return Number(value || 0).toFixed(2)
}

function horaBonita(hora) {
  if (!hora) return '--:--'
  return String(hora).slice(0, 5)
}

function fechaBonita(valor) {
  if (!valor) return ''

  const [year, month, day] = valor.split('-')

  return `${day}/${month}/${year}`
}

async function descargarExtractoPDF() {
  descargandoPdf.value = true

  try {
    const response = await api.get('/reportes/extracto-mensual', {
      params: {
        anio: anio.value,
        mes: mesNumero.value
      },
      responseType: 'blob'
    })

    const blob = new Blob([response.data], {
      type: 'application/pdf'
    })

    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `extracto_glamur_${anio.value}_${String(mesNumero.value).padStart(2, '0')}.pdf`
    document.body.appendChild(link)
    link.click()
    link.remove()

    window.URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      message: 'Extracto PDF generado correctamente'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    descargandoPdf.value = false
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.calendario-page {
  min-height: 100vh;
  background: #faf7fb;
}

.calendar-hero {
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
  gap: 10px;
  flex-wrap: wrap;
}

.btn-white {
  background: white;
  color: #c2185b;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 16px;
}

.btn-glamur {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
  border-radius: 16px;
}

.calendar-card {
  border-radius: 26px;
  overflow: hidden;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
}

.calendar-toolbar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  background: white;
}

.nav-btn {
  background: #fce4ec;
  color: #c2185b;
}

.month-title {
  min-width: 240px;
  text-align: center;
  font-size: 24px;
  font-weight: 900;
  color: #880e4f;
  text-transform: capitalize;
}

.legend {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #555;
  font-weight: 700;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot-green {
  background: #2e7d32;
}

.dot-yellow {
  background: #f9a825;
}

.dot-red {
  background: #c62828;
}

.week-grid,
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(110px, 1fr));
  gap: 10px;
}

.week-day {
  text-align: center;
  font-weight: 900;
  color: #880e4f;
  padding: 8px;
  background: #fce4ec;
  border-radius: 14px;
}

.day-box {
  min-height: 118px;
  border: 1px solid #ead7e2;
  padding: 12px;
  cursor: pointer;
  border-radius: 20px;
  background: white;
  transition: all 0.22s ease;
  box-shadow: 0 8px 20px rgba(156, 39, 176, 0.06);
}

.day-box:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 28px rgba(233, 30, 99, 0.16);
}

.empty-day {
  background: transparent;
  box-shadow: none;
  border: none;
  cursor: default;
}

.empty-day:hover {
  transform: none;
  box-shadow: none;
}

.day-number {
  font-size: 20px;
  font-weight: 900;
  color: #2b1730;
}

.has-citas {
  border-width: 2px;
}

.day-green {
  border-color: #43a047;
  background: #f1fff4;
}

.day-yellow {
  border-color: #f9a825;
  background: #fffaf0;
}

.day-red {
  border-color: #e53935;
  background: #fff5f5;
}

.day-summary {
  margin-top: 10px;
}

.summary-badge {
  font-weight: 900;
}

.mini-states {
  display: flex;
  gap: 5px;
  margin-top: 8px;
}

.mini {
  min-width: 24px;
  height: 22px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  color: white;
  font-size: 12px;
  font-weight: 900;
}

.mini-green {
  background: #2e7d32;
}

.mini-yellow {
  background: #f9a825;
}

.mini-red {
  background: #c62828;
}

.dialog-card {
  width: 640px;
  max-width: 96vw;
  border-radius: 24px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
}

.dialog-body {
  background: white;
  padding: 20px;
  max-height: 65vh;
  overflow-y: auto;
}

.empty-box {
  text-align: center;
  padding: 28px 14px;
  border: 1px dashed #e9b5ce;
  border-radius: 20px;
  background: #fff7fb;
}

.cita-item {
  border-radius: 16px;
  margin-bottom: 8px;
  background: #fff7fb;
}

.estado-badge {
  text-transform: capitalize;
  font-weight: 800;
}

.dialog-actions {
  padding: 16px 20px;
  background: white;
  border-top: 1px solid #eee;
}

@media (max-width: 900px) {
  .week-grid,
  .calendar-grid {
    grid-template-columns: repeat(7, minmax(88px, 1fr));
    overflow-x: auto;
  }

  .calendar-card {
    overflow-x: auto;
  }
}

@media (max-width: 600px) {
  .calendario-page {
    padding: 10px;
  }

  .calendar-hero {
    padding: 20px;
    border-radius: 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .hero-actions,
  .btn-white {
    width: 100%;
  }

  .calendar-toolbar {
    gap: 10px;
  }

  .month-title {
    min-width: auto;
    font-size: 19px;
  }

  .week-grid,
  .calendar-grid {
    grid-template-columns: repeat(7, 92px);
  }

  .day-box {
    min-height: 105px;
    padding: 10px;
  }

  .dialog-card {
    width: 100%;
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