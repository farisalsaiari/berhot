import { CartItemData } from '../types';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';

interface CartWidgetProps {
  items: CartItemData[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onCheckout: () => void;
  taxRate?: number;
}

export function CartWidget({ items, onUpdateQuantity, onRemove, onCheckout, taxRate = 0.15 }: CartWidgetProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return (
    <div className="bg-white border border-gray-200 rounded-xl flex flex-col h-full">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-sm">Current Order</h3>
        <span className="text-xs text-gray-400">{items.length} items</span>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">No items yet</div>
        ) : (
          items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={(qty) => onUpdateQuantity(item.id, qty)}
              onRemove={() => onRemove(item.id)}
            />
          ))
        )}
      </div>

      <CartSummary subtotal={subtotal} tax={tax} total={total} onCheckout={onCheckout} disabled={items.length === 0} />
    </div>
  );
}
