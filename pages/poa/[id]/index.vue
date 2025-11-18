<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePoa } from '~/modules/poa/composables/usePoa'
import { useUsers } from '~/modules/users/composables/useUsers'
import { useMessages, type CreateMessageDto } from '~/composables/useMessages'
import { useThreads, type CreateThreadDto, type CreateMessageInThreadDto } from '~/composables/useThreads'
import { MessageType, ThreadType, ThreadStatus, MessageSenderType } from '~/types/poa-messages'
import { POAStatus, POAType, POAStatusLabels, POATypeLabels, POAStatusVariants, POAExecutionType } from '~/modules/poa/types'
import type { POAHistory, POAExecution, POADocument, ExecutePOADto } from '~/modules/poa/types'
import { Button } from '~/components/ui/button'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Textarea } from '~/components/ui/textarea'
import { Input } from '~/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Label } from '~/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'

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
  createExecution,
  getHistory,
  getExecutions,
  getDocuments,
  uploadDocument,
  deleteDocument,
  clearError,
} = usePoa()

const { users, fetchUsers } = useUsers()

const {
  messages,
  loading: loadingMessages,
  fetchMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
  refresh: refreshMessages,
} = useMessages()

const {
  threads,
  currentThread,
  loading: loadingThreads,
  error: threadsError,
  fetchThreads,
  fetchThread,
  createThread,
  sendMessage: sendThreadMessage,
  markThreadAsRead,
  closeThread,
  reopenThread,
} = useThreads()

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
const showExecutionModal = ref(false)
const rejectReason = ref('')
const selectedAdminId = ref('')
const cancelReason = ref('')
const actionNotes = ref('')

// Formulario de ejecución
const executionForm = ref<ExecutePOADto>({
  executionType: POAExecutionType.BANK_TRANSACTION,
  description: '',
  amount: undefined,
  recipient: '',
  proofDocuments: [],
  notes: '',
})

// Temporal para documento de prueba
const proofDocumentUrl = ref('')

// Modal de confirmación genérico
const showConfirmDialog = ref(false)
const confirmDialogTitle = ref('')
const confirmDialogDescription = ref('')
const confirmDialogAction = ref<(() => Promise<void>) | null>(null)

// Upload de archivos
const selectedFile = ref<File | null>(null)
const uploadDescription = ref('')
const uploadingFile = ref(false)

// Messages (legacy)
const showMessageModal = ref(false)
const messageForm = ref<CreateMessageDto>({
  type: MessageType.GENERAL,
  subject: '',
  message: '',
})

// Threads
const showCreateThreadModal = ref(false)
const showThreadDetailModal = ref(false)
const selectedThreadId = ref<string | null>(null)
const threadForm = ref<CreateThreadDto>({
  type: ThreadType.GENERAL,
  subject: '',
})
const threadMessageForm = ref<CreateMessageInThreadDto>({
  message: '',
})

// Cargar datos al montar
onMounted(async () => {
  await loadPOA()
  await loadHistory()
  await loadExecutions()
  await loadDocuments()
  await loadMessages()
  await loadThreads()
  await loadAdmins()
})

// Debug: watch threads changes
watch(threads, (newThreads) => {
  console.log('🔍 [DEBUG] Threads changed:', {
    count: newThreads.length,
    threads: newThreads.map(t => ({
      id: t.id,
      subject: t.subject,
      type: t.type,
      status: t.status,
      messageCount: t.messageCount
    }))
  })
}, { deep: true })

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

// Cargar mensajes
const loadMessages = async () => {
  try {
    await fetchMessages(poaId.value)
  } catch (e) {
    console.error('Error loading messages:', e)
  }
}

