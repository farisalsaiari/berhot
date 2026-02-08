import { v4 as uuidv4 } from 'uuid';

export function createTestOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: uuidv4(),
    tenantId: 'test-tenant-id',
    orderNumber: `ORD-${Date.now()}`,
    status: 'pending',
    type: 'dine_in',
    items: [
      {
        id: uuidv4(),
        name: 'Test Item',
        quantity: 2,
        unitPrice: 25.00,
        totalPrice: 50.00,
        currency: 'SAR',
      },
    ],
    subtotal: 50.00,
    tax: 7.50,
    total: 57.50,
    currency: 'SAR',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
