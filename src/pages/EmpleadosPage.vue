<template>
  <q-page class="glamur-page empleados-page">

    <!-- HERO -->
    <section class="glamur-hero q-mb-md">
      <div>
        <div class="glamur-eyebrow">
          <q-icon name="groups" />
          Personal del salón
        </div>

        <div class="glamur-title q-mt-sm">
          Empleados
        </div>

        <div class="glamur-subtitle q-mt-xs">
          Administra el personal, especialidades, estado laboral y datos de contacto.
        </div>
      </div>

      <div class="hero-actions">
        <q-btn
          icon="add"
          label="Nuevo empleado"
          class="glamur-btn-light"
          unelevated
          no-caps
          @click="abrirDialogo()"
        />
      </div>
    </section>

    <q-linear-progress
      v-if="loading"
      indeterminate
      color="pink"
      class="q-mb-md"
    />

    <!-- MÉTRICAS -->
    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-4">
        <q-card class="glamur-card glamur-card-hover metric-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="metric-label">Total empleados</div>
                <div class="metric-value">{{ resumen.total }}</div>
                <div class="metric-detail">Registrados en el sistema</div>
              </div>

              <q-avatar class="bg-purple-7" size="58px">
                <q-icon name="groups" color="white" size="30px" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="glamur-card glamur-card-hover metric-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="metric-label">Activos</div>
                <div class="metric-value">{{ resumen.activos }}</div>
                <div class="metric-detail">Disponibles para trabajar</div>
              </div>

              <q-avatar class="bg-green-7" size="58px">
                <q-icon name="verified" color="white" size="30px" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-4">
        <q-card class="glamur-card glamur-card-hover metric-card">
          <q-card-section>
            <div class="row items-center justify-between no-wrap">
              <div>
                <div class="metric-label">Inactivos</div>
                <div class="metric-value">{{ resumen.inactivos }}</div>
                <div class="metric-detail">No disponibles actualmente</div>
              </div>

              <q-avatar class="bg-orange-7" size="58px">
                <q-icon name="person_off" color="white" size="30px" />
              </q-avatar>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- FILTROS -->
    <q-card class="glamur-card q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md items-end">
          <div class="col-12 col-md-5">
            <q-input
              v-model.trim="filtros.buscar"
              label="Buscar empleado"
              placeholder="Nombre, teléfono, CI, cargo o especialidad..."
              outlined
              rounded
              dense
              clearable
              bg-color="white"
              @keyup.enter="load"
            >
              <template #prepend>
                <q-icon name="search" color="pink" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.estado"
              :options="estadoOptions"
              label="Estado"
              outlined
              rounded
              dense
              emit-value
              map-options
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="toggle_on" color="pink" />
              </template>
            </q-select>
          </div>

          <div class="col-12 col-md-2">
            <q-input
              v-model.trim="filtros.especialidad"
              label="Especialidad"
              outlined
              rounded
              dense
              clearable
              bg-color="white"
              @keyup.enter="load"
            >
              <template #prepend>
                <q-icon name="spa" color="pink" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-2">
            <q-btn
              icon="filter_alt"
              label="Filtrar"
              class="glamur-btn full-width"
              unelevated
              no-caps
              :loading="loading"
              @click="load"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- TABLA -->
    <q-card class="glamur-card">
      <q-card-section class="row items-center justify-between q-gutter-sm">
        <div>
          <div class="glamur-section-title">
            Lista de empleados
          </div>

          <div class="glamur-section-subtitle">
            Crea, edita o desactiva el personal registrado.
          </div>
        </div>

        <q-btn
          icon="refresh"
          label="Actualizar"
          flat
          color="pink-7"
          no-caps
          :loading="loading"
          @click="load"
        />
      </q-card-section>

      <q-separator />

      <q-card-section>
        <div v-if="empleados.length === 0 && !loading" class="empty-state">
          <q-icon name="groups" size="58px" color="grey-5" />
          <div>No hay empleados registrados todavía.</div>
          <q-btn
            label="Registrar primer empleado"
            icon="add"
            color="pink-7"
            unelevated
            no-caps
            @click="abrirDialogo()"
          />
        </div>

        <q-table
          v-else
          :rows="empleados"
          :columns="columns"
          row-key="id"
          flat
          bordered
          class="glamur-table"
          :loading="loading"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-nombre="props">
            <q-td :props="props">
              <div class="employee-name">
                {{ props.row.nombre }}
              </div>

              <div class="employee-subtitle">
                {{ props.row.cargo || 'Sin cargo' }}
              </div>
            </q-td>
          </template>

          <template #body-cell-contacto="props">
            <q-td :props="props">
              <div class="contact-line">
                <q-icon name="call" size="16px" />
                {{ props.row.telefono || 'Sin teléfono' }}
              </div>

              <div class="contact-line">
                <q-icon name="badge" size="16px" />
                {{ props.row.ci || 'Sin CI' }}
              </div>
            </q-td>
          </template>

          <template #body-cell-especialidad="props">
            <q-td :props="props">
              <q-badge color="purple" rounded>
                {{ props.row.especialidad || 'General' }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-comision_porcentaje="props">
            <q-td :props="props">
              <div class="money-text">
                {{ money(props.row.comision_porcentaje) }}%
              </div>
            </q-td>
          </template>

          <template #body-cell-salario_base="props">
            <q-td :props="props">
              <div class="money-text">
                Bs {{ money(props.row.salario_base) }}
              </div>
            </q-td>
          </template>

          <template #body-cell-activo="props">
            <q-td :props="props">
              <q-badge
                :color="props.row.activo ? 'positive' : 'warning'"
                rounded
              >
                {{ props.row.activo ? 'Activo' : 'Inactivo' }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-acciones="props">
            <q-td :props="props">
              <div class="row justify-end q-gutter-xs no-wrap">
                <q-btn
                  dense
                  round
                  flat
                  icon="edit"
                  color="primary"
                  @click="abrirDialogo(props.row)"
                >
                  <q-tooltip>Editar</q-tooltip>
                </q-btn>

                <q-btn
                  dense
                  round
                  flat
                  icon="delete"
                  color="negative"
                  @click="confirmarEliminar(props.row)"
                >
                  <q-tooltip>Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- DIALOGO CREAR / EDITAR -->
    <q-dialog
      v-model="dialog"
      persistent
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="employee-dialog">
        <q-card-section class="dialog-header">
          <div>
            <div class="dialog-title">
              {{ editando ? 'Editar empleado' : 'Nuevo empleado' }}
            </div>

            <div class="dialog-subtitle">
              Completa los datos del personal del salón.
            </div>
          </div>

          <q-btn
            icon="close"
            flat
            round
            dense
            color="white"
            @click="cerrarDialogo"
          />
        </q-card-section>

        <q-form @submit.prevent="guardarEmpleado">
          <q-card-section class="dialog-body">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model.trim="form.nombre"
                  label="Nombre completo *"
                  outlined
                  rounded
                  dense
                  bg-color="white"
                  :rules="[val => !!val || 'El nombre es obligatorio']"
                >
                  <template #prepend>
                    <q-icon name="person" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model.trim="form.telefono"
                  label="Teléfono"
                  outlined
                  rounded
                  dense
                  bg-color="white"
                >
                  <template #prepend>
                    <q-icon name="call" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model.trim="form.ci"
                  label="CI"
                  outlined
                  rounded
                  dense
                  bg-color="white"
                >
                  <template #prepend>
                    <q-icon name="badge" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model.trim="form.email"
                  label="Correo electrónico"
                  type="email"
                  outlined
                  rounded
                  dense
                  bg-color="white"
                >
                  <template #prepend>
                    <q-icon name="email" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model.trim="form.cargo"
                  label="Cargo"
                  placeholder="Ej: Estilista, recepcionista..."
                  outlined
                  rounded
                  dense
                  bg-color="white"
                >
                  <template #prepend>
                    <q-icon name="work" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-6">
                <q-input
                  v-model.trim="form.especialidad"
                  label="Especialidad"
                  placeholder="Ej: Uñas, cejas, pestañas..."
                  outlined
                  rounded
                  dense
                  bg-color="white"
                >
                  <template #prepend>
                    <q-icon name="spa" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.comision_porcentaje"
                  label="Comisión %"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  outlined
                  rounded
                  dense
                  bg-color="white"
                >
                  <template #prepend>
                    <q-icon name="percent" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.salario_base"
                  label="Salario base"
                  type="number"
                  min="0"
                  step="0.01"
                  outlined
                  rounded
                  dense
                  bg-color="white"
                >
                  <template #prepend>
                    <q-icon name="payments" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.fecha_ingreso"
                  label="Fecha de ingreso"
                  type="date"
                  outlined
                  rounded
                  dense
                  bg-color="white"
                >
                  <template #prepend>
                    <q-icon name="event" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  v-model.trim="form.direccion"
                  label="Dirección"
                  outlined
                  rounded
                  dense
                  bg-color="white"
                >
                  <template #prepend>
                    <q-icon name="location_on" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-input
                  v-model.trim="form.observaciones"
                  label="Observaciones"
                  type="textarea"
                  outlined
                  rounded
                  dense
                  bg-color="white"
                  autogrow
                >
                  <template #prepend>
                    <q-icon name="notes" color="pink" />
                  </template>
                </q-input>
              </div>

              <div class="col-12">
                <q-toggle
                  v-model="form.activo"
                  color="pink"
                  checked-icon="check"
                  unchecked-icon="close"
                  label="Empleado activo"
                />
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions align="right" class="q-pa-md">
            <q-btn
              label="Cancelar"
              flat
              color="grey-7"
              no-caps
              @click="cerrarDialogo"
            />

            <q-btn
              :label="editando ? 'Guardar cambios' : 'Registrar empleado'"
              icon="save"
              color="pink-7"
              unelevated
              no-caps
              type="submit"
              :loading="saving"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

defineOptions({
  name: 'EmpleadosPage'
})

const $q = useQuasar()

const loading = ref(false)
const saving = ref(false)
const dialog = ref(false)
const editando = ref(false)
const empleadoEditandoId = ref(null)

const empleados = ref([])

const resumen = ref({
  total: 0,
  activos: 0,
  inactivos: 0
})

const filtros = ref({
  buscar: '',
  estado: 'todos',
  especialidad: ''
})

const form = ref(formBase())

const estadoOptions = [
  {
    label: 'Todos',
    value: 'todos'
  },
  {
    label: 'Activos',
    value: 'activo'
  },
  {
    label: 'Inactivos',
    value: 'inactivo'
  }
]

const columns = [
  {
    name: 'nombre',
    label: 'Empleado',
    field: 'nombre',
    align: 'left',
    sortable: true
  },
  {
    name: 'contacto',
    label: 'Contacto',
    field: 'telefono',
    align: 'left',
    sortable: false
  },
  {
    name: 'especialidad',
    label: 'Especialidad',
    field: 'especialidad',
    align: 'center',
    sortable: true
  },
  {
    name: 'comision_porcentaje',
    label: 'Comisión',
    field: 'comision_porcentaje',
    align: 'right',
    sortable: true
  },
  {
    name: 'salario_base',
    label: 'Salario',
    field: 'salario_base',
    align: 'right',
    sortable: true
  },
  {
    name: 'activo',
    label: 'Estado',
    field: 'activo',
    align: 'center',
    sortable: true
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'right',
    sortable: false
  }
]

const empleadosActivos = computed(() => {
  return empleados.value.filter((empleado) => empleado.activo)
})

function formBase() {
  return {
    nombre: '',
    telefono: '',
    ci: '',
    email: '',
    cargo: '',
    especialidad: '',
    comision_porcentaje: 0,
    salario_base: 0,
    direccion: '',
    fecha_ingreso: '',
    activo: true,
    observaciones: ''
  }
}

function normalizarEmpleado(empleado = {}) {
  return {
    ...empleado,
    activo: Boolean(empleado.activo),
    comision_porcentaje: Number(empleado.comision_porcentaje || 0),
    salario_base: Number(empleado.salario_base || 0),
    fecha_ingreso: empleado.fecha_ingreso ? String(empleado.fecha_ingreso).slice(0, 10) : ''
  }
}

function normalizarPayload() {
  return {
    nombre: form.value.nombre,
    telefono: form.value.telefono,
    ci: form.value.ci,
    email: form.value.email,
    cargo: form.value.cargo,
    especialidad: form.value.especialidad,
    comision_porcentaje: Number(form.value.comision_porcentaje || 0),
    salario_base: Number(form.value.salario_base || 0),
    direccion: form.value.direccion,
    fecha_ingreso: form.value.fecha_ingreso || null,
    activo: Boolean(form.value.activo),
    observaciones: form.value.observaciones
  }
}

function money(value) {
  return Number(value || 0).toLocaleString('es-BO', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

function getErrorMessage(error, fallback = 'Ocurrió un error') {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || fallback
}

async function load() {
  loading.value = true

  try {
    const { data } = await api.get('/empleados', {
      params: {
        buscar: filtros.value.buscar || '',
        estado: filtros.value.estado || 'todos',
        especialidad: filtros.value.especialidad || ''
      }
    })

    empleados.value = Array.isArray(data?.empleados)
      ? data.empleados.map(normalizarEmpleado)
      : []

    resumen.value = {
      total: Number(data?.resumen?.total ?? empleados.value.length),
      activos: Number(data?.resumen?.activos ?? empleadosActivos.value.length),
      inactivos: Number(data?.resumen?.inactivos ?? 0)
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error, 'No se pudieron cargar los empleados')
    })
  } finally {
    loading.value = false
  }
}

function abrirDialogo(empleado = null) {
  if (empleado) {
    editando.value = true
    empleadoEditandoId.value = empleado.id
    form.value = {
      ...formBase(),
      ...normalizarEmpleado(empleado)
    }
  } else {
    editando.value = false
    empleadoEditandoId.value = null
    form.value = formBase()
  }

  dialog.value = true
}

function cerrarDialogo() {
  dialog.value = false
  editando.value = false
  empleadoEditandoId.value = null
  form.value = formBase()
}

async function guardarEmpleado() {
  saving.value = true

  try {
    const payload = normalizarPayload()

    if (editando.value && empleadoEditandoId.value) {
      await api.put(`/empleados/${empleadoEditandoId.value}`, payload)

      $q.notify({
        type: 'positive',
        message: 'Empleado actualizado correctamente'
      })
    } else {
      await api.post('/empleados', payload)

      $q.notify({
        type: 'positive',
        message: 'Empleado registrado correctamente'
      })
    }

    cerrarDialogo()
    await load()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error, 'No se pudo guardar el empleado')
    })
  } finally {
    saving.value = false
  }
}

