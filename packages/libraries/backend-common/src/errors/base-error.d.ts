export declare abstract class BaseError extends Error {
    readonly code: string;
    readonly statusCode: number;
    readonly isOperational: boolean;
    readonly details?: Record<string, unknown>;
    constructor(message: string, code: string, statusCode: number, isOperational?: boolean, details?: Record<string, unknown>);
    toJSON(): {
        code: string;
        message: string;
        statusCode: number;
        details: Record<string, unknown> | undefined;
    };
}
//# sourceMappingURL=base-error.d.ts.map