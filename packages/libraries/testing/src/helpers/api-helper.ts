import supertest from 'supertest';

export function createTestAgent(app: any) {
  return supertest(app);
}

export function withTenant(agent: supertest.SuperTest<supertest.Test>, tenantId: string) {
  return {
    get: (url: string) => agent.get(url).set('x-tenant-id', tenantId),
    post: (url: string) => agent.post(url).set('x-tenant-id', tenantId),
    put: (url: string) => agent.put(url).set('x-tenant-id', tenantId),
    patch: (url: string) => agent.patch(url).set('x-tenant-id', tenantId),
    delete: (url: string) => agent.delete(url).set('x-tenant-id', tenantId),
  };
}
