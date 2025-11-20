import { Request, Response } from 'express';
import { asyncHandler, AppError } from '../../middleware/error/index.js';
import { auth } from '../../config/auth.js';
import { getMongoDbInstance } from '../../config/database.js';

/**
 * Account API Key Management
 *
 * These endpoints manage account-level API keys that can be used across
 * all of a user's IoT devices (vs device-specific keys).
 */

const ACCOUNT_KEY_NAME = 'Account API Key';
const KEY_EXPIRY = 60 * 60 * 24 * 365; // 1 year

/**
 * Helper function to get user's API keys from MongoDB
 * Better-auth's listApiKeys doesn't work reliably, so we query MongoDB directly
 */
async function getUserApiKeys(userId: string): Promise<any[]> {
  const db = getMongoDbInstance();
  const apiKeyCollection = db.collection('apiKey');
  const keys = await apiKeyCollection.find({ userId }).toArray();
  return keys;
}

/**
 * Generate account-level API key
 * POST /api/users/api-key
 * Requires: JWT authentication
 *
 * Returns the API key ONCE - must be stored securely by the user
 */
export const generateAccountApiKey = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  try {
    // Check if user already has an account API key
    const existingKeys = await getUserApiKeys(userId);
    const accountKey = existingKeys.find(
      (k: any) => k.name === ACCOUNT_KEY_NAME
    );

    if (accountKey) {
      throw new AppError(
        'Account API key already exists. Use regenerate endpoint to create a new one.',
        400,
        'API_KEY_EXISTS'
      );
    }

    // Generate new account-level API key using better-auth
    const apiKeyResponse = await auth.api.createApiKey({
      body: {
        name: ACCOUNT_KEY_NAME,
        userId: userId,
        expiresIn: KEY_EXPIRY,
      },
    });

    const apiKeyData = apiKeyResponse as any;
    const apiKey = apiKeyData?.key;

    if (!apiKey) {
      console.error('No API key in response:', apiKeyResponse);
      throw new AppError('Failed to generate API key', 500, 'API_KEY_GENERATION_FAILED');
    }

    // Manually insert the API key into MongoDB
    // Better-auth's createApiKey API doesn't persist to DB automatically
    const db = getMongoDbInstance();
    const apiKeyCollection = db.collection('apiKey');

    const expiresAt = new Date(Date.now() + KEY_EXPIRY * 1000);
    const createdAt = new Date();

    await apiKeyCollection.insertOne({
      id: apiKeyData.id,
      key: apiKey,
      name: ACCOUNT_KEY_NAME,
      userId: userId,
      createdAt: createdAt,
      expiresAt: expiresAt,
    });

    console.log('✓ API key saved to MongoDB:', {
      id: apiKeyData.id,
      userId,
      name: ACCOUNT_KEY_NAME,
    });

    res.status(201).json({
      success: true,
      data: {
        apiKey: apiKey,
        name: ACCOUNT_KEY_NAME,
        expiresIn: KEY_EXPIRY,
        expiresAt: expiresAt.toISOString(),
      },
      message: 'Account API key generated successfully. Store it securely - it will only be shown once.',
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error generating account API key:', error);
    throw new AppError('Failed to generate account API key', 500, 'API_KEY_GENERATION_FAILED');
  }
});

/**
 * View existing account API key (masked)
 * GET /api/users/api-key
 * Requires: JWT authentication
 *
 * Returns masked API key info (last 8 characters visible)
 */
export const viewAccountApiKey = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  try {
    // Get all user's API keys from MongoDB directly
    const existingKeys = await getUserApiKeys(userId);

    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('📋 API Keys found for user:', userId);
      console.log('   Total keys:', existingKeys.length);
      existingKeys.forEach((key: any, index: number) => {
        console.log(`   Key ${index + 1}:`, {
          id: key.id,
          name: key.name,
          createdAt: key.createdAt,
          expiresAt: key.expiresAt
        });
      });
    }

    // Find account-level key
    const accountKey = existingKeys.find(
      (k: any) => k.name === ACCOUNT_KEY_NAME
    );

    if (!accountKey) {
      if (process.env.NODE_ENV === 'development') {
        console.log('❌ Account API key not found among', existingKeys.length, 'keys');
        console.log('   Looking for name:', ACCOUNT_KEY_NAME);
      }

      return res.status(404).json({
        success: false,
        error: {
          message: 'No account API key found',
          code: 'API_KEY_NOT_FOUND',
        },
      });
    }

    // Return masked key info (never return full key)
    res.status(200).json({
      success: true,
      data: {
        id: accountKey.id,
        name: accountKey.name,
        keyPreview: accountKey.key ? `***${accountKey.key.slice(-8)}` : '***',
        createdAt: accountKey.createdAt,
        expiresAt: accountKey.expiresAt,
        isExpired: new Date(accountKey.expiresAt) < new Date(),
      },
    });
  } catch (error) {
    console.error('Error viewing account API key:', error);
    throw new AppError('Failed to retrieve account API key', 500, 'API_KEY_RETRIEVAL_FAILED');
  }
});

