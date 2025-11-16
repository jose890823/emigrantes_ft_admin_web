<template>
  <Sidebar collapsible="icon" variant="sidebar">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <NuxtLink to="/">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <span class="text-xl">🏢</span>
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">
                  {{ $t('app.name') || 'Mi Aplicación' }}
                </span>
                <span class="truncate text-xs">Admin Dashboard</span>
              </div>
            </NuxtLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>

    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navegación</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <!-- Inicio -->
            <SidebarMenuItem>
              <SidebarMenuButton as-child :is-active="$route.path === '/'">
                <NuxtLink to="/">
                  <HomeIcon class="size-4" />
                  <span>Inicio</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <!-- Módulos activos -->
            <SidebarMenuItem v-for="module in activeModules" :key="module.name">
              <SidebarMenuButton as-child :is-active="$route.path.startsWith(module.route)">
                <NuxtLink :to="module.route">
                  <component :is="getModuleIcon(module.icon)" class="size-4" />
                  <span>{{ module.label }}</span>
                </NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>

    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
  </Sidebar>
</template>

<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '~/components/ui/sidebar'
import {
  HomeIcon,
  UsersIcon,
  PackageIcon,
  SettingsIcon,
  ChartBarIcon,
  FileTextIcon,
} from 'lucide-vue-next'
import { getActiveModules } from '~/app/module-config'
import NavUser from '~/components/layout/NavUser.vue'

const activeModules = getActiveModules()
const route = useRoute()

// Mapeo de iconos
const iconMap: Record<string, any> = {
  users: UsersIcon,
  package: PackageIcon,
  settings: SettingsIcon,
  chart: ChartBarIcon,
  file: FileTextIcon,
}

const getModuleIcon = (icon?: string) => {
  if (!icon) return PackageIcon
  return iconMap[icon] || PackageIcon
}

// Función para abrir selector de layout
const openLayoutSelector = () => {
  // Esto se implementará en el componente LayoutSwitcher
  const event = new CustomEvent('open-layout-selector')
  window.dispatchEvent(event)
}
</script>
