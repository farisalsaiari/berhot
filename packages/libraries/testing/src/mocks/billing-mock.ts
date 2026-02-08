export class MockBillingService {
  async checkEntitlement(tenantId: string, productId: string) { return true; }
  async getSubscription(tenantId: string) {
    return { plan: 'professional', status: 'active', products: ['restaurant-pos', 'loyalty'] };
  }
}
