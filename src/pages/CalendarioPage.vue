<template>
  <q-page padding>

    <div class="row items-center q-mb-md">
      <h5 class="q-mr-md">Calendario Glamur</h5>

      <q-btn icon="chevron_left" flat @click="mesAnterior" />
      <div class="text-h6 q-mx-md">
        {{ nombreMes }} {{ año }}
      </div>
      <q-btn icon="chevron_right" flat @click="mesSiguiente" />
    </div>

    <!-- CALENDARIO -->
    <div class="calendar-grid">

      <div
        v-for="dia in diasDelMes"
        :key="dia.fecha"
        class="day-box"
        @click="seleccionarDia(dia.fecha)"
      >

        <div class="text-bold">{{ dia.dia }}</div>

        <div v-if="dia.citas.length > 0">
          <q-badge color="orange">
            {{ dia.citas.length }} cita(s)
          </q-badge>
        </div>

      </div>

    </div>

    <!-- MODAL DÍA -->
    <q-dialog v-model="dialog">
      <q-card style="min-width:400px">

        <q-card-section>
          <div class="text-h6">
            📅 {{ diaSeleccionado }}
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div v-if="citasDia.length === 0">
            No hay citas este día
          </div>

          <div v-for="c in citasDia" :key="c.id" class="q-mb-sm">

            <q-chip :color="colorEstado(c.estado)" text-color="white">
              {{ c.hora }} - {{ c.cliente?.nombre }}
            </q-chip>

            <div class="text-caption">
              {{ c.servicio }}
            </div>

          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" v-close-popup />
          <q-btn color="primary" label="Nueva Cita" @click="nuevaCita" />
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

defineOptions({ name: 'CalendarioPage' })

const router = useRouter()
const $q = useQuasar()

const citas = ref([])
const dialog = ref(false)
const diaSeleccionado = ref('')

// 📅 FECHA ACTUAL
const fecha = ref(new Date())

// 🧠 MESES
const meses = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]

const nombreMes = computed(() => meses[fecha.value.getMonth()])
const año = computed(() => fecha.value.getFullYear())

// 🔄 CARGAR CITAS
async function load() {
  try {
    const { data } = await api.get('/citas')
    citas.value = data
  } catch  {
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar las citas del calendario'
    })
  }
}

// 📆 GENERAR DÍAS DEL MES
const diasDelMes = computed(() => {
  const year = fecha.value.getFullYear()
  const month = fecha.value.getMonth()

  const lastDay = new Date(year, month + 1, 0).getDate()

  let dias = []

  for (let i = 1; i <= lastDay; i++) {

    const fechaStr = `${year}-${String(month+1).padStart(2,'0')}-${String(i).padStart(2,'0')}`

    const citasDia = citas.value.filter(c => c.fecha === fechaStr)

    dias.push({
      dia: i,
      fecha: fechaStr,
      citas: citasDia
    })
  }

  return dias
})

// 📌 SELECCIONAR DÍA
const citasDia = ref([])

function seleccionarDia(fechaSel) {
  diaSeleccionado.value = fechaSel
  citasDia.value = citas.value.filter(c => c.fecha === fechaSel)
  dialog.value = true
}

// 🔥 ESTADO COLOR
function colorEstado(estado) {
  if (estado === 'confirmada') return 'green'
  if (estado === 'cancelada') return 'red'
  return 'orange'
}

// 🔁 NAVEGAR MES
function mesAnterior() {
  fecha.value = new Date(fecha.value.getFullYear(), fecha.value.getMonth() - 1, 1)
  load()
}

function mesSiguiente() {
  fecha.value = new Date(fecha.value.getFullYear(), fecha.value.getMonth() + 1, 1)
  load()
}

function nuevaCita() {
  dialog.value = false
  router.push({ path: '/citas', query: { fecha: diaSeleccionado.value } })
}

onMounted(() => {
  load()
})
</script>

<style>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.day-box {
  border: 1px solid #ddd;
  padding: 10px;
  min-height: 70px;
  cursor: pointer;
  border-radius: 8px;
}

.day-box:hover {
  background: #f5f5f5;
}
</style>