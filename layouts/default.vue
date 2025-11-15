<template>
  <div class="min-h-screen bg-background">
    <AppHeader />

    <div class="flex">
      <!-- Sidebar de navegación de módulos -->
      <aside class="w-64 border-r bg-muted/40 min-h-[calc(100vh-4rem)] p-4">
        <nav class="space-y-2">
          <h3 class="font-semibold text-sm text-muted-foreground px-3 mb-2">
            Módulos
          </h3>

          <NuxtLink
            to="/"
            class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            active-class="bg-accent font-medium"
          >
            <span>🏠</span>
            <span>Inicio</span>
          </NuxtLink>

          <NuxtLink
            v-for="module in activeModules"
            :key="module.name"
            :to="module.route"
            class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
            active-class="bg-accent font-medium"
          >
            <span>{{ module.icon ? moduleIcons[module.icon] || '📦' : '📦' }}</span>
            <span>{{ module.label }}</span>
          </NuxtLink>
        </nav>
      </aside>

      <!-- Contenido principal -->
      <main class="flex-1">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/layout/AppHeader.vue'
import { getActiveModules } from '~/app/module-config'

const activeModules = getActiveModules()

const moduleIcons: Record<string, string> = {
  users: '👥',
  package: '📦',
  settings: '⚙️',
  chart: '📊',
  file: '📄',
}
</script>
