<script setup lang="ts">
import { ref } from 'vue'
import { z } from 'zod'
import { DynamicForm } from '~/components/shared/DynamicForm'
import type { FormFieldConfig } from '~/components/shared/DynamicForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'default',
})

const { success } = useToast()

// Schema de validación con Zod
const userSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  age: z.number().min(18, 'Debes ser mayor de 18 años').max(100),
  bio: z.string().optional(),
  role: z.string(),
  country: z.string(),
  receiveEmails: z.boolean(),
  isActive: z.boolean(),
  birthDate: z.string().optional(),
})

// Configuración de campos del formulario
const formFields: FormFieldConfig[] = [
  {
    name: 'firstName',
    label: 'Nombre',
    type: 'text',
    placeholder: 'Ingresa tu nombre',
    description: 'Tu nombre de pila',
  },
  {
    name: 'lastName',
    label: 'Apellido',
    type: 'text',
    placeholder: 'Ingresa tu apellido',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'tu@email.com',
    description: 'Usaremos este email para contactarte',
  },
  {
    name: 'password',
    label: 'Contraseña',
    type: 'password',
    placeholder: '••••••••',
  },
  {
    name: 'age',
    label: 'Edad',
    type: 'number',
    defaultValue: 18,
    attrs: { min: 18, max: 100 },
  },
  {
    name: 'birthDate',
    label: 'Fecha de Nacimiento',
    type: 'date',
  },
  {
    name: 'bio',
    label: 'Biografía',
    type: 'textarea',
    placeholder: 'Cuéntanos sobre ti...',
    description: 'Breve descripción sobre ti',
    attrs: { rows: 4 },
  },
  {
    name: 'role',
    label: 'Rol',
    type: 'select',
    placeholder: 'Selecciona un rol',
    options: [
      { label: 'Administrador', value: 'admin' },
      { label: 'Personal', value: 'staff' },
      { label: 'Cliente', value: 'client' },
    ],
    defaultValue: 'client',
  },
  {
    name: 'country',
    label: 'País',
    type: 'select',
    placeholder: 'Selecciona tu país',
    options: [
      { label: 'España', value: 'ES' },
      { label: 'México', value: 'MX' },
      { label: 'Argentina', value: 'AR' },
      { label: 'Colombia', value: 'CO' },
      { label: 'Chile', value: 'CL' },
    ],
  },
  {
    name: 'receiveEmails',
    label: 'Recibir Emails',
    type: 'checkbox',
    placeholder: 'Quiero recibir emails promocionales',
    defaultValue: false,
  },
  {
    name: 'isActive',
    label: 'Estado Activo',
    type: 'switch',
    placeholder: 'Usuario activo',
    defaultValue: true,
    description: 'Activa o desactiva el usuario',
  },
]

// Estado del formulario
const loading = ref(false)
const formValues = ref({})

// Manejar submit
const handleSubmit = async (values: any) => {
  loading.value = true

  // Simular llamada a API
  await new Promise((resolve) => setTimeout(resolve, 2000))

  console.log('Formulario enviado:', values)
  success('Formulario enviado', 'Los datos se guardaron correctamente')

  loading.value = false
}

// Manejar cancel
const handleCancel = () => {
  console.log('Formulario cancelado')
}

// Actualizar valores en tiempo real
const handleUpdate = (values: any) => {
  formValues.value = values
}
</script>

<template>
  <div class="container mx-auto py-8">
    <div class="mb-6">
      <h1 class="text-3xl font-bold">Demo DynamicForm</h1>
      <p class="text-muted-foreground mt-2">
        Ejemplo de formulario dinámico con validación usando Zod y vee-validate
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Formulario -->
      <Card>
        <CardHeader>
          <CardTitle>Formulario de Usuario</CardTitle>
          <CardDescription>
            Completa todos los campos requeridos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DynamicForm
            :fields="formFields"
            :validation-schema="userSchema"
            :loading="loading"
            :show-cancel="true"
            :columns="2"
            submit-text="Guardar Usuario"
            @submit="handleSubmit"
            @cancel="handleCancel"
            @update:model-value="handleUpdate"
          />
        </CardContent>
      </Card>

      <!-- Vista previa de valores -->
      <Card>
        <CardHeader>
          <CardTitle>Valores del Formulario</CardTitle>
          <CardDescription>
            Valores en tiempo real
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre class="bg-muted p-4 rounded-lg text-sm overflow-auto max-h-[600px]">{{
            JSON.stringify(formValues, null, 2)
          }}</pre>
        </CardContent>
      </Card>
    </div>

    <!-- Ejemplos de uso -->
    <Card class="mt-6">
      <CardHeader>
        <CardTitle>Ejemplos de Configuración</CardTitle>
        <CardDescription>
          Diferentes formas de configurar el formulario dinámico
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div>
          <h3 class="font-semibold mb-2">1 Columna (móvil)</h3>
          <code class="text-sm bg-muted px-2 py-1 rounded">:columns="1"</code>
        </div>

        <div>
          <h3 class="font-semibold mb-2">2 Columnas (tablet+)</h3>
          <code class="text-sm bg-muted px-2 py-1 rounded">:columns="2"</code>
        </div>

        <div>
          <h3 class="font-semibold mb-2">3 Columnas (desktop)</h3>
          <code class="text-sm bg-muted px-2 py-1 rounded">:columns="3"</code>
        </div>

        <div>
          <h3 class="font-semibold mb-2">4 Columnas (pantallas grandes)</h3>
          <code class="text-sm bg-muted px-2 py-1 rounded">:columns="4"</code>
        </div>
      </CardContent>
    </Card>
  </div>
</template>
