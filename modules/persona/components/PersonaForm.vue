<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <FormField
      v-model="formData.nombre"
      label="Nombre"
      placeholder="Ingrese el nombre"
      :required="true"
      :error="errors.nombre"
    />

    <FormField
      v-model="formData.apellido"
      label="Apellido"
      placeholder="Ingrese el apellido"
      :required="true"
      :error="errors.apellido"
    />

    <FormField
      v-model="formData.email"
      label="Email"
      type="email"
      placeholder="correo@ejemplo.com"
      :required="true"
      :error="errors.email"
    />

    <FormField
      v-model="formData.telefono"
      label="Teléfono"
      type="tel"
      placeholder="+34 600 000 000"
      :error="errors.telefono"
    />

    <FormField
      v-model="formData.edad"
      label="Edad"
      type="number"
      placeholder="18"
      :error="errors.edad"
    />

    <div class="flex justify-end gap-2">
      <Button
        type="button"
        variant="outline"
        @click="$emit('cancel')"
      >
        {{ $t('common.cancel') }}
      </Button>
      <Button type="submit" :disabled="loading">
        {{ loading ? $t('common.loading') : $t('common.save') }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import FormField from '~/components/forms/FormField.vue'
import type { Persona, CreatePersonaDto } from '../types'

interface Props {
  persona?: Persona
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false
})

const emit = defineEmits<{
  submit: [data: CreatePersonaDto]
  cancel: []
}>()

const formData = ref<CreatePersonaDto>({
  nombre: props.persona?.nombre || '',
  apellido: props.persona?.apellido || '',
  email: props.persona?.email || '',
  telefono: props.persona?.telefono || '',
  edad: props.persona?.edad || undefined,
})

const errors = ref<Record<string, string>>({})

const validate = () => {
  errors.value = {}

  if (!formData.value.nombre) {
    errors.value.nombre = 'El nombre es requerido'
  }

  if (!formData.value.apellido) {
    errors.value.apellido = 'El apellido es requerido'
  }

  if (!formData.value.email) {
    errors.value.email = 'El email es requerido'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errors.value.email = 'Email inválido'
  }

  if (formData.value.edad && (formData.value.edad < 0 || formData.value.edad > 150)) {
    errors.value.edad = 'Edad inválida'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = () => {
  if (validate()) {
    emit('submit', formData.value)
  }
}

// Actualizar form cuando cambia la persona
watch(() => props.persona, (newPersona) => {
  if (newPersona) {
    formData.value = {
      nombre: newPersona.nombre,
      apellido: newPersona.apellido,
      email: newPersona.email,
      telefono: newPersona.telefono,
      edad: newPersona.edad,
    }
  }
}, { immediate: true })
</script>
