import { z } from 'zod';
import { userSchema } from '../auth/index.js';
import { passwordSchema } from '../common/index.js';

// Update profile request
export const updateProfileRequestSchema = z.object({
  name: z.string().min(1).max(100).openapi({
    example: 'Jane Smith',
    description: 'Updated user name'
  })
}).openapi('UpdateProfileRequest');

// Change password request
export const changePasswordRequestSchema = z.object({
  currentPassword: z.string().openapi({
    example: 'OldPass123!',
    description: 'Current password'
  }),
  newPassword: passwordSchema.openapi({
    description: 'New password (must meet security requirements)'
  })
}).openapi('ChangePasswordRequest');

// Delete account request
export const deleteAccountRequestSchema = z.object({
  password: z.string().openapi({
    example: 'CurrentPassword123!',
    description: 'Current password for verification'
  })
}).openapi('DeleteAccountRequest');

// Update physician association request
export const updatePhysicianRequestSchema = z.object({
  physicianId: z.string().nullable().openapi({
    example: 'physician-id-123',
    description: 'Physician ID to associate with, or null to remove association'
  })
}).openapi('UpdatePhysicianRequest');

// User profile response with stats
export const userProfileResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: userSchema,
    stats: z.object({
      deviceCount: z.number().int().min(0).openapi({ example: 2 }),
      recentMeasurementCount: z.number().int().min(0).openapi({ example: 145 })
    })
  })
}).openapi('UserProfileResponse');

// Update profile response
export const updateProfileResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: userSchema
  }),
  message: z.string().openapi({ example: 'Profile updated successfully' })
}).openapi('UpdateProfileResponse');

// Change password response
export const changePasswordResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().openapi({ example: 'Password changed successfully' })
}).openapi('ChangePasswordResponse');

// Delete account response
export const deleteAccountResponseSchema = z.object({
  success: z.literal(true),
  message: z.string().openapi({ example: 'Account and all associated data deleted successfully' }),
  data: z.object({
    deletedMeasurements: z.number().int().min(0).openapi({ example: 150 }),
    deletedDevices: z.number().int().min(0).openapi({ example: 2 })
  })
}).openapi('DeleteAccountResponse');

// Update physician response
export const updatePhysicianResponseSchema = z.object({
  success: z.literal(true),
  data: z.object({
    user: userSchema
  }),
  message: z.string().openapi({ example: 'Physician association updated successfully' })
}).openapi('UpdatePhysicianResponse');
