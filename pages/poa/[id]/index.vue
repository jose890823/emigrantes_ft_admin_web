<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePoa } from '~/modules/poa/composables/usePoa'
import { useUsers } from '~/modules/users/composables/useUsers'
import { POAStatus, POAType, POAStatusLabels, POATypeLabels, POAStatusVariants } from '~/modules/poa/types'
import type { POAHistory, POAExecution, POADocument } from '~/modules/poa/types'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

definePageMeta({
  middleware: ['auth'],
})

const router = useRouter()
const route = useRoute()
const poaId = computed(() => route.params.id as string)

const {
  currentPOA,
  loading,
  error,
  fetchPOA,
  approvePOA,
  rejectPOA,
  assignPOA,
  notarizePOA,
  activatePOA,
  cancelPOA,
  getHistory,
  getExecutions,
  getDocuments,
  uploadDocument,
  deleteDocument,
  clearError,
} = usePoa()

const { users, fetchUsers } = useUsers()

// Estado local
const activeTab = ref('details')
const history = ref<POAHistory[]>([])
const executions = ref<POAExecution[]>([])
const documents = ref<POADocument[]>([])
const loadingHistory = ref(false)
const loadingExecutions = ref(false)
const loadingDocuments = ref(false)

// Modales y formularios
const showRejectModal = ref(false)
const showAssignModal = ref(false)
const showCancelModal = ref(false)
const rejectReason = ref('')
const selectedAdminId = ref('')
const cancelReason = ref('')
const actionNotes = ref('')

// Upload de archivos
const selectedFile = ref<File | null>(null)
const uploadDescription = ref('')
const uploadingFile = ref(false)

// Cargar datos al montar
onMounted(async () => {
  await loadPOA()
  await loadHistory()
  await loadExecutions()
  await loadDocuments()
  await loadAdmins()
})

// Cargar POA
const loadPOA = async () => {
  try {
    await fetchPOA(poaId.value)
  } catch (e) {
    console.error('Error loading POA:', e)
  }
}

// Cargar historial
const loadHistory = async () => {
  loadingHistory.value = true
  try {
    const response: any = await getHistory(poaId.value)
    history.value = response.data || response || []
  } catch (e) {
    console.error('Error loading history:', e)
  } finally {
    loadingHistory.value = false
  }
}

// Cargar ejecuciones
const loadExecutions = async () => {
  loadingExecutions.value = true
  try {
    const response: any = await getExecutions(poaId.value)
    executions.value = response.data || response || []
  } catch (e) {
    console.error('Error loading executions:', e)
  } finally {
    loadingExecutions.value = false
  }
}

// Cargar documentos
const loadDocuments = async () => {
  loadingDocuments.value = true
  try {
    const response: any = await getDocuments(poaId.value)
    documents.value = response.data || response || []
  } catch (e) {
    console.error('Error loading documents:', e)
    // No mostrar error si es un 404 o error de endpoint no encontrado
    // Limpiar el error global y solo inicializar con array vacío
    clearError()
    documents.value = []
  } finally {
    loadingDocuments.value = false
  }
}

// Cargar administradores
const loadAdmins = async () => {
  try {
    await fetchUsers({ role: 'admin' } as any)
  } catch (e) {
    console.error('Error loading admins:', e)
  }
}

// Volver a la lista
const goBack = () => {
  router.push('/poa')
}

// Formatear fecha
const formatDate = (date?: Date | string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Función helper para verificar si un objeto/array JSON está vacío
const isJSONEmpty = (value: any): boolean => {
  if (!value) return true

  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value

    // Si es un array, verificar si está vacío
    if (Array.isArray(parsed)) {
      return parsed.length === 0
    }

    // Si es un objeto, verificar si todos sus valores son arrays/objetos vacíos
    if (typeof parsed === 'object') {
      const values = Object.values(parsed)
      if (values.length === 0) return true

      // Verificar si todos los valores son arrays vacíos
      return values.every(v =>
        Array.isArray(v) && v.length === 0 ||
        (typeof v === 'object' && v !== null && Object.keys(v).length === 0)
      )
    }

    return false
  } catch (e) {
    return false
  }
}

// Función helper para formatear JSON
const formatJSONField = (value: any): string => {
  if (!value) return ''

  try {
    // Si ya es un string, intentar parsearlo
    const parsed = typeof value === 'string' ? JSON.parse(value) : value
    // Formatear con indentación para mejor legibilidad
    return JSON.stringify(parsed, null, 2)
  } catch (e) {
    // Si no es JSON válido, devolver el valor original
    return value?.toString() || ''
  }
}

