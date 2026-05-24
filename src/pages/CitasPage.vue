<template>
  <q-page class="q-pa-md citas-page">

    <!-- HERO -->
    <div class="page-hero q-mb-lg">

      <div>
        <div class="text-h4 text-weight-bold text-white">
          📅 Citas
        </div>

        <div class="text-subtitle2 text-white">
          Gestión de reservas, pagos y estados
        </div>
      </div>

      <q-btn
        class="btn-glamur-white"
        label="Nueva Cita"
        icon="add"
        @click="openDialog"
      />

    </div>

    <!-- TABLA -->
    <q-table
      class="tabla-glamur"
      :rows="citas"
      :columns="columns"
      row-key="id"
      :loading="loading"
      no-data-label="No hay citas registradas"
      flat
      bordered
    >

      <!-- CLIENTE -->
      <template #body-cell-cliente="props">
        <q-td :props="props">

          <div class="text-weight-bold text-pink-7">
            {{ props.row.cliente?.nombre || 'Sin cliente' }}
          </div>

          <div class="text-caption text-grey-7">
            Cliente Glamur
          </div>

        </q-td>
      </template>

      <!-- PRECIO -->
      <template #body-cell-precio="props">
        <q-td :props="props">

          <div class="text-weight-bold text-green-8">
            Bs {{ Number(props.row.precio || 0).toFixed(2) }}
          </div>

        </q-td>
      </template>

      <!-- ESTADO -->
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

      <!-- ESTADO PAGO -->
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

      <!-- ACCIONES -->
      <template #body-cell-actions="props">
        <q-td :props="props" class="text-center">

          <div class="acciones">

            <q-btn
              round
              unelevated
              size="sm"
              color="primary"
              icon="edit"
              @click="edit(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn
              v-if="props.row.estado !== 'concluida'"
              round
              unelevated
              size="sm"
              color="positive"
              icon="check"
              @click="finalizar(props.row.id)"
            >
              <q-tooltip>Finalizar</q-tooltip>
            </q-btn>

            <q-btn
              v-if="props.row.estado_pago !== 'pagado'"
              round
              unelevated
              size="sm"
              color="blue"
              icon="payments"
              @click="pagar(props.row)"
            >
              <q-tooltip>Pagar</q-tooltip>
            </q-btn>

            <q-btn
              round
              unelevated
              size="sm"
              color="purple"
              icon="history"
              @click="verHistorial(props.row.id)"
            >
              <q-tooltip>Historial</q-tooltip>
            </q-btn>

            <q-btn
              round
              unelevated
              size="sm"
              color="negative"
              icon="delete"
              @click="remove(props.row.id)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>

          </div>

        </q-td>
      </template>

    </q-table>

    <!-- DIALOG NUEVA CITA -->
    <q-dialog v-model="dialog" persistent>

      <q-card class="dialog-card">

        <!-- HEADER -->
        <q-card-section class="dialog-header row items-center">

          <div class="text-h6 text-weight-bold">
            {{ form.id ? '✏️ Editar cita' : '📅 Nueva cita' }}
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

        <!-- FORM -->
        <q-card-section class="dialog-body">

          <div class="q-gutter-md">

            <q-select
              v-model="form.cliente_id"
              :options="clientes"
              option-label="nombre"
              option-value="id"
              emit-value
              map-options
              label="Cliente *"
              outlined
              dense
              rounded
              bg-color="white"
            />

            <q-input
              v-model.trim="form.servicio"
              label="Servicio *"
              outlined
              dense
              rounded
              bg-color="white"
            />

            <q-input
              v-model.number="form.precio"
              type="number"
              label="Precio Bs. *"
              outlined
              dense
              rounded
              min="0"
              bg-color="white"
            />

            <div class="row q-col-gutter-md">

              <div class="col-12 col-sm-6">

                <q-input
                  v-model="form.fecha"
                  type="date"
                  label="Fecha *"
                  outlined
                  dense
                  rounded
                  bg-color="white"
                />

              </div>

              <div class="col-12 col-sm-6">

                <q-input
                  v-model="form.hora"
                  type="time"
                  label="Hora *"
                  outlined
                  dense
                  rounded
                  bg-color="white"
                />

              </div>

            </div>

            <q-select
              v-model="form.estado"
              :options="['pendiente', 'concluida', 'cancelada']"
              label="Estado"
              outlined
              dense
              rounded
              bg-color="white"
            />

          </div>

        </q-card-section>

        <!-- ACTIONS -->
        <q-card-actions align="right" class="dialog-actions">

          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            v-close-popup
          />

          <q-btn
            class="btn-glamur"
            label="Guardar"
            :loading="saving"
            @click="save"
          />

        </q-card-actions>

      </q-card>

    </q-dialog>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

