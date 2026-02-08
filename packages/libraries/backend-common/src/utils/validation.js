"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tenantIdSchema = exports.dateRangeSchema = exports.moneySchema = exports.passwordSchema = exports.slugSchema = exports.phoneSchema = exports.emailSchema = exports.uuidSchema = void 0;
exports.validateOrThrow = validateOrThrow;
const zod_1 = require("zod");
exports.uuidSchema = zod_1.z.string().uuid('Invalid UUID format');
exports.emailSchema = zod_1.z.string().email('Invalid email format').toLowerCase().trim();
exports.phoneSchema = zod_1.z.string().regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +1234567890)');
exports.slugSchema = zod_1.z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');
exports.passwordSchema = zod_1.z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');
exports.moneySchema = zod_1.z.object({
    amount: zod_1.z.number().min(0, 'Amount must be non-negative'),
    currency: zod_1.z.string().length(3, 'Currency must be 3-letter ISO code'),
});
exports.dateRangeSchema = zod_1.z.object({
    startDate: zod_1.z.coerce.date(),
    endDate: zod_1.z.coerce.date(),
}).refine((data) => data.endDate > data.startDate, { message: 'End date must be after start date' });
exports.tenantIdSchema = zod_1.z.string().min(1, 'Tenant ID is required');
function validateOrThrow(schema, data) {
    const result = schema.safeParse(data);
    if (!result.success) {
        const errors = result.error.flatten();
        throw new Error(JSON.stringify(errors));
    }
    return result.data;
}
//# sourceMappingURL=validation.js.map