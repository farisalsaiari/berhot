export const testOrderFixture = {
  id: 'order-001',
  tenantId: 'test-tenant-001',
  orderNumber: 'ORD-20240101-001',
  status: 'completed' as const,
  type: 'dine_in' as const,
  subtotal: 60.00,
  tax: 9.00,
  total: 69.00,
  currency: 'SAR',
};
