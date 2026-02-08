"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiter = rateLimiter;
const http_errors_1 = require("../errors/http-errors");
const store = {};
function rateLimiter(options) {
    const { windowMs = 60_000, max = 100, keyGenerator = defaultKeyGenerator, } = options;
    // Clean expired entries periodically
    setInterval(() => {
        const now = Date.now();
        for (const key of Object.keys(store)) {
            if (store[key].resetAt <= now) {
                delete store[key];
            }
        }
    }, windowMs);
    return (req, res, next) => {
        const key = keyGenerator(req);
        const now = Date.now();
        if (!store[key] || store[key].resetAt <= now) {
            store[key] = { count: 0, resetAt: now + windowMs };
        }
        const entry = store[key];
        entry.count++;
        const remaining = Math.max(0, max - entry.count);
        const resetAt = entry.resetAt;
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', Math.ceil(resetAt / 1000));
        if (entry.count > max) {
            const retryAfter = Math.ceil((resetAt - now) / 1000);
            res.setHeader('Retry-After', retryAfter);
            return next(new http_errors_1.TooManyRequestsError(retryAfter));
        }
        next();
    };
}
function defaultKeyGenerator(req) {
    const tenantId = req.tenantId || 'anonymous';
    const userId = req.user?.userId || req.ip;
    return `${tenantId}:${userId}`;
}
//# sourceMappingURL=rate-limiter.js.map