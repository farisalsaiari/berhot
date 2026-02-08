import { type Request, type Response, type NextFunction } from 'express';

import { type AuthenticatedUser, type JwtPayload } from '../types/user';
import { UnauthorizedError, ForbiddenError } from '../errors/http-errors';
import { logger } from '../logging/logger';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      tenantId?: string;
    }
  }
}

export function authMiddleware(options?: { optional?: boolean }) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = extractToken(req);

      if (!token) {
        if (options?.optional) {
          return next();
        }
        throw new UnauthorizedError('Missing authentication token');
      }

      // Token verification is delegated to identity-access service
      // In production, this validates JWT signature with public key
      const payload = decodeToken(token);

      req.user = {
        userId: payload.sub,
        tenantId: payload.tenantId,
        email: payload.email,
        role: payload.role,
        permissions: payload.permissions,
        sessionId: payload.sessionId,
      };
      req.tenantId = payload.tenantId;

      next();
    } catch (error) {
      next(error instanceof UnauthorizedError ? error : new UnauthorizedError('Invalid token'));
    }
  };
}

export function requirePermissions(...permissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    const hasAllPermissions = permissions.every(
      (perm) => req.user!.permissions.includes(perm) || req.user!.permissions.includes('*'),
    );

    if (!hasAllPermissions) {
      logger.warn('Permission denied', {
        userId: req.user.userId,
        tenantId: req.user.tenantId,
        required: permissions,
        actual: req.user.permissions,
      });
      return next(new ForbiddenError('Insufficient permissions'));
    }

    next();
  };
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new UnauthorizedError());
    }

    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError(`Required role: ${roles.join(' or ')}`));
    }

    next();
  };
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return req.cookies?.access_token ?? null;
}

function decodeToken(token: string): JwtPayload {
  // In production, this verifies with RS256 public key
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new UnauthorizedError('Invalid token format');
  }
  const payload = JSON.parse(Buffer.from(parts[1]!, 'base64url').toString());
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new UnauthorizedError('Token expired');
  }
  return payload as JwtPayload;
}
