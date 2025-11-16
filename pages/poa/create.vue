<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { z } from 'zod'
import type { FormFieldConfig } from '~/components/shared/DynamicForm/types'
import type { CreatePOADto } from '~/modules/poa/types'
import { POAType } from '~/modules/poa/types'
import { usePoa } from '~/modules/poa/composables/usePoa'
import { Button } from '~/components/ui/button'

definePageMeta({
  middleware: ['auth'],
})

const router = useRouter()
const { createPOA, loading, error, clearError } = usePoa()

// Tipo seleccionado (para mostrar/ocultar activationTriggers)
const selectedType = ref<POAType>(POAType.STANDARD)

// Schema de validación con Zod
const validationSchema = z.object({
  type: z.enum([POAType.STANDARD, POAType.DURABLE, POAType.SPRINGING], {
    errorMap: () => ({ message: 'Seleccione un tipo de POA válido' }),
  }),
  clientFullName: z.string().min(3, 'El nombre completo debe tener al menos 3 caracteres'),
  clientAddress: z.string().min(10, 'La dirección debe tener al menos 10 caracteres'),
  clientIdentification: z.string().min(5, 'La identificación debe tener al menos 5 caracteres'),
  clientEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  clientPhone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'El teléfono debe estar en formato internacional (ej: +17868391882)'
    )
    .optional()
    .or(z.literal('')),
  instructions: z.string().optional(),
  beneficiaries: z.string().optional(),
  activationTriggers: z.string().optional(),
})

// Configuración de campos del formulario
const formFields = computed<FormFieldConfig[]>(() => [
  {
    name: 'type',
    label: 'Tipo de POA',
    type: 'select',
    options: [
      { value: POAType.STANDARD, label: 'Estándar - Poder general' },
      { value: POAType.DURABLE, label: 'Duradero - Permanece válido si el cliente queda incapacitado' },
      { value: POAType.SPRINGING, label: 'Condicional - Se activa bajo condiciones específicas' },
    ],
    description: 'Seleccione el tipo de poder notarial',
  },
  {
    name: 'clientFullName',
    label: 'Nombre Completo del Cliente',
    type: 'text',
    placeholder: 'Ingrese el nombre completo',
  },
  {
    name: 'clientIdentification',
    label: 'Identificación del Cliente',
    type: 'text',
    placeholder: 'Número de identificación o pasaporte',
  },
  {
    name: 'clientEmail',
    label: 'Email del Cliente',
    type: 'email',
    placeholder: 'ejemplo@correo.com',
    description: 'Opcional',
  },
  {
    name: 'clientPhone',
    label: 'Teléfono del Cliente',
    type: 'text',
    placeholder: '+17868391882',
    description: 'Formato internacional (ej: +17868391882) - Opcional',
  },
  {
    name: 'clientAddress',
    label: 'Dirección del Cliente',
    type: 'textarea',
    placeholder: 'Ingrese la dirección completa',
    rows: 3,
  },
  {
    name: 'instructions',
    label: 'Instrucciones del POA',
    type: 'textarea',
    placeholder: 'Instrucciones detalladas para el poder notarial...',
    description: 'Detalles sobre cómo debe ser ejecutado el poder notarial - Opcional',
    rows: 4,
  },
  {
    name: 'beneficiaries',
    label: 'Beneficiarios',
    type: 'textarea',
    placeholder: 'Lista de beneficiarios y sus detalles...',
    description: 'Personas o entidades que se beneficiarán del POA - Opcional',
    rows: 3,
  },
  // Campo condicional para POA tipo Springing
  ...(selectedType.value === POAType.SPRINGING
    ? [
        {
          name: 'activationTriggers',
          label: 'Condiciones de Activación',
          type: 'textarea',
          placeholder: 'Condiciones bajo las cuales se activará el POA...',
          description: 'Para POA Condicional: especifique las condiciones que activarán el poder',
          rows: 3,
        } as FormFieldConfig,
      ]
    : []),
])

// Valores iniciales
const initialValues = ref({
  type: POAType.STANDARD,
  clientFullName: '',
  clientAddress: '',
  clientIdentification: '',
  clientEmail: '',
  clientPhone: '',
  instructions: '',
  beneficiaries: '',
  activationTriggers: '',
})

// Manejar cambio de tipo para actualizar formulario
const handleTypeChange = (values: any) => {
  selectedType.value = values.type
}

// Manejar envío del formulario
const handleSubmit = async (values: any) => {
  clearError()

  try {
    // Limpiar campos vacíos opcionales
    const poaData: CreatePOADto = {
      type: values.type,
      clientFullName: values.clientFullName,
      clientAddress: values.clientAddress,
      clientIdentification: values.clientIdentification,
      ...(values.clientEmail && values.clientEmail.trim() && { clientEmail: values.clientEmail }),
      ...(values.clientPhone && values.clientPhone.trim() && { clientPhone: values.clientPhone }),
      ...(values.instructions && values.instructions.trim() && { instructions: values.instructions }),
      ...(values.beneficiaries && values.beneficiaries.trim() && { beneficiaries: values.beneficiaries }),
      ...(values.activationTriggers &&
        values.activationTriggers.trim() && { activationTriggers: values.activationTriggers }),
    }

    const newPOA = await createPOA(poaData)

    if (newPOA) {
      // Redirigir a la lista de POAs
      router.push('/poa')
    }
  } catch (e) {
    console.error('Error creating POA:', e)
  }
}

// Cancelar y volver a la lista
const handleCancel = () => {
  router.push('/poa')
}

// Volver a la lista
const goBack = () => {
  router.push('/poa')
}
</script>

<template>
  <div class="container mx-auto py-6 max-w-4xl">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Crear Poder Notarial (POA)</h1>
          <p class="text-muted-foreground text-sm mt-1">
            Complete el formulario para crear un nuevo poder notarial
          </p>
        </div>
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

    <!-- Mensaje de error -->
    <div
      v-if="error"
      class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6"
    >
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

    <!-- Formulario -->
    <div class="rounded-lg border p-6">
      <DynamicForm
        :fields="formFields"
        :validation-schema="validationSchema"
        :initial-values="initialValues"
        :loading="loading"
        :columns="2"
        submit-text="Crear POA"
        cancel-text="Cancelar"
        :show-cancel="true"
        @submit="handleSubmit"
        @cancel="handleCancel"
        @values-change="handleTypeChange"
      />
    </div>
  </div>
</template>
