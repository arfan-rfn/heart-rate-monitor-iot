import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../../middleware/error/index.js';
import { Device } from '../../models/devices/index.js';
import { Measurement } from '../../models/measurements/index.js';
import { getMongoDbInstance } from '../../config/database.js';
import bcrypt from 'bcrypt';

/**
 * Get user profile
 * GET /api/users/profile
 * Requires: JWT authentication
 */
export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  // Get user data from Better-Auth
  // The user data is already in req.user from the authenticate middleware
  const user = req.user;

  // Count user's devices
  const deviceCount = await Device.countDocuments({ userId });

  // Get recent measurement count (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentMeasurementCount = await Measurement.countDocuments({
    userId,
    timestamp: { $gte: sevenDaysAgo },
  });

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'user',
        physicianId: user.physicianId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      stats: {
        deviceCount,
        recentMeasurementCount,
      },
    },
  });
});

/**
 * Update user profile
 * PUT /api/users/profile
 * Requires: JWT authentication
 * Allows updating: name
 * Does NOT allow: email, password, role, physicianId (use specific endpoints)
 */
export const updateUserProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  const { name } = req.body;

  // Validate input
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    throw new AppError('Name is required and must be a non-empty string', 400, 'INVALID_INPUT');
  }

  if (name.length > 100) {
    throw new AppError('Name must not exceed 100 characters', 400, 'INVALID_INPUT');
  }

  // Reject attempts to update protected fields
  if (req.body.email || req.body.password || req.body.role || req.body.physicianId) {
    throw new AppError(
      'Cannot update email, password, role, or physicianId through this endpoint',
      400,
      'INVALID_INPUT'
    );
  }

  // Update user directly in database (Better-Auth manages the user collection)
  try {
    const db = getMongoDbInstance();
    const userCollection = db.collection('user');
    const { ObjectId } = await import('mongodb');

    // Try to find user by 'id' field first (Better Auth v2 format)
    let query: any = { id: userId };
    let existingUser = await userCollection.findOne(query);

    // If not found, try by _id (legacy format or ObjectId)
    if (!existingUser) {
      try {
        query = { _id: new ObjectId(userId) };
        existingUser = await userCollection.findOne(query);
      } catch (e) {
        // Invalid ObjectId format
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
    }

    if (!existingUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Update using the same query that found the user
    const result = await userCollection.findOneAndUpdate(
      query,
      {
        $set: {
          name: name.trim(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    // Extract the updated document
    const updateResult = result?.value || result;

    if (!updateResult) {
      throw new AppError('Failed to update user', 500, 'UPDATE_FAILED');
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: updateResult.id || updateResult._id?.toString(),
          email: updateResult.email,
          name: updateResult.name,
          role: updateResult.role || 'user',
          updatedAt: updateResult.updatedAt,
        },
      },
      message: 'Profile updated successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error updating user profile:', error);
    throw new AppError('Failed to update profile', 500, 'UPDATE_FAILED');
  }
});

/**
 * Change user password
 * POST /api/users/change-password
 * Requires: JWT authentication
 * Body: { currentPassword, newPassword }
 */
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userEmail = req.user?.email;

  if (!userId || !userEmail) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  const { currentPassword, newPassword } = req.body;

  // Validate input
  if (!currentPassword || !newPassword) {
    throw new AppError('Current password and new password are required', 400, 'INVALID_INPUT');
  }

  // Validate new password strength
  if (newPassword.length < 8) {
    throw new AppError('New password must be at least 8 characters long', 400, 'WEAK_PASSWORD');
  }

  // Check password complexity (optional but recommended)
  const hasUpperCase = /[A-Z]/.test(newPassword);
  const hasLowerCase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
    throw new AppError(
      'Password must contain uppercase, lowercase, number, and special character',
      400,
      'WEAK_PASSWORD'
    );
  }

  // Verify current password and change to new password
  try {
    const db = getMongoDbInstance();
    const accountCollection = db.collection('account');

    // Find the user's account (Better-Auth stores password hashes in 'account' collection)
    const account = await accountCollection.findOne({ userId });

    if (!account || !account.password) {
      throw new AppError('Account not found or password not set', 404, 'ACCOUNT_NOT_FOUND');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, account.password);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 401, 'INVALID_CREDENTIALS');
    }

    // Hash new password using the same bcrypt configuration as Better-Auth
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await accountCollection.updateOne(
      { userId },
      {
        $set: {
          password: newPasswordHash,
          updatedAt: new Date(),
        },
      }
    );

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error changing password:', error);
    throw new AppError('Failed to change password', 500, 'PASSWORD_CHANGE_FAILED');
  }
});