// Cargar hilos
const loadThreads = async () => {
  try {
    await fetchThreads(poaId.value)
  } catch (e) {
    console.error('Error loading threads:', e)
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

// Mostrar diálogo de confirmación
const showConfirm = (title: string, description: string, action: () => Promise<void>) => {
  confirmDialogTitle.value = title
  confirmDialogDescription.value = description
  confirmDialogAction.value = action
  showConfirmDialog.value = true
}

// Ejecutar acción confirmada
const handleConfirmAction = async () => {
  if (confirmDialogAction.value) {
    await confirmDialogAction.value()
  }
  showConfirmDialog.value = false
  confirmDialogAction.value = null
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

const canExecute = computed(() => {
  return currentPOA.value?.status === POAStatus.ACTIVATED || currentPOA.value?.status === POAStatus.EXECUTED
})

// Manejar aprobación
const handleApprove = () => {
  showConfirm(
    'Aprobar POA',
    '¿Está seguro de que desea aprobar este Poder Notarial? Esta acción no se puede deshacer.',
    async () => {
      try {
        await approvePOA(poaId.value, { adminNotes: actionNotes.value || undefined })
        await loadPOA()
        await loadHistory()
        actionNotes.value = ''
        alert('POA aprobado exitosamente')
      } catch (e: any) {
        console.error('Error approving POA:', e)
        alert(`Error al aprobar el POA: ${e.message || 'Error desconocido'}`)
      }
    }
  )
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
    alert('POA rechazado exitosamente')
  } catch (e: any) {
    console.error('Error rejecting POA:', e)
    alert(`Error al rechazar el POA: ${e.message || 'Error desconocido'}`)
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
    })
    await loadPOA()
    await loadHistory()
    showAssignModal.value = false
    selectedAdminId.value = ''
    actionNotes.value = ''
    alert('POA asignado exitosamente')
  } catch (e: any) {
    console.error('Error assigning POA:', e)
    alert(`Error al asignar el POA: ${e.message || 'Error desconocido'}`)
  }
}

// Manejar envío de mensaje
const handleSendMessage = async () => {
  if (!messageForm.value.subject.trim() || !messageForm.value.message.trim()) {
    alert('El asunto y el mensaje son obligatorios')
    return
  }

  try {
    await sendMessage(poaId.value, messageForm.value)
    showMessageModal.value = false
    messageForm.value = {
      type: MessageType.GENERAL,
      subject: '',
      message: '',
    }
    alert('Mensaje enviado exitosamente')
  } catch (e: any) {
    console.error('Error sending message:', e)
    alert(`Error al enviar el mensaje: ${e.message || 'Error desconocido'}`)
  }
}

// Manejar marcar como leído
const handleMarkAsRead = async (messageId: string) => {
  try {
    await markAsRead(messageId)
  } catch (e: any) {
    console.error('Error marking message as read:', e)
  }
}

// Manejar eliminar mensaje
const handleDeleteMessage = async (messageId: string) => {
  showConfirm(
    'Eliminar mensaje',
    '¿Estás seguro de eliminar este mensaje? Esta acción no se puede deshacer.',
    async () => {
      try {
        await deleteMessage(messageId)
      } catch (e: any) {
        console.error('Error deleting message:', e)
        alert(`Error al eliminar el mensaje: ${e.message || 'Error desconocido'}`)
      }
    }
  )
}

// ============================================
// THREAD HANDLERS
// ============================================

// Crear nuevo hilo
const handleCreateThread = async () => {
  if (!threadForm.value.subject.trim()) {
    alert('El asunto del hilo es obligatorio')
    return
  }

  try {
    await createThread(poaId.value, threadForm.value)
    showCreateThreadModal.value = false
    threadForm.value = {
      type: ThreadType.GENERAL,
      subject: '',
    }
    alert('Hilo creado exitosamente')
  } catch (e: any) {
    console.error('Error creating thread:', e)
    alert(`Error al crear el hilo: ${e.message || 'Error desconocido'}`)
  }
}

// Abrir hilo para ver mensajes
const handleOpenThread = async (threadId: string) => {
  try {
    selectedThreadId.value = threadId
    await fetchThread(threadId)
    showThreadDetailModal.value = true

    // Marcar como leído si tiene mensajes no leídos del cliente
    const thread = threads.value.find(t => t.id === threadId)
    if (thread && thread.unreadCount > 0) {
      await markThreadAsRead(threadId)
    }
  } catch (e: any) {
    console.error('Error opening thread:', e)
    alert(`Error al abrir el hilo: ${e.message || 'Error desconocido'}`)
  }
}

