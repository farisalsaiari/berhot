"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenantPlan = exports.TenantStatus = void 0;
var TenantStatus;
(function (TenantStatus) {
    TenantStatus["ACTIVE"] = "active";
    TenantStatus["SUSPENDED"] = "suspended";
    TenantStatus["PENDING"] = "pending";
    TenantStatus["TRIAL"] = "trial";
    TenantStatus["CANCELLED"] = "cancelled";
})(TenantStatus || (exports.TenantStatus = TenantStatus = {}));
var TenantPlan;
(function (TenantPlan) {
    TenantPlan["FREE"] = "free";
    TenantPlan["STARTER"] = "starter";
    TenantPlan["PROFESSIONAL"] = "professional";
    TenantPlan["ENTERPRISE"] = "enterprise";
})(TenantPlan || (exports.TenantPlan = TenantPlan = {}));
//# sourceMappingURL=tenant.js.map