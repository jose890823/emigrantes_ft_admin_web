

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePoa } from '~/modules/poa/composables/usePoa'
import type { POA, POAFilters, POAPaginationParams } from '~/modules/poa/types'
import { POAStatus, POAType, POAStatusLabels, POATypeLabels, POAStatusVariants } from '~/modules/poa/types'
import type { ColumnDef } from '~/components/shared/DataTable/types'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

definePageMeta({
  middleware: ['auth'],
})

const router = useRouter()
const { poas, loading, error, fetchPOAs, clearError, getStats } = usePoa()

// Filtros
const filters = ref<POAFilters>({
  search: '',
  status: undefined,
  type: undefined,
  dateFrom: undefined,
  dateTo: undefined,
})

// Paginación
const pagination = ref<POAPaginationParams>({
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'DESC',
})

// Estadísticas
const stats = ref<any>(null)
const loadingStats = ref(false)

// Cargar datos al montar
onMounted(async () => {
  await loadPOAs()
  await loadStats()
})

// Cargar POAs
const loadPOAs = async () => {
  try {
    // Limpiar filtros vacíos
    const activeFilters: POAFilters = {}
    Object.entries(filters.value).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        activeFilters[key as keyof POAFilters] = value as any
      }
    })

    await fetchPOAs(activeFilters, pagination.value)
  } catch (e) {
    console.error('Error loading POAs:', e)
  }
}

// Cargar estadísticas
const loadStats = async () => {
  loadingStats.value = true
  try {
    // Calcular estadísticas localmente desde los POAs cargados
    if (poas.value.length > 0) {
      stats.value = {
        total: poas.value.length,
        pendingReview: poas.value.filter(p => p.status === 'pending' || p.status === 'in_review').length,
        approved: poas.value.filter(p => p.status === 'approved').length,
        active: poas.value.filter(p => p.status === 'activated' || p.status === 'executed').length,
      }
    } else {
      // Si no hay POAs, mostrar estadísticas en 0
      stats.value = {
        total: 0,
        pendingReview: 0,
        approved: 0,
        active: 0,
      }
    }
  } catch (e) {
    console.error('Error loading stats:', e)
    // Inicializar stats en 0 si hay error
    stats.value = {
      total: 0,
      pendingReview: 0,
      approved: 0,
      active: 0,
    }
  } finally {
    loadingStats.value = false
  }
}

// Manejar cambio de filtros
const handleFilterChange = async () => {
  pagination.value.page = 1
  await loadPOAs()
  await loadStats() // Actualizar estadísticas después de filtrar
}

// Limpiar filtros
const clearFilters = () => {
  filters.value = {
    search: '',
    status: undefined,
    type: undefined,
    dateFrom: undefined,
    dateTo: undefined,
  }
  handleFilterChange()
}

// Ir a crear POA
const goToCreate = () => {
  router.push('/poa/create')
}

// Ver detalle de POA
const viewPOA = (poa: POA) => {
  router.push(`/poa/${poa.id}`)
}

// Ir a estadísticas
const goToStats = () => {
  router.push('/poa/stats')
}

