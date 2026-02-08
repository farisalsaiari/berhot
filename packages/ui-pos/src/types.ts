export interface CartItemData {
  id: string;
  name: string;
  price: number;
  quantity: number;
  modifiers?: string[];
  notes?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile' | 'split';

export interface ReceiptData {
  orderId: string;
  items: CartItemData[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  timestamp: string;
  cashier?: string;
  location?: string;
}

export interface ProductData {
  id: string;
  name: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  available: boolean;
  modifierGroups?: ModifierGroup[];
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  maxSelections: number;
  options: ModifierOption[];
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
  default?: boolean;
}
