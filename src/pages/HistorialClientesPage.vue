<template>
  <q-page class="historial-clientes-page">

    <!-- HERO -->
    <div class="page-hero q-mb-lg">
      <div>
        <div class="hero-chip">
          Historial inteligente
        </div>

        <div class="hero-title">
          📜 Historial de Clientes
        </div>

        <div class="hero-subtitle">
          Busca por nombre o teléfono y revisa citas, pagos y actividad del cliente.
        </div>
      </div>
    </div>

    <!-- BUSCADOR -->
    <q-card class="search-card q-mb-lg">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md">
            <q-input
              v-model.trim="buscar"
              outlined
              rounded
              dense
              clearable
              bg-color="white"
              placeholder="Buscar por nombre o teléfono..."
              @keyup.enter="buscarHistorial"
            >
              <template #prepend>
                <q-icon name="search" color="pink-7" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-auto">
            <q-btn
              class="btn-search"
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
      class="q-mb-lg"
    />

    <!-- ESTADO INICIAL -->
    <div
      v-if="!loading && clientes.length === 0 && !busquedaRealizada"
      class="empty-state"
    >
      <q-icon name="manage_search" size="82px" color="pink-4" />

      <div class="empty-title">
        Busca un cliente
      </div>

      <div class="empty-text">
        Escribe su nombre o teléfono para ver su historial completo.
      </div>
    </div>

    <!-- SIN RESULTADOS -->
    <div
      v-if="!loading && clientes.length === 0 && busquedaRealizada"
      class="empty-state"
    >
      <q-icon name="person_search" size="82px" color="orange-5" />

      <div class="empty-title">
        No se encontraron clientes
      </div>

      <div class="empty-text">
        Intenta buscar con otro nombre o número de teléfono.
      </div>
    </div>

    <!-- RESULTADOS -->
    <div
      v-for="cliente in clientes"
      :key="cliente.id"
      class="cliente-card q-mb-lg"
    >

      <!-- INFO CLIENTE -->
      <div class="cliente-header">

        <div class="cliente-info">
          <q-avatar class="cliente-avatar" size="66px">
            <q-icon name="person" color="white" size="36px" />
          </q-avatar>

          <div>
            <div class="cliente-nombre">
              {{ cliente.nombre || 'Cliente sin nombre' }}
            </div>

            <div class="cliente-dato">
              <q-icon name="phone" size="16px" color="pink-7" />
              {{ cliente.telefono || 'Sin teléfono' }}
            </div>
          </div>
        </div>

        <div class="resumen-grid">

          <div class="resumen-box resumen-citas">
            <div class="resumen-numero">
              {{ cliente.total_citas || 0 }}
            </div>

            <div class="resumen-label">
              Citas
            </div>
          </div>

          <div class="resumen-box resumen-pendientes">
            <div class="resumen-numero">
              {{ cliente.citas_pendientes || 0 }}
            </div>

            <div class="resumen-label">
              Pendientes
            </div>
          </div>

          <div class="resumen-box resumen-concluidas">
            <div class="resumen-numero">
              {{ cliente.citas_concluidas || 0 }}
            </div>

            <div class="resumen-label">
              Concluidas
            </div>
          </div>

          <div class="resumen-box resumen-pagos">
            <div class="resumen-numero">
              Bs {{ money(cliente.total_pagado) }}
            </div>

            <div class="resumen-label">
              Pagado
            </div>
          </div>

        </div>

      </div>

      <q-separator />

      <!-- TABS -->
      <div class="tabs-area">

        <q-tabs
          v-model="tabs[cliente.id]"
          dense
          active-color="pink-7"
          indicator-color="pink-7"
          align="left"
          class="tabs-glamur"
        >
          <q-tab
            name="citas"
            icon="event"
            label="Citas"
          />

          <q-tab
            name="pagos"
            icon="payments"
            label="Pagos"
          />
        </q-tabs>

        <q-tab-panels
          v-model="tabs[cliente.id]"
          animated
          class="tab-panels"
        >

          <!-- CITAS -->
          <q-tab-panel name="citas">
            <q-table
              class="tabla-glamur"
              :rows="cliente.citas || []"
              :columns="columnsCitas"
              row-key="id"
              flat
              bordered
              dense
              :rows-per-page-options="[5, 10, 20]"
              no-data-label="Este cliente no tiene citas registradas"
            >
              <template #body-cell-servicio="props">
                <q-td :props="props">
                  <div class="text-weight-bold text-pink-8">
                    {{ props.row.servicio || 'Sin servicio' }}
                  </div>

                  <div class="text-caption text-grey-7">
                    {{ props.row.fecha || 'Sin fecha' }} - {{ formatHora(props.row.hora) }}
                  </div>
                </q-td>
              </template>

              <template #body-cell-precio="props">
                <q-td :props="props">
                  <b class="text-green-8">
                    Bs {{ money(props.row.precio) }}
                  </b>
                </q-td>
              </template>

              <template #body-cell-estado="props">
                <q-td :props="props" class="text-center">
                  <q-badge
                    rounded
                    class="estado-badge"
                    :color="colorEstado(props.row.estado)"
                  >
                    {{ props.row.estado || 'pendiente' }}
                  </q-badge>
                </q-td>
              </template>

              <template #body-cell-estado_pago="props">
                <q-td :props="props" class="text-center">
                  <q-badge
                    rounded
                    class="estado-badge"
                    :color="props.row.estado_pago === 'pagado' ? 'green' : 'red'"
                  >
                    {{ props.row.estado_pago || 'pendiente' }}
                  </q-badge>
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

          <!-- PAGOS -->
          <q-tab-panel name="pagos">
            <q-table
              class="tabla-glamur"
              :rows="cliente.pagos || []"
              :columns="columnsPagos"
              row-key="id"
              flat
              bordered
              dense
              :rows-per-page-options="[5, 10, 20]"
              no-data-label="Este cliente no tiene pagos registrados"
            >
              <template #body-cell-servicio="props">
                <q-td :props="props">
                  <div class="text-weight-bold text-purple-8">
                    {{ props.row.servicio || props.row.cita?.servicio || 'Sin servicio' }}
                  </div>

                  <div class="text-caption text-grey-7">
                    Cita: {{ props.row.fecha_cita || props.row.cita?.fecha || 'Sin fecha' }}
                  </div>
                </q-td>
              </template>

              <template #body-cell-monto="props">
                <q-td :props="props">
                  <b class="text-green-8">
                    Bs {{ money(props.row.monto) }}
                  </b>
                </q-td>
              </template>

              <template #body-cell-metodo="props">
                <q-td :props="props">
                  <q-badge
                    rounded
                    color="blue"
                    class="estado-badge text-uppercase"
                  >
                    {{ props.row.metodo || 'No definido' }}
                  </q-badge>
                </q-td>
              </template>

              <template #body-cell-estado="props">
                <q-td :props="props">
                  <q-badge
                    rounded
                    color="green"
                    class="estado-badge"
                  >
                    {{ props.row.estado || 'pagado' }}
                  </q-badge>
                </q-td>
              </template>

              <template #body-cell-fecha_pago="props">
                <q-td :props="props">
                  {{ formatDate(props.row.fecha_pago) }}
                </q-td>
              </template>
            </q-table>
          </q-tab-panel>

        </q-tab-panels>

      </div>

    </div>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar, date } from 'quasar'
