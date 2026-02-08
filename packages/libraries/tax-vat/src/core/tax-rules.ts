import { type TaxRate } from './types';

export const DefaultTaxRules: Record<string, TaxRate[]> = {
  SA: [{ country: 'SA', rate: 15, name: 'VAT', isDefault: true }],
  AE: [{ country: 'AE', rate: 5, name: 'VAT', isDefault: true }],
  BH: [{ country: 'BH', rate: 10, name: 'VAT', isDefault: true }],
  EG: [{ country: 'EG', rate: 14, name: 'VAT', isDefault: true }],
  GB: [{ country: 'GB', rate: 20, name: 'VAT', isDefault: true }],
  US: [], // Sales tax varies by state
};
