<template>
  <q-layout view="lHh Lpr lFf" class="login-layout">
    <q-page-container>
      <q-page class="login-page">

        <q-card class="login-card">

          <!-- HEADER -->
          <q-card-section class="login-header">
            <q-avatar class="login-logo" size="78px">
              <img
                :src="logoSistema"
                :alt="nombreCorto"
                @error="usarLogoBase"
              />
            </q-avatar>

            <div class="login-title">
              {{ marcaPrincipal }}
            </div>

            <div class="login-subtitle">
              {{ marcaSubtitulo }} | {{ sloganNegocio }}
            </div>
          </q-card-section>

          <!-- BODY -->
          <q-card-section class="login-body">
            <q-form class="q-gutter-md" @submit.prevent="login">

              <q-input
                v-model.trim="form.usuario"
                label="Gmail o usuario"
                outlined
                rounded
                bg-color="white"
                autocomplete="username"
              >
                <template #prepend>
                  <q-icon name="person" color="pink" />
                </template>
              </q-input>

              <q-input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                label="Contraseña"
                outlined
                rounded
                bg-color="white"
                autocomplete="current-password"
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

              <q-btn
                type="submit"
                label="Iniciar sesión"
                icon="login"
                class="btn-login full-width"
                unelevated
                :loading="loading"
              />

              <q-btn
                label="Crear cuenta con Gmail"
                icon="person_add"
                flat
                class="btn-register full-width"
                to="/register"
              />

            </q-form>
          </q-card-section>

          <!-- FOOTER -->
          <q-card-section class="login-footer">
            Accede con tu cuenta registrada en {{ nombreCorto }}
          </q-card-section>

        </q-card>

      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import axios from 'axios'
import { api } from 'boot/axios'
import logoBase from 'assets/logo-glamur.png'

defineOptions({
  name: 'LoginPage'
})

const router = useRouter()
const $q = useQuasar()

const loading = ref(false)
const showPassword = ref(false)

const valoresBaseConfiguracion = {
  nombre_negocio: 'AUREA Beauty Salon',
  nombre_corto: 'AUREA Beauty',
  slogan: 'Sistema inteligente',
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
  usuario: '',
  password: ''
})

const nombreCorto = computed(() => {
  return configuracion.value.nombre_corto || valoresBaseConfiguracion.nombre_corto
})

const sloganNegocio = computed(() => {
  return configuracion.value.slogan || valoresBaseConfiguracion.slogan
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

  return data?.message || data?.error || 'No se pudo iniciar sesión'
}

async function login() {
  if (!form.value.usuario.trim()) {
    $q.notify({
      type: 'warning',
      message: 'Ingrese su Gmail o usuario'
    })

    return
  }

  if (!form.value.password) {
    $q.notify({
      type: 'warning',
      message: 'Ingrese su contraseña'
    })

    return
  }

  loading.value = true

  try {
    const { data } = await api.post('/login', {
      usuario: form.value.usuario.trim(),
      password: form.value.password
    })

    localStorage.setItem('glamur_token', data.token)
    localStorage.setItem('glamur_user', JSON.stringify(data.usuario))

    $q.notify({
      type: 'positive',
      message: 'Inicio de sesión correcto'
    })

    router.replace('/dashboard')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await cargarConfiguracionNegocio()

  const token = localStorage.getItem('glamur_token')

  if (!token) return

  try {
    await api.get('/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    router.replace('/dashboard')
  } catch {
    localStorage.removeItem('glamur_token')
    localStorage.removeItem('glamur_user')
  }
})
</script>

<style scoped>
.login-layout {
  min-height: 100vh;
}

.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 20px;
  background:
    radial-gradient(circle at top left, rgba(233, 30, 99, 0.25), transparent 34%),
    radial-gradient(circle at bottom right, rgba(156, 39, 176, 0.25), transparent 34%),
    linear-gradient(135deg, #120f1c 0%, #241329 55%, #e91e63 100%);
}

.login-card {
  width: 430px;
  max-width: 96vw;
  border-radius: 30px;
  overflow: hidden;
  background: white;
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.35);
}

.login-header {
  text-align: center;
  padding: 34px 26px 22px;
  background: linear-gradient(135deg, #15111f, #241329 45%, #e91e63);
  color: white;
}

.login-logo {
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  box-shadow: 0 18px 40px rgba(233, 30, 99, 0.45);
}

.login-logo img {
  object-fit: cover;
}

.login-title {
  margin-top: 16px;
  font-size: 34px;
  font-weight: 900;
  line-height: 1;
}

.login-subtitle {
  margin-top: 10px;
  font-size: 14px;
  opacity: 0.85;
}

.login-body {
  padding: 28px 28px 12px;
}

.btn-login {
  margin-top: 8px;
  min-height: 50px;
  border-radius: 18px;
  background: linear-gradient(135deg, #e91e63, #9c27b0);
  color: white;
  font-weight: 900;
  box-shadow: 0 14px 30px rgba(233, 30, 99, 0.28);
}

.btn-register {
  min-height: 44px;
  border-radius: 16px;
  color: #c2185b;
  font-weight: 900;
}

.btn-register:hover {
  background: #fff0f6;
}

.login-footer {
  padding: 4px 28px 24px;
  text-align: center;
  font-size: 12px;
  color: #777;
}

@media (max-width: 600px) {
  .login-page {
    padding: 14px;
  }

  .login-card {
    border-radius: 24px;
  }

  .login-title {
    font-size: 30px;
  }

  .login-body {
    padding: 22px 22px 10px;
  }

  .login-footer {
    padding: 4px 22px 22px;
  }
}
</style>