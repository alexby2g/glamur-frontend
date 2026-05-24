<template>
  <q-page class="q-pa-md servicios-page">

    <div class="page-hero q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-white">
          💅 Servicios y Combos
        </div>

        <div class="text-subtitle2 text-white">
          Administra los servicios predeterminados de Glamur
        </div>
      </div>

      <q-btn
        class="btn-glamur-white"
        icon="add"
        label="Nuevo servicio"
        @click="openDialog"
      />
    </div>

    <q-card class="search-card q-mb-md">
      <q-input
        v-model="search"
        outlined
        rounded
        dense
        clearable
        placeholder="Buscar por servicio, combo o detalle..."
      >
        <template #prepend>
          <q-icon name="search" color="pink" />
        </template>
      </q-input>
    </q-card>

    <q-card class="table-card">
      <q-table
        :rows="filteredServicios"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :rows-per-page-options="[5, 10, 20, 50]"
        no-data-label="No hay servicios registrados"
      >

        <template #body-cell-servicio="props">
          <q-td :props="props">
            <div class="text-weight-bold text-pink-7">
              {{ props.row.servicio }}
            </div>

            <div class="text-caption text-grey-7">
              Categoría del servicio
            </div>
          </q-td>
        </template>

        <template #body-cell-combo="props">
          <q-td :props="props">
            <div class="text-weight-bold">
              {{ props.row.combo }}
            </div>

            <div class="text-caption text-grey-7">
              {{ props.row.detalle }}
            </div>
          </q-td>
        </template>

        <template #body-cell-precio="props">
          <q-td :props="props">
            <q-badge color="green" rounded class="precio-badge">
              Bs {{ money(props.row.precio) }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <q-btn
              round
              unelevated
              size="sm"
              color="primary"
              icon="edit"
              class="q-mr-sm"
              @click="edit(props.row)"
            >
              <q-tooltip>Editar</q-tooltip>
            </q-btn>

            <q-btn
              round
              unelevated
              size="sm"
              color="negative"
              icon="delete"
              @click="remove(props.row)"
            >
              <q-tooltip>Eliminar</q-tooltip>
            </q-btn>
          </q-td>
        </template>

      </q-table>
    </q-card>

    <q-dialog v-model="dialog" persistent>
      <q-card class="dialog-card">

        <q-card-section class="dialog-header row items-center">
          <div class="text-h6 text-weight-bold">
            {{ form.id ? '✏️ Editar servicio' : '➕ Nuevo servicio' }}
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
          <div class="q-gutter-md">

            <q-input
              v-model.trim="form.servicio"
              label="Servicio / Categoría *"
              outlined
              rounded
              dense
              bg-color="white"
            />

            <q-input
              v-model.trim="form.combo"
              label="Nombre del combo *"
              outlined
              rounded
              dense
              bg-color="white"
            />

            <q-input
              v-model.trim="form.detalle"
              label="Detalle del combo *"
              outlined
              rounded
              dense
              bg-color="white"
            />

            <q-input
              v-model.number="form.precio"
              type="number"
              label="Precio Bs. *"
              outlined
              rounded
              dense
              min="0"
              bg-color="white"
            />

          </div>
        </q-card-section>

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
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'

defineOptions({
  name: 'ServiciosPage'
})

const $q = useQuasar()

const STORAGE_KEY = 'glamur_servicios_combos'

const servicios = ref([])
const search = ref('')
const dialog = ref(false)
const saving = ref(false)

const form = ref({
  id: null,
  servicio: '',
  combo: '',
  detalle: '',
  precio: 0
})

const defaultServicios = [
  {
    id: 1,
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'CLEAN BROWS',
    detalle: 'Depilación + Visagismo',
    precio: 25
  },
  {
    id: 2,
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'BROWS PRO',
    detalle: 'Henna + Depilación y Visagismo',
    precio: 80
  },
  {
    id: 3,
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'LAMI BROWS',
    detalle: 'Laminado + Vitaminas + Depilación y Visagismo',
    precio: 80
  },
  {
    id: 4,
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'LASH PERFECT',
    detalle: 'Lifting + Tinte efecto rimel',
    precio: 85
  },
  {
    id: 5,
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'PERFECT BROWS',
    detalle: 'Laminado + Henna + Depilación + Visagismo',
    precio: 135
  },
  {
    id: 6,
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'GLOW UP EXPRESS',
    detalle: 'Laminado + Henna + Depilación y Visagismo + Lifting + Tinte efecto rimel',
    precio: 220
  },
  {
    id: 7,
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'PERFECT EXPRESS',
    detalle: 'Henna + Depilación y Visagismo + Lifting + Tinte efecto rimel',
    precio: 165
  },
  {
    id: 8,
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'LASH & BROWS EXPRESS',
    detalle: 'Laminado + Lifting + Tinte efecto rimel + Vitaminas + Depilación y Visagismo',
    precio: 165
  },
  {
    id: 9,
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'RETOQUE BROWS PRO',
    detalle: 'Henna',
    precio: 40
  }
]

const columns = [
  {
    name: 'servicio',
    label: 'Servicio',
    field: 'servicio',
    align: 'left',
    sortable: true
  },
  {
    name: 'combo',
    label: 'Combo',
    field: 'combo',
    align: 'left',
    sortable: true
  },
  {
    name: 'precio',
    label: 'Precio',
    field: 'precio',
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

const filteredServicios = computed(() => {
  const term = search.value.trim().toLowerCase()

  if (!term) {
    return servicios.value
  }

  return servicios.value.filter(item => {
    return String(item.servicio || '').toLowerCase().includes(term) ||
      String(item.combo || '').toLowerCase().includes(term) ||
      String(item.detalle || '').toLowerCase().includes(term)
  })
})

function money(value) {
  return Number(value || 0).toFixed(2)
}

function saveStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(servicios.value))
}

function load() {
  const data = localStorage.getItem(STORAGE_KEY)

  if (!data) {
    servicios.value = defaultServicios
    saveStorage()
    return
  }

  try {
    servicios.value = JSON.parse(data)
  } catch {
    servicios.value = defaultServicios
    saveStorage()
  }
}

function resetForm() {
  form.value = {
    id: null,
    servicio: 'CEJAS Y PESTAÑAS',
    combo: '',
    detalle: '',
    precio: 0
  }
}

function openDialog() {
  resetForm()
  dialog.value = true
}

function edit(row) {
  form.value = {
    id: row.id,
    servicio: row.servicio || '',
    combo: row.combo || '',
    detalle: row.detalle || '',
    precio: Number(row.precio || 0)
  }

  dialog.value = true
}

function save() {
  if (!form.value.servicio || !form.value.combo || !form.value.detalle || Number(form.value.precio || 0) <= 0) {
    $q.notify({
      type: 'warning',
      message: 'Completa servicio, combo, detalle y precio'
    })

    return
  }

  saving.value = true

  try {
    if (form.value.id) {
      servicios.value = servicios.value.map(item => {
        if (item.id === form.value.id) {
          return {
            ...form.value,
            precio: Number(form.value.precio || 0)
          }
        }

        return item
      })

      $q.notify({
        type: 'positive',
        message: 'Servicio actualizado correctamente'
      })
    } else {
      const nuevoServicio = {
        ...form.value,
        id: Date.now(),
        precio: Number(form.value.precio || 0)
      }

      servicios.value.unshift(nuevoServicio)

      $q.notify({
        type: 'positive',
        message: 'Servicio registrado correctamente'
      })
    }

    saveStorage()
    dialog.value = false
  } finally {
    saving.value = false
  }
}

function remove(row) {
  $q.dialog({
    title: 'Eliminar servicio',
    message: `¿Deseas eliminar el combo ${row.combo}?`,
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
  }).onOk(() => {
    servicios.value = servicios.value.filter(item => item.id !== row.id)
    saveStorage()

    $q.notify({
      type: 'positive',
      message: 'Servicio eliminado correctamente'
    })
  })
}

onMounted(load)
</script>

<style scoped>
.servicios-page {
  min-height: 100vh;
  background: #faf7fb;
}

.page-hero {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  border-radius: 28px;
  padding: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 16px 40px rgba(233, 30, 99, 0.25);
}

.btn-glamur-white {
  background: white;
  color: #c2185b;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
}

.btn-glamur {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 800;
  border-radius: 16px;
}

.search-card,
.table-card {
  border-radius: 24px;
  overflow: hidden;
  background: white;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
}

.search-card {
  padding: 16px;
}

.table-card :deep(.q-table thead tr) {
  background: linear-gradient(135deg, #fce4ec, #f3e5f5);
  color: #880e4f;
}

.table-card :deep(.q-table th) {
  font-weight: 900;
  font-size: 13px;
}

.table-card :deep(.q-table tbody tr:hover) {
  background: #fff0f6;
}

.precio-badge {
  padding: 7px 12px;
  font-weight: 900;
}

.dialog-card {
  width: 520px;
  max-width: 96vw;
  border-radius: 24px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
}

.dialog-body {
  padding: 24px;
  background: white;
}

.dialog-actions {
  padding: 16px 22px;
  background: white;
  border-top: 1px solid #eeeeee;
}

@media (max-width: 600px) {
  .servicios-page {
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
    font-size: 25px;
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