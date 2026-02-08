import { useState } from 'react';
import { Card, Badge, Button, DataTable, StatCard, SearchInput } from '@berhot/ui';
import type { Column } from '@berhot/ui';

interface Sale {
  id: string;
  date: string;
  time: string;
  items: string[];
  itemCount: number;
  total: number;
  payment: string;
  cashier: string;
  status: 'completed' | 'refunded' | 'partial-refund';
}

const SALES: Sale[] = [
  { id: 'TXN-4821', date: '2026-02-07', time: '14:32', items: ['Wireless Earbuds Pro', 'USB-C Cable', 'Screen Protector'], itemCount: 3, total: 245, payment: 'Card', cashier: 'Faisal', status: 'completed' },
  { id: 'TXN-4820', date: '2026-02-07', time: '14:18', items: ['Wireless Mouse'], itemCount: 1, total: 89, payment: 'Cash', cashier: 'Faisal', status: 'completed' },
  { id: 'TXN-4819', date: '2026-02-07', time: '13:55', items: ['Laptop Stand', 'HDMI Cable', 'USB Hub', 'Keyboard', 'Mouse'], itemCount: 5, total: 432, payment: 'Card', cashier: 'Mariam', status: 'completed' },
  { id: 'TXN-4818', date: '2026-02-07', time: '13:42', items: ['Portable Charger 20K', 'Phone Case'], itemCount: 2, total: 178, payment: 'Mada', cashier: 'Mariam', status: 'completed' },
  { id: 'TXN-4817', date: '2026-02-07', time: '13:20', items: ['Car Phone Mount'], itemCount: 1, total: 55, payment: 'Cash', cashier: 'Faisal', status: 'completed' },
  { id: 'TXN-4816', date: '2026-02-06', time: '18:58', items: ['Fitness Tracker', 'Watch Band', 'Screen Protector', 'Charging Cable'], itemCount: 4, total: 367, payment: 'Card', cashier: 'Mariam', status: 'refunded' },
  { id: 'TXN-4815', date: '2026-02-06', time: '17:35', items: ['Bluetooth Speaker', 'Lightning Cable'], itemCount: 2, total: 124, payment: 'Mada', cashier: 'Faisal', status: 'completed' },
  { id: 'TXN-4814', date: '2026-02-06', time: '16:10', items: ['Mechanical Keyboard', 'Mouse', 'USB Hub', 'HDMI Cable x2', 'USB-C Cable'], itemCount: 6, total: 590, payment: 'Card', cashier: 'Mariam', status: 'partial-refund' },
  { id: 'TXN-4813', date: '2026-02-06', time: '15:22', items: ['Portable Charger 10K'], itemCount: 1, total: 150, payment: 'Cash', cashier: 'Faisal', status: 'completed' },
  { id: 'TXN-4812', date: '2026-02-06', time: '14:05', items: ['Earbuds Pro', 'Phone Case'], itemCount: 2, total: 220, payment: 'Card', cashier: 'Mariam', status: 'completed' },
  { id: 'TXN-4811', date: '2026-02-05', time: '19:40', items: ['Smart Watch Band x3'], itemCount: 3, total: 195, payment: 'Card', cashier: 'Faisal', status: 'completed' },
  { id: 'TXN-4810', date: '2026-02-05', time: '18:15', items: ['Wireless Mouse', 'USB-C Cable'], itemCount: 2, total: 125, payment: 'Mada', cashier: 'Mariam', status: 'completed' },
];

const PAYMENT_BADGE: Record<string, 'blue' | 'green' | 'purple'> = {
  Card: 'blue',
  Cash: 'green',
  Mada: 'purple',
};

const STATUS_BADGE: Record<Sale['status'], { variant: 'green' | 'red' | 'orange'; label: string }> = {
  completed: { variant: 'green', label: 'Completed' },
  refunded: { variant: 'red', label: 'Refunded' },
  'partial-refund': { variant: 'orange', label: 'Partial Refund' },
};

const salesColumns: Column<Sale>[] = [
  { key: 'id', header: 'Transaction', render: (row) => <span className="font-mono text-xs font-medium">{row.id}</span> },
  { key: 'date', header: 'Date', render: (row) => <span>{row.date} {row.time}</span> },
  {
    key: 'items',
    header: 'Items',
    render: (row) => (
      <div>
        <span className="text-sm">{row.items[0]}</span>
        {row.itemCount > 1 && <span className="text-xs text-gray-400 ml-1">+{row.itemCount - 1} more</span>}
      </div>
    ),
  },
  { key: 'total', header: 'Total', render: (row) => <span className="font-semibold">{row.total} SAR</span> },
  { key: 'payment', header: 'Payment', render: (row) => <Badge variant={PAYMENT_BADGE[row.payment] || 'gray'}>{row.payment}</Badge> },
  { key: 'cashier', header: 'Cashier' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => {
      const badge = STATUS_BADGE[row.status];
      return <Badge variant={badge.variant}>{badge.label}</Badge>;
    },
  },
];

export default function SalesPage() {
  const [dateFrom, setDateFrom] = useState('2026-02-05');
  const [dateTo, setDateTo] = useState('2026-02-07');
  const [search, setSearch] = useState('');

  const filtered = SALES.filter((sale) => {
    const matchDate = sale.date >= dateFrom && sale.date <= dateTo;
    const matchSearch =
      sale.id.toLowerCase().includes(search.toLowerCase()) ||
      sale.cashier.toLowerCase().includes(search.toLowerCase()) ||
      sale.items.some((item) => item.toLowerCase().includes(search.toLowerCase()));
    return matchDate && matchSearch;
  });

  const totalSales = filtered.reduce((sum, s) => sum + s.total, 0);
  const completedSales = filtered.filter((s) => s.status === 'completed');
  const refundedSales = filtered.filter((s) => s.status === 'refunded' || s.status === 'partial-refund');

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Sales" value={`${totalSales.toLocaleString()} SAR`} sub={`${filtered.length} transactions`} />
        <StatCard label="Completed" value={completedSales.length} sub={`${completedSales.reduce((s, t) => s + t.total, 0).toLocaleString()} SAR`} trend="up" />
        <StatCard label="Refunded" value={refundedSales.length} sub={`${refundedSales.reduce((s, t) => s + t.total, 0).toLocaleString()} SAR`} trend={refundedSales.length > 0 ? 'down' : 'neutral'} />
        <StatCard label="Avg Ticket" value={`${filtered.length > 0 ? Math.round(totalSales / filtered.length) : 0} SAR`} sub="per transaction" />
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <label className="text-xs text-gray-500 block mb-1">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 block mb-1">Search</label>
            <SearchInput placeholder="Search by ID, cashier, or item..." onSearch={setSearch} />
          </div>
          <div className="self-end">
            <Button variant="secondary">
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold">Transactions</h3>
          <span className="text-xs text-gray-400">{filtered.length} results</span>
        </div>
        <DataTable columns={salesColumns} data={filtered} emptyMessage="No transactions found for the selected date range" />
      </Card>
    </div>
  );
}
