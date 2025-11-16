/**
 * Tipos para el módulo de usuarios
 */

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  role: 'client' | 'staff' | 'admin' | 'super_admin'
  emailVerified: boolean
  phoneVerified: boolean
  isActive: boolean
  profilePhotoUrl?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  // Nota: role e isActive no son aceptados por el endpoint /auth/register
  // El backend asigna automáticamente role: 'client' e isActive: true
  role?: 'client' | 'staff' | 'admin' | 'super_admin'
  isActive?: boolean
}

export interface UpdateUserDto {
  email?: string
  password?: string
  firstName?: string
  lastName?: string
  phone?: string
  role?: 'client' | 'staff' | 'admin' | 'super_admin'
  isActive?: boolean
  emailVerified?: boolean
  phoneVerified?: boolean
}

export interface UserFilters {
  search?: string
  role?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export interface UserListResponse {
  success: boolean
  data: {
    users: User[]
    total: number
    page: number
    limit: number
  }
  message?: string
}

export interface UserResponse {
  success: boolean
  data: User
  message?: string
}
