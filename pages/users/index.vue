<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '~/modules/users/types'
import type { ColumnDef } from '~/components/shared/DataTable/types'
import { useUsers } from '~/modules/users/composables/useUsers'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'

definePageMeta({
  middleware: ['auth'],
})

const router = useRouter()
const {
  users,
  loading,
  error,
  total,
  page,
  limit,
  fetchUsers,
  deleteUser,
  toggleActive,
  clearError,
} = useUsers()

// Estado local
const searchQuery = ref('')
const roleFilter = ref<string>('all')
const statusFilter = ref<string>('all')
const showDeleteDialog = ref(false)
const userToDelete = ref<User | null>(null)
const deleting = ref(false)

// Definir columnas de la tabla
const columns: ColumnDef<User>[] = [
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
    key: 'phone',
    label: 'Teléfono',
    sortable: false,
  },
  {
    key: 'role',
    label: 'Rol',
    sortable: true,
    align: 'center',
  },
  {
    key: 'isActive',
    label: 'Estado',
    sortable: true,
    align: 'center',
  },
  {
    key: 'actions',
    label: 'Acciones',
    sortable: false,
    align: 'center',
    width: '250px',
  },
]

// Filtrar usuarios según los filtros aplicados
const filteredUsers = computed(() => {
  let filtered = [...users.value]

  // Filtro por rol
  if (roleFilter.value !== 'all') {
    filtered = filtered.filter((user) => user.role === roleFilter.value)
  }

  // Filtro por estado
  if (statusFilter.value !== 'all') {
    const isActive = statusFilter.value === 'active'
    filtered = filtered.filter((user) => user.isActive === isActive)
  }

  return filtered
})

// Cargar usuarios al montar el componente
onMounted(async () => {
  await loadUsers()
})

// Cargar usuarios
const loadUsers = async () => {
  try {
    await fetchUsers({
      page: page.value,
      limit: limit.value,
      search: searchQuery.value || undefined,
    })
  } catch (e) {
    console.error('Error loading users:', e)
  }
}

// Manejar cambio de página
const handlePageChange = async (newPage: number) => {
  page.value = newPage
  await loadUsers()
}

// Buscar usuarios
const handleSearch = async () => {
  page.value = 1
  await loadUsers()
}

// Limpiar búsqueda
const clearSearch = async () => {
  searchQuery.value = ''
  page.value = 1
  await loadUsers()
}

// Navegar a crear usuario
const goToCreate = () => {
  router.push('/users/create')
}

// Navegar a editar usuario
const goToEdit = (user: User) => {
  router.push(`/users/${user.id}/edit`)
}

// Navegar a actividad del usuario
const goToActivity = (user: User) => {
  router.push(`/users/${user.id}/activity`)
}

// Mostrar diálogo de confirmación de eliminación
const confirmDelete = (user: User) => {
  userToDelete.value = user
  showDeleteDialog.value = true
}

// Eliminar usuario
const handleDelete = async () => {
  if (!userToDelete.value) return

  deleting.value = true
  try {
    await deleteUser(userToDelete.value.id)
    showDeleteDialog.value = false
    userToDelete.value = null
    await loadUsers()
  } catch (e) {
    console.error('Error deleting user:', e)
  } finally {
    deleting.value = false
  }
}

// Cancelar eliminación
const cancelDelete = () => {
  showDeleteDialog.value = false
  userToDelete.value = null
}

// Toggle activar/desactivar usuario
const handleToggleActive = async (user: User) => {
  try {
    await toggleActive(user.id, !user.isActive)
    await loadUsers()
  } catch (e) {
    console.error('Error toggling user active status:', e)
  }
}

// Obtener variante de badge según el rol
const getRoleBadgeVariant = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'destructive'
    case 'admin':
      return 'default'
    case 'staff':
      return 'secondary'
    case 'client':
      return 'outline'
    default:
      return 'outline'
  }
}

