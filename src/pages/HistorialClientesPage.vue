<template>
  <q-page class="historial-page">

    <section class="hero">
      <div>
        <div class="badge">Historial inteligente</div>
        <div class="title">📜 Historial de Clientes</div>
        <div class="subtitle">
          Busca por nombre o teléfono y revisa citas, pagos y actividad del cliente.
        </div>
      </div>
    </section>

    <q-card class="search-card">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-9">
            <q-input
              v-model="buscar"
              outlined
              rounded
              dense
              placeholder="Buscar por nombre o teléfono..."
              debounce="500"
              @keyup.enter="buscarHistorial"
            >
              <template #prepend>
                <q-icon name="search" color="pink" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <q-btn
              class="btn-search full-width"
              icon="search"
              label="Buscar"
              :loading="loading"
              @click="buscarHistorial"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-linear-progress
      v-if="loading"
      indeterminate
      color="pink"
      class="q-my-md"
    />

    <div v-if="clientes.length === 0 && !loading" class="empty-box">
      <q-icon name="manage_search" size="70px" color="pink-4" />
      <div class="empty-title">Busca un cliente</div>
      <div class="empty-text">
        Escribe su nombre o teléfono para ver su historial completo.
      </div>
    </div>

    <div class="q-mt-md" v-for="cliente in clientes" :key="cliente.id">
      <q-card class="cliente-card">

        <q-card-section>
          <div class="row q-col-gutter-md items-center">

            <div class="col-12 col-md-4">
              <div class="cliente-header">
                <q-avatar class="cliente-avatar" size="64px">
                  <q-icon name="person" color="white" size="34px" />
                </q-avatar>

                <div>
                  <div class="cliente-nombre">{{ cliente.nombre }}</div>
                  <div class="cliente-info">
                    📞 {{ cliente.telefono || 'Sin teléfono' }}
                  </div>
                  <div class="cliente-info">
                    ✉️ {{ cliente.email || 'Sin correo' }}
                  </div>
                </div>
              </div>
            </div>

            <div class="col-6 col-md-2">
              <div class="mini-stat">
                <div class="mini-value">{{ cliente.total_citas || 0 }}</div>
                <div class="mini-label">Citas</div>
              </div>
            </div>

            <div class="col-6 col-md-2">
              <div class="mini-stat warning">
                <div class="mini-value">{{ cliente.citas_pendientes || 0 }}</div>
                <div class="mini-label">Pendientes</div>
              </div>
            </div>

            <div class="col-6 col-md-2">
              <div class="mini-stat success">
                <div class="mini-value">{{ cliente.citas_concluidas || 0 }}</div>
                <div class="mini-label">Concluidas</div>
              </div>
            </div>

            <div class="col-6 col-md-2">
              <div class="mini-stat money">
                <div class="mini-value">Bs {{ money(cliente.total_pagado) }}</div>
                <div class="mini-label">Pagado</div>
              </div>
            </div>

          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-tabs
            v-model="tab[cliente.id]"
            dense
            class="text-pink-7"
            active-color="pink"
            indicator-color="pink"
            align="left"
          >
            <q-tab name="citas" icon="event" label="Citas" />
            <q-tab name="pagos" icon="payments" label="Pagos" />
          </q-tabs>

          <q-tab-panels v-model="tab[cliente.id]" animated>
            <q-tab-panel name="citas">
              <div v-if="cliente.citas?.length === 0" class="text-grey-7">
                Este cliente no tiene citas registradas.
              </div>

              <q-timeline color="pink" v-else>
                <q-timeline-entry
                  v-for="cita in cliente.citas"
                  :key="cita.id"
                  :title="cita.servicio || 'Servicio sin nombre'"
                  :subtitle="formatDate(cita.fecha) + ' - ' + (cita.hora || '')"
                  :icon="iconEstado(cita.estado)"
                  :color="colorEstado(cita.estado)"
                >
                  <div class="timeline-box">
                    <q-badge :color="colorEstado(cita.estado)" class="q-mb-sm">
                      {{ cita.estado || 'Sin estado' }}
                    </q-badge>

                    <div>
                      <b>Precio:</b> Bs {{ money(cita.precio) }}
                    </div>

                    <div>
                      <b>Estado pago:</b> {{ cita.estado_pago || 'No definido' }}
                    </div>

                    <div>
                      <b>Método pago:</b> {{ cita.metodo_pago || 'No definido' }}
                    </div>
                  </div>
                </q-timeline-entry>
              </q-timeline>
            </q-tab-panel>

            <q-tab-panel name="pagos">
              <q-table
                flat
                bordered
                :rows="cliente.pagos || []"
                :columns="columnsPagos"
                row-key="id"
                no-data-label="Este cliente no tiene pagos registrados"
              >
                <template #body-cell-monto="props">
                  <q-td :props="props">
                    <b class="text-green-8">Bs {{ money(props.row.monto) }}</b>
                  </q-td>
                </template>

                <template #body-cell-estado="props">
                  <q-td :props="props">
                    <q-badge color="green">
                      {{ props.row.estado || 'Pagado' }}
                    </q-badge>
                  </q-td>
                </template>
              </q-table>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>

      </q-card>
    </div>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { api } from 'boot/axios'