import { api } from 'boot/axios'

defineOptions({
  name: 'HistorialClientesPage'
})

const $q = useQuasar()

const buscar = ref('')
const loading = ref(false)
const busquedaRealizada = ref(false)
const clientes = ref([])
const tabs = ref({})

const columnsCitas = [
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
    align: 'left'
  },
  {
    name: 'fecha',
    label: 'Fecha',
    field: row => row.fecha || 'Sin fecha',
    align: 'left',
    sortable: true
  },
  {
    name: 'hora',
    label: 'Hora',
    field: row => formatHora(row.hora),
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
  }
]

const columnsPagos = [
  {
    name: 'servicio',
    label: 'Servicio',
    field: row => row.servicio || row.cita?.servicio || 'Sin servicio',
    align: 'left',
    sortable: true
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
    field: 'fecha_pago',
    align: 'left',
    sortable: true
  }
]

function money(value) {
  return Number(value || 0).toFixed(2)
}

function formatHora(value) {
  if (!value) return 'Sin hora'
  return String(value).slice(0, 5)
}

function formatDate(value) {
  if (!value) return 'Sin fecha'
  return date.formatDate(value, 'DD/MM/YYYY HH:mm')
}

function colorEstado(estado) {
  if (estado === 'concluida') return 'green'
  if (estado === 'cancelada') return 'red'
  return 'orange'
}

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || 'Ocurrió un error'
}

