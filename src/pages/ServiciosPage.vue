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

      <div class="hero-actions">
        <q-btn
          class="btn-glamur-white"
          icon="playlist_add"
          label="Cargar combos base"
          @click="confirmarCargarBase"
        />

        <q-btn
          class="btn-glamur-white"
          icon="add"
          label="Nuevo servicio"
          @click="openDialog"
        />
      </div>
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
        :loading="loading"
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

        <template #body-cell-activo="props">
          <q-td :props="props" class="text-center">
            <q-badge
              rounded
              :color="props.row.activo ? 'green' : 'grey'"
              class="estado-badge"
            >
              {{ props.row.activo ? 'Activo' : 'Inactivo' }}
            </q-badge>
          </q-td>
        </template>

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
                round
                unelevated
                size="sm"
                color="negative"
                icon="delete"
                @click="remove(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog
      v-model="dialog"
      persistent
      :maximized="$q.screen.lt.sm"
    >
      <q-card class="dialog-card dialog-card-main">
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
            <q-select
              v-model="form.servicio"
              :options="categorias"
              label="Servicio *"
              outlined
              dense
              rounded
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="spa" color="pink" />
              </template>
            </q-select>

            <q-input
              v-model.trim="form.combo"
              label="Nombre del combo *"
              outlined
              dense
              rounded
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="local_offer" color="pink" />
              </template>
            </q-input>

            <q-input
              v-model.trim="form.detalle"
              label="Detalle del combo *"
              type="textarea"
              autogrow
              outlined
              dense
              rounded
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="description" color="pink" />
              </template>
            </q-input>

            <q-input
              v-model.number="form.precio"
              type="number"
              label="Precio Bs. *"
              outlined
              dense
              rounded
              min="0"
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="payments" color="green" />
              </template>
            </q-input>

            <q-toggle
              v-model="form.activo"
              color="green"
              label="Servicio activo"
              checked-icon="check"
              unchecked-icon="close"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn
            class="btn-cancelar"
            label="Cancelar"
            icon="close"
            unelevated
            v-close-popup
          />

          <q-btn
            class="btn-glamur"
            :label="form.id ? 'Guardar cambios' : 'Registrar servicio'"
            icon="save"
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
import { api } from 'boot/axios'

defineOptions({
  name: 'ServiciosPage'
})

const $q = useQuasar()

const servicios = ref([])
const search = ref('')
const dialog = ref(false)
const loading = ref(false)
const saving = ref(false)
const loadingBase = ref(false)

const categorias = [
  'CEJAS Y PESTAÑAS',
  'MAQUILLAJE Y CABELLO',
  'OTROS SERVICIOS'
]

const combosBase = [
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'CLEAN BROWS',
    detalle: 'Depilación + Visagismo',
    precio: 25,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'BROWS PRO',
    detalle: 'Henna + Depilación y Visagismo',
    precio: 80,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'LAMI BROWS',
    detalle: 'Laminado + Vitaminas + Depilación y Visagismo',
    precio: 80,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'LASH PERFECT',
    detalle: 'Lifting + Tinte efecto rimel',
    precio: 85,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'PERFECT BROWS',
    detalle: 'Laminado + Henna + Depilación + Visagismo',
    precio: 135,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'GLOW UP EXPRESS',
    detalle: 'Laminado + Henna + Depilación y Visagismo + Lifting + Tinte efecto rimel',
    precio: 220,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'PERFECT EXPRESS',
    detalle: 'Henna + Depilación y Visagismo + Lifting + Tinte efecto rimel',
    precio: 165,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'LASH & BROWS EXPRESS',
    detalle: 'Laminado + Lifting + Tinte efecto rimel + Vitaminas + Depilación y Visagismo',
    precio: 165,
    activo: true
  },
  {
    servicio: 'CEJAS Y PESTAÑAS',
    combo: 'RETOQUE BROWS PRO',
    detalle: 'Henna',
    precio: 40,
    activo: true
  }
]

const form = ref({
  id: null,
  servicio: 'CEJAS Y PESTAÑAS',
  combo: '',
  detalle: '',
  precio: 0,
  activo: true
})

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
    name: 'activo',
    label: 'Estado',
    field: 'activo',
    align: 'center'
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

const filteredServicios = computed(() => {
  const texto = normalizar(search.value)

  if (!texto) return servicios.value

  return servicios.value.filter(item => {
    return normalizar(item.servicio).includes(texto) ||
      normalizar(item.combo).includes(texto) ||
      normalizar(item.detalle).includes(texto)
  })
})

function money(value) {
  return Number(value || 0).toFixed(2)
}

function normalizar(valor) {
  return String(valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function responseToArray(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.data)) return data.data
  if (Array.isArray(data?.servicios)) return data.servicios
  return []
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
    const { data } = await api.get('/servicios')
    servicios.value = responseToArray(data)
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    loading.value = false
  }
}

