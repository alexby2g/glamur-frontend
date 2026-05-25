<template>
  <q-page class="q-pa-md pagos-page">

    <!-- HERO -->
    <div class="page-hero q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-white">
          💰 Pagos
        </div>

        <div class="text-subtitle2 text-white">
          Registro general de pagos realizados
        </div>
      </div>

      <q-btn
        class="btn-glamur-white"
        icon="refresh"
        label="Actualizar"
        :loading="loading"
        @click="load"
      />
    </div>

    <!-- TABLA -->
    <q-table
      class="tabla-glamur"
      :rows="pagos"
      :columns="columns"
      row-key="id"
      :loading="loading"
      no-data-label="No hay pagos registrados"
      flat
      bordered
      :rows-per-page-options="[5, 10, 20, 50]"
    >

      <!-- CLIENTE -->
      <template #body-cell-cliente="props">
        <q-td :props="props">
          <div class="text-weight-bold text-pink-7">
            {{ props.row.cita?.cliente?.nombre || 'Sin cliente' }}
          </div>

          <div class="text-caption text-grey-7">
            Cliente Glamur
          </div>
        </q-td>
      </template>

      <!-- SERVICIO -->
      <template #body-cell-servicio="props">
        <q-td :props="props">
          <div class="text-weight-medium">
            {{ props.row.cita?.servicio || 'Sin servicio' }}
          </div>

          <div class="text-caption text-grey-7">
            Cita #{{ props.row.cita_id || 'N/A' }}
          </div>
        </q-td>
      </template>

      <!-- MONTO -->
      <template #body-cell-monto="props">
        <q-td :props="props">
          <div class="text-weight-bold text-green-8">
            Bs {{ money(props.row.monto) }}
          </div>
        </q-td>
      </template>

      <!-- MÉTODO -->
      <template #body-cell-metodo="props">
        <q-td :props="props">
          <q-badge
            rounded
            color="blue"
            class="estado-badge"
          >
            {{ metodoTexto(props.row.metodo) }}
          </q-badge>
        </q-td>
      </template>

      <!-- ESTADO -->
      <template #body-cell-estado="props">
        <q-td :props="props" class="text-center">
          <q-badge
            rounded
            class="estado-badge"
            :color="props.row.estado === 'pagado' ? 'green' : 'orange'"
          >
            {{ props.row.estado || 'pendiente' }}
          </q-badge>
        </q-td>
      </template>

      <!-- FECHA -->
      <template #body-cell-fecha_pago="props">
        <q-td :props="props">
          <div class="text-weight-medium">
            {{ formatFecha(props.row.fecha_pago) }}
          </div>
        </q-td>
      </template>

      <!-- ACCIONES -->
      <template #body-cell-actions="props">
        <q-td :props="props" class="text-center">
          <q-btn
            round
            unelevated
            size="sm"
            color="negative"
            icon="delete"
            @click="remove(props.row)"
          >
            <q-tooltip>Eliminar pago</q-tooltip>
          </q-btn>
        </q-td>
      </template>

    </q-table>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

defineOptions({
  name: 'PagosPage'
})

const $q = useQuasar()

const pagos = ref([])
const loading = ref(false)

const columns = [
  {
    name: 'cliente',
    label: 'Cliente',
    field: row => row.cita?.cliente?.nombre || 'Sin cliente',
    align: 'left',
    sortable: true
  },
  {
    name: 'servicio',
    label: 'Servicio',
    field: row => row.cita?.servicio || 'Sin servicio',
    align: 'left',
    sortable: true
  },
  {
    name: 'monto',
    label: 'Monto',
    field: 'monto',
    align: 'left',
    sortable: true
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
    align: 'center'
  },
  {
    name: 'fecha_pago',
    label: 'Fecha',
    field: 'fecha_pago',
    align: 'left',
    sortable: true
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

function money(value) {
  return Number(value || 0).toFixed(2)
}

function metodoTexto(metodo) {
  if (!metodo) return 'No definido'

  if (metodo.toLowerCase() === 'qr') {
    return 'QR'
  }

  return metodo.charAt(0).toUpperCase() + metodo.slice(1)
}

function formatFecha(fecha) {
  if (!fecha) return 'Sin fecha'

  return String(fecha).replace('T', ' ').slice(0, 19)
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
    const { data } = await api.get('/pagos')

    pagos.value = Array.isArray(data)
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

function remove(row) {
  $q.dialog({
    title: 'Eliminar pago',
    message: `¿Seguro que deseas eliminar este pago de Bs ${money(row.monto)}?`,
    persistent: true,
    ok: {
      label: 'Eliminar',
      color: 'negative',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    try {
      await api.delete(`/pagos/${row.id}`)

      $q.notify({
        type: 'positive',
        message: 'Pago eliminado correctamente'
      })

      await load()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error)
      })
    }
  })
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.pagos-page {
  min-height: 100vh;
  background: #faf7fb;
}

/* HERO */

.page-hero {
  background:
    linear-gradient(
      135deg,
      #e91e63,
      #9c27b0
    );

  border-radius: 28px;
  padding: 28px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  box-shadow:
    0 16px 40px rgba(233, 30, 99, 0.25);
}

/* BUTTON */

.btn-glamur-white {
  background: white;
  color: #c2185b;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
}

/* TABLE */

.tabla-glamur {
  border-radius: 24px;
  overflow: hidden;
  background: white;

  box-shadow:
    0 14px 35px rgba(156, 39, 176, 0.12);
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
  font-size: 13px;
}

.tabla-glamur :deep(.q-table tbody tr:hover) {
  background: #fff0f6;
}

.estado-badge {
  padding: 6px 10px;
  font-weight: 800;
  text-transform: capitalize;
}

/* MOBILE */

@media (max-width: 600px) {
  .pagos-page {
    padding: 10px;
  }

  .page-hero {
    padding: 20px;
    border-radius: 20px;

    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .page-hero .text-h4 {
    font-size: 28px;
  }

  .btn-glamur-white {
    width: 100%;
  }
}
</style>