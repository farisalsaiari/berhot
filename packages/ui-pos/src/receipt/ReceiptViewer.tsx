import { ReceiptData } from '../types';

interface ReceiptViewerProps {
  receipt: ReceiptData;
  onPrint?: () => void;
  onEmail?: () => void;
}

export function ReceiptViewer({ receipt, onPrint, onEmail }: ReceiptViewerProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 max-w-sm mx-auto font-mono text-sm">
      <div className="text-center mb-4">
        <div className="font-bold text-lg">berhot</div>
        {receipt.location && <div className="text-gray-400 text-xs">{receipt.location}</div>}
        <div className="text-gray-400 text-xs mt-1">{receipt.timestamp}</div>
      </div>

      <div className="border-t border-dashed border-gray-300 my-3" />

      <div className="text-xs text-gray-400 mb-2">Order #{receipt.orderId}</div>

      <div className="space-y-1.5">
        {receipt.items.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.quantity}x {item.name}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-dashed border-gray-300 my-3" />

      <div className="space-y-1">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>${receipt.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Tax</span>
          <span>${receipt.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-base mt-1">
          <span>Total</span>
          <span>${receipt.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="border-t border-dashed border-gray-300 my-3" />

      <div className="text-center text-xs text-gray-400">
        <div>Paid via {receipt.paymentMethod}</div>
        {receipt.cashier && <div>Cashier: {receipt.cashier}</div>}
        <div className="mt-2">Thank you for your visit!</div>
      </div>

      {(onPrint || onEmail) && (
        <div className="flex gap-2 mt-4 font-sans">
          {onPrint && (
            <button onClick={onPrint} className="flex-1 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
              Print
            </button>
          )}
          {onEmail && (
            <button onClick={onEmail} className="flex-1 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50">
              Email
            </button>
          )}
        </div>
      )}
    </div>
  );
}
