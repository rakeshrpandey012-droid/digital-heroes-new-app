import { Request, Response, NextFunction } from 'express';
import { store } from '../store.ts';
import { IUser, UserRole } from '../models/types.ts';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

/**
 * Protects routes requiring valid JWT token
 */
export const requireAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No authentication token provided.' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = store.verifyToken(token);

  if (!decoded || !decoded.id) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }

  const user = store.getUserById(decoded.id);
  if (!user) {
    return res.status(401).json({ success: false, message: 'User associated with token no longer exists.' });
  }

  req.user = user;
  next();
};

/**
 * Ensures user is an active subscriber (or admin who has elevated privileges)
 */
export const requireActiveSubscription = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  if (req.user.role === 'admin') {
    return next();
  }

  if (req.user.subscription.status !== 'active') {
    return res.status(403).json({
      success: false,
      message: 'Active subscription required to access this feature.',
      subscriptionStatus: req.user.subscription.status
    });
  }

  next();
};

/**
 * Role-Based Access Control (RBAC) middleware
 * Allowed roles: 'public', 'subscriber', 'admin'
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden. Requires one of the following roles: ${allowedRoles.join(', ')}.` 
      });
    }

    next();
  };
};

/**
 * Admin Only Guard
 */
export const requireAdmin = [requireAuth, requireRole(['admin'])];
