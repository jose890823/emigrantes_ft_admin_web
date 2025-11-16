<script setup lang="ts">
import { ref } from 'vue'
import { DataTable } from '~/components/shared/DataTable'
import type { ColumnDef } from '~/components/shared/DataTable'
import { Badge } from '~/components/ui/badge'

definePageMeta({
  layout: 'default',
})

// Tipo de datos de ejemplo
interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  status: 'active' | 'inactive' | 'pending'
  createdAt: string
}

// Datos de ejemplo
const users = ref<User[]>([
  {
    id: 1,
    firstName: 'Juan',
    lastName: 'Pérez',
    email: 'juan.perez@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-15',
  },
  {
    id: 2,
    firstName: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@example.com',
    role: 'staff',
    status: 'active',
    createdAt: '2024-02-20',
  },
  {
    id: 3,
    firstName: 'Pedro',
    lastName: 'Martínez',
    email: 'pedro.martinez@example.com',
    role: 'client',
    status: 'inactive',
    createdAt: '2024-03-10',
  },
  {
    id: 4,
    firstName: 'Ana',
    lastName: 'Rodríguez',
    email: 'ana.rodriguez@example.com',
    role: 'staff',
    status: 'pending',
    createdAt: '2024-04-05',
  },
  {
    id: 5,
    firstName: 'Carlos',
    lastName: 'López',
    email: 'carlos.lopez@example.com',
    role: 'client',
    status: 'active',
    createdAt: '2024-05-12',
  },
  {
    id: 6,
    firstName: 'Laura',
    lastName: 'Sánchez',
    email: 'laura.sanchez@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-06-18',
  },
  {
    id: 7,
    firstName: 'Diego',
    lastName: 'Ramírez',
    email: 'diego.ramirez@example.com',
    role: 'client',
    status: 'inactive',
    createdAt: '2024-07-22',
  },
  {
    id: 8,
    firstName: 'Sofia',
    lastName: 'Torres',
    email: 'sofia.torres@example.com',
    role: 'staff',
    status: 'active',
    createdAt: '2024-08-14',
  },
  {
    id: 9,
    firstName: 'Miguel',
    lastName: 'Flores',
    email: 'miguel.flores@example.com',
    role: 'client',
    status: 'pending',
    createdAt: '2024-09-03',
  },
  {
    id: 10,
    firstName: 'Elena',
    lastName: 'Castro',
    email: 'elena.castro@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-10-08',
  },
  {
    id: 11,
    firstName: 'Roberto',
    lastName: 'Vargas',
    email: 'roberto.vargas@example.com',
    role: 'client',
    status: 'inactive',
    createdAt: '2024-11-01',
  },
  {
    id: 12,
    firstName: 'Carmen',
    lastName: 'Ortiz',
    email: 'carmen.ortiz@example.com',
    role: 'staff',
    status: 'active',
    createdAt: '2024-11-10',
  },
])

// Definición de columnas
const columns: ColumnDef<User>[] = [
  {
    key: 'id',
    label: 'ID',
    sortable: true,
    width: '80px',
    align: 'center',
  },
  {
    key: 'firstName',
    label: 'Nombre',
    sortable: true,
    searchable: true,
  },
  {
    key: 'lastName',
    label: 'Apellido',
    sortable: true,
    searchable: true,
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
    searchable: true,
  },
  {
    key: 'role',
    label: 'Rol',
    sortable: true,
    format: (value) => {
      const roles: Record<string, string> = {
        admin: 'Administrador',
        staff: 'Personal',
        client: 'Cliente',
      }
      return roles[value] || value
    },
  },
  {
    key: 'status',
    label: 'Estado',
    sortable: true,
    align: 'center',
  },
  {
    key: 'createdAt',
    label: 'Fecha de Registro',
    sortable: true,
    format: (value) => {
      return new Date(value).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    },
  },
]

// Manejar click en fila
const handleRowClick = (user: User) => {
  console.log('Usuario seleccionado:', user)
  alert(`Usuario: ${user.firstName} ${user.lastName}`)
}

// Obtener variante de badge según el estado
const getStatusVariant = (status: User['status']): 'default' | 'destructive' | 'outline' | 'secondary' => {
  const variants: Record<string, 'default' | 'destructive' | 'outline' | 'secondary'> = {
    active: 'default',
    inactive: 'secondary',
    pending: 'outline',
  }
  return variants[status] || 'default'
}

// Obtener texto del estado
const getStatusText = (status: User['status']) => {
  const texts = {
    active: 'Activo',
    inactive: 'Inactivo',
    pending: 'Pendiente',
  }
  return texts[status]
}
</script>

<template>
  <div class="container mx-auto py-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Demo DataTable</h1>
      <p class="text-muted-foreground mt-2">
        Ejemplo de uso del componente DataTable con todas sus funcionalidades
      </p>
    </div>

    <DataTable
      :data="users"
      :columns="columns"
      :searchable="true"
      search-placeholder="Buscar usuarios..."
      :row-clickable="true"
      row-key="id"
      @row-click="handleRowClick"
    >
      <!-- Slot personalizado para la columna de estado -->
      <template #cell-status="{ value }">
        <Badge :variant="getStatusVariant(value)">
          {{ getStatusText(value) }}
        </Badge>
      </template>
    </DataTable>
  </div>
</template>
