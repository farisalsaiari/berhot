import { CartItemData, PaymentMethod } from '../types';
import { PaymentMethodSelector } from './PaymentMethodSelector';

interface CheckoutPanelProps {
  items: CartItemData[];
  total: number;
  selectedMethod: PaymentMethod;
  onMethodChange: (method: PaymentMethod) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function CheckoutPanel({ items, total, selectedMethod, onMethodChange, onConfirm, onCancel }: CheckoutPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Checkout</h2>

      <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.quantity}x {item.name}</span>
            <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-between text-lg font-bold mb-6">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>

      <PaymentMethodSelector selected={selectedMethod} onChange={onMethodChange} />

      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
        >
          Confirm Payment
        </button>
      </div>
    </div>
  );
}
