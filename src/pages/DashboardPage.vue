<template>
  <q-page class="q-pa-md dashboard-page">

    <div class="dashboard-hero q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-white">
          📊 Dashboard
        </div>

        <div class="text-subtitle2 text-white">
          Resumen general de Glamur
        </div>
      </div>

      <q-btn
        icon="refresh"
        label="Actualizar"
        class="btn-refresh"
        :loading="loading"
        @click="load"
      />
    </div>

    <q-linear-progress
      v-if="loading"
      indeterminate
      color="pink"
      class="q-mb-md"
    />

    <div class="row q-col-gutter-md">

      <div
        class="col-12 col-sm-6 col-md-4"
        v-for="card in cards"
        :key="card.titulo"
      >
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="text-caption text-grey-7">
                  {{ card.titulo }}
                </div>

                <div class="text-h4 text-weight-bold">
                  {{ card.valor }}
                </div>

                <div class="text-caption text-grey-7">
                  {{ card.detalle }}
                </div>
              </div>

              <q-avatar :class="card.clase" size="56px">
                <q-icon :name="card.icono" size="30px" color="white" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>

    </div>

    <div class="row q-col-gutter-md q-mt-md">

      <div class="col-12 col-md-7">
        <q-card class="panel-card">
          <q-card-section>
            <div class="text-h6 text-weight-bold text-pink-7">
              Estado de citas
            </div>

            <div class="text-caption text-grey-7">
              Resumen de citas registradas
            </div>
          </q-card-section>

          <q-card-section>
            <div class="q-mb-md">
              <div class="row justify-between q-mb-xs">
                <div>Pendientes</div>
                <div>{{ data.pendientes || 0 }}</div>
              </div>

              <q-linear-progress
                rounded
                size="14px"
                color="orange"
                :value="porcentajePendientes"
              />
            </div>

            <div>
              <div class="row justify-between q-mb-xs">
                <div>Concluidas</div>
                <div>{{ data.concluidas || 0 }}</div>
              </div>

              <q-linear-progress
                rounded
                size="14px"
                color="green"
                :value="porcentajeConcluidas"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card class="panel-card">
          <q-card-section>
            <div class="text-h6 text-weight-bold text-pink-7">
              Ingresos
            </div>

            <div class="text-caption text-grey-7">
              Total de ingresos registrados
            </div>
          </q-card-section>

          <q-card-section>
            <div class="ingreso-total">
              Bs {{ money(data.ingreso_mes) }}
            </div>

            <div class="text-caption text-grey-7">
              Ingreso del mes actual
            </div>

            <div class="q-mt-md q-gutter-sm">
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

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'boot/axios'
import { useQuasar } from 'quasar'

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

function money(value) {
  return Number(value || 0).toFixed(2)
}

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
    clase: 'bg-pink-7'
  },
  {
    titulo: 'Pendientes',
    valor: data.value.pendientes || 0,
    detalle: 'Citas por atender',
    icono: 'schedule',
    clase: 'bg-orange-7'
  },
  {
    titulo: 'Concluidas',
    valor: data.value.concluidas || 0,
    detalle: 'Citas finalizadas',
    icono: 'check_circle',
    clase: 'bg-green-7'
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

async function load() {
  loading.value = true

  try {
    const res = await api.get('/dashboard')
    data.value = {
      total: Number(res.data?.total || 0),
      pendientes: Number(res.data?.pendientes || 0),
      concluidas: Number(res.data?.concluidas || 0),
      ingreso_dia: Number(res.data?.ingreso_dia || 0),
      ingreso_mes: Number(res.data?.ingreso_mes || 0),
      ingreso_anio: Number(res.data?.ingreso_anio || 0)
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
}

.dashboard-hero {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  border-radius: 28px;
  padding: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 16px 40px rgba(233, 30, 99, 0.25);
}

.btn-refresh {
  background: white;
  color: #c2185b;
  font-weight: 800;
  border-radius: 16px;
}

.stat-card {
  border-radius: 24px;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
  min-height: 120px;
  transition: all 0.25s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 42px rgba(233, 30, 99, 0.18);
}

.panel-card {
  border-radius: 24px;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
  overflow: hidden;
}

.ingreso-total {
  font-size: 34px;
  font-weight: 900;
  color: #2e7d32;
}

.quick-btn {
  width: 100%;
  justify-content: flex-start;
  border-radius: 16px;
  padding: 12px;
  color: white;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  font-weight: 700;
}

@media (max-width: 600px) {
  .dashboard-page {
    padding: 10px;
  }

  .dashboard-hero {
    padding: 20px;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    border-radius: 20px;
  }

  .btn-refresh {
    width: 100%;
  }

  .ingreso-total {
    font-size: 28px;
  }
}
</style>