/**
 * Regenerate account API key
 * POST /api/users/api-key/regenerate
 * Requires: JWT authentication
 *
 * Revokes old key and generates new one
 */
export const regenerateAccountApiKey = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  try {
    const db = getMongoDbInstance();
    const apiKeyCollection = db.collection('apiKey');

    // Get existing account key from MongoDB
    const existingKeys = await getUserApiKeys(userId);
    const accountKey = existingKeys.find(
      (k: any) => k.name === ACCOUNT_KEY_NAME
    );

    // Delete old key from MongoDB if it exists
    if (accountKey) {
      await apiKeyCollection.deleteOne({ id: accountKey.id });

      // Also revoke via better-auth API (if it supports it)
      try {
        await auth.api.revokeApiKey({
          body: {
            keyId: accountKey.id,
          },
        });
      } catch (revokeError) {
        // Ignore revoke errors since we already deleted from DB
        console.log('Better-auth revoke not needed (key deleted from DB)');
      }
    }

    // Generate new key
    const apiKeyResponse = await auth.api.createApiKey({
      body: {
        name: ACCOUNT_KEY_NAME,
        userId: userId,
        expiresIn: KEY_EXPIRY,
      },
    });

    const apiKeyData = apiKeyResponse as any;
    const apiKey = apiKeyData?.key;

    if (!apiKey) {
      throw new AppError('Failed to generate new API key', 500, 'API_KEY_GENERATION_FAILED');
    }

    // Save new key to MongoDB
    const expiresAt = new Date(Date.now() + KEY_EXPIRY * 1000);
    const createdAt = new Date();

    await apiKeyCollection.insertOne({
      id: apiKeyData.id,
      key: apiKey,
      name: ACCOUNT_KEY_NAME,
      userId: userId,
      createdAt: createdAt,
      expiresAt: expiresAt,
    });

    console.log('✓ API key regenerated and saved to MongoDB:', {
      id: apiKeyData.id,
      userId,
      name: ACCOUNT_KEY_NAME,
    });

    res.status(200).json({
      success: true,
      data: {
        apiKey: apiKey,
        name: ACCOUNT_KEY_NAME,
        expiresIn: KEY_EXPIRY,
        expiresAt: expiresAt.toISOString(),
      },
      message: accountKey
        ? 'Account API key regenerated successfully. Old key has been revoked.'
        : 'Account API key generated successfully. Store it securely - it will only be shown once.',
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error regenerating account API key:', error);
    throw new AppError('Failed to regenerate account API key', 500, 'API_KEY_REGENERATION_FAILED');
  }
});

/**
 * Revoke account API key
 * DELETE /api/users/api-key
 * Requires: JWT authentication
 *
 * Permanently revokes the account-level API key
 */
export const revokeAccountApiKey = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError('User not authenticated', 401, 'UNAUTHORIZED');
  }

  try {
    const db = getMongoDbInstance();
    const apiKeyCollection = db.collection('apiKey');

    // Get existing account key from MongoDB
    const existingKeys = await getUserApiKeys(userId);
    const accountKey = existingKeys.find(
      (k: any) => k.name === ACCOUNT_KEY_NAME
    );

    if (!accountKey) {
      throw new AppError('No account API key found to revoke', 404, 'API_KEY_NOT_FOUND');
    }

    // Delete from MongoDB
    await apiKeyCollection.deleteOne({ id: accountKey.id });

    // Also revoke via better-auth API (if it supports it)
    try {
      await auth.api.revokeApiKey({
        body: {
          keyId: accountKey.id,
        },
      });
    } catch (revokeError) {
      // Ignore revoke errors since we already deleted from DB
      console.log('Better-auth revoke not needed (key deleted from DB)');
    }

    console.log('✓ API key revoked and deleted from MongoDB:', {
      id: accountKey.id,
      userId,
    });

    res.status(200).json({
      success: true,
      message: 'Account API key revoked successfully',
    });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error('Error revoking account API key:', error);
    throw new AppError('Failed to revoke account API key', 500, 'API_KEY_REVOCATION_FAILED');
  }
});
