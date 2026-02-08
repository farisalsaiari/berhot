export interface Tenant {
    id: string;
    name: string;
    slug: string;
    domain?: string;
    status: TenantStatus;
    plan: TenantPlan;
    settings: TenantSettings;
    products: TenantProduct[];
    createdAt: Date;
    updatedAt: Date;
}
export declare enum TenantStatus {
    ACTIVE = "active",
    SUSPENDED = "suspended",
    PENDING = "pending",
    TRIAL = "trial",
    CANCELLED = "cancelled"
}
export declare enum TenantPlan {
    FREE = "free",
    STARTER = "starter",
    PROFESSIONAL = "professional",
    ENTERPRISE = "enterprise"
}
export interface TenantSettings {
    timezone: string;
    currency: string;
    locale: string;
    dateFormat: string;
    taxEnabled: boolean;
    multiLocationEnabled: boolean;
}
export interface TenantProduct {
    productId: string;
    productName: string;
    enabled: boolean;
    activatedAt: Date;
    expiresAt?: Date;
}
export interface TenantContext {
    tenantId: string;
    tenant?: Tenant;
}
//# sourceMappingURL=tenant.d.ts.map