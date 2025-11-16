<template>
  <div class="container py-8">
      <div class="space-y-8">
        <div>
          <h1 class="text-4xl font-bold">{{ $t('welcome') }}</h1>
          <p class="text-muted-foreground mt-2">{{ $t('app.description') }}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{{ $t('app.title') }}</CardTitle>
            <CardDescription>
              Plantilla profesional con Nuxt 3, shadcn-vue, i18n y Vitest
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="grid gap-4 md:grid-cols-2">
              <div class="space-y-2">
                <h3 class="font-semibold">Características</h3>
                <ul class="list-disc list-inside text-sm space-y-1">
                  <li>Nuxt 3 (última versión)</li>
                  <li>shadcn-vue con Tailwind CSS</li>
                  <li>i18n (ES/EN)</li>
                  <li>Vitest configurado</li>
                  <li>Componentes reutilizables</li>
                  <li>Composables CRUD</li>
                </ul>
              </div>
              <div class="space-y-2">
                <h3 class="font-semibold">Componentes incluidos</h3>
                <ul class="list-disc list-inside text-sm space-y-1">
                  <li>DataTable - Tablas de datos</li>
                  <li>FormField - Campos de formulario</li>
                  <li>ConfirmDialog - Diálogos de confirmación</li>
                  <li>AppHeader - Cabecera con i18n</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button @click="showDialog = true">
              {{ $t('common.create') }}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ejemplo de DataTable</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              :data="sampleData"
              :columns="columns"
              :loading="false"
              @edit="handleEdit"
              @delete="handleDelete"
            />
          </CardContent>
        </Card>
      </div>

    <ConfirmDialog
      v-model:is-open="showDialog"
      title="Crear nuevo recurso"
      confirm-text="Crear"
      @confirm="handleCreate"
    >
      <div class="space-y-4">
        <FormField
          v-model="formData.name"
          label="Nombre"
          placeholder="Ingrese el nombre"
          :required="true"
        />
        <FormField
          v-model="formData.email"
          label="Email"
          type="email"
          placeholder="Ingrese el email"
        />
      </div>
    </ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '~/components/ui/card'
import { DataTable } from '~/components/shared/DataTable'
import FormField from '~/components/forms/FormField.vue'
import ConfirmDialog from '~/components/common/ConfirmDialog.vue'

const showDialog = ref(false)
const formData = ref({
  name: '',
  email: ''
})

const sampleData = ref([
  { id: 1, name: 'Juan Pérez', email: 'juan@example.com', status: 'Active' },
  { id: 2, name: 'María García', email: 'maria@example.com', status: 'Inactive' },
  { id: 3, name: 'Carlos López', email: 'carlos@example.com', status: 'Active' },
])

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Estado' },
]

const handleEdit = (item: any) => {
  console.log('Edit:', item)
}

const handleDelete = (item: any) => {
  console.log('Delete:', item)
}

const handleCreate = () => {
  console.log('Create:', formData.value)
  formData.value = { name: '', email: '' }
}
</script>