// Parsed data para mostrar de forma estructurada
const parsedInstructions = computed(() => {
  if (!currentPOA.value?.instructions) return null
  if (isJSONEmpty(currentPOA.value.instructions)) return null

  try {
    const parsed = typeof currentPOA.value.instructions === 'string'
      ? JSON.parse(currentPOA.value.instructions)
      : currentPOA.value.instructions
    return parsed
  } catch (e) {
    return null
  }
})

const parsedBeneficiaries = computed(() => {
  if (!currentPOA.value?.beneficiaries) return null
  if (isJSONEmpty(currentPOA.value.beneficiaries)) return null

  try {
    const parsed = typeof currentPOA.value.beneficiaries === 'string'
      ? JSON.parse(currentPOA.value.beneficiaries)
      : currentPOA.value.beneficiaries
    return Array.isArray(parsed) ? parsed : null
  } catch (e) {
    return null
  }
})

const parsedActivationTriggers = computed(() => {
  if (!currentPOA.value?.activationTriggers) return null
  if (isJSONEmpty(currentPOA.value.activationTriggers)) return null

  try {
    const parsed = typeof currentPOA.value.activationTriggers === 'string'
      ? JSON.parse(currentPOA.value.activationTriggers)
      : currentPOA.value.activationTriggers
    return Array.isArray(parsed) ? parsed : null
  } catch (e) {
    return null
  }
})

// Mapeo de condiciones de activación a etiquetas legibles
const activationTriggerLabels: Record<string, string> = {
  deportation: 'Deportación',
  absence: 'Ausencia prolongada',
  incapacity: 'Incapacidad',
  imprisonment: 'Encarcelamiento',
  other: 'Otra condición'
}

// Mapeo de relaciones a etiquetas legibles
const relationshipLabels: Record<string, string> = {
  spouse: 'Cónyuge',
  child: 'Hijo/a',
  parent: 'Padre/Madre',
  sibling: 'Hermano/a',
  friend: 'Amigo/a',
  other: 'Otra relación',
  '1': 'Cónyuge',
  '2': 'Hijo/a',
  '3': 'Padre/Madre',
  '4': 'Hermano/a',
  '5': 'Amigo/a',
  '6': 'Otra relación'
}

// Acciones según el estado
const canApprove = computed(() => {
  return currentPOA.value?.status === POAStatus.IN_REVIEW || currentPOA.value?.status === POAStatus.PENDING
})

const canReject = computed(() => {
  return currentPOA.value?.status === POAStatus.IN_REVIEW || currentPOA.value?.status === POAStatus.PENDING
})

const canAssign = computed(() => {
  return currentPOA.value?.status === POAStatus.PENDING || currentPOA.value?.status === POAStatus.IN_REVIEW
})

const canNotarize = computed(() => {
  return currentPOA.value?.status === POAStatus.APPROVED
})

const canActivate = computed(() => {
  return currentPOA.value?.status === POAStatus.NOTARIZED
})

const canCancel = computed(() => {
  return currentPOA.value && ![POAStatus.CANCELLED, POAStatus.COMPLETED].includes(currentPOA.value.status as POAStatus)
})

// Manejar aprobación
const handleApprove = async () => {
  if (!confirm('¿Está seguro de aprobar este POA?')) return

  try {
    await approvePOA(poaId.value, { notes: actionNotes.value || undefined })
    await loadPOA()
    await loadHistory()
    actionNotes.value = ''
  } catch (e) {
    console.error('Error approving POA:', e)
  }
}

// Manejar rechazo
const handleReject = async () => {
  if (!rejectReason.value.trim()) {
    alert('Debe ingresar una razón para el rechazo')
    return
  }

  try {
    await rejectPOA(poaId.value, {
      reason: rejectReason.value,
      notes: actionNotes.value || undefined,
    })
    await loadPOA()
    await loadHistory()
    showRejectModal.value = false
    rejectReason.value = ''
    actionNotes.value = ''
  } catch (e) {
    console.error('Error rejecting POA:', e)
  }
}

