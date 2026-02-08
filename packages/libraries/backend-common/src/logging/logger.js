"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.createServiceLogger = createServiceLogger;
exports.createTenantLogger = createTenantLogger;
const winston_1 = __importDefault(require("winston"));
const formats_1 = require("./formats");
const isProduction = process.env.NODE_ENV === 'production';
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    defaultMeta: {
        service: process.env.SERVICE_NAME || 'unknown',
    },
    transports: [
        new winston_1.default.transports.Console({
            format: isProduction ? formats_1.jsonFormat : formats_1.consoleFormat,
        }),
    ],
});
function createServiceLogger(serviceName, meta) {
    return exports.logger.child({ service: serviceName, ...meta });
}
function createTenantLogger(serviceName, tenantId) {
    return exports.logger.child({ service: serviceName, tenantId });
}
//# sourceMappingURL=logger.js.map