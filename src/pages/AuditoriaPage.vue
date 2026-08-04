<template>
  <q-page class="q-pa-lg auditoria-page">
    <section class="auditoria-hero q-mb-lg">
      <div>
        <div class="hero-badge">Acceso exclusivo para administradores</div>
        <div class="text-h4 text-weight-bold text-white q-mt-sm">Bitácora de auditoría</div>
        <div class="text-subtitle2 text-white hero-subtitle">
          Revisa quién creó, modificó o eliminó información en AUREA
        </div>
      </div>

      <q-btn
        class="btn-white"
        icon="refresh"
        label="Actualizar"
        unelevated
        rounded
        :loading="loading"
        @click="cargarAuditorias"
      />
    </section>

    <div class="row q-col-gutter-md q-mb-lg">
      <div v-for="card in resumen" :key="card.titulo" class="col-12 col-sm-6 col-md-3">
        <q-card class="summary-card">
          <q-card-section class="row items-center justify-between no-wrap">
            <div>
              <div class="summary-title">{{ card.titulo }}</div>
              <div class="summary-value">{{ card.valor }}</div>
              <div class="summary-detail">{{ card.detalle }}</div>
            </div>
            <q-avatar :color="card.color" text-color="white" size="48px">
              <q-icon :name="card.icono" size="25px" />
            </q-avatar>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card class="filters-card q-mb-lg">
      <q-card-section>
        <div class="filters-header q-mb-md">
          <div>
            <div class="filters-title">Buscar movimientos</div>
            <div class="filters-subtitle">Combina filtros y consulta solo los registros necesarios</div>
          </div>
          <q-btn
            flat
            rounded
            icon="filter_alt_off"
            label="Limpiar filtros"
            color="pink-7"
            @click="limpiarFiltros"
          />
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6 col-md-3">
            <q-input v-model.trim="filtros.modulo" outlined dense clearable label="Módulo" placeholder="Ej. clientes">
              <template #prepend><q-icon name="category" color="pink" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-select
              v-model="filtros.accion"
              :options="acciones"
              outlined dense clearable emit-value map-options label="Acción"
            >
              <template #prepend><q-icon name="bolt" color="purple" /></template>
            </q-select>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-input v-model="filtros.usuario_id" type="number" min="1" outlined dense clearable label="ID de usuario">
              <template #prepend><q-icon name="person_search" color="indigo" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-3 filter-button">
            <q-btn
              class="full-width"
              color="pink-7"
              icon="search"
              label="Aplicar filtros"
              unelevated
              :loading="loading"
              @click="aplicarFiltros"
            />
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-input v-model="filtros.desde" type="date" outlined dense label="Desde">
              <template #prepend><q-icon name="event" color="teal" /></template>
            </q-input>
          </div>
          <div class="col-12 col-sm-6 col-md-3">
            <q-input v-model="filtros.hasta" type="date" outlined dense label="Hasta">
              <template #prepend><q-icon name="event_available" color="green" /></template>
            </q-input>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="table-card">
      <q-card-section class="table-header">
        <div>
          <div class="text-h6 text-weight-bold">Movimientos registrados</div>
          <div class="text-caption text-grey-7">{{ total }} registros encontrados</div>
        </div>
        <q-badge color="pink-7" rounded class="count-badge">Página {{ pagination.page }}</q-badge>
      </q-card-section>

      <q-separator />

      <q-table
        class="auditoria-table"
        flat
        row-key="id"
        :rows="rows"
        :columns="columns"
        :loading="loading"
        v-model:pagination="pagination"
        :rows-per-page-options="[10, 25, 50, 100]"
        no-data-label="No hay movimientos con los filtros seleccionados"
        @request="onRequest"
      >
        <template #body-cell-fecha="props">
          <q-td :props="props">
            <div class="text-weight-bold">{{ formatearFecha(props.row.created_at) }}</div>
            <div class="text-caption text-grey-7">ID #{{ props.row.id }}</div>
          </q-td>
        </template>

        <template #body-cell-usuario="props">
          <q-td :props="props">
            <div class="row items-center no-wrap q-gutter-sm">
              <q-avatar color="purple-7" text-color="white" size="34px" icon="person" />
              <div>
                <div class="text-weight-bold">{{ props.row.usuario_nombre || 'Sistema' }}</div>
                <div class="text-caption text-grey-7">{{ etiquetaRol(props.row.usuario_rol) }}</div>
              </div>
            </div>
          </q-td>
        </template>

        <template #body-cell-accion="props">
          <q-td :props="props">
            <q-badge :color="colorAccion(props.row.accion)" rounded class="action-badge">
              {{ etiquetaAccion(props.row.accion) }}
            </q-badge>
          </q-td>
        </template>

        <template #body-cell-modulo="props">
          <q-td :props="props">
            <div class="text-weight-bold text-pink-8">{{ props.row.modulo || 'sistema' }}</div>
            <div class="text-caption text-grey-7">
              {{ props.row.metodo }} · {{ props.row.codigo_respuesta || '—' }}
            </div>
          </q-td>
        </template>

        <template #body-cell-entidad="props">
          <q-td :props="props">{{ props.row.entidad_id || '—' }}</q-td>
        </template>

        <template #body-cell-detalles="props">
          <q-td :props="props" class="text-center">
            <q-btn round flat color="pink-7" icon="visibility" @click="abrirDetalle(props.row)">
              <q-tooltip>Ver detalle seguro</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <q-dialog v-model="detalleAbierto">
      <q-card class="detail-card">
        <q-card-section class="detail-header">
          <div>
            <div class="text-h6 text-weight-bold">Detalle del movimiento</div>
            <div class="text-caption">Registro #{{ detalle?.id }}</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="detalle" class="q-gutter-md">
          <div class="detail-grid">
            <div><span>Usuario</span><strong>{{ detalle.usuario_nombre || 'Sistema' }}</strong></div>
            <div><span>Rol</span><strong>{{ etiquetaRol(detalle.usuario_rol) }}</strong></div>
            <div><span>Acción</span><strong>{{ etiquetaAccion(detalle.accion) }}</strong></div>
            <div><span>Módulo</span><strong>{{ detalle.modulo || 'sistema' }}</strong></div>
            <div><span>Fecha</span><strong>{{ formatearFecha(detalle.created_at) }}</strong></div>
            <div><span>Respuesta</span><strong>{{ detalle.codigo_respuesta || '—' }}</strong></div>
            <div class="full"><span>Ruta</span><strong>{{ detalle.ruta || '—' }}</strong></div>
            <div class="full"><span>Dispositivo</span><strong class="wrap-text">{{ detalle.dispositivo || 'No registrado' }}</strong></div>
          </div>

          <div>
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Datos seguros registrados</div>
            <pre class="json-box">{{ datosFormateados(detalle.datos) }}</pre>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