// Manejar asignación
const handleAssign = async () => {
  if (!selectedAdminId.value) {
    alert('Debe seleccionar un administrador')
    return
  }

  try {
    await assignPOA(poaId.value, {
      adminId: selectedAdminId.value,
      notes: actionNotes.value || undefined,
    })
    await loadPOA()
    await loadHistory()
    showAssignModal.value = false
    selectedAdminId.value = ''
    actionNotes.value = ''
  } catch (e) {
    console.error('Error assigning POA:', e)
  }
}

// Manejar notarización
const handleNotarize = async () => {
  if (!confirm('¿Está seguro de marcar este POA como notarizado?')) return

  try {
    await notarizePOA(poaId.value, { notes: actionNotes.value || undefined })
    await loadPOA()
    await loadHistory()
    actionNotes.value = ''
  } catch (e) {
    console.error('Error notarizing POA:', e)
  }
}

// Manejar activación
const handleActivate = async () => {
  if (!confirm('¿Está seguro de activar este POA?')) return

  try {
    await activatePOA(poaId.value, { notes: actionNotes.value || undefined })
    await loadPOA()
    await loadHistory()
    actionNotes.value = ''
  } catch (e) {
    console.error('Error activating POA:', e)
  }
}

// Manejar cancelación
const handleCancel = async () => {
  if (!cancelReason.value.trim()) {
    alert('Debe ingresar una razón para la cancelación')
    return
  }

  try {
    await cancelPOA(poaId.value, {
      reason: cancelReason.value,
      notes: actionNotes.value || undefined,
    })
    await loadPOA()
    await loadHistory()
    showCancelModal.value = false
    cancelReason.value = ''
    actionNotes.value = ''
  } catch (e) {
    console.error('Error canceling POA:', e)
  }
}

// Manejar selección de archivo
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

// Subir documento
const handleUploadDocument = async () => {
  if (!selectedFile.value) {
    alert('Debe seleccionar un archivo')
    return
  }

  uploadingFile.value = true
  try {
    await uploadDocument(poaId.value, selectedFile.value, uploadDescription.value || undefined)
    await loadDocuments()
    selectedFile.value = null
    uploadDescription.value = ''
    // Reset input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  } catch (e) {
    console.error('Error uploading document:', e)
  } finally {
    uploadingFile.value = false
  }
}

// Eliminar documento
const handleDeleteDocument = async (documentId: string) => {
  if (!confirm('¿Está seguro de eliminar este documento?')) return

  try {
    await deleteDocument(poaId.value, documentId)
    await loadDocuments()
  } catch (e) {
    console.error('Error deleting document:', e)
  }
}

