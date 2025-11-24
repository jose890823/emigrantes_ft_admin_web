<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Subscription, SubscriptionStatus, SubscriptionPlan } from '~/modules/subscriptions/types'
import { useSubscriptions } from '~/modules/subscriptions/composables/useSubscriptions'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Textarea } from '~/components/ui/textarea'
import { Label } from '~/components/ui/label'

definePageMeta({
  middleware: ['auth'],
})

const {
  subscriptions,
  loading,
  error,
  total,
  fetchSubscriptions,
  cancelSubscription,
  activateSubscription,
  clearError,
} = useSubscriptions()

// Estado local
const searchQuery = ref('')
const statusFilter = ref<string>('all')
const planFilter = ref<string>('all')
const showCancelDialog = ref(false)
const showActivateDialog = ref(false)
const selectedSubscription = ref<Subscription | null>(null)
const processing = ref(false)

// Formulario de cancelación
const cancelForm = ref({
  reason: '',
  cancelAtPeriodEnd: true,
  feedback: '',
})

// Formulario de activación
const activateForm = ref({
  contractUrl: '',
  envelopeId: '',
})

// Formatear fecha
const formatDate = (date?: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Formatear precio
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

// Obtener color del badge según estado
const getStatusBadgeVariant = (status: SubscriptionStatus) => {
  switch (status) {
    case 'active':
      return 'default'
    case 'pending_payment':
    case 'pending_contract':
      return 'secondary'
    case 'cancelled':
    case 'expired':
      return 'destructive'
    case 'suspended':
    case 'past_due':
      return 'outline'
    default:
      return 'outline'
  }
}

// Obtener texto del estado
const getStatusText = (status: SubscriptionStatus) => {
  const statusMap: Record<string, string> = {
    pending_payment: 'Pago Pendiente',
    pending_contract: 'Contrato Pendiente',
    active: 'Activa',
    cancelled: 'Cancelada',
    suspended: 'Suspendida',
    expired: 'Expirada',
    past_due: 'Pago Atrasado',
  }
  return statusMap[status] || status
}

// Obtener texto del plan
const getPlanText = (planType: SubscriptionPlan) => {
  const planMap: Record<string, string> = {
    basic: 'Básico',
    standard: 'Estándar',
    premium: 'Premium',
  }
  return planMap[planType] || planType
}

// Filtrar suscripciones
const filteredSubscriptions = computed(() => {
  return subscriptions.value.filter((sub) => {
    // Filtro de búsqueda
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      const matchesUser =
        sub.user?.email?.toLowerCase().includes(query) ||
        sub.user?.firstName?.toLowerCase().includes(query) ||
        sub.user?.lastName?.toLowerCase().includes(query)
      if (!matchesUser) return false
    }

    // Filtro de estado
    if (statusFilter.value !== 'all' && sub.status !== statusFilter.value) {
      return false
    }

    // Filtro de plan
    if (planFilter.value !== 'all' && sub.planType !== planFilter.value) {
      return false
    }

    return true
  })
})

// Abrir diálogo de cancelación
const openCancelDialog = (subscription: Subscription) => {
  selectedSubscription.value = subscription
  cancelForm.value = {
    reason: '',
    cancelAtPeriodEnd: true,
    feedback: '',
  }
  showCancelDialog.value = true
}

// Confirmar cancelación
const confirmCancel = async () => {
  if (!selectedSubscription.value) return

  processing.value = true
  try {
    await cancelSubscription(selectedSubscription.value.id, cancelForm.value)
    showCancelDialog.value = false
  } catch (e) {
    console.error('Error canceling subscription:', e)
  } finally {
    processing.value = false
  }
}

// Abrir diálogo de activación
const openActivateDialog = (subscription: Subscription) => {
  selectedSubscription.value = subscription
  activateForm.value = {
    contractUrl: '',
    envelopeId: '',
  }
  showActivateDialog.value = true
}

// Confirmar activación
const confirmActivate = async () => {
  if (!selectedSubscription.value || !activateForm.value.contractUrl) return

  processing.value = true
  try {
    await activateSubscription(
      selectedSubscription.value.id,
      activateForm.value.contractUrl,
      activateForm.value.envelopeId || undefined
    )
    showActivateDialog.value = false
  } catch (e) {
    console.error('Error activating subscription:', e)
  } finally {
    processing.value = false
  }
}

