import { CartItemData } from '../types';

interface CartItemProps {
  item: CartItemData;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 group">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{item.name}</div>
        {item.modifiers && item.modifiers.length > 0 && (
          <div className="text-xs text-gray-400 mt-0.5">{item.modifiers.join(', ')}</div>
        )}
        {item.notes && <div className="text-xs text-blue-500 mt-0.5">{item.notes}</div>}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => item.quantity > 1 ? onUpdateQuantity(item.quantity - 1) : onRemove()}
          className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-200"
        >
          −
        </button>
        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.quantity + 1)}
          className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 text-xs flex items-center justify-center hover:bg-gray-200"
        >
          +
        </button>
      </div>

      <div className="text-sm font-semibold w-16 text-right">
        ${(item.price * item.quantity).toFixed(2)}
      </div>
    </div>
  );
}
