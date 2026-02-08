import jwt from 'jsonwebtoken';

const TEST_SECRET = 'test-secret-key-for-testing';

export function createTestToken(overrides: Record<string, unknown> = {}): string {
  return jwt.sign(
    {
      sub: 'test-user-id',
      tenantId: 'test-tenant-id',
      email: 'test@berhot.dev',
      role: 'tenant_admin',
      permissions: ['*'],
      sessionId: 'test-session',
      ...overrides,
    },
    TEST_SECRET,
    { expiresIn: '1h' },
  );
}

export function createTestApiKey(): string {
  return 'bht_test_api_key_for_testing_purposes_only_12345';
}

export function authHeader(token?: string): Record<string, string> {
  return { Authorization: `Bearer ${token || createTestToken()}` };
}