function openDialog() {
  form.value = {
    id: null,
    servicio: 'CEJAS Y PESTAÑAS',
    combo: '',
    detalle: '',
    precio: 0,
    activo: true
  }

  dialog.value = true
}

function edit(row) {
  form.value = {
    id: row.id,
    servicio: row.servicio || 'CEJAS Y PESTAÑAS',
    combo: row.combo || '',
    detalle: row.detalle || '',
    precio: Number(row.precio || 0),
    activo: row.activo !== false
  }

  dialog.value = true
}

async function save() {
  if (!form.value.servicio) {
    $q.notify({
      type: 'warning',
      message: 'El servicio es obligatorio'
    })

    return
  }

  if (!form.value.combo) {
    $q.notify({
      type: 'warning',
      message: 'El nombre del combo es obligatorio'
    })

    return
  }

  if (!form.value.detalle) {
    $q.notify({
      type: 'warning',
      message: 'El detalle del combo es obligatorio'
    })

    return
  }

  if (Number(form.value.precio || 0) <= 0) {
    $q.notify({
      type: 'warning',
      message: 'El precio debe ser mayor a 0'
    })

    return
  }

  saving.value = true

  try {
    const payload = {
      servicio: form.value.servicio,
      combo: form.value.combo,
      detalle: form.value.detalle,
      precio: Number(form.value.precio || 0),
      activo: form.value.activo
    }

    if (form.value.id) {
      await api.put(`/servicios/${form.value.id}`, payload)

      $q.notify({
        type: 'positive',
        message: 'Servicio actualizado correctamente'
      })
    } else {
      await api.post('/servicios', payload)

      $q.notify({
        type: 'positive',
        message: 'Servicio registrado correctamente'
      })
    }

    dialog.value = false
    await load()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    saving.value = false
  }
}

function remove(row) {
  $q.dialog({
    title: 'Eliminar servicio',
    message: `¿Seguro que deseas eliminar el combo "${row.combo}"?`,
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
      await api.delete(`/servicios/${row.id}`)

      $q.notify({
        type: 'positive',
        message: 'Servicio eliminado correctamente'
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

function confirmarCargarBase() {
  $q.dialog({
    title: 'Cargar combos base',
    message: 'Esto registrará o actualizará los combos principales de Cejas y Pestañas.',
    persistent: true,
    ok: {
      label: 'Cargar',
      color: 'positive',
      unelevated: true
    },
    cancel: {
      label: 'Cancelar',
      color: 'grey-7',
      flat: true
    }
  }).onOk(async () => {
    await cargarCombosBase()
  })
}

async function cargarCombosBase() {
  loadingBase.value = true

  try {
    for (const combo of combosBase) {
      const existente = servicios.value.find(item => {
        return normalizar(item.combo) === normalizar(combo.combo)
      })

      if (existente?.id) {
        await api.put(`/servicios/${existente.id}`, combo)
      } else {
        await api.post('/servicios', combo)
      }
    }

    $q.notify({
      type: 'positive',
      message: 'Combos base cargados correctamente'
    })

    await load()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    loadingBase.value = false
  }
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

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.btn-glamur-white {
  background: white;
  color: #c2185b;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
  box-shadow: 0 10px 24px rgba(20, 10, 30, 0.18);
}

.btn-glamur {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
  box-shadow: 0 10px 24px rgba(233, 30, 99, 0.25);
}

.btn-cancelar {
  background: #f2f2f5;
  color: #666;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
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

.table-card :deep(.q-table__middle) {
  overflow-x: auto;
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

.precio-badge,
.estado-badge {
  padding: 6px 10px;
  font-weight: 800;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.dialog-card {
  width: 520px;
  max-width: 96vw;
  max-height: 92vh;
  border-radius: 24px;
  overflow: hidden;
}

.dialog-card-main {
  display: flex;
  flex-direction: column;
}

.dialog-header {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  position: sticky;
  top: 0;
  z-index: 3;
}

.dialog-body {
  background: #ffffff;
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.dialog-actions {
  padding: 16px 22px;
  background: white;
  border-top: 1px solid #eee;
  position: sticky;
  bottom: 0;
  z-index: 4;
  box-shadow: 0 -8px 18px rgba(20, 10, 30, 0.06);
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
    font-size: 26px;
  }

  .hero-actions,
  .btn-glamur-white {
    width: 100%;
  }

  .hero-actions {
    flex-direction: column;
  }

  .dialog-card {
    width: 100%;
    max-width: 100%;
    height: 100vh;
    max-height: 100vh;
    border-radius: 0;
  }

  .dialog-body {
    padding: 18px;
    padding-bottom: 110px;
  }

  .dialog-actions {
    flex-wrap: wrap;
    gap: 10px;
    padding: 12px 16px 18px;
  }

  .dialog-actions .q-btn {
    flex: 1;
    min-width: 140px;
  }
}
</style>