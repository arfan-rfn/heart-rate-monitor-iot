import { Request, Response, NextFunction } from 'express';
import { auth, User } from '../config/auth.js';

/**
 * Extend Express Request to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: User;
      session?: any;
    }
  }
}

/**
 * Authentication middleware using better-auth
 * Verifies JWT token or session cookie
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get session from better-auth
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (!session || !session.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    // Attach user and session to request
    req.user = session.user;
    req.session = session.session;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid or expired token',
        code: 'AUTHENTICATION_FAILED',
      },
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user to request if authenticated, but doesn't require authentication
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as any,
    });

    if (session && session.user) {
      req.user = session.user;
      req.session = session.session;
    }

    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};
