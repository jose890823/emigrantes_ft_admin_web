<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Plan } from '~/modules/plans/types'
import { usePlans } from '~/modules/plans/composables/usePlans'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { Switch } from '~/components/ui/switch'

definePageMeta({
  middleware: ['auth'],
})

const {
  plans,
  loading,
  error,
  fetchPlans,
  updatePlan,
  updateStripeIds,
  clearError,
} = usePlans()

// Estado local
const showEditDialog = ref(false)
const showStripeDialog = ref(false)
const selectedPlan = ref<Plan | null>(null)
const saving = ref(false)

// Formulario de edición
const editForm = ref({
  name: '',
  description: '',
  monthlyPrice: 0,
  initialPayment: 0,
  installmentAmount: 0,
  isRecommended: false,
  displayOrder: 0,
})

// Formulario de Stripe
const stripeForm = ref({
  stripeProductId: '',
  stripeMonthlyPriceId: '',
  stripeInitialPriceId: '',
  stripeInstallmentPriceId: '',
})

// Formatear precio
const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}

// Obtener color del badge según estado
const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'active':
      return 'default'
    case 'inactive':
      return 'secondary'
    case 'deprecated':
      return 'destructive'
    default:
      return 'outline'
  }
}

// Obtener texto del estado
const getStatusText = (status: string) => {
  switch (status) {
    case 'active':
      return 'Activo'
    case 'inactive':
      return 'Inactivo'
    case 'deprecated':
      return 'Deprecado'
    default:
      return status
  }
}

// Abrir diálogo de edición
const openEditDialog = (plan: Plan) => {
  selectedPlan.value = plan
  editForm.value = {
    name: plan.name,
    description: plan.description,
    monthlyPrice: plan.monthlyPrice,
    initialPayment: plan.initialPayment,
    installmentAmount: plan.installmentAmount,
    isRecommended: plan.isRecommended,
    displayOrder: plan.displayOrder,
  }
  showEditDialog.value = true
}

// Guardar edición
const saveEdit = async () => {
  if (!selectedPlan.value) return

  saving.value = true
  try {
    await updatePlan(selectedPlan.value.id, editForm.value)
    showEditDialog.value = false
  } catch (e) {
    console.error('Error saving plan:', e)
  } finally {
    saving.value = false
  }
}

// Abrir diálogo de Stripe
const openStripeDialog = (plan: Plan) => {
  selectedPlan.value = plan
  stripeForm.value = {
    stripeProductId: plan.stripeProductId || '',
    stripeMonthlyPriceId: plan.stripeMonthlyPriceId || '',
    stripeInitialPriceId: plan.stripeInitialPriceId || '',
    stripeInstallmentPriceId: plan.stripeInstallmentPriceId || '',
  }
  showStripeDialog.value = true
}

// Guardar IDs de Stripe
const saveStripeIds = async () => {
  if (!selectedPlan.value) return

  saving.value = true
  try {
    await updateStripeIds(selectedPlan.value.id, stripeForm.value)
    showStripeDialog.value = false
  } catch (e) {
    console.error('Error saving Stripe IDs:', e)
  } finally {
    saving.value = false
  }
}

// Cargar planes al montar
onMounted(async () => {
  await fetchPlans(true)
})
</script>

