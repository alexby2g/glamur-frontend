<template>
  <q-page class="q-pa-md">

    <div class="text-h5 q-mb-md">📊 Dashboard</div>

    <div class="row q-gutter-md">

      <q-card class="col bg-primary text-white">
        <q-card-section>
          <div>Total Citas</div>
          <div class="text-h4">{{ data.total }}</div>
        </q-card-section>
      </q-card>

      <q-card class="col bg-orange text-white">
        <q-card-section>
          <div>Pendientes</div>
          <div class="text-h4">{{ data.pendientes }}</div>
        </q-card-section>
      </q-card>

      <q-card class="col bg-green text-white">
        <q-card-section>
          <div>Concluidas</div>
          <div class="text-h4">{{ data.concluidas }}</div>
        </q-card-section>
      </q-card>

    </div>

    <div class="row q-gutter-md q-mt-md">

      <q-card class="col bg-green text-white">
        <q-card-section>
          <div>💰 Hoy</div>
          <div class="text-h5">Bs {{ data.ingreso_dia }}</div>
        </q-card-section>
      </q-card>

      <q-card class="col bg-blue text-white">
        <q-card-section>
          <div>📅 Mes</div>
          <div class="text-h5">Bs {{ data.ingreso_mes }}</div>
        </q-card-section>
      </q-card>

      <q-card class="col bg-purple text-white">
        <q-card-section>
          <div>📆 Año</div>
          <div class="text-h5">Bs {{ data.ingreso_anio }}</div>
        </q-card-section>
      </q-card>

    </div>

  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const data = ref({})

async function load() {
  data.value = (await axios.get('http://127.0.0.1:8000/api/dashboard')).data
}

onMounted(load)
</script>