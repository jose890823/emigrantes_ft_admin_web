<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <!-- Header con breadcrumb y trigger -->
      <header class="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
        <div class="flex items-center gap-2 px-4 w-full">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />

          <!-- Breadcrumb -->
          <Breadcrumb class="flex-1">
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink href="/">
                  Inicio
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator v-if="breadcrumbs.length > 0" class="hidden md:block" />
              <BreadcrumbItem v-for="(crumb, index) in breadcrumbs" :key="index">
                <BreadcrumbLink v-if="index < breadcrumbs.length - 1" :href="crumb.href">
                  {{ crumb.label }}
                </BreadcrumbLink>
                <BreadcrumbPage v-else>
                  {{ crumb.label }}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <!-- Controles del header -->
          <div class="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <LayoutSelector />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <!-- Contenido principal -->
      <main class="flex flex-1 flex-col p-4">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import AppSidebar from '~/components/layout/AppSidebar.vue'
import LanguageSwitcher from '~/components/layout/LanguageSwitcher.vue'
import ThemeToggle from '~/components/layout/ThemeToggle.vue'
import LayoutSelector from '~/components/layout/LayoutSelector.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '~/components/ui/breadcrumb'
import { Separator } from '~/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '~/components/ui/sidebar'

/**
 * Layout con sidebar vertical colapsable
 * Similar a los dashboards modernos con menú lateral
 */

const route = useRoute()

// Generar breadcrumbs dinámicamente desde la ruta
const breadcrumbs = computed(() => {
  const paths = route.path.split('/').filter(Boolean)
  const crumbs: Array<{ label: string; href: string }> = []

  let currentPath = ''
  paths.forEach((path, index) => {
    currentPath += `/${path}`
    crumbs.push({
      label: path.charAt(0).toUpperCase() + path.slice(1),
      href: currentPath
    })
  })

  return crumbs
})
</script>