function confirmarEliminar(empleado) {
  $q.dialog({
    title: 'Eliminar empleado',
    message: `¿Deseas eliminar a ${empleado.nombre}? Se moverá al historial interno de Laravel como eliminado.`,
    persistent: true,
    ok: {
      label: 'Sí, eliminar',
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
      await api.delete(`/empleados/${empleado.id}`)

      $q.notify({
        type: 'positive',
        message: 'Empleado eliminado correctamente'
      })

      await load()
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: getErrorMessage(error, 'No se pudo eliminar el empleado')
      })
    }
  })
}

onMounted(load)
</script>

<style scoped>
.empleados-page {
  padding-bottom: 36px;
}

.hero-actions {
  min-width: 180px;
}

.metric-card {
  min-height: 138px;
}

.metric-label {
  color: #7a6f80;
  font-size: 13px;
  font-weight: 850;
}

.metric-value {
  color: #241329;
  font-size: 26px;
  font-weight: 950;
  line-height: 1.2;
  margin-top: 5px;
}

.metric-detail {
  color: #8a7f91;
  font-size: 12px;
  margin-top: 4px;
}

.empty-state {
  min-height: 240px;
  display: grid;
  place-items: center;
  gap: 10px;
  text-align: center;
  color: #7a6f80;
  font-weight: 800;
}

.glamur-table {
  border-radius: 18px;
  overflow: hidden;
}

.employee-name {
  color: #c2185b;
  font-weight: 950;
}

.employee-subtitle {
  color: #7a6f80;
  font-size: 12px;
  margin-top: 2px;
}

.contact-line {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #6a536d;
  font-size: 12px;
  line-height: 1.5;
}

.money-text {
  color: #2e7d32;
  font-weight: 950;
}

.employee-dialog {
  width: 900px;
  max-width: 96vw;
  border-radius: 26px;
  overflow: hidden;
}

.dialog-header {
  color: white;
  background: linear-gradient(135deg, #15111f, #e91e63);
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 22px;
}

.dialog-title {
  font-size: 24px;
  font-weight: 950;
}

.dialog-subtitle {
  color: rgba(255, 255, 255, 0.80);
  font-size: 13px;
}

.dialog-body {
  background: #fff7fb;
  max-height: 68vh;
  overflow-y: auto;
}

@media (max-width: 700px) {
  .hero-actions {
    min-width: 100%;
  }

  .employee-dialog {
    width: 100%;
    max-width: 100%;
    border-radius: 0;
  }

  .dialog-title {
    font-size: 21px;
  }
}
</style>