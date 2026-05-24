<template>
  <q-page class="register-page flex flex-center">

    <q-card class="register-card">

      <q-card-section class="register-header text-center">

        <q-avatar class="logo" size="78px">
          <q-icon name="spa" color="white" size="42px" />
        </q-avatar>

        <div class="text-h4 text-weight-bold q-mt-md">
          Crear cuenta
        </div>

        <div class="text-subtitle2 text-white">
          Registra un usuario administrador con Gmail
        </div>

      </q-card-section>

      <q-card-section class="register-body">

        <q-form @submit.prevent="register" class="q-gutter-md">

          <q-input
            v-model.trim="form.nombre"
            label="Nombre completo"
            outlined
            rounded
            bg-color="white"
            :disable="loading"
          >
            <template #prepend>
              <q-icon name="person" color="pink" />
            </template>
          </q-input>

          <q-input
            v-model.trim="form.usuario"
            label="Correo Gmail"
            outlined
            rounded
            bg-color="white"
            type="email"
            :disable="loading"
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
            bg-color="white"
            :type="showPassword ? 'text' : 'password'"
            :disable="loading"
          >
            <template #prepend>
              <q-icon name="lock" color="pink" />
            </template>

            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="form.password_confirmation"
            label="Confirmar contraseña"
            outlined
            rounded
            bg-color="white"
            :type="showPasswordConfirm ? 'text' : 'password'"
            :disable="loading"
          >
            <template #prepend>
              <q-icon name="lock_reset" color="pink" />
            </template>

            <template #append>
              <q-icon
                :name="showPasswordConfirm ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPasswordConfirm = !showPasswordConfirm"
              />
            </template>
          </q-input>

          <q-btn
            label="Crear cuenta"
            icon="person_add"
            type="submit"
            class="btn-register full-width"
            :loading="loading"
            unelevated
          />

          <q-btn
            label="Ya tengo cuenta"
            icon="login"
            flat
            class="full-width text-pink-7 text-weight-bold"
            to="/login"
          />

        </q-form>

      </q-card-section>

    </q-card>

  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'

defineOptions({
  name: 'RegisterPage'
})

const $q = useQuasar()
const router = useRouter()

const loading = ref(false)
const showPassword = ref(false)
const showPasswordConfirm = ref(false)

const form = ref({
  nombre: '',
  usuario: '',
  password: '',
  password_confirmation: ''
})

function getErrorMessage(error) {
  const data = error?.response?.data

  if (data?.errors) {
    return Object.values(data.errors).flat().join(' ')
  }

  return data?.message || data?.error || 'No se pudo crear la cuenta'
}

async function register() {
  if (!form.value.nombre || !form.value.usuario || !form.value.password || !form.value.password_confirmation) {
    $q.notify({
      type: 'warning',
      message: 'Completa todos los campos'
    })

    return
  }

  if (!form.value.usuario.toLowerCase().endsWith('@gmail.com')) {
    $q.notify({
      type: 'warning',
      message: 'Debes usar un correo Gmail'
    })

    return
  }

  if (form.value.password.length < 6) {
    $q.notify({
      type: 'warning',
      message: 'La contraseña debe tener mínimo 6 caracteres'
    })

    return
  }

  if (form.value.password !== form.value.password_confirmation) {
    $q.notify({
      type: 'warning',
      message: 'Las contraseñas no coinciden'
    })

    return
  }

  loading.value = true

  try {
    await api.post('/register', {
      nombre: form.value.nombre,
      usuario: form.value.usuario.toLowerCase(),
      password: form.value.password,
      password_confirmation: form.value.password_confirmation
    })

    $q.notify({
      type: 'positive',
      message: 'Cuenta creada correctamente. Ahora inicia sesión.'
    })

    router.push('/login')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: getErrorMessage(error)
    })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(233, 30, 99, 0.22), transparent 34%),
    linear-gradient(135deg, #15111f 0%, #2a102c 45%, #d81b60 100%);
  padding: 18px;
}

.register-card {
  width: 470px;
  max-width: 96vw;
  border-radius: 30px;
  overflow: hidden;
  box-shadow: 0 26px 70px rgba(0, 0, 0, 0.38);
}

.register-header {
  background:
    linear-gradient(
      135deg,
      #15111f,
      #241329 45%,
      #e91e63
    );
  color: white;
  padding: 42px 28px 32px;
}

.logo {
  background:
    linear-gradient(
      135deg,
      #e91e63,
      #9c27b0
    );
  box-shadow:
    0 18px 42px rgba(233, 30, 99, 0.45);
}

.register-body {
  background: white;
  padding: 30px;
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
  box-shadow:
    0 14px 30px rgba(233, 30, 99, 0.28);
}

@media (max-width: 600px) {
  .register-card {
    border-radius: 24px;
  }

  .register-header {
    padding: 34px 20px 26px;
  }

  .register-body {
    padding: 22px;
  }
}
</style>