// Obtener texto del rol
const getRoleText = (role: string) => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin'
    case 'admin':
      return 'Administrador'
    case 'staff':
      return 'Personal'
    case 'client':
      return 'Cliente'
    default:
      return role
  }
}
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Usuarios</h1>
        <p class="text-muted-foreground mt-1">
          Gestiona los usuarios del sistema
        </p>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="() => router.push('/users/stats')">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 3v16a2 2 0 0 0 2 2h16" />
            <path d="m19 9-5 5-4-4-3 3" />
          </svg>
          Estadísticas
        </Button>
        <Button @click="goToCreate">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4 mr-2"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nuevo Usuario
        </Button>
      </div>
    </div>

    <!-- Filtros -->
    <div class="bg-card rounded-lg border p-4 space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <!-- Búsqueda -->
        <div class="md:col-span-2">
          <div class="flex gap-2">
            <Input
              v-model="searchQuery"
              placeholder="Buscar por nombre, email..."
              @keyup.enter="handleSearch"
              class="flex-1"
            />
            <Button @click="handleSearch" :disabled="loading">
              Buscar
            </Button>
            <Button
              v-if="searchQuery"
              variant="outline"
              @click="clearSearch"
              :disabled="loading"
            >
              Limpiar
            </Button>
          </div>
        </div>

        <!-- Filtro por rol -->
        <div>
          <Select v-model="roleFilter">
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los roles</SelectItem>
              <SelectItem value="super_admin">Super Admin</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="staff">Personal</SelectItem>
              <SelectItem value="client">Cliente</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <!-- Filtro por estado -->
        <div>
          <Select v-model="statusFilter">
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value="active">Activos</SelectItem>
              <SelectItem value="inactive">Inactivos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
      <div class="flex items-center justify-between">
        <p>{{ error }}</p>
        <Button variant="ghost" size="sm" @click="clearError">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </Button>
      </div>
    </div>

    <!-- Tabla de usuarios -->
    <DataTable
      :data="filteredUsers"
      :columns="columns"
      :loading="loading"
      :pagination="{
        page,
        pageSize: limit,
        total,
      }"
      empty-message="No se encontraron usuarios"
      row-key="id"
      @page-change="handlePageChange"
    >
      <!-- Columna de rol -->
      <template #cell-role="{ row }">
        <Badge :variant="getRoleBadgeVariant(row.role)">
          {{ getRoleText(row.role) }}
        </Badge>
      </template>

      <!-- Columna de estado -->
      <template #cell-isActive="{ row }">
        <Badge :variant="row.isActive ? 'default' : 'secondary'">
          {{ row.isActive ? 'Activo' : 'Inactivo' }}
        </Badge>
      </template>

      <!-- Columna de acciones -->
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-center gap-2">
          <!-- Botón de activar/desactivar -->
          <Button
            :variant="row.isActive ? 'outline' : 'default'"
            size="sm"
            @click="handleToggleActive(row)"
            :title="row.isActive ? 'Desactivar usuario' : 'Activar usuario'"
          >
            <svg
              v-if="row.isActive"
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
          </Button>

          <!-- Botón de ver actividad -->
          <Button
            variant="outline"
            size="sm"
            @click="goToActivity(row)"
            title="Ver actividad del usuario"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </Button>

          <!-- Botón de editar -->
          <Button
            variant="outline"
            size="sm"
            @click="goToEdit(row)"
            title="Editar usuario"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
          </Button>

          <!-- Botón de eliminar -->
          <Button
            variant="destructive"
            size="sm"
            @click="confirmDelete(row)"
            title="Eliminar usuario"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
          </Button>
        </div>
      </template>
    </DataTable>

    <!-- Diálogo de confirmación de eliminación -->
    <AlertDialog v-model:open="showDeleteDialog">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente el usuario
            <strong v-if="userToDelete">
              {{ userToDelete.firstName }} {{ userToDelete.lastName }}
            </strong>
            del sistema.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="cancelDelete" :disabled="deleting">
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            @click="handleDelete"
            :disabled="deleting"
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {{ deleting ? 'Eliminando...' : 'Eliminar' }}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