<template>
  <div class="container mx-auto py-6 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold">Planes de Suscripción</h1>
        <p class="text-muted-foreground mt-1">
          Gestiona los planes y precios de Emigrantes FT
        </p>
      </div>
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

    <!-- Plans Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="plan in plans" :key="plan.id" :class="{ 'ring-2 ring-primary': plan.isRecommended }">
        <CardHeader>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span v-if="plan.icon" class="text-2xl">
                {{ plan.icon === 'shield' ? '🛡️' : plan.icon === 'shield-check' ? '✅' : '👑' }}
              </span>
              <CardTitle>{{ plan.name }}</CardTitle>
            </div>
            <Badge :variant="getStatusBadgeVariant(plan.status)">
              {{ getStatusText(plan.status) }}
            </Badge>
          </div>
          <CardDescription>{{ plan.description }}</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <!-- Precios -->
          <div class="space-y-2">
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">Mensual:</span>
              <span class="font-semibold text-lg">{{ formatPrice(plan.monthlyPrice) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">Inicial:</span>
              <span class="font-medium">{{ formatPrice(plan.initialPayment) }}</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-sm text-muted-foreground">Cuota (x{{ plan.installmentCount }}):</span>
              <span class="font-medium">{{ formatPrice(plan.installmentAmount) }}</span>
            </div>
          </div>

          <!-- Características -->
          <div class="border-t pt-4">
            <h4 class="font-medium mb-2">Características:</h4>
            <ul class="space-y-1 text-sm">
              <li v-for="(feature, idx) in plan.features.slice(0, 4)" :key="idx" class="flex items-center gap-2">
                <span class="text-green-500">✓</span>
                {{ feature }}
              </li>
              <li v-if="plan.features.length > 4" class="text-muted-foreground">
                +{{ plan.features.length - 4 }} más...
              </li>
            </ul>
          </div>

          <!-- Stripe Status -->
          <div class="border-t pt-4">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Stripe:</span>
              <Badge v-if="plan.stripeProductId" variant="outline" class="text-green-600">
                Configurado
              </Badge>
              <Badge v-else variant="outline" class="text-yellow-600">
                Sin configurar
              </Badge>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex gap-2 pt-2">
            <Button variant="outline" size="sm" class="flex-1" @click="openEditDialog(plan)">
              Editar
            </Button>
            <Button variant="outline" size="sm" class="flex-1" @click="openStripeDialog(plan)">
              Stripe
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Edit Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Plan</DialogTitle>
          <DialogDescription>
            Modifica los detalles del plan {{ selectedPlan?.name }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="name">Nombre</Label>
            <Input id="name" v-model="editForm.name" />
          </div>

          <div class="space-y-2">
            <Label for="description">Descripción</Label>
            <Textarea id="description" v-model="editForm.description" rows="3" />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="monthlyPrice">Precio Mensual ($)</Label>
              <Input id="monthlyPrice" v-model.number="editForm.monthlyPrice" type="number" step="0.01" />
            </div>
            <div class="space-y-2">
              <Label for="initialPayment">Pago Inicial ($)</Label>
              <Input id="initialPayment" v-model.number="editForm.initialPayment" type="number" step="0.01" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="installmentAmount">Monto Cuota ($)</Label>
              <Input id="installmentAmount" v-model.number="editForm.installmentAmount" type="number" step="0.01" />
            </div>
            <div class="space-y-2">
              <Label for="displayOrder">Orden</Label>
              <Input id="displayOrder" v-model.number="editForm.displayOrder" type="number" />
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <Switch id="isRecommended" v-model:checked="editForm.isRecommended" />
            <Label for="isRecommended">Marcar como recomendado</Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showEditDialog = false">Cancelar</Button>
          <Button @click="saveEdit" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <!-- Stripe Dialog -->
    <Dialog v-model:open="showStripeDialog">
      <DialogContent class="max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Stripe</DialogTitle>
          <DialogDescription>
            Configura los IDs de Stripe para {{ selectedPlan?.name }}
          </DialogDescription>
        </DialogHeader>

        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label for="stripeProductId">Product ID</Label>
            <Input id="stripeProductId" v-model="stripeForm.stripeProductId" placeholder="prod_xxx" />
          </div>

          <div class="space-y-2">
            <Label for="stripeMonthlyPriceId">Price ID (Mensual)</Label>
            <Input id="stripeMonthlyPriceId" v-model="stripeForm.stripeMonthlyPriceId" placeholder="price_xxx" />
          </div>

          <div class="space-y-2">
            <Label for="stripeInitialPriceId">Price ID (Inicial)</Label>
            <Input id="stripeInitialPriceId" v-model="stripeForm.stripeInitialPriceId" placeholder="price_xxx" />
          </div>

          <div class="space-y-2">
            <Label for="stripeInstallmentPriceId">Price ID (Cuotas)</Label>
            <Input id="stripeInstallmentPriceId" v-model="stripeForm.stripeInstallmentPriceId" placeholder="price_xxx" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" @click="showStripeDialog = false">Cancelar</Button>
          <Button @click="saveStripeIds" :disabled="saving">
            {{ saving ? 'Guardando...' : 'Guardar' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>