const $q = useQuasar()
const loading = ref(false)
const rows = ref([])
const total = ref(0)
const detalle = ref(null)
const detalleAbierto = ref(false)

const filtros = reactive({
  modulo: '',
  accion: null,
  usuario_id: '',
  desde: '',
  hasta: ''
})

const pagination = ref({
  sortBy: 'id',
  descending: true,
  page: 1,
  rowsPerPage: 25,
  rowsNumber: 0
})

const acciones = [
  { label: 'Crear', value: 'crear' },
  { label: 'Actualizar', value: 'actualizar' },
  { label: 'Eliminar', value: 'eliminar' }
]

const columns = [
  { name: 'fecha', label: 'Fecha', field: 'created_at', align: 'left', sortable: false },
  { name: 'usuario', label: 'Usuario', field: 'usuario_nombre', align: 'left', sortable: false },
  { name: 'accion', label: 'Acción', field: 'accion', align: 'left', sortable: false },
  { name: 'modulo', label: 'Módulo', field: 'modulo', align: 'left', sortable: false },
  { name: 'entidad', label: 'Registro', field: 'entidad_id', align: 'center', sortable: false },
  { name: 'detalles', label: 'Detalle', field: 'id', align: 'center', sortable: false }
]

const resumen = computed(() => [
  { titulo: 'Registros', valor: total.value, detalle: 'Según filtros activos', icono: 'fact_check', color: 'pink-7' },
  { titulo: 'Página actual', valor: rows.value.length, detalle: 'Movimientos visibles', icono: 'view_list', color: 'purple-7' },
  { titulo: 'Creaciones', valor: rows.value.filter(row => row.accion === 'crear').length, detalle: 'En esta página', icono: 'add_circle', color: 'green-7' },
  { titulo: 'Cambios y bajas', valor: rows.value.filter(row => row.accion !== 'crear').length, detalle: 'En esta página', icono: 'edit_note', color: 'orange-7' }
])

function parametros() {
  const params = {
    page: pagination.value.page,
    por_pagina: pagination.value.rowsPerPage
  }

  Object.entries(filtros).forEach(([key, value]) => {
    if (value !== '' && value !== null && value !== undefined) params[key] = value
  })

  return params
}

async function cargarAuditorias() {
  if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
    $q.notify({ type: 'warning', message: 'La fecha inicial no puede ser posterior a la fecha final' })
    return
  }

  loading.value = true

  try {
    const { data } = await api.get('/auditorias', { params: parametros() })
    rows.value = Array.isArray(data?.data) ? data.data : []
    total.value = Number(data?.total || 0)
    pagination.value.page = Number(data?.current_page || pagination.value.page)
    pagination.value.rowsPerPage = Number(data?.per_page || pagination.value.rowsPerPage)
    pagination.value.rowsNumber = total.value
  } catch (error) {
    rows.value = []
    total.value = 0
    pagination.value.rowsNumber = 0
    $q.notify({
      type: 'negative',
      message: error?.response?.data?.message || 'No se pudo cargar la bitácora de auditoría'
    })
  } finally {
    loading.value = false
  }
}

