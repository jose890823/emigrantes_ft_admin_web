<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUsers } from '~/modules/users/composables/useUsers'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'

definePageMeta({
  middleware: ['auth'],
})

const router = useRouter()
const route = useRoute()
const userId = computed(() => route.params.id as string)

const { fetchUser, getUserActivity, getUserActivityStats, currentUser, loading, error, clearError } = useUsers()

const activities = ref<any[]>([])
const activityStats = ref<any>(null)
const loadingActivities = ref(false)
const loadingStats = ref(false)
const limit = ref(50)
const offset = ref(0)

// Cargar usuario y actividad al montar
onMounted(async () => {
  await Promise.all([
    loadUser(),
    loadActivities(),
    loadActivityStats(),
  ])
})

// Cargar datos del usuario
const loadUser = async () => {
  try {
    await fetchUser(userId.value)
  } catch (e) {
    console.error('Error loading user:', e)
  }
}

// Cargar actividades
const loadActivities = async () => {
  loadingActivities.value = true
  try {
    const response: any = await getUserActivity(userId.value, limit.value, offset.value)
    activities.value = response.data || []
  } catch (e) {
    console.error('Error loading activities:', e)
  } finally {
    loadingActivities.value = false
  }
}

// Cargar estadísticas de actividad
const loadActivityStats = async () => {
  loadingStats.value = true
  try {
    const response: any = await getUserActivityStats(userId.value)
    activityStats.value = response.data || null
  } catch (e) {
    console.error('Error loading activity stats:', e)
  } finally {
    loadingStats.value = false
  }
}

// Volver a la lista
const goBack = () => {
  router.push('/users')
}

// Formatear fecha
const formatDate = (date: string) => {
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Obtener variante de badge según el tipo de actividad
const getActivityBadgeVariant = (action: string) => {
  if (action.includes('login')) return 'default'
  if (action.includes('create')) return 'default'
  if (action.includes('update')) return 'secondary'
  if (action.includes('delete')) return 'destructive'
  return 'outline'
}

// Obtener icono según el tipo de actividad
const getActivityIcon = (action: string) => {
  if (action.includes('login')) return 'log-in'
  if (action.includes('logout')) return 'log-out'
  if (action.includes('create')) return 'plus'
  if (action.includes('update')) return 'edit'
  if (action.includes('delete')) return 'trash'
  return 'activity'
}
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Historial de Actividad</h1>
          <p class="text-muted-foreground text-sm mt-1">
            <span v-if="currentUser">
              {{ currentUser.firstName }} {{ currentUser.lastName }} - {{ currentUser.email }}
            </span>
            <span v-else>Cargando usuario...</span>
          </p>
        </div>
        <div class="flex gap-2">
          <Button variant="outline" size="sm" @click="loadActivities" :disabled="loadingActivities">
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

    <!-- Estadísticas de actividad -->
    <div v-if="activityStats && !loadingStats" class="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Total de Actividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ activityStats.total || 0 }}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Último Login
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-sm">
            {{ activityStats.lastLogin ? formatDate(activityStats.lastLogin) : 'Nunca' }}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Actividades Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ activityStats.today || 0 }}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            Esta Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ activityStats.thisWeek || 0 }}</div>
        </CardContent>
      </Card>
    </div>

    <!-- Lista de actividades -->
    <Card>
      <CardHeader>
        <CardTitle>Actividades Recientes</CardTitle>
        <CardDescription>
          Historial completo de acciones del usuario
        </CardDescription>
      </CardHeader>
      <CardContent>
        <!-- Estado de carga -->
        <div v-if="loadingActivities" class="flex items-center justify-center py-12">
          <div class="text-center space-y-4">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p class="text-muted-foreground">Cargando actividades...</p>
          </div>
        </div>

        <!-- Lista de actividades -->
        <div v-else-if="activities.length > 0" class="space-y-4">
          <div
            v-for="activity in activities"
            :key="activity.id"
            class="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors"
          >
            <!-- Icono -->
            <div class="flex-shrink-0 mt-1">
              <div class="rounded-full bg-primary/10 p-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
            </div>

            <!-- Contenido -->
            <div class="flex-1 space-y-1">
              <div class="flex items-center gap-2">
                <Badge :variant="getActivityBadgeVariant(activity.action)">
                  {{ activity.action }}
                </Badge>
                <span class="text-sm text-muted-foreground">
                  {{ formatDate(activity.createdAt) }}
                </span>
              </div>
              <p class="text-sm">{{ activity.description || 'Sin descripción' }}</p>
              <div v-if="activity.metadata" class="text-xs text-muted-foreground">
                <pre class="bg-muted/50 rounded p-2 overflow-x-auto">{{ JSON.stringify(activity.metadata, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>

        <!-- Sin actividades -->
        <div v-else class="text-center py-12">
          <p class="text-muted-foreground">No hay actividades registradas</p>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
