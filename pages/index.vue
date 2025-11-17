<template>
  <div class="container py-8">
    <div class="space-y-8">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold text-[#0A1F44] dark:text-white">Dashboard de Administración</h1>
        <p class="text-muted-foreground mt-2">
          Bienvenido de nuevo, {{ user?.firstName }} {{ user?.lastName }}
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37]"></div>
      </div>

      <!-- Dashboard Content -->
      <template v-else>
        <!-- POA Statistics Overview -->
        <div>
          <h2 class="text-xl font-semibold text-[#0A1F44] dark:text-white mb-4">Estadísticas de POAs</h2>
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <!-- Total POAs -->
            <Card class="border-l-4 border-l-[#0A1F44]">
              <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Total POAs</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#0A1F44] dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </CardHeader>
              <CardContent>
                <div class="text-3xl font-bold text-[#0A1F44] dark:text-white">{{ stats?.poa.total || 0 }}</div>
                <p class="text-xs text-muted-foreground mt-1">
                  Poderes notariales registrados
                </p>
              </CardContent>
            </Card>

            <!-- Pending Review -->
            <Card class="border-l-4 border-l-yellow-500">
              <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Pendientes de Revisión</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </CardHeader>
              <CardContent>
                <div class="text-3xl font-bold text-yellow-600">{{ (stats?.poa.byStatus.pending || 0) + (stats?.poa.byStatus.in_review || 0) }}</div>
                <p class="text-xs text-muted-foreground mt-1">
                  Requieren atención
                </p>
              </CardContent>
            </Card>

            <!-- Active POAs -->
            <Card class="border-l-4 border-l-green-500">
              <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">POAs Activos</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </CardHeader>
              <CardContent>
                <div class="text-3xl font-bold text-green-600">{{ stats?.poa.byStatus.activated || 0 }}</div>
                <p class="text-xs text-muted-foreground mt-1">
                  En ejecución actualmente
                </p>
              </CardContent>
            </Card>

            <!-- Completed POAs -->
            <Card class="border-l-4 border-l-[#D4AF37]">
              <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle class="text-sm font-medium">Completados</CardTitle>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-[#D4AF37]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
              </CardHeader>
              <CardContent>
                <div class="text-3xl font-bold text-[#D4AF37]">{{ stats?.poa.byStatus.executed || 0 }}</div>
                <p class="text-xs text-muted-foreground mt-1">
                  Ejecutados exitosamente
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <!-- POA Status Breakdown -->
        <div class="grid gap-4 md:grid-cols-2">
          <!-- Status Details -->
          <Card>
            <CardHeader>
              <CardTitle class="text-[#0A1F44] dark:text-white">Desglose por Estado</CardTitle>
              <CardDescription>Distribución de POAs según su estado actual</CardDescription>
            </CardHeader>
            <CardContent class="space-y-3">
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Borradores</span>
                <span class="text-sm text-muted-foreground">{{ stats?.poa.byStatus.draft || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Pendientes</span>
                <span class="text-sm text-yellow-600 font-semibold">{{ stats?.poa.byStatus.pending || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">En Revisión</span>
                <span class="text-sm text-blue-600 font-semibold">{{ stats?.poa.byStatus.in_review || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Aprobados</span>
                <span class="text-sm text-green-600">{{ stats?.poa.byStatus.approved || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Notarizados</span>
                <span class="text-sm text-purple-600">{{ stats?.poa.byStatus.notarized || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Activados</span>
                <span class="text-sm text-green-700 font-semibold">{{ stats?.poa.byStatus.activated || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium">Ejecutados</span>
                <span class="text-sm text-[#D4AF37] font-semibold">{{ stats?.poa.byStatus.executed || 0 }}</span>
              </div>
              <div class="flex items-center justify-between border-t pt-2">
                <span class="text-sm font-medium text-red-600">Rechazados</span>
                <span class="text-sm text-red-600">{{ stats?.poa.byStatus.rejected || 0 }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm font-medium text-gray-500">Cancelados</span>
                <span class="text-sm text-gray-500">{{ stats?.poa.byStatus.cancelled || 0 }}</span>
              </div>
            </CardContent>
          </Card>

          <!-- User Statistics -->
          <Card>
            <CardHeader>
              <CardTitle class="text-[#0A1F44] dark:text-white">Estadísticas de Usuarios</CardTitle>
              <CardDescription>Información sobre los usuarios del sistema</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <p class="text-sm text-muted-foreground">Total Usuarios</p>
                  <p class="text-2xl font-bold text-[#0A1F44] dark:text-white">{{ stats?.users.total || 0 }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-sm text-muted-foreground">Usuarios Activos</p>
                  <p class="text-2xl font-bold text-green-600">{{ stats?.users.active || 0 }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-sm text-muted-foreground">Verificados</p>
                  <p class="text-2xl font-bold text-blue-600">{{ stats?.users.verified || 0 }}</p>
                </div>
                <div class="space-y-2">
                  <p class="text-sm text-muted-foreground">Inactivos</p>
                  <p class="text-2xl font-bold text-gray-500">{{ stats?.users.inactive || 0 }}</p>
                </div>
              </div>

              <div class="border-t pt-4 space-y-2">
                <p class="text-sm font-medium text-muted-foreground">Por Rol</p>
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-sm">Clientes</span>
                    <span class="text-sm font-semibold">{{ stats?.users.byRole?.client || 0 }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm">Administradores</span>
                    <span class="text-sm font-semibold">{{ stats?.users.byRole?.admin || 0 }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-sm">Super Admins</span>
                    <span class="text-sm font-semibold">{{ stats?.users.byRole?.super_admin || 0 }}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Recent POAs Table -->
        <Card>
          <CardHeader>
            <div class="flex items-center justify-between">
              <div>
                <CardTitle class="text-[#0A1F44] dark:text-white">POAs Recientes</CardTitle>
                <CardDescription>Últimos poderes notariales creados en el sistema</CardDescription>
              </div>
              <Button @click="navigateTo('/poa')" variant="outline" class="border-[#0A1F44] text-[#0A1F44] hover:bg-[#0A1F44] hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-[#0A1F44]">
                Ver Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div v-if="recentPOAs.length === 0" class="text-center py-8 text-muted-foreground">
              No hay POAs recientes para mostrar
            </div>
            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead class="border-b">
                  <tr>
                    <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                    <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                    <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                    <th class="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                    <th class="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y">
                  <tr v-for="poa in recentPOAs" :key="poa.id" class="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td class="py-3 px-4 text-sm">
                      <div class="font-medium">{{ poa.clientName || 'N/A' }}</div>
                      <div class="text-xs text-muted-foreground">{{ poa.clientEmail || '' }}</div>
                    </td>
                    <td class="py-3 px-4 text-sm">{{ poa.type || 'General' }}</td>
                    <td class="py-3 px-4">
                      <span :class="getStatusBadgeClass(poa.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                        {{ getStatusLabel(poa.status) }}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-sm text-muted-foreground">
                      {{ formatDate(poa.createdAt) }}
                    </td>
                    <td class="py-3 px-4 text-right">
                      <Button @click="viewPOA(poa.id)" variant="ghost" size="sm" class="text-[#0A1F44] hover:text-[#D4AF37] dark:text-white dark:hover:text-[#D4AF37]">
                        Ver Detalles
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <!-- Quick Actions -->
        <Card>
          <CardHeader>
            <CardTitle class="text-[#0A1F44] dark:text-white">Acciones Rápidas</CardTitle>
            <CardDescription>Accesos directos a funciones principales</CardDescription>
          </CardHeader>
          <CardContent>
            <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <Button @click="navigateTo('/poa?status=pending')" variant="outline" class="h-auto py-4 flex-col gap-2 border-[#0A1F44] hover:bg-[#0A1F44] hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-[#0A1F44]">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span class="text-sm font-medium">Revisar POAs</span>
              </Button>

              <Button @click="navigateTo('/users')" variant="outline" class="h-auto py-4 flex-col gap-2 border-[#0A1F44] hover:bg-[#0A1F44] hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-[#0A1F44]">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span class="text-sm font-medium">Gestionar Usuarios</span>
              </Button>

              <Button @click="navigateTo('/poa')" variant="outline" class="h-auto py-4 flex-col gap-2 border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-sm font-medium">Ver Todos los POAs</span>
              </Button>

              <Button @click="navigateTo('/reports')" variant="outline" class="h-auto py-4 flex-col gap-2 border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span class="text-sm font-medium">Reportes</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '~/modules/auth/composables/useAuth'
import { useDashboard } from '~/composables/useDashboard'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '~/components/ui/card'

const { user, isAuthenticated, initAuth } = useAuth()
const { stats, recentPOAs, loading, fetchDashboardStats } = useDashboard()

// Initialize auth and fetch dashboard data
onMounted(async () => {
  await initAuth()

  // If not authenticated, redirect to login
  if (!isAuthenticated.value) {
    navigateTo('/login')
    return
  }

  // Fetch dashboard statistics
  try {
    await fetchDashboardStats()
  } catch (error) {
    console.error('Error loading dashboard:', error)
  }
})

/**
 * Get status badge styling
 */
const getStatusBadgeClass = (status: string) => {
  const classes: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    in_review: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    notarized: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    activated: 'bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200',
    executed: 'bg-[#D4AF37] bg-opacity-20 text-[#0A1F44] dark:bg-[#D4AF37] dark:bg-opacity-30 dark:text-white',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
    cancelled: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  }
  return classes[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
}

/**
 * Get status label in Spanish
 */
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: 'Borrador',
    pending: 'Pendiente',
    in_review: 'En Revisión',
    approved: 'Aprobado',
    notarized: 'Notarizado',
    activated: 'Activado',
    executed: 'Ejecutado',
    rejected: 'Rechazado',
    cancelled: 'Cancelado',
  }
  return labels[status] || status
}

/**
 * Format date
 */
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

/**
 * Navigate to POA detail
 */
const viewPOA = (id: string) => {
  navigateTo(`/poa/${id}`)
}
</script>