// Enviar mensaje en hilo
const handleSendThreadMessage = async () => {
  if (!selectedThreadId.value || !threadMessageForm.value.message.trim()) {
    alert('El mensaje es obligatorio')
    return
  }

  try {
    await sendThreadMessage(selectedThreadId.value, threadMessageForm.value)
    threadMessageForm.value = { message: '' }

    // Recargar hilo para ver el nuevo mensaje
    await fetchThread(selectedThreadId.value)
  } catch (e: any) {
    console.error('Error sending message:', e)
    alert(`Error al enviar el mensaje: ${e.message || 'Error desconocido'}`)
  }
}

// Cerrar hilo
const handleCloseThread = async (threadId: string) => {
  showConfirm(
    'Cerrar hilo',
    '¿Está seguro de cerrar este hilo? No se podrán enviar más mensajes.',
    async () => {
      try {
        await closeThread(threadId)

        // Si está abierto el hilo, cerrarlo
        if (selectedThreadId.value === threadId) {
          showThreadDetailModal.value = false
          selectedThreadId.value = null
        }

        alert('Hilo cerrado exitosamente')
      } catch (e: any) {
        console.error('Error closing thread:', e)
        alert(`Error al cerrar el hilo: ${e.message || 'Error desconocido'}`)
      }
    }
  )
}

// Reabrir hilo
const handleReopenThread = async (threadId: string) => {
  try {
    await reopenThread(threadId)
    alert('Hilo reabierto exitosamente')
  } catch (e: any) {
    console.error('Error reopening thread:', e)
    alert(`Error al reabrir el hilo: ${e.message || 'Error desconocido'}`)
  }
}

// Manejar notarización
const handleNotarize = () => {
  showConfirm(
    'Notarizar POA',
    '¿Está seguro de marcar este POA como notarizado? Confirme que el proceso de notarización legal se ha completado.',
    async () => {
      try {
        await notarizePOA(poaId.value, { notarizationNotes: actionNotes.value || undefined })
        await loadPOA()
        await loadHistory()
        actionNotes.value = ''
        alert('POA notarizado exitosamente')
      } catch (e: any) {
        console.error('Error notarizing POA:', e)
        alert(`Error al notarizar el POA: ${e.message || 'Error desconocido'}`)
      }
    }
  )
}

// Manejar activación
const handleActivate = () => {
  showConfirm(
    'Activar POA',
    '¿Está seguro de activar este Poder Notarial? Una vez activado, el poder entrará en vigor y podrá ser ejecutado.',
    async () => {
      try {
        await activatePOA(poaId.value, {
          activationReason: 'other',
          activationDetails: actionNotes.value || undefined,
        })
        await loadPOA()
        await loadHistory()
        actionNotes.value = ''
        alert('POA activado exitosamente')
      } catch (e: any) {
        console.error('Error activating POA:', e)
        alert(`Error al activar el POA: ${e.message || 'Error desconocido'}`)
      }
    }
  )
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
    alert('POA cancelado exitosamente')
  } catch (e: any) {
    console.error('Error canceling POA:', e)
    alert(`Error al cancelar el POA: ${e.message || 'Error desconocido'}`)
  }
}

// Resetear formulario de ejecución
const resetExecutionForm = () => {
  executionForm.value = {
    executionType: POAExecutionType.BANK_TRANSACTION,
    description: '',
    amount: undefined,
    recipient: '',
    proofDocuments: [],
    notes: '',
  }
  proofDocumentUrl.value = ''
}