import { useQuasar, date } from 'quasar'

const $q = useQuasar()

const buscar = ref('')
const loading = ref(false)
const clientes = ref([])
const tab = ref({})

const columnsPagos = [
  {
    name: 'fecha_pago',
    label: 'Fecha',
    field: row => formatDate(row.fecha_pago),
    align: 'left'
  },
  {
    name: 'monto',
    label: 'Monto',
    field: 'monto',
    align: 'left'
  },
  {
    name: 'metodo',
    label: 'Método',
    field: row => row.metodo || 'No definido',
    align: 'left'
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'left'
  }
]

function money(value) {
  return Number(value || 0).toFixed(2)
}

function formatDate(value) {
  if (!value) return 'Sin fecha'
  return date.formatDate(value, 'DD/MM/YYYY')
}

function colorEstado(estado) {
  const e = String(estado || '').toLowerCase()

  if (e.includes('concluida') || e.includes('finalizada')) return 'green'
  if (e.includes('pendiente')) return 'orange'
  if (e.includes('cancelada')) return 'red'

  return 'pink'
}

function iconEstado(estado) {
  const e = String(estado || '').toLowerCase()

  if (e.includes('concluida') || e.includes('finalizada')) return 'check_circle'
  if (e.includes('pendiente')) return 'schedule'
  if (e.includes('cancelada')) return 'cancel'

  return 'event'
}

async function buscarHistorial() {
  if (!buscar.value.trim()) {
    $q.notify({
      type: 'warning',
      message: 'Ingrese un nombre o teléfono para buscar'
    })
    return
  }

  loading.value = true
  clientes.value = []

  try {
    const res = await api.get('/clientes/historial/buscar', {
      params: {
        buscar: buscar.value.trim()
      }
    })

    clientes.value = res.data?.clientes || []

    clientes.value.forEach(cliente => {
      tab.value[cliente.id] = 'citas'
    })
  } catch (error) {
    clientes.value = []

    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'No se pudo cargar el historial'
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.historial-page {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(233, 30, 99, 0.14), transparent 32%),
    linear-gradient(180deg, #fff7fb 0%, #f7f7fb 100%);
}

.hero {
  background: linear-gradient(135deg, #15111f, #241329 45%, #e91e63);
  border-radius: 30px;
  padding: 30px;
  color: white;
  box-shadow: 0 18px 45px rgba(20, 10, 30, 0.28);
}

.badge {
  display: inline-block;
  padding: 7px 14px;
  border-radius: 999px;
  font-weight: 800;
  background: rgba(255, 255, 255, 0.16);
}

.title {
  margin-top: 10px;
  font-size: 32px;
  font-weight: 900;
}

.subtitle {
  opacity: 0.8;
  margin-top: 4px;
}

.search-card,
.cliente-card {
  border-radius: 26px;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
  border: 1px solid rgba(233, 30, 99, 0.08);
}

.search-card {
  margin-top: 18px;
}

.btn-search {
  border-radius: 16px;
  padding: 10px;
  color: white;
  font-weight: 900;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
}

.empty-box {
  margin-top: 40px;
  text-align: center;
  color: #777;
}

.empty-title {
  font-size: 24px;
  font-weight: 900;
  color: #c2185b;
}

.empty-text {
  font-size: 14px;
}

.cliente-header {
  display: flex;
  gap: 14px;
  align-items: center;
}

.cliente-avatar {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  box-shadow: 0 12px 28px rgba(233, 30, 99, 0.32);
}

.cliente-nombre {
  font-size: 20px;
  font-weight: 900;
  color: #222;
}

.cliente-info {
  font-size: 13px;
  color: #777;
}

.mini-stat {
  padding: 16px;
  border-radius: 20px;
  text-align: center;
  background: #fdf2f8;
  color: #c2185b;
}

.mini-stat.warning {
  background: #fff7ed;
  color: #c2410c;
}

.mini-stat.success {
  background: #f0fdf4;
  color: #15803d;
}

.mini-stat.money {
  background: #ecfdf5;
  color: #047857;
}

.mini-value {
  font-size: 20px;
  font-weight: 900;
}

.mini-label {
  font-size: 12px;
  font-weight: 800;
}

.timeline-box {
  background: #fafafa;
  padding: 14px;
  border-radius: 16px;
  border: 1px solid #eee;
}

@media (max-width: 600px) {
  .historial-page {
    padding: 12px;
  }

  .hero {
    padding: 22px;
    border-radius: 22px;
  }

  .title {
    font-size: 25px;
  }

  .cliente-header {
    align-items: flex-start;
  }
}
</style>