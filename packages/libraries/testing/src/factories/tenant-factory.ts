import { v4 as uuidv4 } from 'uuid';

export function createTestTenant(overrides: Record<string, unknown> = {}) {
  return {
    id: uuidv4(),
    name: 'Test Restaurant',
    slug: 'test-restaurant',
    status: 'active',
    plan: 'professional',
    settings: {
      timezone: 'Asia/Riyadh',
      currency: 'SAR',
      locale: 'ar-SA',
      dateFormat: 'DD/MM/YYYY',
      taxEnabled: true,
      multiLocationEnabled: false,
    },
    products: [
      { productId: 'restaurant-pos', productName: 'Restaurant POS', enabled: true, activatedAt: new Date() },
      { productId: 'loyalty', productName: 'Loyalty Program', enabled: true, activatedAt: new Date() },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
