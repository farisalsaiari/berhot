import { type Request, type Response, type NextFunction } from 'express';
export interface TenantContextOptions {
    headerName?: string;
    required?: boolean;
}
export declare function tenantContextMiddleware(options?: TenantContextOptions): (req: Request, _res: Response, next: NextFunction) => void;
/**
 * Ensures the authenticated user belongs to the requested tenant.
 * Prevents cross-tenant data access.
 */
export declare function tenantIsolationMiddleware(): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=tenant-context.d.ts.map