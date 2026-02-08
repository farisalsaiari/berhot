import { type Request, type Response, type NextFunction } from 'express';
import { type AuthenticatedUser } from '../types/user';
declare global {
    namespace Express {
        interface Request {
            user?: AuthenticatedUser;
            tenantId?: string;
        }
    }
}
export declare function authMiddleware(options?: {
    optional?: boolean;
}): (req: Request, _res: Response, next: NextFunction) => Promise<void>;
export declare function requirePermissions(...permissions: string[]): (req: Request, _res: Response, next: NextFunction) => void;
export declare function requireRole(...roles: string[]): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth-middleware.d.ts.map