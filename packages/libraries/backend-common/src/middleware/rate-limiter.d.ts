import { type Request, type Response, type NextFunction } from 'express';
export interface RateLimitOptions {
    windowMs: number;
    max: number;
    keyGenerator?: (req: Request) => string;
    message?: string;
}
export declare function rateLimiter(options: RateLimitOptions): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=rate-limiter.d.ts.map