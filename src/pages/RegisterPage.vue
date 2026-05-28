<template>
  <q-layout view="lHh Lpr lFf" class="register-layout">
    <q-page-container>
      <q-page class="register-page flex flex-center">
        <q-card class="register-card">
          <q-card-section class="register-header">
            <q-avatar class="register-logo" size="78px">
              <img
                :src="logoSistema"
                :alt="nombreCorto"
                @error="usarLogoBase"
              />
            </q-avatar>

            <div class="register-title">
              Crear cuenta {{ marcaPrincipal }}
            </div>

            <div class="register-subtitle">
              Regístrate para administrar {{ marcaSubtitulo }}
            </div>
          </q-card-section>

          <q-card-section class="register-body">
            <div class="security-box q-mb-md">
              <q-icon name="admin_panel_settings" size="34px" color="pink" />

              <div>
                <div class="security-title">
                  Registro protegido
                </div>

                <div class="security-text">
                  Para crear una cuenta debes ingresar el código secreto de administrador.
                </div>
              </div>
            </div>

            <q-input
              v-model.trim="form.nombre"
              label="Nombre completo"
              outlined
              rounded
              class="q-mb-md"
              bg-color="white"
              :disable="loading"
              @keyup.enter="register"
            >
              <template #prepend>
                <q-icon name="badge" color="pink" />
              </template>
            </q-input>

            <q-input
              v-model.trim="form.usuario"
              label="Correo Gmail"
              outlined
              rounded
              class="q-mb-md"
              bg-color="white"
              type="email"
              :disable="loading"
              @keyup.enter="register"
            >
              <template #prepend>
                <q-icon name="mail" color="pink" />
              </template>
            </q-input>

            <q-input
              v-model="form.password"
              label="Contraseña"
              outlined
              rounded
              class="q-mb-md"
              bg-color="white"
              :type="showPassword ? 'text' : 'password'"
              :disable="loading"
              @keyup.enter="register"
            >
              <template #prepend>
                <q-icon name="lock" color="pink" />
              </template>

              <template #append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  color="grey-7"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-input
              v-model="form.password_confirmation"
              label="Confirmar contraseña"
              outlined
              rounded
              class="q-mb-md"
              bg-color="white"
              :type="showPassword2 ? 'text' : 'password'"
              :disable="loading"
              @keyup.enter="register"
            >
              <template #prepend>
                <q-icon name="verified_user" color="pink" />
              </template>

              <template #append>
                <q-icon
                  :name="showPassword2 ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  color="grey-7"
                  @click="showPassword2 = !showPassword2"
                />
              </template>
            </q-input>

            <q-input
              v-model.trim="form.codigo_registro"
              label="Código secreto de administrador"
              outlined
              rounded
              class="q-mb-lg"
              bg-color="white"
              :type="showCode ? 'text' : 'password'"
              :disable="loading"
              @keyup.enter="register"
            >
              <template #prepend>
                <q-icon name="vpn_key" color="pink" />
              </template>

              <template #append>
                <q-icon
                  :name="showCode ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  color="grey-7"
                  @click="showCode = !showCode"
                />
              </template>
            </q-input>

            <q-btn
              class="btn-register full-width"
              label="Crear cuenta"
              icon="person_add"
              :loading="loading"
              @click="register"
            />

            <q-btn
              flat
              class="full-width q-mt-md text-pink-7 text-weight-bold"
              label="Ya tengo cuenta, iniciar sesión"
              icon="login"
              to="/login"
              :disable="loading"
            />
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { api } from 'boot/axios'
import logoBase from 'assets/logo-glamur.png'

defineOptions({
  name: 'RegisterPage'
})

const $q = useQuasar()
const router = useRouter()

const loading = ref(false)
const showPassword = ref(false)
const showPassword2 = ref(false)
const showCode = ref(false)

const valoresBaseConfiguracion = {
  nombre_negocio: 'AUREA Beauty Salon',
  nombre_corto: 'AUREA Beauty',
  slogan: 'Sistema inteligente para salones de belleza',
  telefono: '',
  whatsapp: '',
  direccion: '',
  mensaje_whatsapp: 'Hola, quiero información sobre los servicios de AUREA Beauty Salon.',
  logo_url: '',
  moneda: 'Bs',
  activo: true
}

const configuracion = ref({
  ...valoresBaseConfiguracion
})

const form = ref({
  nombre: '',
  usuario: '',
  password: '',
  password_confirmation: '',
  codigo_registro: ''
})

const nombreCorto = computed(() => {
  return configuracion.value.nombre_corto || valoresBaseConfiguracion.nombre_corto
})

const logoSistema = computed(() => {
  return configuracion.value.logo_url || logoBase
})

const marcaPrincipal = computed(() => {
  const partes = String(nombreCorto.value || 'AUREA Beauty').trim().split(' ')
  return partes[0] || 'AUREA'
})

const marcaSubtitulo = computed(() => {
  const texto = String(nombreCorto.value || 'AUREA Beauty')
    .replace(marcaPrincipal.value, '')
    .trim()

  return texto || 'Beauty Salon'
})

