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

    <!-- TABLA CLIENTES -->
    <q-card class="card-table">
      <q-table
        :rows="clientes"
        :columns="columns"
        row-key="id"
        :loading="loading"
        no-data-label="No hay clientes registrados"
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
    <q-dialog v-model="dialogContactos" persistent>
      <q-card class="dialog-contactos">

        <q-card-section class="dialog-header row items-center">
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

            <q-chip color="purple" text-color="white" icon="check_circle">
              {{ contactosSeleccionados.length }} seleccionado(s)
            </q-chip>
          </div>
        </q-card-section>

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
          >
            <template #body-cell-nombre="props">
              <q-td :props="props">
                <div class="contacto-nombre">
                  <q-avatar size="34px" class="contacto-avatar">
                    <q-icon name="person" color="white" size="20px" />
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

        <q-card-actions align="right" class="dialog-actions">
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
            :disable="contactosSeleccionados.length === 0"
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

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || 'Ocurrió un error'
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

async function guardarContactosSeleccionados() {
  if (contactosSeleccionados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona al menos un contacto'
    })

    return
  }

  const contactosNuevos = contactosSeleccionados.value.filter((contacto) => {
    return !clienteYaExiste(contacto.telefono)
  })

  if (contactosNuevos.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Los contactos seleccionados ya existen como clientes'
    })

    return
  }

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
  max-height: 92vh;
  border-radius: 24px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
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

.contactos-body {
  padding: 16px;
  max-height: 58vh;
  overflow-y: auto;
}

.tabla-contactos {
  border-radius: 18px;
  overflow: hidden;
  background: white;
}

.contacto-nombre {
  display: flex;
  align-items: center;
  gap: 10px;
}

.contacto-avatar {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
}

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

  .dialog-card,
  .dialog-contactos {
    width: 100%;
    max-width: 100%;
    border-radius: 20px;
  }

  .dialog-actions {
    flex-wrap: wrap;
  }

  .dialog-actions .q-btn {
    width: 100%;
  }

  .contactos-body {
    padding: 10px;
    max-height: 55vh;
  }
}
</style>