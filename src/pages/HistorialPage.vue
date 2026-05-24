<div class="page-header">
  <div>
    <div class="page-title">
      Historial
    </div>

    <div class="page-subtitle">
      Clientes y citas/servicios eliminados del sistema
    </div>
  </div>

  <div class="header-actions">
    <q-btn
      class="btn-restore-all"
      icon="restore"
      label="Recuperar todo"
      :loading="restoringAll"
      @click="restaurarTodo"
    />

    <q-btn
      class="btn-clean"
      icon="delete_sweep"
      label="Limpiar historial"
      :loading="cleaning"
      @click="limpiarHistorial"
    />
  </div>
</div>

<q-linear-progress
  v-if="loading"
  indeterminate
  color="pink"
  class="q-mb-md"
/>

<div class="row q-col-gutter-lg">

  <!-- CLIENTES ELIMINADOS -->
  <div class="col-12 col-md-6">
    <q-card class="historial-card">

      <q-card-section class="card-title-row">
        <div>
          <div class="card-title">
            Clientes eliminados
          </div>

          <div class="card-subtitle">
            Clientes enviados al historial
          </div>
        </div>

        <q-badge color="pink" rounded>
          {{ clientesEliminados.length }}
        </q-badge>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          class="tabla-historial"
          :rows="clientesEliminados"
          :columns="columnsClientes"
          row-key="id"
          flat
          bordered
          dense
          :rows-per-page-options="[5, 10, 20]"
          no-data-label="No hay clientes eliminados"
        >
          <template #body-cell-nombre="props">
            <q-td :props="props">
              <div class="text-weight-bold text-pink-8">
                {{ props.row.nombre || 'Sin nombre' }}
              </div>

              <div class="text-caption text-grey-7">
                {{ props.row.telefono || 'Sin teléfono' }}
              </div>
            </q-td>
          </template>

          <template #body-cell-deleted_at="props">
            <q-td :props="props">
              {{ formatDate(props.row.deleted_at) }}
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <q-btn
                round
                unelevated
                size="sm"
                color="positive"
                icon="restore"
                :loading="restoringId === `cliente-${props.row.id}`"
                @click="restaurarCliente(props.row)"
              >
                <q-tooltip>Recuperar cliente</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>

    </q-card>
  </div>

  <!-- CITAS ELIMINADAS -->
  <div class="col-12 col-md-6">
    <q-card class="historial-card">

      <q-card-section class="card-title-row">
        <div>
          <div class="card-title">
            Citas / servicios borrados
          </div>

          <div class="card-subtitle">
            Citas eliminadas que pueden recuperarse
          </div>
        </div>

        <q-badge color="purple" rounded>
          {{ citasEliminadas.length }}
        </q-badge>
      </q-card-section>

      <q-separator />

      <q-card-section>
        <q-table
          class="tabla-historial"
          :rows="citasEliminadas"
          :columns="columnsCitas"
          row-key="id"
          flat
          bordered
          dense
          :rows-per-page-options="[5, 10, 20]"
          no-data-label="No hay servicios eliminados"
        >
          <template #body-cell-servicio="props">
            <q-td :props="props">
              <div class="text-weight-bold text-purple-8">
                {{ props.row.servicio || 'Servicio sin nombre' }}
              </div>

              <div class="text-caption text-grey-7">
                Cliente: {{ props.row.cliente?.nombre || 'Sin cliente' }}
              </div>
            </q-td>
          </template>

          <template #body-cell-precio="props">
            <q-td :props="props">
              <b class="text-green-8">
                Bs {{ money(props.row.precio) }}
              </b>
            </q-td>
          </template>

          <template #body-cell-deleted_at="props">
            <q-td :props="props">
              {{ formatDate(props.row.deleted_at) }}
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props" class="text-center">
              <q-btn
                round
                unelevated
                size="sm"
                color="positive"
                icon="restore"
                :loading="restoringId === `cita-${props.row.id}`"
                @click="restaurarCita(props.row)"
              >
                <q-tooltip>Recuperar cita</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card-section>

    </q-card>
  </div>

</div>

<div
  v-if="!loading && clientesEliminados.length === 0 && citasEliminadas.length === 0"
  class="empty-state"
>
  <q-icon name="history" size="80px" color="pink-4" />

  <div class="empty-title">
    No hay elementos en el historial
  </div>

  <div class="empty-text">
    Cuando elimines clientes o citas, aparecerán aquí para poder recuperarlos.
  </div>
</div>