/**
 * Delete user account
 * DELETE /api/users/profile
 * Requires: JWT authentication
 * Body: { password } - for confirmation
 *
 * This will:
 * 1. Verify password
 * 2. Delete all user's devices
 * 3. Delete all user's measurements
 * 4. Delete user account from Better-Auth
 */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const userEmail = req.user?.email;

  if (!userId || !userEmail) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  const { password } = req.body;

  // Validate input
  if (!password) {
    throw new AppError('Password is required to delete account', 400, 'INVALID_INPUT');
  }

  // Verify password and delete account
  try {
    const db = getMongoDbInstance();
    const accountCollection = db.collection('account');
    const userCollection = db.collection('user');
    const sessionCollection = db.collection('session');
    const apiKeyCollection = db.collection('apiKey');

    // Find and verify password
    const account = await accountCollection.findOne({ userId });

    if (!account || !account.password) {
      throw new AppError('Account not found', 404, 'ACCOUNT_NOT_FOUND');
    }

    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      throw new AppError('Password is incorrect', 401, 'INVALID_CREDENTIALS');
    }

    // Delete associated data
    // 1. Delete all measurements
    const deletedMeasurements = await Measurement.deleteMany({ userId });
    console.log(`Deleted ${deletedMeasurements.deletedCount} measurements for user ${userId}`);

    // 2. Delete all devices
    const userDevices = await Device.find({ userId });
    for (const device of userDevices) {
      await device.deleteOne();
    }
    console.log(`Deleted ${userDevices.length} devices for user ${userId}`);

    // 3. Delete user's sessions from Better-Auth
    await sessionCollection.deleteMany({ userId });

    // 4. Delete user's API keys from Better-Auth
    await apiKeyCollection.deleteMany({ userId });

    // 5. Delete user's account from Better-Auth
    await accountCollection.deleteMany({ userId });

    // 6. Delete user record from Better-Auth
    await userCollection.deleteOne({ id: userId });

    res.status(200).json({
      success: true,
      message: 'Account and all associated data deleted successfully',
      data: {
        deletedMeasurements: deletedMeasurements.deletedCount,
        deletedDevices: userDevices.length,
      },
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error deleting account:', error);
    throw new AppError('Failed to delete account', 500, 'DELETE_FAILED');
  }
});

/**
 * Update physician association
 * PUT /api/users/physician
 * Requires: JWT authentication
 * Body: { physicianId } - ID of physician to associate with, or null to remove
 */
export const updatePhysicianAssociation = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  const { physicianId } = req.body;

  // Validate input (physicianId can be null to remove association)
  if (physicianId !== null && physicianId !== undefined && typeof physicianId !== 'string') {
    throw new AppError('Invalid physician ID', 400, 'INVALID_INPUT');
  }

  // If physicianId provided, verify the physician exists
  if (physicianId) {
    try {
      // We would normally check if the physician exists and has the 'physician' role
      // For now, we'll just update the field
      // TODO: Add physician validation when physician model is implemented
    } catch (error) {
      throw new AppError('Physician not found', 404, 'PHYSICIAN_NOT_FOUND');
    }
  }

  // Update user's physicianId in database
  try {
    const db = getMongoDbInstance();
    const userCollection = db.collection('user');
    const { ObjectId } = await import('mongodb');

    // Try to find user by 'id' field first (Better Auth v2 format)
    let query: any = { id: userId };
    let existingUser = await userCollection.findOne(query);

    // If not found, try by _id (legacy format or ObjectId)
    if (!existingUser) {
      try {
        query = { _id: new ObjectId(userId) };
        existingUser = await userCollection.findOne(query);
      } catch (e) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }
    }

    if (!existingUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const result = await userCollection.findOneAndUpdate(
      query,
      {
        $set: {
          physicianId: physicianId || null,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    // findOneAndUpdate returns { value: document } or { value: null }
    const updateResult = result?.value || result;

    if (!updateResult) {
      throw new AppError('Failed to update physician association', 500, 'UPDATE_FAILED');
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: updateResult.id || updateResult._id?.toString(),
          email: updateResult.email,
          name: updateResult.name,
          role: updateResult.role || 'user',
          physicianId: updateResult.physicianId,
          updatedAt: updateResult.updatedAt,
        },
      },
      message: physicianId
        ? 'Physician association updated successfully'
        : 'Physician association removed successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error updating physician association:', error);
    throw new AppError('Failed to update physician association', 500, 'UPDATE_FAILED');
  }
});
