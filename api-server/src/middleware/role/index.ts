import { Request, Response, NextFunction } from 'express';

/**
 * Role-based access control middleware
 * Checks if user has required role(s)
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'UNAUTHORIZED',
        },
      });
    }

    const userRole = req.user.role || 'user';

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        error: {
          message: `Access denied. Required role: ${roles.join(' or ')}`,
          code: 'FORBIDDEN',
        },
      });
    }

    next();
  };
};

/**
 * Physician-only access middleware
 */
export const requirePhysician = requireRole('physician');

/**
 * Admin-only access middleware (if needed in future)
 */
export const requireAdmin = requireRole('admin');

/**
 * User or Physician access middleware
 */
export const requireUserOrPhysician = requireRole('user', 'physician');
