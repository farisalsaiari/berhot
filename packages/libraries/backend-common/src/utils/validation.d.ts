import { z } from 'zod';
export declare const uuidSchema: z.ZodString;
export declare const emailSchema: z.ZodString;
export declare const phoneSchema: z.ZodString;
export declare const slugSchema: z.ZodString;
export declare const passwordSchema: z.ZodString;
export declare const moneySchema: z.ZodObject<{
    amount: z.ZodNumber;
    currency: z.ZodString;
}, "strip", z.ZodTypeAny, {
    amount: number;
    currency: string;
}, {
    amount: number;
    currency: string;
}>;
export declare const dateRangeSchema: z.ZodEffects<z.ZodObject<{
    startDate: z.ZodDate;
    endDate: z.ZodDate;
}, "strip", z.ZodTypeAny, {
    startDate: Date;
    endDate: Date;
}, {
    startDate: Date;
    endDate: Date;
}>, {
    startDate: Date;
    endDate: Date;
}, {
    startDate: Date;
    endDate: Date;
}>;
export declare const tenantIdSchema: z.ZodString;
export declare function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T;
//# sourceMappingURL=validation.d.ts.map