// Cargar suscripciones al montar
onMounted(async () => {
  await fetchSubscriptions()
})
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Suscripciones</h1>
        <p class="text-muted-foreground mt-1">
          Gestiona las suscripciones de los clientes
        </p>
      </div>
      <div class="text-sm text-muted-foreground">
        Total: {{ total }} suscripciones
      </div>
    </div>

    <!-- Filtros -->
    <div class="flex flex-col sm:flex-row gap-4">
      <Input
        v-model="searchQuery"
        placeholder="Buscar por email o nombre..."
        class="max-w-sm"
      />
      <Select v-model="statusFilter">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="pending_payment">Pago Pendiente</SelectItem>
          <SelectItem value="pending_contract">Contrato Pendiente</SelectItem>
          <SelectItem value="active">Activa</SelectItem>
          <SelectItem value="cancelled">Cancelada</SelectItem>
          <SelectItem value="suspended">Suspendida</SelectItem>
          <SelectItem value="past_due">Pago Atrasado</SelectItem>
        </SelectContent>
      </Select>
      <Select v-model="planFilter">
        <SelectTrigger class="w-[180px]">
          <SelectValue placeholder="Plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los planes</SelectItem>
          <SelectItem value="basic">Básico</SelectItem>
          <SelectItem value="standard">Estándar</SelectItem>
          <SelectItem value="premium">Premium</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="bg-destructive/15 text-destructive px-4 py-3 rounded-md flex items-center justify-between">
      <span>{{ error }}</span>
      <Button variant="ghost" size="sm" @click="clearError">Cerrar</Button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Tabla -->
    <div v-else class="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Plan</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Pago Inicial</TableHead>
            <TableHead>Mensual</TableHead>
            <TableHead>Contrato</TableHead>
            <TableHead>Creada</TableHead>
            <TableHead class="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="subscription in filteredSubscriptions" :key="subscription.id">
            <TableCell>
              <div>
                <div class="font-medium">
                  {{ subscription.user?.firstName }} {{ subscription.user?.lastName }}
                </div>
                <div class="text-sm text-muted-foreground">
                  {{ subscription.user?.email }}
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {{ getPlanText(subscription.planType) }}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge :variant="getStatusBadgeVariant(subscription.status)">
                {{ getStatusText(subscription.status) }}
              </Badge>
            </TableCell>
            <TableCell>
              <div class="text-sm">
                <span :class="subscription.initialPaymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'">
                  {{ subscription.initialPaymentStatus === 'completed' ? '✓' : '⏳' }}
                </span>
                {{ formatPrice(subscription.initialPaymentAmount) }}
                <span v-if="subscription.initialPaymentType === 'installments'" class="text-muted-foreground">
                  ({{ subscription.installmentsPaid }}/{{ subscription.totalInstallments }})
                </span>
              </div>
            </TableCell>
            <TableCell>{{ formatPrice(subscription.monthlyPrice) }}</TableCell>
            <TableCell>
              <span v-if="subscription.contractSigned" class="text-green-600">✓ Firmado</span>
              <span v-else class="text-yellow-600">Pendiente</span>
            </TableCell>
            <TableCell>{{ formatDate(subscription.createdAt) }}</TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-2">
                <Button
                  v-if="subscription.status === 'pending_contract'"
                  variant="outline"
                  size="sm"
                  @click="openActivateDialog(subscription)"
                >
                  Activar
                </Button>
                <Button
                  v-if="subscription.status === 'active'"
                  variant="outline"
                  size="sm"
                  @click="openCancelDialog(subscription)"
                >
                  Cancelar
                </Button>
                <NuxtLink :to="`/subscriptions/${subscription.id}`">
                  <Button variant="ghost" size="sm">Ver</Button>
                </NuxtLink>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-if="filteredSubscriptions.length === 0">
            <TableCell colspan="8" class="text-center py-8 text-muted-foreground">
              No se encontraron suscripciones
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Cancel Dialog -->
    <Dialog v-model:open="showCancelDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancelar Suscripción</DialogTitle>
          <DialogDescription>
            Cancela la suscripción de {{ selectedSubscription?.user?.firstName }}
            {{ selectedSubscription?.user?.lastName }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="reason">Razón de cancelación *</Label>
            <Textarea
              id="reason"
              v-model="cancelForm.reason"
              placeholder="Ingresa la razón de la cancelación"
              rows="3"
            />
          </div>

          <div class="space-y-2">
            <Label for="feedback">Feedback adicional</Label>
            <Textarea
              id="feedback"
              v-model="cancelForm.feedback"
              placeholder="Comentarios adicionales del cliente"
              rows="2"
            />
          </div>

          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="cancelAtPeriodEnd"
              v-model="cancelForm.cancelAtPeriodEnd"
              class="rounded border-gray-300"
            />
            <Label for="cancelAtPeriodEnd">
              Cancelar al final del período de facturación actual
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showCancelDialog = false">Cancelar</Button>
          <Button
            variant="destructive"
            @click="confirmCancel"
            :disabled="processing || !cancelForm.reason"
          >
            {{ processing ? 'Procesando...' : 'Confirmar Cancelación' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Activate Dialog -->
    <Dialog v-model:open="showActivateDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activar Suscripción</DialogTitle>
          <DialogDescription>
            Activa la suscripción después de que el contrato haya sido firmado
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="contractUrl">URL del Contrato Firmado *</Label>
            <Input
              id="contractUrl"
              v-model="activateForm.contractUrl"
              placeholder="https://..."
            />
          </div>

          <div class="space-y-2">
            <Label for="envelopeId">ID de Envelope (DocuSign)</Label>
            <Input
              id="envelopeId"
              v-model="activateForm.envelopeId"
              placeholder="envelope_xxx"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showActivateDialog = false">Cancelar</Button>
          <Button
            @click="confirmActivate"
            :disabled="processing || !activateForm.contractUrl"
          >
            {{ processing ? 'Procesando...' : 'Activar Suscripción' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
