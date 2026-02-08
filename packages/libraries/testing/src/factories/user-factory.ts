import { v4 as uuidv4 } from 'uuid';

export function createTestUser(overrides: Record<string, unknown> = {}) {
  return {
    id: uuidv4(),
    tenantId: 'test-tenant-id',
    email: `user-${uuidv4().slice(0, 8)}@berhot.dev`,
    firstName: 'Test',
    lastName: 'User',
    role: 'staff',
    permissions: ['pos:view', 'pos:create_order'],
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
