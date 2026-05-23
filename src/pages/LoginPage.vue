<template>
  <q-page class="flex flex-center bg-grey-2">
    <q-card style="width:350px" class="shadow-10">
      <q-card-section class="text-center">
        <h5>Glamur</h5>
        <p>Iniciar Sesión</p>
      </q-card-section>

      <q-card-section>
        <q-input v-model="email" label="Email" outlined />
        <q-input v-model="password" type="password" label="Password" outlined class="q-mt-md"/>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn label="Ingresar" color="primary" @click="login"/>
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({ name: 'LoginPage' })

const email = ref('')
const password = ref('')
const router = useRouter()

function login(){
  router.push('/dashboard')
}
</script>