// Manejar ejecución de instrucción
const handleExecuteInstruction = async () => {
  if (!executionForm.value.description.trim()) {
    alert('Debe ingresar una descripción de la ejecución')
    return
  }

  // Agregar URL de documento de prueba si se proporcionó
  if (proofDocumentUrl.value.trim()) {
    executionForm.value.proofDocuments = [proofDocumentUrl.value.trim()]
  }

  try {
    await createExecution(poaId.value, executionForm.value)
    await loadPOA()
    await loadHistory()
    await loadExecutions()
    showExecutionModal.value = false
    resetExecutionForm()
    alert('Instrucción ejecutada exitosamente')
  } catch (e: any) {
    console.error('Error executing instruction:', e)
    alert(`Error al ejecutar la instrucción: ${e.message || 'Error desconocido'}`)
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
const handleDeleteDocument = (documentId: string) => {
  showConfirm(
    'Eliminar Documento',
    '¿Está seguro de que desea eliminar este documento? Esta acción no se puede deshacer.',
    async () => {
      try {
        await deleteDocument(poaId.value, documentId)
        await loadDocuments()
      } catch (e) {
        console.error('Error deleting document:', e)
      }
    }
  )
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
            <Button v-if="canExecute" variant="default" size="sm" @click="showExecutionModal = true">
              Ejecutar Instrucción
            </Button>
            <Button v-if="canCancel" variant="outline" size="sm" @click="showCancelModal = true">
              Cancelar POA
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Tabs -->
      <Tabs :default-value="activeTab" @update:model-value="(val: string) => activeTab = val" class="w-full">
        <TabsList class="grid w-full grid-cols-5">
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="messages">Mensajes</TabsTrigger>
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
              <div v-if="loadingDocuments" class="text-center py-12">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                <p class="text-sm text-muted-foreground">Cargando documentos...</p>
              </div>
              <div v-else-if="documents.length === 0" class="text-center py-16">
                <div class="mx-auto w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold mb-2">No hay documentos adjuntos</h3>
                <p class="text-sm text-muted-foreground max-w-sm mx-auto">
                  Este POA aún no tiene documentos adjuntos. Los documentos aparecerán aquí una vez que el cliente los suba.
                </p>
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="doc in documents"
                  :key="doc.id"
                  class="flex items-center justify-between border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                >
                  <div class="flex items-start gap-3 flex-1">
                    <div class="w-10 h-10 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="h-5 w-5 text-primary"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="font-medium truncate">{{ doc.fileName }}</p>
                      <p class="text-sm text-muted-foreground">
                        {{ doc.description || doc.fileType || 'Sin descripción' }}
                      </p>
                      <p class="text-xs text-muted-foreground mt-1">
                        Subido: {{ formatDate(doc.createdAt) }}
                      </p>
                    </div>
                  </div>
                  <div class="flex gap-2">
                    <Button variant="ghost" size="sm" as-child>
                      <a :href="`http://localhost:3001${doc.fileUrl}`" target="_blank" title="Ver documento">
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
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                      </a>
                    </Button>
                    <Button variant="ghost" size="sm" @click="handleDeleteDocument(doc.id)" title="Eliminar documento">
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
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
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
              <div v-if="loadingExecutions" class="text-center py-12">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                <p class="text-sm text-muted-foreground">Cargando ejecuciones...</p>
              </div>
              <div v-else-if="executions.length === 0" class="text-center py-16">
                <div class="mx-auto w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold mb-2">No hay ejecuciones registradas</h3>
                <p class="text-sm text-muted-foreground max-w-sm mx-auto">
                  Este POA aún no ha sido ejecutado. Las ejecuciones aparecerán aquí una vez que el poder sea activado y utilizado.
                </p>
              </div>
              <div v-else class="space-y-4">
                <div
                  v-for="execution in executions"
                  :key="execution.id"
                  class="border rounded-lg p-4 space-y-3"
                >
                  <!-- Header con tipo y estado -->
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-2">
                        <Badge variant="outline" class="capitalize">
                          {{ execution.executionType.replace('_', ' ') }}
                        </Badge>
                        <Badge :variant="execution.status === 'completed' ? 'default' : 'secondary'">
                          {{ execution.status }}
                        </Badge>
                      </div>
                      <p class="font-medium">{{ execution.description }}</p>
                    </div>
                  </div>

                  <!-- Detalles de la ejecución -->
                  <div class="grid grid-cols-2 gap-3 text-sm">
                    <div v-if="execution.amount">
                      <p class="text-muted-foreground">Monto</p>
                      <p class="font-medium">${{ execution.amount.toLocaleString() }}</p>
                    </div>
                    <div v-if="execution.recipient">
                      <p class="text-muted-foreground">Destinatario</p>
                      <p class="font-medium">{{ execution.recipient }}</p>
                    </div>
                    <div>
                      <p class="text-muted-foreground">Ejecutado</p>
                      <p class="font-medium">{{ formatDate(execution.executedAt) }}</p>
                    </div>
                    <div v-if="execution.executedByUser">
                      <p class="text-muted-foreground">Ejecutado por</p>
                      <p class="font-medium">
                        {{ execution.executedByUser.firstName }} {{ execution.executedByUser.lastName }}
                      </p>
                    </div>
                    <div v-if="execution.completedAt" class="col-span-2">
                      <p class="text-muted-foreground">Completado</p>
                      <p class="font-medium">{{ formatDate(execution.completedAt) }}</p>
                    </div>
                  </div>

                  <!-- Documentos de prueba -->
                  <div v-if="execution.proofDocuments && execution.proofDocuments.length > 0" class="text-sm">
                    <p class="text-muted-foreground mb-1">Documentos de Prueba:</p>
                    <ul class="list-disc list-inside space-y-1">
                      <li v-for="(doc, idx) in execution.proofDocuments" :key="idx" class="text-xs">
                        <a :href="doc" target="_blank" class="text-primary hover:underline">
                          Documento {{ idx + 1 }}
                        </a>
                      </li>
                    </ul>
                  </div>

                  <!-- Notas -->
                  <div v-if="execution.notes" class="text-sm">
                    <p class="text-muted-foreground mb-1">Notas:</p>
                    <p class="text-sm bg-muted p-2 rounded">{{ execution.notes }}</p>
                  </div>
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
              <div v-if="loadingHistory" class="text-center py-12">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                <p class="text-sm text-muted-foreground">Cargando historial...</p>
              </div>
              <div v-else-if="history.length === 0" class="text-center py-16">
                <div class="mx-auto w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold mb-2">No hay historial disponible</h3>
                <p class="text-sm text-muted-foreground max-w-sm mx-auto">
                  El historial de cambios aparecerá aquí a medida que se realicen acciones sobre este POA, como aprobaciones, rechazos o cambios de estado.
                </p>
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="item in history"
                  :key="item.id"
                  class="border rounded-lg p-4"
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

        <!-- Tab de Mensajes -->
        <TabsContent value="messages">
          <Card>
            <CardHeader class="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Hilos de Conversación</CardTitle>
                <CardDescription>Comunicación organizada por temas con el cliente</CardDescription>
              </div>
              <div class="flex gap-2">
                <Button @click="loadThreads" variant="outline" size="sm" :disabled="loadingThreads">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 mr-2"
                    :class="{ 'animate-spin': loadingThreads }"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Refrescar
                </Button>
                <Button @click="showCreateThreadModal = true" size="sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Nuevo Hilo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div v-if="loadingThreads" class="text-center py-12">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                <p class="text-sm text-muted-foreground">Cargando hilos...</p>
              </div>
              <div v-else-if="threads.length === 0" class="text-center py-16">
                <div class="mx-auto w-16 h-16 mb-6 rounded-full bg-muted flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-8 w-8 text-muted-foreground"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <h3 class="text-lg font-semibold mb-2">No hay hilos de conversación</h3>
                <p class="text-sm text-muted-foreground max-w-sm mx-auto">
                  Aún no hay hilos de conversación para este POA. Crea el primer hilo haciendo clic en "Nuevo Hilo".
                </p>
              </div>
              <div v-else class="space-y-2">
                <div
                  v-for="thread in threads"
                  :key="thread.id"
                  class="border rounded-lg p-4 transition-all hover:shadow-md cursor-pointer"
                  :class="{
                    'bg-blue-50/30 border-blue-200': thread.status === 'open',
                    'bg-gray-50/30 border-gray-200': thread.status === 'closed',
                    'ring-2 ring-blue-300': thread.unreadCount > 0
                  }"
                  @click="handleOpenThread(thread.id)"
                >
                  <!-- Header -->
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                        <Badge
                          :variant="thread.status === 'open' ? 'default' : 'secondary'"
                          class="text-xs"
                        >
                          {{ thread.status === 'open' ? 'Abierto' : 'Cerrado' }}
                        </Badge>
                        <Badge variant="outline" class="text-xs">
                          {{ thread.type === 'general' ? 'General' :
                             thread.type === 'question' ? 'Pregunta' :
                             thread.type === 'request_document' ? 'Documentos' :
                             'Actualización' }}
                        </Badge>
                        <Badge v-if="thread.unreadCount > 0" variant="destructive" class="text-xs animate-pulse">
                          {{ thread.unreadCount }} nuevos
                        </Badge>
                      </div>
                      <h4 class="font-semibold text-sm truncate" :title="thread.subject || 'Sin título'">
                        {{ thread.subject || '(Sin título)' }}
                      </h4>
                    </div>
                  </div>

                  <!-- Stats -->
                  <div class="flex items-center gap-4 text-xs text-muted-foreground mt-3">
                    <div class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      {{ thread.messageCount }} mensajes
                    </div>
                    <div v-if="thread.lastMessageAt" class="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      {{ new Date(thread.lastMessageAt).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex items-center gap-2 mt-3 pt-3 border-t" @click.stop>
                    <Button
                      v-if="thread.status === 'open'"
                      size="sm"
                      variant="ghost"
                      @click="handleCloseThread(thread.id)"
                      class="text-xs h-7"
                    >
                      Cerrar
                    </Button>
                    <Button
                      v-else
                      size="sm"
                      variant="ghost"
                      @click="handleReopenThread(thread.id)"
                      class="text-xs h-7"
                    >
                      Reabrir
                    </Button>
                  </div>
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

    <!-- Modal de Ejecución de Instrucción -->
    <div v-if="showExecutionModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
      <Card class="w-full max-w-2xl my-8">
        <CardHeader>
          <CardTitle>Ejecutar Instrucción del POA</CardTitle>
          <CardDescription>Registre la ejecución de una instrucción del Poder Notarial</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Tipo de Ejecución -->
          <div class="space-y-2">
            <Label for="executionType">Tipo de Ejecución *</Label>
            <Select v-model="executionForm.executionType">
              <SelectTrigger id="executionType">
                <SelectValue placeholder="Seleccione el tipo de ejecución" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="POAExecutionType.BANK_TRANSACTION">
                  Transacción Bancaria
                </SelectItem>
                <SelectItem :value="POAExecutionType.DOCUMENT_DELIVERY">
                  Entrega de Documentos
                </SelectItem>
                <SelectItem :value="POAExecutionType.PROPERTY_MANAGEMENT">
                  Gestión de Propiedades
                </SelectItem>
                <SelectItem :value="POAExecutionType.OTHER">
                  Otro
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Descripción -->
          <div class="space-y-2">
            <Label for="description">Descripción *</Label>
            <Textarea
              id="description"
              v-model="executionForm.description"
              placeholder="Describa detalladamente la instrucción ejecutada..."
              rows="4"
            />
            <p class="text-xs text-muted-foreground">
              Ejemplo: Transferencia de $5,000 desde cuenta XXXX1234 a beneficiaria María Pérez
            </p>
          </div>

          <!-- Monto (opcional) -->
          <div class="space-y-2">
            <Label for="amount">Monto (opcional)</Label>
            <Input
              id="amount"
              v-model.number="executionForm.amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Ej: 5000.00"
            />
            <p class="text-xs text-muted-foreground">
              Ingrese el monto si la ejecución involucra una transacción financiera
            </p>
          </div>

          <!-- Destinatario (opcional) -->
          <div class="space-y-2">
            <Label for="recipient">Destinatario (opcional)</Label>
            <Input
              id="recipient"
              v-model="executionForm.recipient"
              placeholder="Ej: María Pérez (Beneficiaria)"
            />
            <p class="text-xs text-muted-foreground">
              Indique la persona o entidad que recibe el beneficio de esta ejecución
            </p>
          </div>

          <!-- Documentos de Prueba (opcional) -->
          <div class="space-y-2">
            <Label for="proofDocs">URL de Documento de Prueba (opcional)</Label>
            <Textarea
              id="proofDocs"
              v-model="proofDocumentUrl"
              placeholder="https://ejemplo.com/documento1.pdf"
              rows="2"
            />
            <p class="text-xs text-muted-foreground">
              URL del documento que evidencia la ejecución (comprobante, confirmación, etc.)
            </p>
          </div>

          <!-- Notas Adicionales (opcional) -->
          <div class="space-y-2">
            <Label for="notes">Notas Adicionales (opcional)</Label>
            <Textarea
              id="notes"
              v-model="executionForm.notes"
              placeholder="Notas adicionales sobre la ejecución..."
              rows="3"
            />
          </div>

          <!-- Botones de Acción -->
          <div class="flex justify-end gap-2 pt-4">
            <Button variant="outline" @click="showExecutionModal = false; resetExecutionForm()">
              Cancelar
            </Button>
            <Button @click="handleExecuteInstruction">
              Ejecutar Instrucción
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Modal de Confirmación Profesional -->
    <AlertDialog :open="showConfirmDialog" @update:open="showConfirmDialog = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{{ confirmDialogTitle }}</AlertDialogTitle>
          <AlertDialogDescription>
            {{ confirmDialogDescription }}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction @click="handleConfirmAction">
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <!-- Modal de Nuevo Mensaje (Legacy - mantener por compatibilidad) -->
    <div v-if="showMessageModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card class="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Enviar Mensaje al Cliente</CardTitle>
          <CardDescription>Comunicarse con el cliente sobre este POA</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <Label>Tipo de Mensaje *</Label>
            <Select v-model="messageForm.type">
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="MessageType.GENERAL">General</SelectItem>
                <SelectItem :value="MessageType.REQUEST_DOCUMENT">Solicitud de Documento</SelectItem>
                <SelectItem :value="MessageType.STATUS_UPDATE">Actualización de Estado</SelectItem>
                <SelectItem :value="MessageType.QUESTION">Pregunta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Asunto *</Label>
            <Input
              v-model="messageForm.subject"
              placeholder="Ej: Documentos adicionales requeridos"
              maxlength="255"
            />
          </div>
          <div>
            <Label>Mensaje *</Label>
            <Textarea
              v-model="messageForm.message"
              placeholder="Escriba su mensaje aquí..."
              rows="6"
            />
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="showMessageModal = false">Cancelar</Button>
            <Button @click="handleSendMessage">Enviar Mensaje</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Modal de Crear Nuevo Hilo -->
    <div v-if="showCreateThreadModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card class="w-full max-w-md">
        <CardHeader>
          <CardTitle>Crear Nuevo Hilo</CardTitle>
          <CardDescription>Inicia una nueva conversación con el cliente</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <Label>Tipo de Hilo *</Label>
            <Select v-model="threadForm.type">
              <SelectTrigger>
                <SelectValue placeholder="Seleccione el tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="ThreadType.GENERAL">General</SelectItem>
                <SelectItem :value="ThreadType.REQUEST_DOCUMENT">Solicitud de Documento</SelectItem>
                <SelectItem :value="ThreadType.STATUS_UPDATE">Actualización de Estado</SelectItem>
                <SelectItem :value="ThreadType.QUESTION">Pregunta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Asunto *</Label>
            <Input
              v-model="threadForm.subject"
              placeholder="Ej: Documentos adicionales requeridos"
              maxlength="255"
            />
            <p class="text-xs text-muted-foreground mt-1">
              Este será el tema principal del hilo de conversación
            </p>
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="showCreateThreadModal = false">Cancelar</Button>
            <Button @click="handleCreateThread">Crear Hilo</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Modal de Detalle del Hilo -->
    <div v-if="showThreadDetailModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card class="w-full max-w-4xl max-h-[90vh] flex flex-col">
        <CardHeader class="flex-shrink-0">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-2">
                <Badge :variant="currentThread?.status === 'open' ? 'default' : 'secondary'">
                  {{ currentThread?.status === 'open' ? 'Abierto' : 'Cerrado' }}
                </Badge>
                <Badge variant="outline">
                  {{ currentThread?.type === 'general' ? 'General' :
                     currentThread?.type === 'question' ? 'Pregunta' :
                     currentThread?.type === 'request_document' ? 'Documentos' :
                     'Actualización' }}
                </Badge>
              </div>
              <CardTitle>{{ currentThread?.subject }}</CardTitle>
              <CardDescription class="mt-1">
                {{ currentThread?.messageCount || 0 }} mensajes •
                Creado {{ currentThread?.createdAt ? formatDate(currentThread.createdAt) : '' }}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" @click="showThreadDetailModal = false">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            </Button>
          </div>
        </CardHeader>

        <CardContent class="flex-1 overflow-y-auto space-y-3 min-h-0">
          <div v-if="!currentThread?.messages || currentThread.messages.length === 0" class="text-center py-12">
            <div class="mx-auto w-16 h-16 mb-4 rounded-full bg-muted flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <p class="text-sm text-muted-foreground">No hay mensajes en este hilo aún.</p>
            <p class="text-xs text-muted-foreground mt-1">Envía el primer mensaje para iniciar la conversación.</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="msg in currentThread.messages"
              :key="msg.id"
              class="flex"
              :class="msg.senderType === 'admin' ? 'justify-end' : 'justify-start'"
            >
              <div
                class="max-w-[70%] rounded-lg p-3 shadow-sm"
                :class="{
                  'bg-blue-500 text-white': msg.senderType === 'admin',
                  'bg-gray-100': msg.senderType === 'client'
                }"
              >
                <div class="flex items-center gap-2 mb-1">
                  <Badge
                    :variant="msg.senderType === 'admin' ? 'secondary' : 'outline'"
                    class="text-[10px] px-2 py-0.5"
                    :class="msg.senderType === 'admin' ? 'bg-blue-600 text-white border-blue-600' : ''"
                  >
                    {{ msg.senderType === 'admin' ? 'Admin' : 'Cliente' }}
                  </Badge>
                  <span class="text-[10px]" :class="msg.senderType === 'admin' ? 'text-blue-100' : 'text-muted-foreground'">
                    {{ new Date(msg.createdAt).toLocaleString('es-ES', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                  </span>
                </div>
                <p class="text-sm whitespace-pre-wrap">{{ msg.message }}</p>
                <div v-if="msg.sender" class="text-[10px] mt-2 pt-2 border-t" :class="msg.senderType === 'admin' ? 'border-blue-400 text-blue-100' : 'border-border text-muted-foreground'">
                  {{ msg.sender.firstName }} {{ msg.sender.lastName }}
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <div v-if="currentThread?.status === 'open'" class="flex-shrink-0 border-t p-4">
          <div class="flex gap-2">
            <Textarea
              v-model="threadMessageForm.message"
              placeholder="Escribe tu mensaje..."
              rows="3"
              class="flex-1"
              @keydown.ctrl.enter="handleSendThreadMessage"
            />
            <Button
              @click="handleSendThreadMessage"
              :disabled="!threadMessageForm.message.trim()"
              class="self-end"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              Enviar
            </Button>
          </div>
          <p class="text-xs text-muted-foreground mt-2">
            Presiona Ctrl + Enter para enviar
          </p>
        </div>
        <div v-else class="flex-shrink-0 border-t p-4 bg-muted/50">
          <p class="text-sm text-center text-muted-foreground">
            Este hilo está cerrado. Reábrelo para continuar la conversación.
          </p>
        </div>
      </Card>
    </div>
  </div>
</template>
