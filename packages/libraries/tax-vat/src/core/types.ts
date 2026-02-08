export interface TaxRate {
  country: string;
  rate: number;
  name: string;
  isDefault: boolean;
  category?: string;
}

export interface TaxCalculation {
  subtotal: number;
  taxAmount: number;
  total: number;
  breakdown: TaxBreakdownItem[];
}

export interface TaxBreakdownItem {
  name: string;
  rate: number;
  taxableAmount: number;
  taxAmount: number;
}

export type TaxType = 'vat' | 'sales_tax' | 'gst' | 'none';