defineOptions({
  name: 'CitasPage'
})

const $q = useQuasar()

const citas = ref([])
const clientes = ref([])

const dialog = ref(false)

const loading = ref(false)
const saving = ref(false)

const form = ref({
  id: null,
  cliente_id: null,
  servicio: '',
  precio: 0,
  fecha: '',
  hora: '',
  estado: 'pendiente'
})

const columns = [
  {
    name: 'cliente',
    label: 'Cliente',
    field: row => row.cliente?.nombre || '',
    align: 'left'
  },

  {
    name: 'servicio',
    label: 'Servicio',
    field: 'servicio',
    align: 'left'
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
    field: 'fecha',
    align: 'left'
  },

  {
    name: 'hora',
    label: 'Hora',
    field: 'hora',
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
  },

  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

function hoy () {
  return new Date().toISOString().slice(0, 10)
}

function colorEstado (estado) {
  if (estado === 'concluida') return 'green'
  if (estado === 'cancelada') return 'red'
  return 'orange'
}

async function load () {
  loading.value = true

  try {
    const { data } = await api.get('/citas')

    citas.value = Array.isArray(data)
      ? data
      : (data?.data || [])

  } finally {
    loading.value = false
  }
}

async function loadClientes () {
  const { data } = await api.get('/clientes')

  clientes.value = Array.isArray(data)
    ? data
    : (data?.data || [])
}

function openDialog () {
  form.value = {
    id: null,
    cliente_id: null,
    servicio: '',
    precio: 0,
    fecha: hoy(),
    hora: '',
    estado: 'pendiente'
  }

  dialog.value = true
}

function edit (row) {
  form.value = {
    id: row.id,
    cliente_id: row.cliente_id,
    servicio: row.servicio,
    precio: row.precio,
    fecha: row.fecha,
    hora: row.hora,
    estado: row.estado
  }

  dialog.value = true
}

async function save () {
  saving.value = true

  try {
    if (form.value.id) {
      await api.put(`/citas/${form.value.id}`, form.value)

      $q.notify({
        type: 'positive',
        message: 'Cita actualizada'
      })

    } else {
      await api.post('/citas', form.value)

      $q.notify({
        type: 'positive',
        message: 'Cita registrada'
      })
    }

    dialog.value = false

    await load()

  } catch (error) {

    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error'
    })

  } finally {
    saving.value = false
  }
}

function pagar () {}
function finalizar () {}
function verHistorial () {}
function remove () {}

onMounted(async () => {
  await Promise.all([
    load(),
    loadClientes()
  ])
})
</script>

<style scoped>

.citas-page {
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
    0 16px 40px rgba(233,30,99,0.25);
}

/* BUTTON */

.btn-glamur-white {
  background: white;
  color: #c2185b;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
}

.btn-glamur {
  background:
    linear-gradient(
      135deg,
      #e91e63,
      #9c27b0
    );

  color: white;
  font-weight: 800;
  border-radius: 16px;
}

/* TABLE */

.tabla-glamur {
  border-radius: 24px;
  overflow: hidden;
  background: white;

  box-shadow:
    0 14px 35px rgba(156,39,176,0.12);
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

.estado-badge {
  padding: 6px 10px;
  font-weight: 800;
  text-transform: capitalize;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

/* DIALOG */

.dialog-card {
  width: 560px;
  max-width: 96vw;
  border-radius: 24px;
  overflow: hidden;
}

.dialog-header {
  background:
    linear-gradient(
      135deg,
      #e91e63,
      #9c27b0
    );

  color: white;
}

.dialog-body {
  background: #ffffff;
  padding: 24px;
}

.dialog-actions {
  padding: 16px 22px;
  background: white;
  border-top: 1px solid #eee;
}

/* MOBILE */

@media (max-width: 600px) {

  .citas-page {
    padding: 10px;
  }

  .page-hero {
    padding: 20px;
    border-radius: 20px;

    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
  }

  .btn-glamur-white {
    width: 100%;
  }

  .dialog-card {
    width: 100%;
    max-width: 100%;
    border-radius: 20px;
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