function normalizarConfiguracion(config = {}) {
  return {
    ...valoresBaseConfiguracion,
    ...config,
    activo: config?.activo === undefined ? true : Boolean(config.activo)
  }
}

function aplicarConfiguracion(config = {}) {
  configuracion.value = normalizarConfiguracion(config)
}

function guardarConfiguracionLocal(config = {}) {
  localStorage.setItem('aurea_configuracion', JSON.stringify(normalizarConfiguracion(config)))
}

function cargarConfiguracionLocal() {
  try {
    const guardado = localStorage.getItem('aurea_configuracion')
    return guardado ? JSON.parse(guardado) : null
  } catch {
    return null
  }
}

async function cargarConfiguracionNegocio() {
  const local = cargarConfiguracionLocal()

  if (local) {
    aplicarConfiguracion(local)
  }

  try {
    const { data } = await axios.get(`${api.defaults.baseURL}/configuracion-publica`, {
  headers: {
    Accept: 'application/json'
  }
})

    const config = data?.configuracion || data || valoresBaseConfiguracion

    aplicarConfiguracion(config)
    guardarConfiguracionLocal(config)
  } catch {
    if (!local) {
      aplicarConfiguracion(valoresBaseConfiguracion)
    }
  }
}

function usarLogoBase(event) {
  if (event?.target) {
    event.target.src = logoBase
  }
}

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || 'No se pudo crear la cuenta'
}

function validarFormulario() {
  if (!form.value.nombre) {
    $q.notify({
      type: 'warning',
      message: 'Ingrese su nombre completo'
    })

    return false
  }

  if (!form.value.usuario) {
    $q.notify({
      type: 'warning',
      message: 'Ingrese su correo Gmail'
    })

    return false
  }

  if (!form.value.usuario.toLowerCase().includes('@gmail.com')) {
    $q.notify({
      type: 'warning',
      message: 'Debe usar un correo Gmail válido'
    })

    return false
  }

  if (!form.value.password) {
    $q.notify({
      type: 'warning',
      message: 'Ingrese una contraseña'
    })

    return false
  }

  if (form.value.password.length < 6) {
    $q.notify({
      type: 'warning',
      message: 'La contraseña debe tener mínimo 6 caracteres'
    })

    return false
  }

  if (form.value.password !== form.value.password_confirmation) {
    $q.notify({
      type: 'warning',
      message: 'Las contraseñas no coinciden'
    })

    return false
  }

  if (!form.value.codigo_registro) {
    $q.notify({
      type: 'warning',
      message: 'Ingrese el código secreto de administrador'
    })

    return false
  }

  return true
}

async function register() {
  if (!validarFormulario()) return

  loading.value = true

  try {
    const { data } = await api.post('/register', {
      nombre: form.value.nombre,
      usuario: form.value.usuario.toLowerCase(),
      password: form.value.password,
      password_confirmation: form.value.password_confirmation,
      codigo_registro: form.value.codigo_registro
    })

    localStorage.setItem('glamur_token', data.token)
    localStorage.setItem('glamur_user', JSON.stringify(data.usuario))

    $q.notify({
      type: 'positive',
      message: 'Cuenta creada correctamente'
    })

    router.push('/dashboard')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    loading.value = false
  }
}

onMounted(cargarConfiguracionNegocio)
</script>

<style scoped>
.register-layout {
  min-height: 100vh;
}

.register-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgba(233, 30, 99, 0.55), transparent 38%),
    linear-gradient(135deg, #15111f 0%, #2a0f28 50%, #c2185b 100%);
  padding: 18px;
}

.register-card {
  width: 430px;
  max-width: 95vw;
  border-radius: 28px;
  overflow: hidden;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.35);
}

.register-header {
  text-align: center;
  padding: 34px 24px 26px;
  color: white;
  background:
    linear-gradient(
      135deg,
      #15111f,
      #241329 42%,
      #e91e63
    );
}

.register-logo {
  background:
    linear-gradient(
      135deg,
      #e91e63,
      #9c27b0
    );
  box-shadow: 0 18px 42px rgba(233, 30, 99, 0.45);
}

.register-logo img {
  object-fit: cover;
}

.register-title {
  margin-top: 18px;
  font-size: 30px;
  font-weight: 900;
}

.register-subtitle {
  margin-top: 6px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.78);
}

.register-body {
  padding: 28px 24px 30px;
  background: white;
}

.security-box {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 18px;
  background: #fff0f6;
  border: 1px solid rgba(233, 30, 99, 0.22);
}

.security-title {
  font-size: 14px;
  font-weight: 900;
  color: #c2185b;
}

.security-text {
  font-size: 12px;
  color: #7b1b45;
  line-height: 1.3;
}

.btn-register {
  height: 52px;
  border-radius: 18px;
  color: white;
  font-weight: 900;
  background:
    linear-gradient(
      135deg,
      #e91e63,
      #9c27b0
    );
  box-shadow: 0 14px 34px rgba(233, 30, 99, 0.32);
}

@media (max-width: 600px) {
  .register-page {
    padding: 12px;
  }

  .register-card {
    width: 100%;
    border-radius: 22px;
  }

  .register-title {
    font-size: 26px;
  }

  .register-body {
    padding: 22px 18px 24px;
  }
}
</style>