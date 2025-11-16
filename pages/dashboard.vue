<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuth } from '~/modules/auth/composables/useAuth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

const { user, isAuthenticated, initAuth } = useAuth()

// Inicializar auth desde localStorage y obtener datos actualizados del usuario
onMounted(async () => {
  await initAuth()

  // Si no está autenticado después de inicializar, redirigir a login
  if (!isAuthenticated.value) {
    navigateTo('/login')
  }
})
</script>

<template>
  <div class="container py-8">
    <div class="space-y-8">
      <!-- Header -->
      <div>
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <p class="text-muted-foreground mt-2">
          Bienvenido de nuevo, {{ user?.firstName }} {{ user?.lastName }}
        </p>
      </div>

      <!-- User Info Card -->
      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
          <CardDescription>Tus datos de perfil</CardDescription>
        </CardHeader>
        <CardContent class="space-y-2">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <p class="text-sm text-muted-foreground">Email</p>
              <p class="font-medium">{{ user?.email }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Rol</p>
              <p class="font-medium">{{ user?.role }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Teléfono</p>
              <p class="font-medium">{{ user?.phone }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Estado</p>
              <p class="font-medium">{{ user?.isActive ? 'Activo' : 'Inactivo' }}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Stats Cards -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">
              Total Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">0</div>
            <p class="text-xs text-muted-foreground">
              Próximamente
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">
              POAs Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">0</div>
            <p class="text-xs text-muted-foreground">
              Próximamente
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">
              Pagos Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">0</div>
            <p class="text-xs text-muted-foreground">
              Próximamente
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle class="text-sm font-medium">
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">0</div>
            <p class="text-xs text-muted-foreground">
              Próximamente
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
