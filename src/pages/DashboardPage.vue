<template>
  <q-page class="dashboard-page">

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

    <div class="row q-col-gutter-md q-mt-md">
      <div
        class="col-12 col-sm-6 col-md-4"
        v-for="card in cards"
        :key="card.titulo"
      >
        <q-card class="stat-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="stat-title">
                  {{ card.titulo }}
                </div>

                <div class="stat-value">
                  {{ card.valor }}
                </div>

                <div class="stat-detail">
                  {{ card.detalle }}
                </div>
              </div>

              <q-avatar :class="card.clase" size="58px">
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
  min-height: 125px;
  transition: all 0.25s ease;
  border: 1px solid rgba(233, 30, 99, 0.08);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 18px 42px rgba(233, 30, 99, 0.18);
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
}
</style>