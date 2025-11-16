<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePoa } from '~/modules/poa/composables/usePoa'
import { POAStatus, POAType, POAStatusLabels, POATypeLabels } from '~/modules/poa/types'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

definePageMeta({
  middleware: ['auth'],
})

const router = useRouter()
const { getStats, loading, error, clearError } = usePoa()

const stats = ref<any>(null)

// Cargar estadísticas al montar
onMounted(async () => {
  await loadStats()
})

// Cargar estadísticas
const loadStats = async () => {
  try {
    const response: any = await getStats()
    stats.value = response.data || response
  } catch (e) {
    console.error('Error loading stats:', e)
  }
}

// Volver a la lista
const goBack = () => {
  router.push('/poa')
}

// Formatear fecha
const formatDate = (date?: Date | string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Estadísticas de POA</h1>
          <p class="text-muted-foreground text-sm mt-1">
            Vista general de métricas y análisis de poderes notariales
          </p>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="loadStats" :disabled="loading">
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
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            Actualizar
          </Button>
          <Button variant="ghost" size="sm" @click="goBack">
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
              <path d="m15 18-6-6 6-6" />
            </svg>
            Volver
          </Button>
        </div>
      </div>
    </div>

    <!-- Mensaje de error -->
    <div
      v-if="error"
      class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg"
    >
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

    <!-- Estado de carga -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="text-muted-foreground">Cargando estadísticas...</p>
      </div>
    </div>

    <!-- Estadísticas -->
    <div v-else-if="stats" class="space-y-6">
      <!-- Tarjetas de resumen general -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Total de POAs</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" x2="8" y1="13" y2="13" />
              <line x1="16" x2="8" y1="17" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.total || 0 }}</div>
            <p class="text-xs text-muted-foreground">Total de poderes registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Pendientes de Revisión</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.pendingReview || 0 }}</div>
            <p class="text-xs text-muted-foreground">Requieren atención</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Aprobados</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.approved || 0 }}</div>
            <p class="text-xs text-muted-foreground">POAs aprobados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Activos</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 text-muted-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.active || 0 }}</div>
            <p class="text-xs text-muted-foreground">POAs en vigor</p>
          </CardContent>
        </Card>
      </div>

      <!-- Tarjetas adicionales -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Rechazados</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.rejected || 0 }}</div>
            <p class="text-xs text-muted-foreground">POAs rechazados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">{{ stats.completed || 0 }}</div>
            <p class="text-xs text-muted-foreground">POAs finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Tiempo Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ stats.averageProcessingTime ? `${stats.averageProcessingTime} días` : '-' }}
            </div>
            <p class="text-xs text-muted-foreground">Tiempo de procesamiento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">Cancelados</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ stats.byStatus ? (stats.byStatus[POAStatus.CANCELLED] || 0) : 0 }}
            </div>
            <p class="text-xs text-muted-foreground">POAs cancelados</p>
          </CardContent>
        </Card>
      </div>

      <!-- Distribución por estados -->
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Estados</CardTitle>
          <CardDescription>Cantidad de POAs por cada estado del sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-if="stats.byStatus" class="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div
                v-for="(count, status) in stats.byStatus"
                :key="status"
                class="flex items-center justify-between rounded-lg border p-4"
              >
                <div>
                  <p class="text-sm font-medium">{{ POAStatusLabels[status as unknown as POAStatus] }}</p>
                  <p class="text-2xl font-bold">{{ count }}</p>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground text-center py-4">
              No hay datos de estados disponibles
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Distribución por tipos -->
      <Card>
        <CardHeader>
          <CardTitle>Distribución por Tipos</CardTitle>
          <CardDescription>Cantidad de POAs por cada tipo</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div v-if="stats.byType" class="grid gap-4 md:grid-cols-3">
              <div
                v-for="(count, type) in stats.byType"
                :key="type"
                class="flex items-center justify-between rounded-lg border p-4"
              >
                <div class="flex-1">
                  <p class="text-sm font-medium">{{ POATypeLabels[type as unknown as POAType] }}</p>
                  <p class="text-2xl font-bold">{{ count }}</p>
                  <p class="text-xs text-muted-foreground mt-1">
                    {{ ((count / stats.total) * 100).toFixed(1) }}% del total
                  </p>
                </div>
              </div>
            </div>
            <p v-else class="text-sm text-muted-foreground text-center py-4">
              No hay datos de tipos disponibles
            </p>
          </div>
        </CardContent>
      </Card>

      <!-- Actividad reciente -->
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimas acciones en el sistema de POA</CardDescription>
        </CardHeader>
        <CardContent>
          <div v-if="stats.recentActivity && stats.recentActivity.length > 0" class="space-y-4">
            <div
              v-for="activity in stats.recentActivity"
              :key="activity.id"
              class="border-l-2 border-primary pl-4 py-2"
            >
              <div class="flex items-center justify-between">
                <p class="font-medium">{{ activity.action }}</p>
                <p class="text-sm text-muted-foreground">{{ formatDate(activity.createdAt) }}</p>
              </div>
              <p v-if="activity.description" class="text-sm mt-1">{{ activity.description }}</p>
              <p v-if="activity.performedByUser" class="text-sm text-muted-foreground mt-1">
                Por: {{ activity.performedByUser.firstName }}
                {{ activity.performedByUser.lastName }}
              </p>
            </div>
          </div>
          <p v-else class="text-sm text-muted-foreground text-center py-4">
            No hay actividad reciente
          </p>
        </CardContent>
      </Card>
    </div>

    <!-- Sin datos -->
    <div v-else class="text-center py-12">
      <p class="text-muted-foreground">No hay estadísticas disponibles</p>
    </div>
  </div>
</template>
