<template>
  <div class="space-y-4">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold">Lista de Personas</h2>
      <Button @click="$emit('create')">
        Crear Persona
      </Button>
    </div>

    <DataTable
      :data="personas"
      :columns="columns"
      :loading="loading"
      :error="error"
      @edit="$emit('edit', $event)"
      @delete="$emit('delete', $event)"
    >
      <template #cell-activo="{ row }">
        <span
          :class="[
            'px-2 py-1 rounded-full text-xs font-medium',
            row.activo
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          ]"
        >
          {{ row.activo ? 'Activo' : 'Inactivo' }}
        </span>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { DataTable } from '~/components/shared/DataTable'
import type { Persona } from '../types'

interface Props {
  personas: Persona[]
  loading?: boolean
  error?: string | null
}

defineProps<Props>()

defineEmits<{
  create: []
  edit: [persona: Persona]
  delete: [persona: Persona]
}>()

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'apellido', label: 'Apellido' },
  { key: 'email', label: 'Email' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'edad', label: 'Edad' },
  { key: 'activo', label: 'Estado' },
]
</script>
