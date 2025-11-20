/**
 * User management types based on backend API
 * Corresponds to /api/users/* endpoints
 */

// User role type
export type UserRole = 'user' | 'physician'

// User profile data from API
export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  physicianId: string | null
  createdAt: string
  updatedAt: string
}

// User statistics
export interface UserStats {
  deviceCount: number
  recentMeasurementCount: number
}

// GET /api/users/profile response
export interface GetProfileResponse {
  user: UserProfile
  stats: UserStats
}

// PUT /api/users/profile request
export interface UpdateProfileRequest {
  name: string
}

// PUT /api/users/profile response
export interface UpdateProfileResponse {
  user: UserProfile
  message: string
}

// POST /api/users/change-password request
export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

// POST /api/users/change-password response
export interface ChangePasswordResponse {
  message: string
}

// DELETE /api/users/profile request
export interface DeleteAccountRequest {
  password: string
}

// DELETE /api/users/profile response
export interface DeleteAccountResponse {
  message: string
  deletedMeasurements: number
  deletedDevices: number
}

// PUT /api/users/physician request
export interface UpdatePhysicianRequest {
  physicianId: string | null
}

// PUT /api/users/physician response
export interface UpdatePhysicianResponse {
  user: UserProfile
  message: string
}

// Password validation rules
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
  specialCharPattern: /[!@#$%^&*(),.?":{}|<>]/,
} as const

// Password validation helper
export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`)
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (PASSWORD_REQUIREMENTS.requireSpecial && !PASSWORD_REQUIREMENTS.specialCharPattern.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