function onRequest({ pagination: nueva }) {
  pagination.value.page = nueva.page
  pagination.value.rowsPerPage = nueva.rowsPerPage
  cargarAuditorias()
}

function aplicarFiltros() {
  pagination.value.page = 1
  cargarAuditorias()
}

function limpiarFiltros() {
  filtros.modulo = ''
  filtros.accion = null
  filtros.usuario_id = ''
  filtros.desde = ''
  filtros.hasta = ''
  aplicarFiltros()
}

function abrirDetalle(row) {
  detalle.value = row
  detalleAbierto.value = true
}

function etiquetaAccion(value) {
  return ({ crear: 'Crear', actualizar: 'Actualizar', eliminar: 'Eliminar' })[value] || value || 'Sin acción'
}

function colorAccion(value) {
  return ({ crear: 'green-7', actualizar: 'orange-7', eliminar: 'red-7' })[value] || 'grey-7'
}

function etiquetaRol(value) {
  return value === 'admin' ? 'Administrador' : value === 'empleado' ? 'Empleado' : (value || 'Sistema')
}

function formatearFecha(value) {
  if (!value) return 'Sin fecha'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleString('es-BO', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

function datosFormateados(value) {
  if (!value || (typeof value === 'object' && Object.keys(value).length === 0)) return 'Sin datos adicionales'
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

onMounted(cargarAuditorias)
</script>

<style scoped>
.auditoria-page {
  min-height: 100vh;
  background: radial-gradient(circle at top left, rgba(233, 30, 99, 0.10), transparent 32%), linear-gradient(180deg, #fff7fb 0%, #f7f7fb 100%);
}
.auditoria-hero {
  background: linear-gradient(135deg, #15111f, #9c27b0 55%, #e91e63);
  border-radius: 30px;
  padding: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  box-shadow: 0 18px 45px rgba(156, 39, 176, 0.28);
}
.hero-badge { display: inline-block; padding: 7px 14px; border-radius: 999px; color: white; font-weight: 800; background: rgba(255,255,255,.16); }
.hero-subtitle { opacity: .9; }
.btn-white { background: white; color: #c2185b; font-weight: 900; padding: 10px 18px; }
.summary-card, .filters-card, .table-card { border-radius: 24px; background: white; box-shadow: 0 14px 35px rgba(156,39,176,.12); border: 1px solid rgba(233,30,99,.08); }
.summary-title { color: #777; font-size: 12px; font-weight: 800; }
.summary-value { color: #222; font-size: 24px; font-weight: 900; margin-top: 3px; }
.summary-detail { color: #888; font-size: 11px; }
.filters-title { color: #c2185b; font-size: 18px; font-weight: 900; }
.filters-subtitle { color: #777; font-size: 13px; }
.filters-header, .table-header, .detail-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
.filter-button { display: flex; align-items: center; }
.table-card { overflow: hidden; }
.table-header { padding: 22px 24px; }
.count-badge, .action-badge { font-weight: 900; padding: 7px 11px; }
.auditoria-table :deep(.q-table__middle) { overflow-x: auto; }
.auditoria-table :deep(.q-table thead tr) { background: linear-gradient(135deg, #fce4ec, #f3e5f5); color: #880e4f; }
.auditoria-table :deep(.q-table th) { font-weight: 900; }
.auditoria-table :deep(.q-table tbody tr:hover) { background: #fff0f6; }
.detail-card { width: 760px; max-width: 94vw; border-radius: 24px; overflow: hidden; }
.detail-header { color: white; background: linear-gradient(135deg, #15111f, #e91e63); padding: 20px 24px; }
.detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
.detail-grid > div { background: #faf7fb; border-radius: 14px; padding: 12px; display: flex; flex-direction: column; gap: 3px; }
.detail-grid span { color: #777; font-size: 11px; font-weight: 800; text-transform: uppercase; }
.detail-grid .full { grid-column: 1 / -1; }
.wrap-text { overflow-wrap: anywhere; }
.json-box { margin: 0; max-height: 280px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; padding: 16px; border-radius: 16px; color: #f8f8f2; background: #21182a; font-size: 12px; }
@media (max-width: 700px) {
  .auditoria-page { padding: 12px; }
  .auditoria-hero { padding: 22px; border-radius: 22px; flex-direction: column; align-items: flex-start; }
  .auditoria-hero .q-btn { width: 100%; }
  .filters-header, .table-header { align-items: flex-start; flex-direction: column; }
  .filters-header .q-btn { width: 100%; }
  .detail-grid { grid-template-columns: 1fr; }
  .detail-grid .full { grid-column: auto; }
}
</style>
