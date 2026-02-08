export class MockAuthService {
  private users = new Map<string, any>();

  addUser(id: string, data: any) { this.users.set(id, data); }
  async authenticate(token: string) {
    return { userId: 'mock-user', tenantId: 'mock-tenant', role: 'tenant_admin', permissions: ['*'] };
  }
  async authorize(userId: string, permission: string) { return true; }
}
