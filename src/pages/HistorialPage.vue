<template>
  <q-page class="q-pa-lg page-fondo">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-weight-bold text-primary">
          Historial
        </div>
        <div class="text-grey-7">
          Clientes y citas/servicios eliminados del sistema
        </div>
      </div>

      <q-btn
        icon="delete_sweep"
        label="Limpiar historial"
        class="btn-electrofrio"
        @click="limpiarHistorial"
      />
    </div>

    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-6">
        <q-card class="card-electro">
          <q-card-section>
            <div class="text-h6 text-weight-bold">
              Clientes eliminados
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-list bordered separator>
              <q-item v-for="cliente in clientesEliminados" :key="cliente.fecha_eliminacion">
                <q-item-section avatar>
                  <q-icon name="person_off" color="negative" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ cliente.nombre }}
                  </q-item-label>
                  <q-item-label caption>
                    Tel: {{ cliente.telefono || 'Sin teléfono' }}
                  </q-item-label>
                  <q-item-label caption>
                    Eliminado: {{ cliente.fecha_eliminacion }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="clientesEliminados.length === 0">
                <q-item-section class="text-grey text-center">
                  No hay clientes eliminados
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="card-electro">
          <q-card-section>
            <div class="text-h6 text-weight-bold">
              Citas / servicios borrados
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <q-list bordered separator>
              <q-item v-for="servicio in serviciosEliminados" :key="servicio.fecha_eliminacion">
                <q-item-section avatar>
                  <q-icon name="event_busy" color="orange" />
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bold">
                    {{ servicio.tipo_servicio }}
                  </q-item-label>
                  <q-item-label caption>
                    Cliente: {{ servicio.cliente?.nombre || 'S/N' }}
                  </q-item-label>
                  <q-item-label caption>
                    Fecha: {{ servicio.fecha || 'Sin fecha' }}
                  </q-item-label>
                  <q-item-label caption>
                    Eliminado: {{ servicio.fecha_eliminacion }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="serviciosEliminados.length === 0">
                <q-item-section class="text-grey text-center">
                  No hay servicios eliminados
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script>
export default {
  name: 'HistorialPage',

  data() {
    return {
      clientesEliminados: [],
      serviciosEliminados: []
    }
  },

  mounted() {
    this.cargarHistorial()
  },

  methods: {
    cargarHistorial() {
      this.clientesEliminados = JSON.parse(localStorage.getItem('clientes_eliminados') || '[]')
      this.serviciosEliminados = JSON.parse(localStorage.getItem('servicios_eliminados') || '[]')
    },

    limpiarHistorial() {
      this.$q.dialog({
        title: 'Limpiar historial',
        message: '¿Seguro que deseas borrar todo el historial?',
        cancel: true,
        persistent: true
      }).onOk(() => {
        localStorage.removeItem('clientes_eliminados')
        localStorage.removeItem('servicios_eliminados')
        this.cargarHistorial()
        this.$q.notify({ type: 'positive', message: 'Historial limpiado' })
      })
    }
  }
}
</script>