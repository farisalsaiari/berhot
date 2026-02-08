export interface User {
    id: string;
    tenantId: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    permissions: string[];
    status: UserStatus;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum UserRole {
    SUPER_ADMIN = "super_admin",
    TENANT_OWNER = "tenant_owner",
    TENANT_ADMIN = "tenant_admin",
    MANAGER = "manager",
    STAFF = "staff",
    CASHIER = "cashier",
    VIEWER = "viewer"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    SUSPENDED = "suspended",
    PENDING_VERIFICATION = "pending_verification"
}
export interface AuthenticatedUser {
    userId: string;
    tenantId: string;
    email: string;
    role: UserRole;
    permissions: string[];
    sessionId: string;
}
export interface JwtPayload {
    sub: string;
    tenantId: string;
    email: string;
    role: UserRole;
    permissions: string[];
    sessionId: string;
    iat: number;
    exp: number;
}
//# sourceMappingURL=user.d.ts.map