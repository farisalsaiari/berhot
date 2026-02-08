export const Permissions = {
  // POS
  POS_VIEW: 'pos:view',
  POS_CREATE_ORDER: 'pos:create_order',
  POS_VOID_ORDER: 'pos:void_order',
  POS_REFUND: 'pos:refund',
  POS_MANAGE_DRAWER: 'pos:manage_drawer',
  POS_VIEW_REPORTS: 'pos:view_reports',
  POS_MANAGE_MENU: 'pos:manage_menu',

  // Inventory
  INVENTORY_VIEW: 'inventory:view',
  INVENTORY_MANAGE: 'inventory:manage',

  // Customers
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_MANAGE: 'customers:manage',

  // Staff
  STAFF_VIEW: 'staff:view',
  STAFF_MANAGE: 'staff:manage',
  STAFF_MANAGE_ROLES: 'staff:manage_roles',

  // Loyalty
  LOYALTY_VIEW: 'loyalty:view',
  LOYALTY_MANAGE: 'loyalty:manage',
  LOYALTY_REDEEM: 'loyalty:redeem',

  // Reports
  REPORTS_VIEW: 'reports:view',
  REPORTS_EXPORT: 'reports:export',

  // Settings
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_MANAGE: 'settings:manage',

  // Billing
  BILLING_VIEW: 'billing:view',
  BILLING_MANAGE: 'billing:manage',

  // Admin
  ADMIN_ALL: '*',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export const RolePermissions: Record<string, Permission[]> = {
  tenant_owner: [Permissions.ADMIN_ALL],
  tenant_admin: [Permissions.ADMIN_ALL],
  manager: [
    Permissions.POS_VIEW, Permissions.POS_CREATE_ORDER, Permissions.POS_VOID_ORDER,
    Permissions.POS_REFUND, Permissions.POS_MANAGE_DRAWER, Permissions.POS_VIEW_REPORTS,
    Permissions.POS_MANAGE_MENU, Permissions.INVENTORY_VIEW, Permissions.INVENTORY_MANAGE,
    Permissions.CUSTOMERS_VIEW, Permissions.CUSTOMERS_MANAGE, Permissions.STAFF_VIEW,
    Permissions.STAFF_MANAGE, Permissions.LOYALTY_VIEW, Permissions.LOYALTY_MANAGE,
    Permissions.REPORTS_VIEW, Permissions.REPORTS_EXPORT, Permissions.SETTINGS_VIEW,
  ],
  staff: [
    Permissions.POS_VIEW, Permissions.POS_CREATE_ORDER, Permissions.POS_MANAGE_DRAWER,
    Permissions.INVENTORY_VIEW, Permissions.CUSTOMERS_VIEW, Permissions.LOYALTY_REDEEM,
  ],
  cashier: [
    Permissions.POS_VIEW, Permissions.POS_CREATE_ORDER, Permissions.POS_MANAGE_DRAWER,
    Permissions.CUSTOMERS_VIEW, Permissions.LOYALTY_REDEEM,
  ],
  viewer: [
    Permissions.POS_VIEW, Permissions.CUSTOMERS_VIEW, Permissions.REPORTS_VIEW,
    Permissions.INVENTORY_VIEW, Permissions.LOYALTY_VIEW,
  ],
};

export function hasPermission(userPermissions: string[], required: string): boolean {
  return userPermissions.includes('*') || userPermissions.includes(required);
}

export function hasAnyPermission(userPermissions: string[], required: string[]): boolean {
  return required.some((p) => hasPermission(userPermissions, p));
}

export function hasAllPermissions(userPermissions: string[], required: string[]): boolean {
  return required.every((p) => hasPermission(userPermissions, p));
}