async function buscarHistorial() {
  if (!buscar.value) {
    $q.notify({
      type: 'warning',
      message: 'Escribe un nombre o teléfono para buscar'
    })

    return
  }

  loading.value = true
  busquedaRealizada.value = true

  try {
    const { data } = await api.get('/clientes/historial/buscar', {
      params: {
        buscar: buscar.value
      }
    })

    clientes.value = data?.clientes || []

    tabs.value = {}

    clientes.value.forEach((cliente) => {
      tabs.value[cliente.id] = 'citas'
    })

    if (clientes.value.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'No se encontraron clientes'
      })
    }
  } catch (error) {
    clientes.value = []

    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.historial-clientes-page {
  min-height: 100vh;
  padding: 24px;
  background:
    radial-gradient(circle at top left, rgba(233, 30, 99, 0.12), transparent 32%),
    linear-gradient(180deg, #fff7fb 0%, #f6f7fb 100%);
}

/* HERO */

.page-hero {
  min-height: 178px;
  border-radius: 30px;
  padding: 30px;

  display: flex;
  align-items: center;

  background:
    linear-gradient(
      135deg,
      #15111f 0%,
      #3b163a 42%,
      #e91e63 100%
    );

  color: white;

  box-shadow:
    0 18px 45px rgba(233, 30, 99, 0.25);

  overflow: hidden;
  position: relative;
}

.page-hero::after {
  content: "";
  position: absolute;
  width: 230px;
  height: 230px;
  right: -70px;
  top: -60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.13);
}

.hero-chip {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 999px;
  margin-bottom: 14px;

  font-size: 13px;
  font-weight: 900;

  background: rgba(255, 255, 255, 0.13);
}

.hero-title {
  font-size: 34px;
  font-weight: 900;
  line-height: 1.1;
}

.hero-subtitle {
  margin-top: 10px;
  max-width: 720px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 15px;
}

/* SEARCH */

.search-card {
  border-radius: 26px;
  background: white;
  box-shadow: 0 16px 42px rgba(156, 39, 176, 0.12);
}

.btn-search {
  width: 245px;
  min-height: 44px;
  border-radius: 16px;

  color: white;
  font-weight: 900;

  background:
    linear-gradient(
      135deg,
      #e91e63,
      #9c27b0
    );

  box-shadow:
    0 12px 30px rgba(233, 30, 99, 0.28);
}

/* CARDS */

.cliente-card {
  border-radius: 28px;
  background: white;
  overflow: hidden;

  box-shadow:
    0 16px 45px rgba(80, 70, 120, 0.14);

  border:
    1px solid rgba(233, 30, 99, 0.08);
}

.cliente-header {
  padding: 24px;

  display: grid;
  grid-template-columns: 1.4fr 2fr;
  gap: 22px;
  align-items: center;
}

.cliente-info {
  display: flex;
  align-items: center;
  gap: 18px;
}

.cliente-avatar {
  background:
    linear-gradient(
      135deg,
      #e91e63,
      #9c27b0
    );

  box-shadow:
    0 12px 30px rgba(233, 30, 99, 0.30);
}

.cliente-nombre {
  font-size: 22px;
  font-weight: 900;
  color: #111827;
  text-transform: capitalize;
}

.cliente-dato {
  margin-top: 5px;
  display: flex;
  gap: 6px;
  align-items: center;
  color: #6b7280;
  font-size: 13px;
}

.resumen-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.resumen-box {
  border-radius: 18px;
  padding: 18px 12px;
  text-align: center;
}

.resumen-numero {
  font-size: 20px;
  font-weight: 900;
}

.resumen-label {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 800;
}

.resumen-citas {
  background: #fce4ec;
  color: #c2185b;
}

.resumen-pendientes {
  background: #fff3e0;
  color: #e65100;
}

.resumen-concluidas {
  background: #e8f5e9;
  color: #087f23;
}

.resumen-pagos {
  background: #e0f7ef;
  color: #00796b;
}

/* TABS */

.tabs-area {
  padding: 18px 24px 28px;
}

.tabs-glamur {
  color: #e91e63;
  font-weight: 900;
}

.tab-panels {
  background: transparent;
}

.tabla-glamur {
  margin-top: 14px;
  border-radius: 18px;
  overflow: hidden;
  background: white;
}

.tabla-glamur :deep(.q-table thead tr) {
  background:
    linear-gradient(
      135deg,
      #fce4ec,
      #f3e5f5
    );

  color: #880e4f;
}

.tabla-glamur :deep(.q-table th) {
  font-weight: 900;
}

.estado-badge {
  padding: 6px 10px;
  font-weight: 800;
  text-transform: capitalize;
}

/* EMPTY */

.empty-state {
  min-height: 280px;
  display: grid;
  place-items: center;
  align-content: center;
  text-align: center;
  color: #6b7280;
}

.empty-title {
  margin-top: 12px;
  font-size: 25px;
  font-weight: 900;
  color: #c2185b;
}

.empty-text {
  margin-top: 6px;
  font-size: 14px;
}

/* MOBILE */

@media (max-width: 900px) {
  .cliente-header {
    grid-template-columns: 1fr;
  }

  .resumen-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .btn-search {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .historial-clientes-page {
    padding: 12px;
  }

  .page-hero {
    padding: 22px;
    border-radius: 22px;
    min-height: auto;
  }

  .hero-title {
    font-size: 27px;
  }

  .cliente-header {
    padding: 18px;
  }

  .cliente-info {
    align-items: flex-start;
  }

  .resumen-grid {
    grid-template-columns: 1fr;
  }

  .tabs-area {
    padding: 14px;
  }
}
</style>