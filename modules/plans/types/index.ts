/**
 * Tipos para el módulo de planes
 */

export type PlanType = 'basic' | 'standard' | 'premium'
export type PlanStatus = 'active' | 'inactive' | 'deprecated'

export interface Plan {
  id: string
  type: PlanType
  name: string
  description: string
  status: PlanStatus

  // Precios
  monthlyPrice: number
  initialPayment: number
  installmentAmount: number
  installmentCount: number
  currency: string

  // Stripe IDs
  stripeProductId?: string
  stripeMonthlyPriceId?: string
  stripeInitialPriceId?: string
  stripeInstallmentPriceId?: string

  // Características
  features: string[]
  benefits?: Record<string, any>

  // Contrato
  contractAnnex: string
  docusignTemplateId?: string

  // Visual
  isRecommended: boolean
  displayOrder: number
  badgeColor?: string
  icon?: string

  // Auditoría
  createdAt: string
  updatedAt: string
}

export interface CreatePlanDto {
  type: PlanType
  name: string
  description: string
  status?: PlanStatus
  monthlyPrice: number
  initialPayment: number
  installmentAmount: number
  installmentCount?: number
  features: string[]
  benefits?: Record<string, any>
  contractAnnex: string
  docusignTemplateId?: string
  isRecommended?: boolean
  displayOrder?: number
  badgeColor?: string
  icon?: string
  stripeProductId?: string
  stripeMonthlyPriceId?: string
  stripeInitialPriceId?: string
  stripeInstallmentPriceId?: string
}

export interface UpdatePlanDto extends Partial<CreatePlanDto> {}

export interface PlanListResponse {
  success: boolean
  data: Plan[]
  message?: string
}

export interface PlanResponse {
  success: boolean
  data: Plan
  message?: string
}
