<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { z } from 'zod'
import type { FormFieldConfig } from '~/components/shared/DynamicForm/types'
import type { UpdateUserDto } from '~/modules/users/types'
import { useUsers } from '~/modules/users/composables/useUsers'
import { useAuth } from '~/modules/auth/composables/useAuth'
import { Button } from '~/components/ui/button'

definePageMeta({
  // layout: 'default',
  middleware: ['auth'],
})

const router = useRouter()
const route = useRoute()
const userId = computed(() => route.params.id as string)

const { fetchUser, updateUser, currentUser, loading, error, clearError } = useUsers()
const { user: authUser } = useAuth()

const loadingUser = ref(false)

// Schema de validación con Zod (password es opcional en edición)
const validationSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email es requerido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (@$!%*?&)'
    )
    .optional()
    .or(z.literal('')),
  confirmPassword: z.string().optional().or(z.literal('')),
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  phone: z.string().regex(
    /^\+?[1-9]\d{1,14}$/,
    'El teléfono debe estar en formato internacional (ej: +17868391882)'
  ),
  role: z.enum(['client', 'staff', 'admin', 'super_admin'], {
    errorMap: () => ({ message: 'Seleccione un rol válido' }),
  }),
  isActive: z.boolean().default(true),
  emailVerified: z.boolean().optional(),
  phoneVerified: z.boolean().optional(),
}).refine(
  (data) => {
    // Si se ingresó una contraseña, validar que coincidan
    if (data.password && data.password.length > 0) {
      return data.password === data.confirmPassword
    }
    return true
  },
  {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  }
)

// Configuración de campos del formulario
const formFields: FormFieldConfig[] = [
  {
    name: 'firstName',
    label: 'Nombre',
    type: 'text',
    placeholder: 'Ingrese el nombre',
  },
  {
    name: 'lastName',
    label: 'Apellido',
    type: 'text',
    placeholder: 'Ingrese el apellido',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'ejemplo@correo.com',
  },
  {
    name: 'phone',
    label: 'Teléfono',
    type: 'text',
    placeholder: '+17868391882',
    description: 'Formato internacional (ej: +17868391882)',
  },
  {
    name: 'password',
    label: 'Nueva Contraseña',
    type: 'password',
    placeholder: '••••••••',
    description: 'Dejar en blanco para mantener la actual. Mínimo 8 caracteres, debe incluir mayúscula, minúscula, número y carácter especial',
  },
  {
    name: 'confirmPassword',
    label: 'Confirmar Nueva Contraseña',
    type: 'password',
    placeholder: '••••••••',
  },
  {
    name: 'role',
    label: 'Rol',
    type: 'select',
    options: [
      { value: 'client', label: 'Cliente' },
      { value: 'staff', label: 'Personal' },
      { value: 'admin', label: 'Administrador' },
      { value: 'super_admin', label: 'Super Administrador' },
    ],
    description: 'Seleccione el rol del usuario',
  },
  {
    name: 'isActive',
    label: 'Usuario Activo',
    type: 'switch',
    defaultValue: true,
    description: 'Habilitar o deshabilitar el acceso del usuario',
  },
  {
    name: 'emailVerified',
    label: 'Email Verificado',
    type: 'switch',
    defaultValue: false,
    description: 'Marcar email como verificado',
  },
  {
    name: 'phoneVerified',
    label: 'Teléfono Verificado',
    type: 'switch',
    defaultValue: false,
    description: 'Marcar teléfono como verificado',
  },
]

// Verificar si el usuario actual es super_admin
const isSuperAdmin = computed(() => authUser.value?.role === 'super_admin')

// Valores iniciales (se llenarán al cargar el usuario)
const initialValues = ref({
  email: '',
  password: '',
  confirmPassword: '',
  firstName: '',
  lastName: '',
  phone: '',
  role: 'client',
  isActive: true,
  emailVerified: false,
  phoneVerified: false,
})

// Cargar datos del usuario
onMounted(async () => {
  loadingUser.value = true
  try {
    const user = await fetchUser(userId.value)
    if (user) {
      initialValues.value = {
        email: user.email,
        password: '',
        confirmPassword: '',
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        emailVerified: user.emailVerified || false,
        phoneVerified: user.phoneVerified || false,
      }
    }
  } catch (e) {
    console.error('Error loading user:', e)
  } finally {
    loadingUser.value = false
  }
})

// Manejar envío del formulario
const handleSubmit = async (values: any) => {
  clearError()

  try {
    // Preparar datos para actualizar
    const { confirmPassword, password, ...userData } = values

    // Solo incluir password si se ingresó uno nuevo
    const updateData: UpdateUserDto = {
      ...userData,
      ...(password && password.length > 0 ? { password } : {}),
    }

    const updatedUser = await updateUser(userId.value, updateData)

    if (updatedUser) {
      // Redirigir a la lista de usuarios
      router.push('/users')
    }
  } catch (e) {
    console.error('Error updating user:', e)
  }
}

// Cancelar y volver a la lista
const handleCancel = () => {
  router.push('/users')
}

// Volver a la lista
const goBack = () => {
  router.push('/users')
}
</script>

<template>
  <div class="container mx-auto py-6 max-w-4xl">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Editar Usuario</h1>
          <p class="text-muted-foreground text-sm mt-1">
            <span v-if="currentUser">
              {{ currentUser.firstName }} {{ currentUser.lastName }} - {{ currentUser.email }}
            </span>
            <span v-else>Cargando...</span>
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          @click="goBack"
        >
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

    <!-- Mensaje de error -->
    <div v-if="error" class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6">
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

    <!-- Estado de carga -->
    <div v-if="loadingUser" class="flex items-center justify-center py-12">
      <div class="text-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="text-muted-foreground">Cargando usuario...</p>
      </div>
    </div>

    <!-- Formulario -->
    <div v-else class="rounded-lg border p-6">
      <DynamicForm
        :key="userId"
        :fields="formFields"
        :validation-schema="validationSchema"
        :initial-values="initialValues"
        :loading="loading"
        :columns="2"
        submit-text="Actualizar Usuario"
        cancel-text="Cancelar"
        :show-cancel="true"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>
