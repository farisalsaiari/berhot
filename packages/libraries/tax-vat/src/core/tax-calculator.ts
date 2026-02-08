import { type TaxCalculation, type TaxRate } from './types';

export function calculateTax(
  subtotal: number,
  rates: TaxRate[],
  priceIncludesTax = false,
): TaxCalculation {
  const breakdown = rates.map((rate) => {
    let taxAmount: number;
    let taxableAmount: number;

    if (priceIncludesTax) {
      taxableAmount = subtotal / (1 + rate.rate / 100);
      taxAmount = subtotal - taxableAmount;
    } else {
      taxableAmount = subtotal;
      taxAmount = subtotal * (rate.rate / 100);
    }

    return {
      name: rate.name,
      rate: rate.rate,
      taxableAmount: round(taxableAmount),
      taxAmount: round(taxAmount),
    };
  });

  const totalTax = breakdown.reduce((sum, item) => sum + item.taxAmount, 0);

  return {
    subtotal: priceIncludesTax ? round(subtotal - totalTax) : round(subtotal),
    taxAmount: round(totalTax),
    total: priceIncludesTax ? round(subtotal) : round(subtotal + totalTax),
    breakdown,
  };
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