// Formatear fecha
const formatDate = (date?: Date | string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Verificar si un campo está encriptado
const isEncrypted = (value: string) => {
  if (!value) return false
  // El formato de encriptación es "iv:encryptedData"
  return value.includes(':') && value.length > 50
}

// Definición de columnas
const columns = computed<ColumnDef<POA>[]>(() => [
  {
    key: 'clientFullName',
    label: 'Cliente',
    sortable: true,
    searchable: true,
  },
  {
    key: 'clientIdentification',
    label: 'Identificación',
    sortable: true,
    searchable: true,
  },
  {
    key: 'type',
    label: 'Tipo',
    sortable: true,
    align: 'center',
  },
  {
    key: 'status',
    label: 'Estado',
    sortable: true,
    align: 'center',
  },
  {
    key: 'submittedAt',
    label: 'Enviado',
    sortable: true,
    align: 'center',
  },
  {
    key: 'assignedAdmin',
    label: 'Asignado a',
    sortable: false,
  },
  {
    key: 'actions',
    label: 'Acciones',
    align: 'center',
    width: '200px',
  },
])

// Estados disponibles para el filtro
const statusOptions = computed(() =>
  Object.values(POAStatus).map((status) => ({
    value: status,
    label: POAStatusLabels[status],
  }))
)

// Tipos disponibles para el filtro
const typeOptions = computed(() =>
  Object.values(POAType).map((type) => ({
    value: type,
    label: POATypeLabels[type],
  }))
)
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Poderes Notariales (POA)</h1>
          <p class="text-muted-foreground text-sm mt-1">
            Gestión de poderes notariales y documentos legales
          </p>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="goToStats">
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
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
            Estadísticas
          </Button>
          <Button size="sm" @click="goToCreate">
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
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            Nuevo POA
          </Button>
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

    <!-- Estadísticas -->
    <div v-if="stats && !loadingStats" class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.total || 0 }}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.pendingReview || 0 }}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Aprobados</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.approved || 0 }}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">Activos</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ stats.active || 0 }}</div>
        </CardContent>
      </Card>
    </div>

    <!-- Filtros -->
    <Card>
      <CardHeader>
        <CardTitle>Filtros</CardTitle>
        <CardDescription>Filtrar POAs por diferentes criterios</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4 md:grid-cols-4">
          <!-- Búsqueda general -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Buscar</label>
            <Input
              v-model="filters.search"
              placeholder="Cliente, ID, identificación..."
              @input="handleFilterChange"
            />
          </div>

          <!-- Estado -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Estado</label>
            <Select
              :model-value="filters.status"
              @update:model-value="(value: any) => {
                filters.status = value as POAStatus
                handleFilterChange()
              }"
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in statusOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Tipo -->
          <div class="space-y-2">
            <label class="text-sm font-medium">Tipo</label>
            <Select
              :model-value="filters.type"
              @update:model-value="(value: any) => {
                filters.type = value as POAType
                handleFilterChange()
              }"
            >
              <SelectTrigger>
                <SelectValue placeholder="Todos los tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="option in typeOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Botón limpiar -->
          <div class="space-y-2">
            <label class="text-sm font-medium">&nbsp;</label>
            <Button variant="outline" class="w-full" @click="clearFilters">
              Limpiar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Tabla de POAs -->
    <DataTable
      :columns="columns"
      :data="poas"
      :loading="loading"
      :row-clickable="true"
      empty-message="No hay POAs registrados"
      @row-click="viewPOA"
    >
      <!-- Slot para identificación del cliente (campo encriptado) -->
      <template #cell-clientIdentification="{ value }">
        <span class="text-sm inline-flex items-center">
          <template v-if="value && isEncrypted(value)">
            <Badge variant="secondary" class="inline-flex items-center gap-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-3 w-3"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Encriptado
            </Badge>
          </template>
          <template v-else>{{ value || '-' }}</template>
        </span>
      </template>

      <!-- Slot para tipo -->
      <template #cell-type="{ value }">
        <Badge variant="outline">
          {{ POATypeLabels[value as POAType] }}
        </Badge>
      </template>

      <!-- Slot para estado -->
      <template #cell-status="{ value }">
        <Badge :variant="POAStatusVariants[value as POAStatus]">
          {{ POAStatusLabels[value as POAStatus] }}
        </Badge>
      </template>

      <!-- Slot para fecha de envío -->
      <template #cell-submittedAt="{ value }">
        <span class="text-sm">{{ formatDate(value) }}</span>
      </template>

      <!-- Slot para administrador asignado -->
      <template #cell-assignedAdmin="{ row }">
        <span v-if="row.assignedAdmin" class="text-sm">
          {{ row.assignedAdmin.firstName }} {{ row.assignedAdmin.lastName }}
        </span>
        <span v-else class="text-sm text-muted-foreground">Sin asignar</span>
      </template>

      <!-- Slot para acciones -->
      <template #cell-actions="{ row }">
        <div class="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            @click.stop="viewPOA(row)"
            title="Ver detalles"
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
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </Button>
        </div>
      </template>
    </DataTable>
  </div>
</template>
