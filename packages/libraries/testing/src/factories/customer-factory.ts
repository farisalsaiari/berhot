import { v4 as uuidv4 } from 'uuid';

export function createTestCustomer(overrides: Record<string, unknown> = {}) {
  return {
    id: uuidv4(),
    tenantId: 'test-tenant-id',
    firstName: 'John',
    lastName: 'Doe',
    email: `customer-${uuidv4().slice(0, 8)}@example.com`,
    phone: '+966501234567',
    loyaltyPoints: 150,
    tier: 'silver',
    totalSpent: 500.00,
    visitCount: 12,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
