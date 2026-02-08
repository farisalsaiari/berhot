import { StatCard, Card, DataTable, Badge } from '@berhot/ui';
import type { Column } from '@berhot/ui';

interface Transaction {
  id: string;
  time: string;
  customer: string;
  items: number;
  total: number;
  payment: string;
  cashier: string;
}

interface TopProduct {
  name: string;
  sold: number;
  revenue: number;
}

const RECENT_TRANSACTIONS: Transaction[] = [
  { id: 'TXN-4821', time: '14:32', customer: 'Walk-in', items: 3, total: 245, payment: 'Card', cashier: 'Faisal' },
  { id: 'TXN-4820', time: '14:18', customer: 'Noura A.', items: 1, total: 89, payment: 'Cash', cashier: 'Faisal' },
  { id: 'TXN-4819', time: '13:55', customer: 'Walk-in', items: 5, total: 432, payment: 'Card', cashier: 'Mariam' },
  { id: 'TXN-4818', time: '13:42', customer: 'Abdullah S.', items: 2, total: 178, payment: 'Mada', cashier: 'Mariam' },
  { id: 'TXN-4817', time: '13:20', customer: 'Walk-in', items: 1, total: 55, payment: 'Cash', cashier: 'Faisal' },
  { id: 'TXN-4816', time: '12:58', customer: 'Reem K.', items: 4, total: 367, payment: 'Card', cashier: 'Mariam' },
  { id: 'TXN-4815', time: '12:35', customer: 'Walk-in', items: 2, total: 124, payment: 'Mada', cashier: 'Faisal' },
  { id: 'TXN-4814', time: '12:10', customer: 'Yusuf H.', items: 6, total: 590, payment: 'Card', cashier: 'Mariam' },
];

const TOP_PRODUCTS: TopProduct[] = [
  { name: 'Wireless Earbuds Pro', sold: 24, revenue: 4320 },
  { name: 'USB-C Charging Cable', sold: 38, revenue: 1520 },
  { name: 'Phone Case (Clear)', sold: 31, revenue: 1240 },
  { name: 'Screen Protector Pack', sold: 28, revenue: 840 },
  { name: 'Portable Charger 10K', sold: 15, revenue: 2250 },
];

const PAYMENT_COLORS: Record<string, 'blue' | 'green' | 'purple'> = {
  Card: 'blue',
  Cash: 'green',
  Mada: 'purple',
};

const txnColumns: Column<Transaction>[] = [
  { key: 'id', header: 'Transaction ID', render: (row) => <span className="font-mono text-xs">{row.id}</span> },
  { key: 'time', header: 'Time' },
  { key: 'customer', header: 'Customer' },
  { key: 'items', header: 'Items', className: 'text-center' },
  { key: 'total', header: 'Total', render: (row) => <span className="font-semibold">{row.total} SAR</span> },
  { key: 'payment', header: 'Payment', render: (row) => <Badge variant={PAYMENT_COLORS[row.payment] || 'gray'}>{row.payment}</Badge> },
  { key: 'cashier', header: 'Cashier' },
];

export default function DashboardPage() {
  const todaySales = RECENT_TRANSACTIONS.reduce((sum, t) => sum + t.total, 0);
  const avgTicket = Math.round(todaySales / RECENT_TRANSACTIONS.length);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Sales"
          value={`${todaySales.toLocaleString()} SAR`}
          sub="+12% vs yesterday"
          trend="up"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Transactions"
          value={RECENT_TRANSACTIONS.length}
          sub="today so far"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
            </svg>
          }
        />
        <StatCard
          label="Avg Ticket"
          value={`${avgTicket} SAR`}
          sub="+5% vs last week"
          trend="up"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          }
        />
        <StatCard
          label="Top Product"
          value="Earbuds Pro"
          sub="24 units sold today"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
        />
      </div>

      {/* Charts placeholder + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart Placeholder */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Sales Trend (Today)</h3>
          <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <p className="text-sm">Sales chart area</p>
            </div>
          </div>
        </Card>

        {/* Top Products */}
        <Card>
          <h3 className="font-semibold mb-4">Top Products</h3>
          <div className="space-y-3">
            {TOP_PRODUCTS.map((product, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{product.name}</div>
                    <div className="text-xs text-gray-500">{product.sold} units</div>
                  </div>
                </div>
                <span className="text-sm font-semibold">{product.revenue.toLocaleString()} SAR</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Hourly Breakdown Placeholder */}
      <Card>
        <h3 className="font-semibold mb-4">Hourly Breakdown</h3>
        <div className="h-32 bg-gradient-to-br from-green-50 to-green-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            <p className="text-sm">Hourly bar chart area</p>
          </div>
        </div>
      </Card>

      {/* Recent Transactions */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold">Recent Transactions</h3>
          <span className="text-xs text-gray-400">Today</span>
        </div>
        <DataTable columns={txnColumns} data={RECENT_TRANSACTIONS} />
      </Card>
    </div>
  );
}
