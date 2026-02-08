import { useState } from 'react';
import { StatCard, Badge, Card, TabBar, Button, SearchInput, DataTable } from '@berhot/ui';
import type { BadgeVariant, Column } from '@berhot/ui';

type OrderStatus = 'preparing' | 'ready' | 'served';

interface Order {
  id: string;
  table: number;
  server: string;
  items: { name: string; qty: number }[];
  total: number;
  status: OrderStatus;
  time: string;
  elapsed: string;
}

const ORDERS: Order[] = [
  { id: '#1044', table: 6, server: 'Omar', items: [{ name: 'Kabsa', qty: 2 }, { name: 'Hummus', qty: 1 }, { name: 'Grilled Chicken', qty: 3 }], total: 234.75, status: 'preparing', time: '12:45 PM', elapsed: '15 min' },
  { id: '#1043', table: 3, server: 'Sara', items: [{ name: 'Lamb Mandi', qty: 1 }, { name: 'Fattoush', qty: 1 }], total: 98.0, status: 'ready', time: '12:32 PM', elapsed: '28 min' },
  { id: '#1042', table: 1, server: 'Ahmed', items: [{ name: 'Mixed Grill', qty: 1 }, { name: 'Arabic Coffee', qty: 2 }], total: 78.5, status: 'preparing', time: '12:28 PM', elapsed: '32 min' },
  { id: '#1041', table: 5, server: 'Sara', items: [{ name: 'Shawarma Plate', qty: 2 }, { name: 'Lentil Soup', qty: 2 }], total: 112.0, status: 'served', time: '12:15 PM', elapsed: '45 min' },
  { id: '#1040', table: 2, server: 'Omar', items: [{ name: 'Fish Sayadieh', qty: 1 }], total: 68.0, status: 'served', time: '12:02 PM', elapsed: '58 min' },
  { id: '#1039', table: 3, server: 'Sara', items: [{ name: 'Kabsa', qty: 1 }, { name: 'Kunafa', qty: 2 }, { name: 'Tea', qty: 3 }], total: 145.0, status: 'preparing', time: '11:52 AM', elapsed: '48 min' },
  { id: '#1038', table: 7, server: 'Ahmed', items: [{ name: 'Falafel Wrap', qty: 3 }, { name: 'Fresh Juice', qty: 3 }], total: 87.0, status: 'ready', time: '11:45 AM', elapsed: '55 min' },
  { id: '#1037', table: 4, server: 'Omar', items: [{ name: 'Lamb Ouzi', qty: 1 }, { name: 'Tabbouleh', qty: 1 }], total: 156.0, status: 'served', time: '11:30 AM', elapsed: '70 min' },
];

const STATUS_BADGE: Record<OrderStatus, { variant: BadgeVariant; label: string }> = {
  preparing: { variant: 'orange', label: 'Preparing' },
  ready: { variant: 'blue', label: 'Ready' },
  served: { variant: 'green', label: 'Served' },
};

const TABS = [
  { key: 'all', label: 'All Orders' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'ready', label: 'Ready' },
  { key: 'served', label: 'Served' },
];

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = ORDERS
    .filter((o) => activeTab === 'all' || o.status === activeTab)
    .filter((o) => search === '' || o.id.toLowerCase().includes(search.toLowerCase()) || o.server.toLowerCase().includes(search.toLowerCase()));

  const activeOrders = ORDERS.filter((o) => o.status !== 'served').length;
  const todayRevenue = ORDERS.reduce((sum, o) => sum + o.total, 0);

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    count: t.key === 'all' ? ORDERS.length : ORDERS.filter((o) => o.status === t.key).length,
  }));

  const columns: Column<Order>[] = [
    {
      key: 'id',
      header: 'Order ID',
      render: (row) => <span className="font-semibold text-gray-900">{row.id}</span>,
    },
    {
      key: 'table',
      header: 'Table',
      render: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 font-bold text-sm rounded-lg">
          {row.table}
        </span>
      ),
    },
    {
      key: 'server',
      header: 'Server',
    },
    {
      key: 'items',
      header: 'Items',
      render: (row) => (
        <div>
          <span className="font-medium text-gray-900">{row.items.reduce((s, i) => s + i.qty, 0)} items</span>
          <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[200px]">
            {row.items.map((i) => `${i.qty}x ${i.name}`).join(', ')}
          </div>
        </div>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (row) => <span className="font-semibold">SAR {row.total.toFixed(2)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const cfg = STATUS_BADGE[row.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'elapsed',
      header: 'Time',
      render: (row) => (
        <div className="text-right">
          <div className="text-sm text-gray-700">{row.elapsed}</div>
          <div className="text-xs text-gray-400">{row.time}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Active Orders" value={activeOrders} sub="+3 in last hour" trend="up" />
        <StatCard label="Avg. Prep Time" value="24 min" sub="2 min faster today" trend="up" />
        <StatCard label="Revenue Today" value={`SAR ${todayRevenue.toFixed(0)}`} sub="+18% vs yesterday" trend="up" />
        <StatCard label="Orders Served" value={ORDERS.filter((o) => o.status === 'served').length} sub="Since opening" trend="neutral" />
      </div>

      {/* Tabs + Search */}
      <Card padding={false}>
        <div className="px-5 pt-4 flex items-center justify-between">
          <div className="flex-1">
            <TabBar tabs={tabsWithCounts} activeKey={activeTab} onChange={setActiveTab} />
          </div>
          <div className="flex items-center gap-3 ml-4 pb-2">
            <SearchInput placeholder="Search orders..." onSearch={setSearch} className="w-56" />
            <Button variant="primary" size="sm">
              + New Order
            </Button>
          </div>
        </div>

        <DataTable columns={columns} data={filtered} emptyMessage="No orders found" />
      </Card>
    </div>
  );
}