// Administradores disponibles
const availableAdmins = computed(() => {
  return users.value.filter((u) => u.role === 'admin' || u.role === 'super_admin')
})
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-2">
        <div>
          <h1 class="text-2xl font-bold tracking-tight">Detalle de POA</h1>
          <p class="text-muted-foreground text-sm mt-1">
            <span v-if="currentPOA">
              {{ currentPOA.clientFullName }} - {{ POAStatusLabels[currentPOA.status as POAStatus] }}
            </span>
            <span v-else>Cargando...</span>
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
    <div v-if="error" class="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg">
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
    <div v-if="loading && !currentPOA" class="flex items-center justify-center py-12">
      <div class="text-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p class="text-muted-foreground">Cargando POA...</p>
      </div>
    </div>

    <!-- Contenido -->
    <div v-else-if="currentPOA">
      <!-- Información general y acciones -->
      <div class="grid gap-6 md:grid-cols-3 mb-6">
        <!-- Card de información básica -->
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div>
              <p class="text-sm text-muted-foreground">Nombre Completo</p>
              <p class="font-medium">{{ currentPOA.clientFullName }}</p>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Identificación</p>
              <p class="font-medium">{{ currentPOA.clientIdentification }}</p>
            </div>
            <div v-if="currentPOA.clientEmail">
              <p class="text-sm text-muted-foreground">Email</p>
              <p class="font-medium">{{ currentPOA.clientEmail }}</p>
            </div>
            <div v-if="currentPOA.clientPhone">
              <p class="text-sm text-muted-foreground">Teléfono</p>
              <p class="font-medium">{{ currentPOA.clientPhone }}</p>
            </div>
          </CardContent>
        </Card>

        <!-- Card de tipo y estado -->
        <Card>
          <CardHeader>
            <CardTitle>Tipo y Estado</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div>
              <p class="text-sm text-muted-foreground">Tipo de POA</p>
              <Badge variant="outline" class="mt-1">
                {{ POATypeLabels[currentPOA.type as POAType] }}
              </Badge>
            </div>
            <div>
              <p class="text-sm text-muted-foreground">Estado</p>
              <Badge :variant="POAStatusVariants[currentPOA.status as POAStatus]" class="mt-1">
                {{ POAStatusLabels[currentPOA.status as POAStatus] }}
              </Badge>
            </div>
            <div v-if="currentPOA.assignedAdmin">
              <p class="text-sm text-muted-foreground">Asignado a</p>
              <p class="font-medium">
                {{ currentPOA.assignedAdmin.firstName }} {{ currentPOA.assignedAdmin.lastName }}
              </p>
            </div>
          </CardContent>
        </Card>

        <!-- Card de fechas importantes -->
        <Card>
          <CardHeader>
            <CardTitle>Fechas Importantes</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div>
              <p class="text-sm text-muted-foreground">Creado</p>
              <p class="text-sm">{{ formatDate(currentPOA.createdAt) }}</p>
            </div>
            <div v-if="currentPOA.submittedAt">
              <p class="text-sm text-muted-foreground">Enviado</p>
              <p class="text-sm">{{ formatDate(currentPOA.submittedAt) }}</p>
            </div>
            <div v-if="currentPOA.approvedAt">
              <p class="text-sm text-muted-foreground">Aprobado</p>
              <p class="text-sm">{{ formatDate(currentPOA.approvedAt) }}</p>
            </div>
            <div v-if="currentPOA.notarizedAt">
              <p class="text-sm text-muted-foreground">Notarizado</p>
              <p class="text-sm">{{ formatDate(currentPOA.notarizedAt) }}</p>
            </div>
            <div v-if="currentPOA.activatedAt">
              <p class="text-sm text-muted-foreground">Activado</p>
              <p class="text-sm">{{ formatDate(currentPOA.activatedAt) }}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Botones de acciones -->
      <Card class="mb-6">
        <CardHeader>
          <CardTitle>Acciones</CardTitle>
          <CardDescription>Acciones disponibles según el estado del POA</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="flex flex-wrap gap-2">
            <Button v-if="canAssign" size="sm" @click="showAssignModal = true">
              Asignar
            </Button>
            <Button v-if="canApprove" size="sm" @click="handleApprove">
              Aprobar
            </Button>
            <Button v-if="canReject" variant="destructive" size="sm" @click="showRejectModal = true">
              Rechazar
            </Button>
            <Button v-if="canNotarize" size="sm" @click="handleNotarize">
              Notarizar
            </Button>
            <Button v-if="canActivate" size="sm" @click="handleActivate">
              Activar
            </Button>
            <Button v-if="canCancel" variant="outline" size="sm" @click="showCancelModal = true">
              Cancelar POA
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Tabs -->
      <Tabs v-model="activeTab" class="w-full">
        <TabsList class="grid w-full grid-cols-4">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="executions">Ejecuciones</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <!-- Tab de Detalles -->
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Información Detallada</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div>
                <p class="text-sm font-medium text-muted-foreground">Dirección del Cliente</p>
                <p v-if="currentPOA.clientAddress">{{ currentPOA.clientAddress }}</p>
                <p v-else class="text-sm text-muted-foreground italic">No especificada</p>
              </div>

              <div>
                <p class="text-sm font-medium text-muted-foreground mb-2">Instrucciones</p>
                <div v-if="parsedInstructions" class="bg-muted p-4 rounded-md space-y-3">
                  <div v-if="parsedInstructions.accounts && parsedInstructions.accounts.length > 0">
                    <p class="text-xs font-semibold text-muted-foreground uppercase mb-2">Cuentas</p>
                    <ul class="list-disc list-inside space-y-1 text-sm">
                      <li v-for="(account, idx) in parsedInstructions.accounts" :key="idx">{{ account }}</li>
                    </ul>
                  </div>
                  <div v-if="parsedInstructions.actions && parsedInstructions.actions.length > 0">
                    <p class="text-xs font-semibold text-muted-foreground uppercase mb-2">Acciones</p>
                    <ul class="list-disc list-inside space-y-1 text-sm">
                      <li v-for="(action, idx) in parsedInstructions.actions" :key="idx">{{ action }}</li>
                    </ul>
                  </div>
                </div>
                <div v-else class="flex items-center gap-2 p-3 bg-muted/50 rounded-md border border-dashed">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                  <p class="text-sm text-muted-foreground italic">No hay instrucciones registradas</p>
                </div>
              </div>

              <div>
                <p class="text-sm font-medium text-muted-foreground mb-2">Beneficiarios</p>
                <div v-if="parsedBeneficiaries && parsedBeneficiaries.length > 0" class="space-y-2">
                  <div
                    v-for="(beneficiary, idx) in parsedBeneficiaries"
                    :key="idx"
                    class="bg-muted p-3 rounded-md border"
                  >
                    <div class="flex items-start justify-between">
                      <div class="space-y-1">
                        <p class="font-medium">{{ beneficiary.name }}</p>
                        <p class="text-sm text-muted-foreground">
                          {{ relationshipLabels[beneficiary.relationship] || beneficiary.relationship }}
                        </p>
                      </div>
                      <Badge variant="secondary">{{ beneficiary.percentage }}%</Badge>
                    </div>
                  </div>
                </div>
                <div v-else class="flex items-center gap-2 p-3 bg-muted/50 rounded-md border border-dashed">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                  <p class="text-sm text-muted-foreground italic">No hay beneficiarios registrados</p>
                </div>
              </div>

              <div v-if="currentPOA.type === 'springing'">
                <p class="text-sm font-medium text-muted-foreground mb-2">Condiciones de Activación</p>
                <div v-if="parsedActivationTriggers && parsedActivationTriggers.length > 0" class="flex flex-wrap gap-2">
                  <Badge
                    v-for="(trigger, idx) in parsedActivationTriggers"
                    :key="idx"
                    variant="outline"
                    class="px-3 py-1"
                  >
                    {{ activationTriggerLabels[trigger] || trigger }}
                  </Badge>
                </div>
                <div v-else class="flex items-center gap-2 p-3 bg-muted/50 rounded-md border border-dashed">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  <p class="text-sm text-muted-foreground italic">No hay condiciones de activación definidas</p>
                </div>
              </div>
              <div v-if="currentPOA.reviewNotes">
                <p class="text-sm font-medium text-muted-foreground">Notas de Revisión</p>
                <p class="whitespace-pre-wrap">{{ currentPOA.reviewNotes }}</p>
              </div>
              <div v-if="currentPOA.adminNotes">
                <p class="text-sm font-medium text-muted-foreground">Notas Administrativas</p>
                <p class="whitespace-pre-wrap">{{ currentPOA.adminNotes }}</p>
              </div>
              <div v-if="currentPOA.rejectionReason">
                <p class="text-sm font-medium text-destructive">Razón de Rechazo</p>
                <p class="whitespace-pre-wrap">{{ currentPOA.rejectionReason }}</p>
              </div>
              <div v-if="currentPOA.cancellationReason">
                <p class="text-sm font-medium text-destructive">Razón de Cancelación</p>
                <p class="whitespace-pre-wrap">{{ currentPOA.cancellationReason }}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Tab de Documentos -->
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Archivos adjuntos al POA</CardDescription>
            </CardHeader>
            <CardContent class="space-y-4">
              <!-- Upload de documentos -->
              <div class="border rounded-lg p-4 space-y-3">
                <p class="font-medium">Subir Nuevo Documento</p>
                <div class="space-y-2">
                  <Input
                    id="file-upload"
                    type="file"
                    @change="handleFileSelect"
                  />
                  <Input
                    v-model="uploadDescription"
                    placeholder="Descripción del documento (opcional)"
                  />
                  <Button
                    size="sm"
                    :disabled="!selectedFile || uploadingFile"
                    @click="handleUploadDocument"
                  >
                    {{ uploadingFile ? 'Subiendo...' : 'Subir Documento' }}
                  </Button>
                </div>
              </div>

              <!-- Lista de documentos -->
              <div v-if="loadingDocuments" class="text-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
              <div v-else-if="documents.length === 0" class="text-center py-8 text-muted-foreground">
                No hay documentos adjuntos
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="doc in documents"
                  :key="doc.id"
                  class="flex items-center justify-between border rounded-lg p-3"
                >
                  <div class="flex-1">
                    <p class="font-medium">{{ doc.fileName }}</p>
                    <p class="text-sm text-muted-foreground">
                      {{ doc.description || 'Sin descripción' }} - {{ formatDate(doc.createdAt) }}
                    </p>
                  </div>
                  <div class="flex gap-2">
                    <Button variant="ghost" size="sm" as-child>
                      <a :href="doc.fileUrl" target="_blank">Ver</a>
                    </Button>
                    <Button variant="ghost" size="sm" @click="handleDeleteDocument(doc.id)">
                      Eliminar
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Tab de Ejecuciones -->
        <TabsContent value="executions">
          <Card>
            <CardHeader>
              <CardTitle>Ejecuciones</CardTitle>
              <CardDescription>Historial de ejecuciones del POA</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="loadingExecutions" class="text-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
              <div v-else-if="executions.length === 0" class="text-center py-8 text-muted-foreground">
                No hay ejecuciones registradas
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="execution in executions"
                  :key="execution.id"
                  class="border rounded-lg p-4 space-y-2"
                >
                  <div class="flex items-center justify-between">
                    <p class="font-medium">{{ execution.description }}</p>
                    <Badge>{{ execution.status }}</Badge>
                  </div>
                  <p class="text-sm text-muted-foreground">
                    Ejecutado: {{ formatDate(execution.executionDate) }}
                  </p>
                  <p v-if="execution.outcome" class="text-sm">
                    <span class="font-medium">Resultado:</span> {{ execution.outcome }}
                  </p>
                  <p v-if="execution.notes" class="text-sm text-muted-foreground">
                    {{ execution.notes }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <!-- Tab de Historial -->
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historial de Cambios</CardTitle>
              <CardDescription>Auditoría completa de acciones</CardDescription>
            </CardHeader>
            <CardContent>
              <div v-if="loadingHistory" class="text-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
              <div v-else-if="history.length === 0" class="text-center py-8 text-muted-foreground">
                No hay historial disponible
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="item in history"
                  :key="item.id"
                  class="border-l-2 border-primary pl-4 py-2"
                >
                  <div class="flex items-center justify-between">
                    <p class="font-medium">{{ item.action }}</p>
                    <p class="text-sm text-muted-foreground">{{ formatDate(item.createdAt) }}</p>
                  </div>
                  <p v-if="item.description" class="text-sm mt-1">{{ item.description }}</p>
                  <p v-if="item.performedByUser" class="text-sm text-muted-foreground mt-1">
                    Por: {{ item.performedByUser.firstName }} {{ item.performedByUser.lastName }}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>

    <!-- Modal de Rechazo -->
    <div v-if="showRejectModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card class="w-full max-w-md">
        <CardHeader>
          <CardTitle>Rechazar POA</CardTitle>
          <CardDescription>Ingrese la razón del rechazo</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <label class="text-sm font-medium">Razón del Rechazo *</label>
            <Textarea
              v-model="rejectReason"
              placeholder="Ingrese la razón del rechazo..."
              rows="3"
            />
          </div>
          <div>
            <label class="text-sm font-medium">Notas Adicionales</label>
            <Textarea
              v-model="actionNotes"
              placeholder="Notas opcionales..."
              rows="2"
            />
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="showRejectModal = false">Cancelar</Button>
            <Button variant="destructive" @click="handleReject">Rechazar</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Modal de Asignación -->
    <div v-if="showAssignModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card class="w-full max-w-md">
        <CardHeader>
          <CardTitle>Asignar POA</CardTitle>
          <CardDescription>Seleccione un administrador</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <label class="text-sm font-medium">Administrador *</label>
            <Select v-model="selectedAdminId">
              <SelectTrigger>
                <SelectValue placeholder="Seleccione administrador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem
                  v-for="admin in availableAdmins"
                  :key="admin.id"
                  :value="admin.id"
                >
                  {{ admin.firstName }} {{ admin.lastName }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label class="text-sm font-medium">Notas</label>
            <Textarea
              v-model="actionNotes"
              placeholder="Notas opcionales..."
              rows="2"
            />
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="showAssignModal = false">Cancelar</Button>
            <Button @click="handleAssign">Asignar</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Modal de Cancelación -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card class="w-full max-w-md">
        <CardHeader>
          <CardTitle>Cancelar POA</CardTitle>
          <CardDescription>Ingrese la razón de la cancelación</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <label class="text-sm font-medium">Razón de Cancelación *</label>
            <Textarea
              v-model="cancelReason"
              placeholder="Ingrese la razón de la cancelación..."
              rows="3"
            />
          </div>
          <div>
            <label class="text-sm font-medium">Notas Adicionales</label>
            <Textarea
              v-model="actionNotes"
              placeholder="Notas opcionales..."
              rows="2"
            />
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="showCancelModal = false">Cancelar</Button>
            <Button variant="destructive" @click="handleCancel">Confirmar Cancelación</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
