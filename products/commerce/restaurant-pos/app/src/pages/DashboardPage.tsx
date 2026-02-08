import { StatCard, Card, DataTable, Badge } from '@berhot/ui';
import type { Column } from '@berhot/ui';

interface Order {
  id: string;
  time: string;
  table: number;
  guests: number;
  total: number;
  payment: 'Card' | 'Cash' | 'Mada';
  server: string;
}

const RECENT_ORDERS: Order[] = [
  { id: '#1048', time: '1:42 PM', table: 3, guests: 4, total: 385, payment: 'Card', server: 'Ahmed' },
  { id: '#1047', time: '1:28 PM', table: 7, guests: 2, total: 142, payment: 'Mada', server: 'Sara' },
  { id: '#1046', time: '1:15 PM', table: 1, guests: 3, total: 267, payment: 'Cash', server: 'Omar' },
  { id: '#1045', time: '12:58 PM', table: 5, guests: 2, total: 98, payment: 'Mada', server: 'Ahmed' },
  { id: '#1044', time: '12:40 PM', table: 6, guests: 6, total: 412, payment: 'Card', server: 'Sara' },
  { id: '#1043', time: '12:22 PM', table: 2, guests: 2, total: 85, payment: 'Cash', server: 'Omar' },
  { id: '#1042', time: '12:05 PM', table: 4, guests: 5, total: 310, payment: 'Card', server: 'Ahmed' },
  { id: '#1041', time: '11:48 AM', table: 8, guests: 3, total: 195, payment: 'Mada', server: 'Sara' },
];

const PAYMENT_VARIANTS: Record<Order['payment'], 'blue' | 'green' | 'purple'> = {
  Card: 'blue',
  Cash: 'green',
  Mada: 'purple',
};

const ORDER_COLUMNS: Column<Order>[] = [
  { key: 'id', header: 'Order ID', className: 'font-semibold text-gray-900' },
  { key: 'time', header: 'Time' },
  { key: 'table', header: 'Table', render: (row) => `T${row.table}` },
  { key: 'guests', header: 'Guests' },
  { key: 'total', header: 'Total (SAR)', render: (row) => row.total.toFixed(2), className: 'font-semibold' },
  {
    key: 'payment',
    header: 'Payment',
    render: (row) => <Badge variant={PAYMENT_VARIANTS[row.payment]}>{row.payment}</Badge>,
  },
  { key: 'server', header: 'Server' },
];

const TOP_DISHES = [
  { name: 'Kabsa Lamb', orders: 18, revenue: 2340 },
  { name: 'Grilled Chicken Platter', orders: 15, revenue: 1875 },
  { name: 'Mixed Grill', orders: 12, revenue: 2160 },
  { name: 'Mandi Rice', orders: 10, revenue: 1100 },
  { name: 'Seafood Soup', orders: 8, revenue: 640 },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Today's Revenue"
          value="12,450 SAR"
          sub="+15% vs yesterday"
          trend="up"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Orders Served"
          value={64}
          sub="Today so far"
          trend="neutral"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V19.5a2.25 2.25 0 002.25 2.25h.75" />
            </svg>
          }
        />
        <StatCard
          label="Avg Check"
          value="195 SAR"
          sub="+7% vs last week"
          trend="up"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          }
        />
        <StatCard
          label="Active Tables"
          value="8 / 20"
          sub="Currently occupied"
          trend="neutral"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          }
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <h3 className="font-semibold mb-4">Hourly Revenue</h3>
          <div className="h-48 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <p className="text-sm">Hourly revenue chart area</p>
            </div>
          </div>
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Revenue Trend (Today)</h3>
          <div className="h-48 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <p className="text-sm">Revenue chart area</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Orders & Top Dishes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2" padding={false}>
          <div className="p-5 pb-0">
            <h3 className="font-semibold mb-4">Recent Orders</h3>
          </div>
          <DataTable columns={ORDER_COLUMNS} data={RECENT_ORDERS} />
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Top Dishes</h3>
          <div className="space-y-3">
            {TOP_DISHES.map((dish, i) => (
              <div key={dish.name} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{dish.name}</div>
                  <div className="text-xs text-gray-500">{dish.orders} orders</div>
                </div>
                <span className="text-sm font-semibold text-gray-700">{dish.revenue.toLocaleString()} SAR</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
