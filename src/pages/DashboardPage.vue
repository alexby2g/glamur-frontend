<template>
  <q-page class="q-pa-md dashboard-page">

    <div class="row items-center justify-between q-mb-lg page-header">
      <div>
        <div class="text-h4 text-weight-bold text-primary">
          📊 Dashboard
        </div>
        <div class="text-caption text-grey-7">
          Resumen general de Glamur
        </div>
      </div>

      <q-btn
        class="btn-glamur"
        icon="refresh"
        label="Actualizar"
        :loading="loading"
        @click="load"
      />
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="stat-card bg-primary text-white">
          <q-card-section>
            <div>Total Citas</div>
            <div class="text-h4 text-weight-bold">{{ data.total || 0 }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="stat-card bg-orange text-white">
          <q-card-section>
            <div>Pendientes</div>
            <div class="text-h4 text-weight-bold">{{ data.pendientes || 0 }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="stat-card bg-green text-white">
          <q-card-section>
            <div>Concluidas</div>
            <div class="text-h4 text-weight-bold">{{ data.concluidas || 0 }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="stat-card bg-green text-white">
          <q-card-section>
            <div>💰 Hoy</div>
            <div class="text-h5 text-weight-bold">Bs {{ money(data.ingreso_dia) }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="stat-card bg-blue text-white">
          <q-card-section>
            <div>📅 Mes</div>
            <div class="text-h5 text-weight-bold">Bs {{ money(data.ingreso_mes) }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-4">
        <q-card class="stat-card bg-purple text-white">
          <q-card-section>
            <div>📆 Año</div>
            <div class="text-h5 text-weight-bold">Bs {{ money(data.ingreso_anio) }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

async function load() {
  loading.value = true

  try {
    const res = await api.get('/dashboard')
    data.value = res.data || {}
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

.stat-card {
  border-radius: 20px;
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.16);
  min-height: 110px;
}

.btn-glamur {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 700;
  border-radius: 14px;
}

@media (max-width: 600px) {
  .dashboard-page {
    padding: 10px;
  }

  .page-header {
    gap: 12px;
  }

  .btn-glamur {
    width: 100%;
  }
}
</style>