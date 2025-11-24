/**
 * Tipos para el módulo de suscripciones
 */

export type SubscriptionPlan = 'basic' | 'standard' | 'premium'
export type SubscriptionStatus = 'pending_payment' | 'pending_contract' | 'active' | 'cancelled' | 'suspended' | 'expired' | 'past_due'
export type InitialPaymentType = 'single' | 'installments'
export type InitialPaymentStatus = 'pending' | 'partial' | 'completed' | 'failed'
export type PaymentMethod = 'stripe' | 'paypal' | 'zelle' | 'other'

export interface Subscription {
  id: string
  userId: string
  planId?: string
  planType: SubscriptionPlan
  status: SubscriptionStatus

  // Precios
  monthlyPrice: number
  currency: string

  // Pago inicial
  initialPaymentType: InitialPaymentType
  initialPaymentAmount: number
  initialPaymentStatus: InitialPaymentStatus
  installmentsPaid: number
  totalInstallments: number
  installmentAmount: number
  nextInstallmentDate?: string

  // Stripe
  paymentMethod: PaymentMethod
  stripeSubscriptionId?: string
  stripeCustomerId?: string
  stripePaymentMethodId?: string
  stripeCheckoutSessionId?: string

  // Fechas
  startDate?: string
  nextBillingDate?: string
  cancelledAt?: string
  cancellationReason?: string
  expiresAt?: string

  // Contrato
  contractSigned: boolean
  contractSignedAt?: string
  docusignEnvelopeId?: string
  contractUrl?: string

  // Relaciones
  user?: {
    id: string
    email: string
    firstName: string
    lastName: string
    phone: string
  }
  plan?: {
    id: string
    type: string
    name: string
  }

  // Auditoría
  notes?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Payment {
  id: string
  userId: string
  subscriptionId?: string
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded'
  provider: 'stripe' | 'paypal' | 'zelle' | 'other'
  transactionId?: string
  invoiceNumber: string
  invoicePdfUrl?: string
  description: string
  paidAt?: string
  refundedAt?: string
  refundedAmount: number
  refundReason?: string
  metadata?: Record<string, any>
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

export interface SubscriptionFilters {
  status?: SubscriptionStatus
  planType?: SubscriptionPlan
  page?: number
  limit?: number
}

export interface SubscriptionListResponse {
  success: boolean
  data: Subscription[]
  meta?: {
    total: number
    page: number
    limit: number
  }
  message?: string
}

export interface SubscriptionResponse {
  success: boolean
  data: Subscription
  message?: string
}

export interface PaymentListResponse {
  success: boolean
  data: Payment[]
  message?: string
}

export interface CancelSubscriptionDto {
  reason: string
  cancelAtPeriodEnd?: boolean
  feedback?: string
}
