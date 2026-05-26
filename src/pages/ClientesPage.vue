<template>
  <q-page class="q-pa-lg clientes-page">

    <!-- HEADER -->
    <div class="page-header q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-primary">
          👥 Clientes
        </div>

        <div class="text-grey-7">
          Registro y administración de clientes
        </div>
      </div>

      <div class="header-actions">
        <q-btn
          icon="contacts"
          label="Importar contactos"
          class="btn-importar"
          unelevated
          rounded
          @click="abrirImportarContactos"
        />

        <q-btn
          icon="add"
          label="Nuevo Cliente"
          class="btn-glamur"
          unelevated
          rounded
          @click="openDialog"
        />
      </div>
    </div>

    <!-- BUSCADOR CLIENTES -->
    <q-card class="buscador-card q-mb-md" flat bordered>
      <div class="buscador-row">
        <q-input
          v-model="busquedaCliente"
          class="buscador-input"
          outlined
          rounded
          dense
          clearable
          bg-color="white"
          debounce="200"
          placeholder="Buscar por nombre, teléfono o código de cliente..."
        >
          <template #prepend>
            <q-icon name="search" color="pink" />
          </template>
        </q-input>

        <q-badge class="buscador-badge" rounded>
          {{ clientesFiltradosTabla.length }} de {{ clientes.length }}
        </q-badge>
      </div>
    </q-card>

    <!-- TABLA CLIENTES -->
    <q-card class="card-table">
      <q-table
        :rows="clientesFiltradosTabla"
        :columns="columns"
        row-key="id"
        :loading="loading"
        :no-data-label="busquedaCliente ? 'No se encontraron clientes con esa búsqueda' : 'No hay clientes registrados'"
        flat
        bordered
        :rows-per-page-options="[5, 10, 20, 50]"
      >
        <!-- NOMBRE -->
        <template #body-cell-nombre="props">
          <q-td :props="props">
            <div class="text-weight-bold text-pink-7">
              {{ props.row.nombre || 'Sin nombre' }}
            </div>

            <div class="text-caption text-grey-7">
              Cliente Glamur
            </div>
          </q-td>
        </template>

        <!-- TELÉFONO -->
        <template #body-cell-telefono="props">
          <q-td :props="props">
            <div class="telefono-box">
              <q-icon name="phone" color="green" size="18px" />

              <span>
                {{ props.row.telefono || 'Sin número' }}
              </span>
            </div>
          </q-td>
        </template>

        <!-- ACCIONES -->
        <template #body-cell-actions="props">
          <q-td :props="props" class="text-center">
            <div class="acciones">
              <q-btn
                icon="edit"
                round
                unelevated
                size="sm"
                color="primary"
                @click="edit(props.row)"
              >
                <q-tooltip>Editar</q-tooltip>
              </q-btn>

              <q-btn
                icon="delete"
                round
                unelevated
                size="sm"
                color="negative"
                @click="remove(props.row)"
              >
                <q-tooltip>Eliminar</q-tooltip>
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </q-card>

    <!-- DIALOG CREAR / EDITAR CLIENTE -->
    <q-dialog v-model="dialog" persistent>
      <q-card class="dialog-card">

        <q-card-section class="dialog-header row items-center">
          <div class="text-h6 text-weight-bold">
            {{ form.id ? '✏️ Editar cliente' : '👤 Nuevo cliente' }}
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
              v-model.trim="form.nombre"
              label="Nombre completo *"
              outlined
              rounded
              bg-color="white"
            >
              <template #prepend>
                <q-icon name="person" color="pink" />
              </template>
            </q-input>

            <q-input
              v-model.trim="form.telefono"
              label="Número de teléfono *"
              outlined
              rounded
              bg-color="white"
              type="tel"
            >
              <template #prepend>
                <q-icon name="phone" color="green" />
              </template>
            </q-input>
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

    <!-- DIALOG IMPORTAR CONTACTOS -->
    <q-dialog
      v-model="dialogContactos"
      persistent
      :maximized="$q.screen.lt.sm"
      transition-show="slide-up"
      transition-hide="slide-down"
    >
      <q-card class="dialog-contactos">

        <!-- CABECERA FIJA -->
        <q-card-section class="dialog-header contactos-header row items-center">
          <div>
            <div class="text-h6 text-weight-bold">
              📱 Importar contactos
            </div>

            <div class="text-caption text-white">
              Selecciona contactos del teléfono para guardarlos como clientes
            </div>
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

        <!-- BUSCADOR Y BOTONES SUPERIORES -->
        <q-card-section class="contactos-toolbar">
          <q-input
            v-model.trim="buscarContacto"
            label="Buscar por nombre o teléfono"
            outlined
            rounded
            dense
            clearable
            bg-color="white"
          >
            <template #prepend>
              <q-icon name="search" color="pink" />
            </template>
          </q-input>

          <div class="contactos-info">
            <q-chip color="pink" text-color="white" icon="contacts">
              {{ contactosFiltrados.length }} contacto(s)
            </q-chip>

            <q-chip color="green" text-color="white" icon="person_add">
              {{ contactosNuevosFiltrados.length }} nuevo(s)
            </q-chip>

            <q-chip color="orange" text-color="white" icon="verified_user">
              {{ contactosExistentesFiltrados.length }} existente(s)
            </q-chip>

            <q-chip color="purple" text-color="white" icon="check_circle">
              {{ contactosSeleccionadosNuevos.length }} seleccionado(s)
            </q-chip>
          </div>

          <div class="contactos-actions row q-col-gutter-sm q-mt-sm">
            <div class="col-12 col-sm-6">
              <q-btn
                class="full-width"
                color="green"
                icon="select_all"
                label="Seleccionar nuevos"
                unelevated
                rounded
                :disable="contactosNuevosFiltrados.length === 0"
                @click="seleccionarContactosNuevos"
              />
            </div>

            <div class="col-12 col-sm-6">
              <q-btn
                class="full-width"
                color="grey-7"
                icon="clear_all"
                label="Limpiar selección"
                unelevated
                rounded
                :disable="contactosSeleccionados.length === 0"
                @click="limpiarSeleccionContactos"
              />
            </div>
          </div>
        </q-card-section>

        <!-- CUERPO CON SCROLL REAL -->
        <q-card-section class="contactos-body">
          <q-table
            class="tabla-contactos"
            :rows="contactosFiltrados"
            :columns="columnsContactos"
            row-key="uid"
            :loading="loadingContactos"
            no-data-label="No se encontraron contactos disponibles"
            flat
            bordered
            selection="multiple"
            v-model:selected="contactosSeleccionados"
            :rows-per-page-options="[5, 10, 20, 50]"
            @update:selected="normalizarSeleccionContactos"
          >
            <template #body-selection="props">
              <q-checkbox
                v-model="props.selected"
                color="pink"
                :disable="clienteYaExiste(props.row.telefono)"
              />
            </template>

            <template #body-cell-nombre="props">
              <q-td :props="props">
                <div class="contacto-nombre">
                  <q-avatar size="36px" class="contacto-avatar">
                    <q-icon name="person" color="white" size="21px" />
                  </q-avatar>

                  <div>
                    <div class="text-weight-bold">
                      {{ props.row.nombre }}
                    </div>

                    <div class="text-caption text-grey-7">
                      Contacto del teléfono
                    </div>
                  </div>
                </div>
              </q-td>
            </template>

            <template #body-cell-telefono="props">
              <q-td :props="props">
                <div class="telefono-box">
                  <q-icon name="phone_android" color="green" size="18px" />
                  <span>{{ props.row.telefono }}</span>
                </div>
              </q-td>
            </template>

            <template #body-cell-estado="props">
              <q-td :props="props" class="text-center">
                <q-badge
                  v-if="clienteYaExiste(props.row.telefono)"
                  color="orange"
                  rounded
                >
                  Ya existe
                </q-badge>

                <q-badge
                  v-else
                  color="green"
                  rounded
                >
                  Nuevo
                </q-badge>
              </q-td>
            </template>
          </q-table>
        </q-card-section>

        <!-- BOTONES FIJOS ABAJO -->
        <q-card-actions align="right" class="dialog-actions contactos-footer">
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            v-close-popup
          />

          <q-btn
            color="primary"
            icon="refresh"
            label="Volver a cargar"
            unelevated
            rounded
            :loading="loadingContactos"
            @click="cargarContactosTelefono"
          />

          <q-btn
            class="btn-glamur"
            icon="save"
            label="Guardar seleccionados"
            :disable="contactosSeleccionadosNuevos.length === 0"
            :loading="savingContactos"
            @click="guardarContactosSeleccionados"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { Capacitor } from '@capacitor/core'
