<template>
  <div class="container py-8">
    <PersonaList
      :personas="personas"
      :loading="loading"
      :error="error"
      @create="openCreateDialog"
      @edit="openEditDialog"
      @delete="openDeleteDialog"
    />

    <!-- Modal Crear/Editar -->
    <ConfirmDialog
      v-model:is-open="showFormDialog"
      :title="isEditing ? 'Editar Persona' : 'Crear Persona'"
      confirm-text=""
      cancel-text=""
    >
      <PersonaForm
        :persona="selectedPersona"
        :loading="loading"
        @submit="handleSubmit"
        @cancel="showFormDialog = false"
      />
    </ConfirmDialog>

    <!-- Modal Eliminar -->
    <ConfirmDialog
      v-model:is-open="showDeleteDialog"
      title="Confirmar eliminación"
      :description="`¿Estás seguro de eliminar a ${selectedPersona?.nombre} ${selectedPersona?.apellido}?`"
      confirm-variant="destructive"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import PersonaList from '../components/PersonaList.vue'
import PersonaForm from '../components/PersonaForm.vue'
import ConfirmDialog from '~/components/common/ConfirmDialog.vue'
import { usePersonas } from '../composables/usePersonas'
import type { Persona, CreatePersonaDto } from '../types'

// Composable del módulo
const {
  personas,
  loading,
  error,
  obtenerPersonas,
  crearPersona,
  actualizarPersona,
  eliminarPersona,
} = usePersonas()

// Estado local
const showFormDialog = ref(false)
const showDeleteDialog = ref(false)
const selectedPersona = ref<Persona | undefined>()
const isEditing = computed(() => !!selectedPersona.value?.id)

// Cargar personas al montar
onMounted(() => {
  obtenerPersonas()
})

// Abrir diálogo crear
const openCreateDialog = () => {
  selectedPersona.value = undefined
  showFormDialog.value = true
}

// Abrir diálogo editar
const openEditDialog = (persona: Persona) => {
  selectedPersona.value = persona
  showFormDialog.value = true
}

// Abrir diálogo eliminar
const openDeleteDialog = (persona: Persona) => {
  selectedPersona.value = persona
  showDeleteDialog.value = true
}

// Manejar submit del formulario
const handleSubmit = async (data: CreatePersonaDto) => {
  if (isEditing.value && selectedPersona.value?.id) {
    await actualizarPersona(selectedPersona.value.id, data)
  } else {
    await crearPersona(data)
  }
  showFormDialog.value = false
  selectedPersona.value = undefined
}

// Manejar eliminación
const handleDelete = async () => {
  if (selectedPersona.value?.id) {
    await eliminarPersona(selectedPersona.value.id)
    selectedPersona.value = undefined
  }
}
</script>
