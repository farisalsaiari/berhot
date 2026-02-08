import { useState, useEffect } from 'react';
import { Card, Badge, Button, StatCard } from '@berhot/ui';

type Complexity = 'simple' | 'medium' | 'complex';

interface BaristaOrder {
  id: number;
  customer: string;
  drink: string;
  size: string;
  milk: string;
  extras: string[];
  complexity: Complexity;
  status: 'incoming' | 'making' | 'done';
  elapsed: number; // seconds
}

const COMPLEXITY_COLORS: Record<Complexity, { bg: string; text: string; badge: 'green' | 'orange' | 'red' }> = {
  simple: { bg: 'border-l-green-500', text: 'text-green-700', badge: 'green' },
  medium: { bg: 'border-l-orange-500', text: 'text-orange-700', badge: 'orange' },
  complex: { bg: 'border-l-red-500', text: 'text-red-700', badge: 'red' },
};

const INITIAL_ORDERS: BaristaOrder[] = [
  { id: 101, customer: 'Ahmad M.', drink: 'Cappuccino', size: 'M', milk: 'Regular', extras: [], complexity: 'simple', status: 'making', elapsed: 45 },
  { id: 102, customer: 'Sara K.', drink: 'Iced Latte', size: 'L', milk: 'Oat', extras: ['Vanilla Syrup'], complexity: 'medium', status: 'incoming', elapsed: 0 },
  { id: 103, customer: 'Omar J.', drink: 'Espresso', size: 'S', milk: 'Regular', extras: [], complexity: 'simple', status: 'incoming', elapsed: 0 },
  { id: 104, customer: 'Lina A.', drink: 'Matcha Latte', size: 'L', milk: 'Almond', extras: ['Extra Shot', 'Vanilla Syrup'], complexity: 'complex', status: 'incoming', elapsed: 0 },
  { id: 105, customer: 'Khaled R.', drink: 'Americano', size: 'M', milk: 'Regular', extras: [], complexity: 'simple', status: 'incoming', elapsed: 0 },
  { id: 106, customer: 'Nora S.', drink: 'Caramel Frappe', size: 'L', milk: 'Regular', extras: ['Whipped Cream', 'Caramel Syrup', 'Chocolate Drizzle'], complexity: 'complex', status: 'incoming', elapsed: 0 },
  { id: 107, customer: 'Yusuf H.', drink: 'Flat White', size: 'M', milk: 'Regular', extras: ['Extra Shot'], complexity: 'medium', status: 'done', elapsed: 120 },
  { id: 108, customer: 'Huda T.', drink: 'Cold Brew', size: 'L', milk: 'Regular', extras: [], complexity: 'simple', status: 'done', elapsed: 90 },
];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function BaristaPage() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // Timer for currently-making orders
  useEffect(() => {
    const interval = setInterval(() => {
      setOrders((prev) =>
        prev.map((o) => (o.status === 'making' ? { ...o, elapsed: o.elapsed + 1 } : o))
      );
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const incoming = orders.filter((o) => o.status === 'incoming');
  const making = orders.filter((o) => o.status === 'making');
  const done = orders.filter((o) => o.status === 'done');

  const startMaking = (id: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'making', elapsed: 0 } : o))
    );
  };

  const markDone = (id: number) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: 'done' } : o))
    );
  };

  const clearDone = () => {
    setOrders((prev) => prev.filter((o) => o.status !== 'done'));
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Incoming" value={incoming.length} sub="orders waiting" />
        <StatCard label="In Progress" value={making.length} sub="currently making" />
        <StatCard label="Completed" value={done.length} sub="drinks ready" />
        <StatCard
          label="Avg Time"
          value={done.length > 0 ? `${Math.round(done.reduce((s, o) => s + o.elapsed, 0) / done.length)}s` : '--'}
          sub="per drink"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incoming Queue */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              Incoming
              <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {incoming.length}
              </span>
            </h2>
          </div>
          {incoming.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No incoming orders</div>
          )}
          {incoming.map((order) => {
            const cc = COMPLEXITY_COLORS[order.complexity];
            return (
              <Card key={order.id} className={`border-l-4 ${cc.bg}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-semibold text-sm">#{order.id}</span>
                    <span className="text-gray-500 text-sm ml-2">{order.customer}</span>
                  </div>
                  <Badge variant={cc.badge}>{order.complexity}</Badge>
                </div>
                <div className="text-sm font-medium">{order.drink} ({order.size})</div>
                <div className="text-xs text-gray-500 mt-1">
                  {order.milk} milk
                  {order.extras.length > 0 && ` + ${order.extras.join(', ')}`}
                </div>
                <Button size="sm" className="w-full mt-3" onClick={() => startMaking(order.id)}>
                  Start Making
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Currently Making */}
        <div className="space-y-3">
          <h2 className="font-semibold flex items-center gap-2">
            Making
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {making.length}
            </span>
          </h2>
          {making.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No drinks in progress</div>
          )}
          {making.map((order) => {
            const cc = COMPLEXITY_COLORS[order.complexity];
            const isOverTime = order.elapsed > 180;
            return (
              <Card key={order.id} className={`border-l-4 ${cc.bg} ring-2 ring-blue-200`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-semibold text-sm">#{order.id}</span>
                    <span className="text-gray-500 text-sm ml-2">{order.customer}</span>
                  </div>
                  <span className={`text-lg font-mono font-bold ${isOverTime ? 'text-red-600' : 'text-blue-600'}`}>
                    {formatTime(order.elapsed)}
                  </span>
                </div>
                <div className="text-sm font-medium">{order.drink} ({order.size})</div>
                <div className="text-xs text-gray-500 mt-1">
                  {order.milk} milk
                  {order.extras.length > 0 && ` + ${order.extras.join(', ')}`}
                </div>
                {/* Progress bar based on estimated time */}
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                  <div
                    className={`h-1.5 rounded-full transition-all ${isOverTime ? 'bg-red-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(100, (order.elapsed / 180) * 100)}%` }}
                  />
                </div>
                <Button size="sm" className="w-full mt-3" onClick={() => markDone(order.id)}>
                  Mark Done
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Completed */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              Completed
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {done.length}
              </span>
            </h2>
            {done.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearDone}>
                Clear All
              </Button>
            )}
          </div>
          {done.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No completed drinks</div>
          )}
          {done.map((order) => (
            <Card key={order.id} className="border-l-4 border-l-green-500 opacity-75">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <span className="font-semibold text-sm">#{order.id}</span>
                  <span className="text-gray-500 text-sm ml-2">{order.customer}</span>
                </div>
                <span className="text-xs text-gray-400">{formatTime(order.elapsed)}</span>
              </div>
              <div className="text-sm">{order.drink} ({order.size})</div>
              <Badge variant="green" className="mt-2">Ready for pickup</Badge>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
