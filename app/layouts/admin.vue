<script setup lang="ts">
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  Calendar,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from 'lucide-vue-next'

const { user, logout } = useAuth()
const router = useRouter()

// State for sidebar
const sidebarOpen = ref(true)
const userMenuOpen = ref(false)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
}

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

// Navigation items
const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Usuarios', href: '/users', icon: Users },
  { name: 'POAs', href: '/poas', icon: FileText },
  { name: 'Pagos', href: '/payments', icon: CreditCard },
  { name: 'Citas', href: '/appointments', icon: Calendar },
  { name: 'Notificaciones', href: '/notifications', icon: Bell },
  { name: 'Reportes', href: '/reports', icon: BarChart3 },
  { name: 'Configuración', href: '/settings', icon: Settings },
]
</script>

<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20'
      ]"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        <div v-if="sidebarOpen" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">EF</span>
          </div>
          <span class="font-semibold text-gray-900">Emigrantes FT</span>
        </div>
        <div v-else class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center mx-auto">
          <span class="text-white font-bold text-sm">EF</span>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NuxtLink
          v-for="item in navigation"
          :key="item.name"
          :to="item.href"
          :class="[
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
            'hover:bg-gray-100 hover:text-primary',
            $route.path === item.href
              ? 'bg-primary/10 text-primary'
              : 'text-gray-700'
          ]"
        >
          <component :is="item.icon" :size="20" />
          <span v-if="sidebarOpen">{{ item.name }}</span>
        </NuxtLink>
      </nav>

      <!-- User section -->
      <div class="border-t border-gray-200 p-4">
        <button
          @click="userMenuOpen = !userMenuOpen"
          :class="[
            'w-full flex items-center gap-3 rounded-md p-2 hover:bg-gray-100 transition-colors',
            sidebarOpen ? 'justify-between' : 'justify-center'
          ]"
        >
          <div :class="['flex items-center gap-3', !sidebarOpen && 'justify-center']">
            <div class="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span class="text-white text-sm font-medium">
                {{ user?.firstName?.[0] }}{{ user?.lastName?.[0] }}
              </span>
            </div>
            <div v-if="sidebarOpen" class="text-left">
              <p class="text-sm font-medium text-gray-900">{{ user?.firstName }} {{ user?.lastName }}</p>
              <p class="text-xs text-gray-500">{{ user?.role }}</p>
            </div>
          </div>
          <ChevronDown v-if="sidebarOpen" :size="16" class="text-gray-400" />
        </button>

        <!-- User menu dropdown -->
        <div v-if="userMenuOpen && sidebarOpen" class="mt-2 space-y-1">
          <button
            @click="handleLogout"
            class="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
          >
            <LogOut :size="16" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top bar -->
      <header class="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
        <button
          @click="toggleSidebar"
          class="p-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <component :is="sidebarOpen ? X : Menu" :size="20" class="text-gray-600" />
        </button>

        <div class="flex items-center gap-4">
          <!-- Notifications -->
          <button class="relative p-2 rounded-md hover:bg-gray-100 transition-colors">
            <Bell :size="20" class="text-gray-600" />
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </header>

      <!-- Page content -->
      <main class="flex-1 overflow-auto bg-gray-50 p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