import { Contacts } from '@capacitor-community/contacts'

defineOptions({
  name: 'ClientesPage'
})

const $q = useQuasar()

const clientes = ref([])
const busquedaCliente = ref('')
const dialog = ref(false)
const loading = ref(false)
const saving = ref(false)

const dialogContactos = ref(false)
const contactosTelefono = ref([])
const contactosSeleccionados = ref([])
const buscarContacto = ref('')
const loadingContactos = ref(false)
const savingContactos = ref(false)

const form = ref({
  id: null,
  nombre: '',
  telefono: ''
})

const columns = [
  {
    name: 'nombre',
    label: 'Nombre completo',
    field: 'nombre',
    align: 'left',
    sortable: true
  },
  {
    name: 'telefono',
    label: 'Número de teléfono',
    field: 'telefono',
    align: 'left'
  },
  {
    name: 'actions',
    label: 'Acciones',
    field: 'actions',
    align: 'center'
  }
]

const columnsContactos = [
  {
    name: 'nombre',
    label: 'Nombre',
    field: 'nombre',
    align: 'left',
    sortable: true
  },
  {
    name: 'telefono',
    label: 'Teléfono',
    field: 'telefono',
    align: 'left'
  },
  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center'
  }
]

const clientesFiltradosTabla = computed(() => {
  const texto = normalizarTexto(busquedaCliente.value)

  if (!texto) {
    return clientes.value
  }

  return clientes.value.filter((cliente) => {
    const datos = [
      cliente.id,
      cliente.nombre,
      cliente.telefono
    ]

    return datos.some((dato) => normalizarTexto(dato).includes(texto))
  })
})

