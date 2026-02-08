import { PaymentMethod } from '../types';

interface PaymentMethodSelectorProps {
  selected: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

const METHODS: { key: PaymentMethod; label: string; icon: string }[] = [
  { key: 'cash', label: 'Cash', icon: '💵' },
  { key: 'card', label: 'Card', icon: '💳' },
  { key: 'mobile', label: 'Mobile Pay', icon: '📱' },
  { key: 'split', label: 'Split', icon: '✂️' },
];

export function PaymentMethodSelector({ selected, onChange }: PaymentMethodSelectorProps) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 mb-2 block">Payment Method</label>
      <div className="grid grid-cols-4 gap-2">
        {METHODS.map((m) => (
          <button
            key={m.key}
            onClick={() => onChange(m.key)}
            className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${
              selected === m.key
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-xl">{m.icon}</span>
            <span className="text-xs font-medium">{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
