import { Badge, Card, Button } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

type KitchenStatus = 'new' | 'cooking' | 'ready';
type Priority = 'normal' | 'rush' | 'vip';

interface KitchenOrder {
  id: string;
  table: number;
  items: { name: string; qty: number; notes?: string }[];
  status: KitchenStatus;
  orderedAt: string;
  elapsed: string;
  priority: Priority;
}

const KITCHEN_ORDERS: KitchenOrder[] = [
  {
    id: '#1044', table: 6, status: 'new', orderedAt: '12:45 PM', elapsed: '15 min', priority: 'rush',
    items: [{ name: 'Kabsa', qty: 2, notes: 'Extra rice' }, { name: 'Hummus', qty: 1 }, { name: 'Grilled Chicken', qty: 3 }],
  },
  {
    id: '#1042', table: 1, status: 'new', orderedAt: '12:28 PM', elapsed: '32 min', priority: 'normal',
    items: [{ name: 'Mixed Grill', qty: 1, notes: 'Medium well' }, { name: 'Arabic Coffee', qty: 2 }],
  },
  {
    id: '#1039', table: 3, status: 'cooking', orderedAt: '11:52 AM', elapsed: '48 min', priority: 'vip',
    items: [{ name: 'Kabsa', qty: 1 }, { name: 'Kunafa', qty: 2 }, { name: 'Tea', qty: 3 }],
  },
  {
    id: '#1046', table: 8, status: 'cooking', orderedAt: '12:50 PM', elapsed: '10 min', priority: 'normal',
    items: [{ name: 'Lamb Mandi', qty: 2 }, { name: 'Fattoush', qty: 2 }, { name: 'Garlic Sauce', qty: 2 }],
  },
  {
    id: '#1045', table: 5, status: 'cooking', orderedAt: '12:48 PM', elapsed: '12 min', priority: 'normal',
    items: [{ name: 'Shawarma Plate', qty: 1 }, { name: 'Fries', qty: 1 }],
  },
  {
    id: '#1043', table: 3, status: 'ready', orderedAt: '12:32 PM', elapsed: '28 min', priority: 'normal',
    items: [{ name: 'Lamb Mandi', qty: 1 }, { name: 'Fattoush', qty: 1 }],
  },
  {
    id: '#1038', table: 7, status: 'ready', orderedAt: '11:45 AM', elapsed: '55 min', priority: 'rush',
    items: [{ name: 'Falafel Wrap', qty: 3 }, { name: 'Fresh Juice', qty: 3 }],
  },
];

const COLUMNS: { key: KitchenStatus; title: string; color: string; headerBg: string }[] = [
  { key: 'new', title: 'NEW ORDERS', color: 'text-red-600', headerBg: 'bg-red-50 border-red-200' },
  { key: 'cooking', title: 'COOKING', color: 'text-orange-600', headerBg: 'bg-orange-50 border-orange-200' },
  { key: 'ready', title: 'READY TO SERVE', color: 'text-green-600', headerBg: 'bg-green-50 border-green-200' },
];

const PRIORITY_CONFIG: Record<Priority, { variant: BadgeVariant; label: string }> = {
  normal: { variant: 'gray', label: 'Normal' },
  rush: { variant: 'red', label: 'RUSH' },
  vip: { variant: 'purple', label: 'VIP' },
};

function getElapsedColor(elapsed: string): string {
  const mins = parseInt(elapsed);
  if (mins > 40) return 'text-red-600 font-bold';
  if (mins > 25) return 'text-orange-600 font-semibold';
  return 'text-gray-600';
}

function KitchenCard({ order, colKey }: { order: KitchenOrder; colKey: KitchenStatus }) {
  const priorityCfg = PRIORITY_CONFIG[order.priority];

  return (
    <Card className="mb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black text-gray-900">T{order.table}</span>
          <span className="text-sm text-gray-400 font-mono">{order.id}</span>
        </div>
        {order.priority !== 'normal' && (
          <Badge variant={priorityCfg.variant}>{priorityCfg.label}</Badge>
        )}
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-100 text-gray-800 font-bold text-base rounded shrink-0">
              {item.qty}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-base font-semibold text-gray-900">{item.name}</div>
              {item.notes && (
                <div className="text-sm text-orange-600 italic">{item.notes}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div>
          <div className="text-xs text-gray-400">{order.orderedAt}</div>
          <div className={`text-sm ${getElapsedColor(order.elapsed)}`}>{order.elapsed}</div>
        </div>
        {colKey === 'new' && (
          <Button variant="primary" size="sm">Start Cooking</Button>
        )}
        {colKey === 'cooking' && (
          <Button variant="primary" size="sm">Mark Ready</Button>
        )}
        {colKey === 'ready' && (
          <Button variant="secondary" size="sm">Picked Up</Button>
        )}
      </div>
    </Card>
  );
}

export default function KitchenPage() {
  const newCount = KITCHEN_ORDERS.filter((o) => o.status === 'new').length;
  const cookingCount = KITCHEN_ORDERS.filter((o) => o.status === 'cooking').length;
  const readyCount = KITCHEN_ORDERS.filter((o) => o.status === 'ready').length;

  return (
    <div className="space-y-4">
      {/* Summary Bar */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-gray-700">New: {newCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full" />
          <span className="text-sm font-semibold text-gray-700">Cooking: {cookingCount}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-sm font-semibold text-gray-700">Ready: {readyCount}</span>
        </div>
        <div className="flex-1" />
        <span className="text-sm text-gray-400">Auto-refreshes every 30s</span>
      </div>

      {/* 3-Column Kitchen Display */}
      <div className="grid grid-cols-3 gap-5 items-start">
        {COLUMNS.map((col) => {
          const orders = KITCHEN_ORDERS.filter((o) => o.status === col.key);
          return (
            <div key={col.key}>
              {/* Column Header */}
              <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl border ${col.headerBg}`}>
                <span className={`text-sm font-black tracking-wider ${col.color}`}>{col.title}</span>
                <span className={`text-xl font-black ${col.color}`}>{orders.length}</span>
              </div>

              {/* Cards */}
              <div className="bg-gray-100/50 rounded-b-xl p-3 min-h-[400px]">
                {orders.length === 0 && (
                  <div className="text-center py-12 text-gray-400 text-sm">No orders</div>
                )}
                {orders.map((order) => (
                  <KitchenCard key={order.id} order={order} colKey={col.key} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
