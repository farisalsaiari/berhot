import { type TaxCalculation } from '../core/types';
import { calculateTax } from '../core/tax-calculator';

export function calculateSalesTax(subtotal: number, stateCode: string, cityRate = 0): TaxCalculation {
  const stateRates: Record<string, number> = {
    CA: 7.25, NY: 4.0, TX: 6.25, FL: 6.0, WA: 6.5,
  };
  const stateRate = stateRates[stateCode] || 0;
  const rates = [
    { country: 'US', rate: stateRate + cityRate, name: `Sales Tax (${stateCode})`, isDefault: true },
  ];
  return calculateTax(subtotal, rates, false);
}