const contactosFiltrados = computed(() => {
  const texto = normalizarTexto(buscarContacto.value)

  if (!texto) {
    return contactosTelefono.value
  }

  return contactosTelefono.value.filter((contacto) => {
    const nombre = normalizarTexto(contacto.nombre)
    const telefono = normalizarTexto(contacto.telefono)

    return nombre.includes(texto) || telefono.includes(texto)
  })
})

const contactosNuevosFiltrados = computed(() => {
  return contactosFiltrados.value.filter((contacto) => !clienteYaExiste(contacto.telefono))
})

const contactosExistentesFiltrados = computed(() => {
  return contactosFiltrados.value.filter((contacto) => clienteYaExiste(contacto.telefono))
})

const contactosSeleccionadosNuevos = computed(() => {
  return contactosSeleccionados.value.filter((contacto) => !clienteYaExiste(contacto.telefono))
})

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || error?.message || 'Ocurrió un error'
}

function normalizarTexto(valor) {
  return String(valor || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

function limpiarTelefono(valor) {
  return String(valor || '')
    .replace(/[^\d+]/g, '')
    .trim()
}

function telefonoComparable(valor) {
  return String(valor || '')
    .replace(/\D/g, '')
    .trim()
}

function clienteYaExiste(telefono) {
  const telefonoLimpio = telefonoComparable(telefono)

  if (!telefonoLimpio) {
    return false
  }

  return clientes.value.some((cliente) => {
    return telefonoComparable(cliente.telefono) === telefonoLimpio
  })
}

function permisoContactosConcedido(respuesta) {
  if (!respuesta) {
    return false
  }

  if (respuesta.contacts === 'granted') {
    return true
  }

  return Object.values(respuesta).includes('granted')
}

async function load() {
  loading.value = true

  try {
    const { data } = await api.get('/clientes')

    clientes.value = Array.isArray(data)
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

function openDialog() {
  form.value = {
    id: null,
    nombre: '',
    telefono: ''
  }

  dialog.value = true
}

function edit(row) {
  form.value = {
    id: row.id,
    nombre: row.nombre || '',
    telefono: row.telefono || ''
  }

  dialog.value = true
}

async function save() {
  if (!form.value.nombre.trim()) {
    $q.notify({
      type: 'warning',
      message: 'El nombre completo es obligatorio'
    })

    return
  }

  if (!form.value.telefono.trim()) {
    $q.notify({
      type: 'warning',
      message: 'El número de teléfono es obligatorio'
    })

    return
  }

  saving.value = true

  try {
    const payload = {
      nombre: form.value.nombre.trim(),
      telefono: limpiarTelefono(form.value.telefono),
      email: null
    }

    if (form.value.id) {
      await api.put(`/clientes/${form.value.id}`, payload)

      $q.notify({
        type: 'positive',
        message: 'Cliente actualizado correctamente'
      })
    } else {
      await api.post('/clientes', payload)

      $q.notify({
        type: 'positive',
        message: 'Cliente registrado correctamente'
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
    title: 'Eliminar cliente',
    message: `¿Deseas eliminar a "${row.nombre}"? Se enviará al historial y podrás recuperarlo después.`,
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
      await api.delete(`/clientes/${row.id}`)

      $q.notify({
        type: 'positive',
        message: 'Cliente enviado al historial correctamente'
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

async function abrirImportarContactos() {
  if (!Capacitor.isNativePlatform()) {
    $q.notify({
      type: 'warning',
      message: 'La importación de contactos solo funciona en la APK instalada en el celular.'
    })

    return
  }

  dialogContactos.value = true

  if (contactosTelefono.value.length === 0) {
    await cargarContactosTelefono()
  }
}

async function cargarContactosTelefono() {
  loadingContactos.value = true
  contactosSeleccionados.value = []

  try {
    const permisoActual = await Contacts.checkPermissions()

    let permisoFinal = permisoActual

    if (!permisoContactosConcedido(permisoActual)) {
      permisoFinal = await Contacts.requestPermissions()
    }

    if (!permisoContactosConcedido(permisoFinal)) {
      $q.notify({
        type: 'warning',
        message: 'Permiso de contactos denegado. Actívalo desde los permisos de la aplicación.'
      })

      return
    }

    const resultado = await Contacts.getContacts({
      projection: {
        name: true,
        phones: true
      }
    })

    const lista = Array.isArray(resultado?.contacts)
      ? resultado.contacts
      : []

    const contactosProcesados = lista
      .map((contacto, index) => {
        const nombre =
          contacto?.name?.display ||
          [contacto?.name?.given, contacto?.name?.family].filter(Boolean).join(' ') ||
          contacto?.displayName ||
          'Sin nombre'

        const telefono =
          contacto?.phones?.[0]?.number ||
          contacto?.phoneNumbers?.[0]?.number ||
          ''

        return {
          uid: `${index}-${telefonoComparable(telefono)}-${normalizarTexto(nombre)}`,
          nombre: String(nombre).trim(),
          telefono: limpiarTelefono(telefono)
        }
      })
      .filter((contacto) => contacto.nombre && contacto.telefono)

    const sinRepetidos = []
    const usados = new Set()

    contactosProcesados.forEach((contacto) => {
      const clave = telefonoComparable(contacto.telefono)

      if (!clave || usados.has(clave)) {
        return
      }

      usados.add(clave)
      sinRepetidos.push(contacto)
    })

    contactosTelefono.value = sinRepetidos

    $q.notify({
      type: 'positive',
      message: `Se cargaron ${sinRepetidos.length} contacto(s) del teléfono`
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error?.message || 'No se pudieron cargar los contactos del teléfono'
    })
  } finally {
    loadingContactos.value = false
  }
}

function normalizarSeleccionContactos(lista) {
  contactosSeleccionados.value = (lista || []).filter((contacto) => {
    return !clienteYaExiste(contacto.telefono)
  })
}

function seleccionarContactosNuevos() {
  contactosSeleccionados.value = [...contactosNuevosFiltrados.value]

  if (contactosSeleccionados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'No hay contactos nuevos para seleccionar'
    })
  }
}

function limpiarSeleccionContactos() {
  contactosSeleccionados.value = []
}

async function guardarContactosSeleccionados() {
  if (contactosSeleccionadosNuevos.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona al menos un contacto nuevo'
    })

    return
  }

  const contactosNuevos = [...contactosSeleccionadosNuevos.value]

  savingContactos.value = true

  let guardados = 0
  let fallidos = 0

  try {
    for (const contacto of contactosNuevos) {
      try {
        await api.post('/clientes', {
          nombre: contacto.nombre,
          telefono: contacto.telefono,
          email: null
        })

        guardados++
      } catch {
        fallidos++
      }
    }

    if (guardados > 0) {
      $q.notify({
        type: 'positive',
        message: `${guardados} contacto(s) importado(s) correctamente`
      })
    }

    if (fallidos > 0) {
      $q.notify({
        type: 'warning',
        message: `${fallidos} contacto(s) no se pudieron importar`
      })
    }

    dialogContactos.value = false
    contactosSeleccionados.value = []

    await load()
  } finally {
    savingContactos.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.clientes-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(233, 30, 99, 0.10), transparent 32%),
    linear-gradient(180deg, #fff7fb 0%, #f7f7fb 100%);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* BUSCADOR CLIENTES */

.buscador-card {
  border-radius: 22px;
  padding: 14px;
  background: #ffffff;
  box-shadow: 0 10px 28px rgba(156, 39, 176, 0.10);
  border: 1px solid #f3d6e5;
}

.buscador-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.buscador-input {
  flex: 1;
}

.buscador-input :deep(.q-field__control) {
  min-height: 48px;
  border-radius: 24px;
}

.buscador-badge {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
  padding: 10px 14px;
  white-space: nowrap;
}

.btn-glamur {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
  box-shadow: 0 12px 28px rgba(233, 30, 99, 0.26);
}

.btn-importar {
  background: linear-gradient(135deg, #15111f, #b8860b);
  color: white;
  font-weight: 900;
  border-radius: 16px;
  padding: 10px 18px;
  box-shadow: 0 12px 28px rgba(20, 10, 30, 0.22);
}

.card-table {
  border-radius: 24px;
  overflow: hidden;
  background: white;
  box-shadow: 0 14px 35px rgba(156, 39, 176, 0.12);
}

.card-table :deep(.q-table thead tr),
.tabla-contactos :deep(.q-table thead tr) {
  background: linear-gradient(135deg, #fce4ec, #f3e5f5);
  color: #880e4f;
}

.card-table :deep(.q-table th),
.tabla-contactos :deep(.q-table th) {
  font-weight: 900;
  font-size: 13px;
}

.card-table :deep(.q-table tbody tr:hover),
.tabla-contactos :deep(.q-table tbody tr:hover) {
  background: #fff0f6;
}

.telefono-box {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  color: #2e7d32;
  white-space: nowrap;
}

.acciones {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.dialog-card {
  width: 460px;
  max-width: 95vw;
  border-radius: 24px;
  overflow: hidden;
}

.dialog-contactos {
  width: 900px;
  max-width: 96vw;
  height: min(92dvh, 760px);
  max-height: 92dvh;
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: white;
}

.dialog-header {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
}

.contactos-header {
  flex: 0 0 auto;
  min-height: 96px;
}

.dialog-body {
  background: white;
  padding: 24px;
}

.dialog-actions {
  padding: 16px 22px;
  background: white;
  border-top: 1px solid #eeeeee;
  gap: 10px;
}

.contactos-toolbar {
  flex: 0 0 auto;
  background: #fff7fb;
  padding: 18px;
  border-bottom: 1px solid #f1d7e5;
}

.contactos-info {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.contactos-actions {
  width: 100%;
}

.contactos-body {
  flex: 1 1 auto;
  min-height: 0;
  padding: 16px;
  overflow-y: auto;
  overflow-x: hidden;
  background: white;
}

.tabla-contactos {
  border-radius: 18px;
  overflow: hidden;
  background: white;
}

.tabla-contactos :deep(.q-table__container) {
  max-width: 100%;
}

.tabla-contactos :deep(.q-table__middle) {
  overflow-x: auto;
}

.contacto-nombre {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 210px;
}

.contacto-avatar {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  flex: 0 0 auto;
}

.contactos-footer {
  flex: 0 0 auto;
  position: sticky;
  bottom: 0;
  z-index: 5;
  box-shadow: 0 -8px 22px rgba(0, 0, 0, 0.08);
}

/* MÓVIL */
@media (max-width: 600px) {
  .clientes-page {
    padding: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .q-btn {
    width: 100%;
  }

  .buscador-row {
    flex-direction: column;
    align-items: stretch;
  }

  .buscador-badge {
    width: 100%;
    justify-content: center;
    text-align: center;
  }

  .dialog-card {
    width: 100%;
    max-width: 100%;
    border-radius: 20px;
  }

  .dialog-contactos {
    width: 100vw;
    max-width: 100vw;
    height: 100dvh;
    max-height: 100dvh;
    border-radius: 0;
  }

  .contactos-header {
    min-height: 110px;
    padding: 18px 18px;
  }

  .contactos-header .text-h6 {
    font-size: 24px;
    line-height: 1.2;
  }

  .contactos-header .text-caption {
    font-size: 15px;
    line-height: 1.45;
    margin-top: 6px;
  }

  .contactos-toolbar {
    padding: 14px 14px 12px;
    max-height: 38dvh;
    overflow-y: auto;
  }

  .contactos-info {
    gap: 7px;
  }

  .contactos-info .q-chip {
    max-width: 100%;
    font-size: 13px;
  }

  .contactos-actions .q-btn {
    min-height: 42px;
  }

  .contactos-body {
    padding: 10px;
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .tabla-contactos {
    border-radius: 14px;
  }

  .tabla-contactos :deep(.q-table th),
  .tabla-contactos :deep(.q-table td) {
    padding: 8px 10px;
    font-size: 13px;
  }

  .contacto-nombre {
    min-width: 190px;
  }

  .dialog-actions {
    flex-wrap: wrap;
    padding: 10px 12px calc(12px + env(safe-area-inset-bottom));
  }

  .dialog-actions .q-btn {
    width: 100%;
    min-height: 46px;
  }

  .contactos-footer {
    background: white;
  }
}
</style>