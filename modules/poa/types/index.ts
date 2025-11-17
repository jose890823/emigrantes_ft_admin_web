/**
 * POA (Power of Attorney) Module Types
 *
 * Este archivo contiene todas las interfaces y tipos relacionados con
 * el módulo de Poderes Notariales (Power of Attorney)
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Tipos de poder notarial disponibles
 */
export enum POAType {
  STANDARD = 'standard',      // Poder general
  DURABLE = 'durable',        // Poder duradero (permanece válido si el cliente queda incapacitado)
  SPRINGING = 'springing',    // Poder condicional (se activa bajo condiciones específicas)
}

/**
 * Estados del ciclo de vida de un poder notarial
 */
export enum POAStatus {
  DRAFT = 'draft',                    // Borrador (en proceso de creación)
  PENDING = 'pending',                // Pendiente de revisión
  IN_REVIEW = 'in_review',           // En proceso de revisión
  APPROVED = 'approved',              // Aprobado
  REJECTED = 'rejected',              // Rechazado
  NOTARIZED = 'notarized',           // Notarizado
  ACTIVATED = 'activated',            // Activado (en vigor)
  EXECUTED = 'executed',              // Ejecutado
  COMPLETED = 'completed',            // Completado
  CANCELLED = 'cancelled',            // Cancelado
}

/**
 * Tipos de acción en el historial
 */
export enum POAHistoryAction {
  CREATED = 'created',
  SUBMITTED = 'submitted',
  ASSIGNED = 'assigned',
  REVIEWED = 'reviewed',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  NOTARIZED = 'notarized',
  ACTIVATED = 'activated',
  EXECUTED = 'executed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DOCUMENT_ADDED = 'document_added',
  COMMENT_ADDED = 'comment_added',
}

/**
 * Tipos de ejecución de POA
 */
export enum POAExecutionType {
  BANK_TRANSACTION = 'bank_transaction',
  DOCUMENT_DELIVERY = 'document_delivery',
  PROPERTY_MANAGEMENT = 'property_management',
  OTHER = 'other',
}

/**
 * Estados de ejecución de POA
 */
export enum POAExecutionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// ============================================================================
// Interfaces principales
// ============================================================================

/**
 * Interfaz principal de Power of Attorney
 */
export interface POA {
  id: string
  clientId: string
  assignedAdminId?: string
  type: POAType
  status: POAStatus

  // Información del cliente
  clientFullName: string
  clientAddress: string
  clientIdentification: string
  clientEmail?: string
  clientPhone?: string

  // Instrucciones y beneficiarios (encriptados en el backend)
  instructions?: string
  beneficiaries?: string

  // Triggers de activación (para POA tipo springing)
  activationTriggers?: string

  // Fechas importantes
  submittedAt?: Date | string
  reviewedAt?: Date | string
  approvedAt?: Date | string
  rejectedAt?: Date | string
  notarizedAt?: Date | string
  activatedAt?: Date | string
  executedAt?: Date | string
  completedAt?: Date | string
  cancelledAt?: Date | string

  // Razones
  rejectionReason?: string
  cancellationReason?: string

  // Notas adicionales
  reviewNotes?: string
  adminNotes?: string

  // Metadatos
  createdAt: Date | string
  updatedAt: Date | string
  deletedAt?: Date | string

  // Relaciones
  client?: POAUser
  assignedAdmin?: POAUser
  documents?: POADocument[]
  history?: POAHistory[]
  executions?: POAExecution[]
}

/**
 * Usuario relacionado con POA (cliente o admin)
 */
export interface POAUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
}

/**
 * Documento adjunto al POA
 */
export interface POADocument {
  id: string
  poaId: string
  fileName: string
  fileUrl: string
  fileType: string
  fileSize: number
  uploadedBy: string
  description?: string
  createdAt: Date | string

  // Relaciones
  uploadedByUser?: POAUser
}

/**
 * Entrada de historial de POA
 */
export interface POAHistory {
  id: string
  poaId: string
  action: POAHistoryAction
  performedBy: string
  description?: string
  metadata?: Record<string, any>
  createdAt: Date | string

  // Relaciones
  performedByUser?: POAUser
}

/**
 * Ejecución de POA
 */
export interface POAExecution {
  id: string
  poaId: string
  executedBy: string
  executionType: POAExecutionType
  description: string
  amount?: number | null
  recipient?: string | null
  proofDocuments?: string[]
  status: POAExecutionStatus
  executedAt: Date | string
  completedAt?: Date | string | null
  notes?: string | null
  updatedAt: Date | string

  // Relaciones
  executedByUser?: POAUser
}

// ============================================================================
// DTOs (Data Transfer Objects)
// ============================================================================

/**
 * DTO para crear un nuevo POA
 */
export interface CreatePOADto {
  type: POAType
  clientFullName: string
  clientAddress: string
  clientIdentification: string
  clientEmail?: string
  clientPhone?: string
  instructions?: string
  beneficiaries?: string
  activationTriggers?: string
}

/**
 * DTO para actualizar un POA
 */
export interface UpdatePOADto {
  type?: POAType
  clientFullName?: string
  clientAddress?: string
  clientIdentification?: string
  clientEmail?: string
  clientPhone?: string
  instructions?: string
  beneficiaries?: string
  activationTriggers?: string
  reviewNotes?: string
  adminNotes?: string
}

