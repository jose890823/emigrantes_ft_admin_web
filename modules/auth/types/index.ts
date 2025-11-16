/**
 * Tipos para el módulo de autenticación
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
  dateOfBirth?: string
  identificationNumber?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  lastLoginAt?: string
  createdAt: string
  updatedAt: string
}

export interface LoginDto {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  data: {
    accessToken: string
    refreshToken: string
    user: User
  }
  message: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  loading: boolean
}
