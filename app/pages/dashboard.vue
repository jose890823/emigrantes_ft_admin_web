<script setup lang="ts">
import { Users, FileText, DollarSign, Activity } from 'lucide-vue-next'

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
})

const { user } = useAuth()

// Stats data (mockup - conectar con API después)
const stats = ref([
  {
    name: 'Total Usuarios',
    value: '0',
    change: '+0%',
    changeType: 'positive',
    icon: Users,
    color: 'blue',
  },
  {
    name: 'POAs Activos',
    value: '0',
    change: '+0%',
    changeType: 'positive',
    icon: FileText,
    color: 'green',
  },
  {
    name: 'Ingresos del Mes',
    value: '$0',
    change: '+0%',
    changeType: 'positive',
    icon: DollarSign,
    color: 'yellow',
  },
  {
    name: 'Actividad Hoy',
    value: '0',
    change: '+0%',
    changeType: 'neutral',
    icon: Activity,
    color: 'purple',
  },
])

const colorClasses = {
  blue: 'bg-blue-500/10 text-blue-600',
  green: 'bg-green-500/10 text-green-600',
  yellow: 'bg-yellow-500/10 text-yellow-600',
  purple: 'bg-purple-500/10 text-purple-600',
}
</script>

<template>
  <div>
    <!-- Page header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900">
        ¡Bienvenido, {{ user?.firstName }}!
      </h1>
      <p class="text-gray-600 mt-2">
        Panel de administración - Emigrantes FT
      </p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div
        v-for="stat in stats"
        :key="stat.name"
        class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">{{ stat.name }}</p>
            <p class="text-3xl font-bold text-gray-900 mt-2">{{ stat.value }}</p>
            <p
              :class="[
                'text-sm mt-2',
                stat.changeType === 'positive' ? 'text-green-600' : 'text-gray-500'
              ]"
            >
              {{ stat.change }} desde el mes pasado
            </p>
          </div>
          <div
            :class="[
              'w-12 h-12 rounded-lg flex items-center justify-center',
              colorClasses[stat.color]
            ]"
          >
            <component :is="stat.icon" :size="24" />
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Activity Feed -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h2>
        <div class="space-y-4">
          <div class="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div class="w-8 h-8 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Users :size="16" class="text-blue-600" />
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-gray-900">
                Sistema iniciado
              </p>
              <p class="text-xs text-gray-500 mt-1">
                El panel de administración está listo para usar
              </p>
            </div>
            <span class="text-xs text-gray-400 flex-shrink-0">Ahora</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div class="space-y-3">
          <NuxtLink
            to="/users"
            class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Users :size="20" class="text-primary" />
            </div>
            <div>
              <p class="font-medium text-gray-900 group-hover:text-primary transition-colors">
                Gestionar Usuarios
              </p>
              <p class="text-sm text-gray-500">Ver y editar usuarios</p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/poas"
            class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div class="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
              <FileText :size="20" class="text-green-600" />
            </div>
            <div>
              <p class="font-medium text-gray-900 group-hover:text-primary transition-colors">
                Revisar POAs
              </p>
              <p class="text-sm text-gray-500">Aprobar o rechazar POAs</p>
            </div>
          </NuxtLink>

          <NuxtLink
            to="/reports"
            class="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <div class="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
              <Activity :size="20" class="text-purple-600" />
            </div>
            <div>
              <p class="font-medium text-gray-900 group-hover:text-primary transition-colors">
                Ver Reportes
              </p>
              <p class="text-sm text-gray-500">Estadísticas y análisis</p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