/**
 * DTO para enviar un POA (cambiar de draft a pending)
 */
export interface SubmitPOADto {
  // Puede incluir información adicional al momento de enviar
  notes?: string
}

/**
 * DTO para asignar un POA a un administrador
 */
export interface AssignPOADto {
  adminId: string
  notes?: string
}

/**
 * DTO para revisar un POA
 */
export interface ReviewPOADto {
  notes?: string
}

/**
 * DTO para aprobar un POA
 */
export interface ApprovePOADto {
  adminNotes?: string
}

/**
 * DTO para rechazar un POA
 */
export interface RejectPOADto {
  reason: string
  notes?: string
}

/**
 * DTO para notarizar un POA
 */
export interface NotarizePOADto {
  notarizationNotes?: string
}

/**
 * DTO para activar un POA
 */
export interface ActivatePOADto {
  activationReason: string
  activationDetails?: string
}

/**
 * DTO para ejecutar un POA
 */
export interface ExecutePOADto {
  executionType: POAExecutionType
  description: string
  amount?: number
  recipient?: string
  proofDocuments?: string[]
  notes?: string
}

/**
 * DTO para completar una ejecución
 */
export interface CompleteExecutionDto {
  outcome: string
  notes?: string
}

/**
 * DTO para cancelar un POA
 */
export interface CancelPOADto {
  reason: string
  notes?: string
}

/**
 * DTO para subir un documento
 */
export interface UploadDocumentDto {
  file: File
  description?: string
}

// ============================================================================
// Filtros y Paginación
// ============================================================================

/**
 * Filtros para búsqueda de POAs
 */
export interface POAFilters {
  search?: string              // Búsqueda por nombre de cliente, ID, identificación
  status?: POAStatus           // Filtrar por estado
  type?: POAType               // Filtrar por tipo
  clientId?: string            // Filtrar por cliente específico
  assignedAdminId?: string     // Filtrar por administrador asignado
  dateFrom?: Date | string     // Fecha de creación desde
  dateTo?: Date | string       // Fecha de creación hasta
  submittedFrom?: Date | string // Fecha de envío desde
  submittedTo?: Date | string   // Fecha de envío hasta
}

/**
 * Parámetros de paginación para POAs
 */
export interface POAPaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

/**
 * Respuesta paginada de POAs
 */
export interface POAPaginatedResponse {
  data: POA[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// ============================================================================
// Estadísticas
// ============================================================================

/**
 * Estadísticas generales de POAs
 */
export interface POAStats {
  total: number
  byStatus: Record<POAStatus, number>
  byType: Record<POAType, number>
  pendingReview: number
  approved: number
  rejected: number
  active: number
  completed: number
  averageProcessingTime?: number // En días
  recentActivity?: POAHistory[]
}

/**
 * Estadísticas de un administrador
 */
export interface AdminPOAStats {
  assigned: number
  reviewed: number
  approved: number
  rejected: number
  pending: number
  averageReviewTime?: number // En días
}

// ============================================================================
// Respuestas de API
// ============================================================================

/**
 * Respuesta genérica de la API
 */
export interface POAResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * Respuesta de una lista de POAs
 */
export type POAListResponse = POAResponse<POAPaginatedResponse>

/**
 * Respuesta de un POA individual
 */
export type POASingleResponse = POAResponse<POA>

/**
 * Respuesta de estadísticas
 */
export type POAStatsResponse = POAResponse<POAStats>

// ============================================================================
// Utilidades y Helpers
// ============================================================================

/**
 * Mapeo de etiquetas de estado en español
 */
export const POAStatusLabels: Record<POAStatus, string> = {
  [POAStatus.DRAFT]: 'Borrador',
  [POAStatus.PENDING]: 'Pendiente',
  [POAStatus.IN_REVIEW]: 'En Revisión',
  [POAStatus.APPROVED]: 'Aprobado',
  [POAStatus.REJECTED]: 'Rechazado',
  [POAStatus.NOTARIZED]: 'Notarizado',
  [POAStatus.ACTIVATED]: 'Activado',
  [POAStatus.EXECUTED]: 'Ejecutado',
  [POAStatus.COMPLETED]: 'Completado',
  [POAStatus.CANCELLED]: 'Cancelado',
}

/**
 * Mapeo de etiquetas de tipo en español
 */
export const POATypeLabels: Record<POAType, string> = {
  [POAType.STANDARD]: 'Estándar',
  [POAType.DURABLE]: 'Duradero',
  [POAType.SPRINGING]: 'Condicional',
}

/**
 * Variantes de color para badges según el estado
 */
export const POAStatusVariants: Record<POAStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  [POAStatus.DRAFT]: 'outline',
  [POAStatus.PENDING]: 'secondary',
  [POAStatus.IN_REVIEW]: 'default',
  [POAStatus.APPROVED]: 'default',
  [POAStatus.REJECTED]: 'destructive',
  [POAStatus.NOTARIZED]: 'default',
  [POAStatus.ACTIVATED]: 'default',
  [POAStatus.EXECUTED]: 'default',
  [POAStatus.COMPLETED]: 'default',
  [POAStatus.CANCELLED]: 'destructive',
}
