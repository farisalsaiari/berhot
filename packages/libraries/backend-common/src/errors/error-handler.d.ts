import { type Request, type Response, type NextFunction } from 'express';
export declare function globalErrorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void;
export declare function asyncHandler(fn: Function): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=error-handler.d.ts.map