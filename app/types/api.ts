/**
 * API Types for Admin Panel
 */

// User types
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STAFF = 'staff',
  CLIENT = 'client',
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: UserRole
  profilePhoto: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  dateOfBirth: string | null
  identificationNumber: string | null
  emailVerified: boolean
  phoneVerified: boolean
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

// Auth types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export interface RefreshTokenRequest {
  refreshToken: string
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: {
    code: string
    message: string
    details?: any
  }
  timestamp: string
  path: string
}

// User admin types
export interface UserFilterParams {
  role?: UserRole
  isActive?: boolean
  emailVerified?: boolean
  phoneVerified?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface UpdateUserAdminRequest {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  role?: UserRole
  isActive?: boolean
  emailVerified?: boolean
  phoneVerified?: boolean
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  dateOfBirth?: string
  identificationNumber?: string
}

// Activity types
export enum ActivityType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFIED = 'email_verified',
  PHONE_VERIFIED = 'phone_verified',
  PROFILE_UPDATED = 'profile_updated',
  PROFILE_PHOTO_UPLOADED = 'profile_photo_uploaded',
  PROFILE_PHOTO_DELETED = 'profile_photo_deleted',
  POA_CREATED = 'poa_created',
  POA_SUBMITTED = 'poa_submitted',
  POA_APPROVED = 'poa_approved',
  POA_REJECTED = 'poa_rejected',
  POA_ACTIVATED = 'poa_activated',
  POA_EXECUTED = 'poa_executed',
  POA_CANCELLED = 'poa_cancelled',
  SUBSCRIPTION_CREATED = 'subscription_created',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  ROLE_CHANGED = 'role_changed',
  USER_ACTIVATED = 'user_activated',
  USER_DEACTIVATED = 'user_deactivated',
  USER_DELETED = 'user_deleted',
  NOTIFICATION_SENT = 'notification_sent',
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_DOWNLOADED = 'document_downloaded',
}

export interface UserActivity {
  id: string
  userId: string
  activityType: ActivityType
  description: string
  ipAddress: string | null
  userAgent: string | null
  metadata: Record<string, any> | null
  performedBy: string | null
  performer: User | null
  createdAt: string
}

export interface UserActivityStats {
  totalActivities: number
  lastActivity: string | null
  activitiesByType: Record<string, number>
}

// Stats types
export interface UserStats {
  total: number
  active: number
  inactive: number
  byRole: Record<UserRole, number>
  emailVerified: number
  phoneVerified: number
}
