import { type TaxCalculation, type TaxRate } from '../core/types';
import { calculateTax } from '../core/tax-calculator';
import { DefaultTaxRules } from '../core/tax-rules';

export function calculateVAT(subtotal: number, country: string, priceIncludesTax = false): TaxCalculation {
  const rates = DefaultTaxRules[country] || [];
  return calculateTax(subtotal, rates, priceIncludesTax);
}
