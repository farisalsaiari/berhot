import { useState } from 'react';
import { Card, Badge, Button, SearchInput, StatCard, DataTable } from '@berhot/ui';
import type { Column } from '@berhot/ui';

interface Purchase {
  date: string;
  items: string;
  total: number;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  email: string;
  totalSpend: number;
  purchaseCount: number;
  lastVisit: string;
  memberSince: string;
  tier: 'Regular' | 'VIP' | 'Premium';
  purchases: Purchase[];
}

const CUSTOMERS: Customer[] = [
  {
    id: 1, name: 'Abdullah Al-Saud', phone: '+966 50 111 2222', email: 'abdullah@example.com',
    totalSpend: 12500, purchaseCount: 34, lastVisit: '2026-02-07', memberSince: '2023-06-15', tier: 'VIP',
    purchases: [
      { date: '2026-02-07', items: 'Wireless Earbuds Pro, USB-C Cable', total: 220 },
      { date: '2026-02-03', items: 'Mechanical Keyboard', total: 340 },
      { date: '2026-01-28', items: 'Laptop Stand, Mouse', total: 280 },
      { date: '2026-01-20', items: 'Portable Charger 20K', total: 220 },
    ],
  },
  {
    id: 2, name: 'Noura Al-Rashid', phone: '+966 55 333 4444', email: 'noura@example.com',
    totalSpend: 8900, purchaseCount: 22, lastVisit: '2026-02-06', memberSince: '2024-01-10', tier: 'VIP',
    purchases: [
      { date: '2026-02-06', items: 'Fitness Tracker, Watch Band', total: 315 },
      { date: '2026-01-30', items: 'Phone Case, Screen Protector', total: 70 },
      { date: '2026-01-22', items: 'Bluetooth Speaker Mini', total: 120 },
    ],
  },
  {
    id: 3, name: 'Mariam Al-Harbi', phone: '+966 54 555 6666', email: 'mariam@example.com',
    totalSpend: 3200, purchaseCount: 10, lastVisit: '2026-02-05', memberSince: '2025-03-20', tier: 'Regular',
    purchases: [
      { date: '2026-02-05', items: 'Lightning Cable x2', total: 90 },
      { date: '2026-01-15', items: 'Car Phone Mount', total: 55 },
    ],
  },
  {
    id: 4, name: 'Faisal Al-Otaibi', phone: '+966 56 777 8888', email: 'faisal@example.com',
    totalSpend: 22300, purchaseCount: 58, lastVisit: '2026-02-07', memberSince: '2022-11-05', tier: 'Premium',
    purchases: [
      { date: '2026-02-07', items: 'Wireless Earbuds Pro x2, Portable Charger 10K', total: 510 },
      { date: '2026-02-04', items: 'HDMI Cable, USB Hub', total: 145 },
      { date: '2026-02-01', items: 'Mechanical Keyboard, Mouse, Laptop Stand', total: 620 },
      { date: '2026-01-25', items: 'Bluetooth Speaker Mini x3', total: 360 },
      { date: '2026-01-18', items: 'Smart Watch Band x5', total: 325 },
    ],
  },
  {
    id: 5, name: 'Reem Al-Shammari', phone: '+966 50 999 0000', email: 'reem@example.com',
    totalSpend: 1800, purchaseCount: 6, lastVisit: '2026-02-03', memberSince: '2025-08-12', tier: 'Regular',
    purchases: [
      { date: '2026-02-03', items: 'Phone Case, USB-C Cable', total: 80 },
      { date: '2026-01-10', items: 'Screen Protector Pack', total: 30 },
    ],
  },
  {
    id: 6, name: 'Yusuf Al-Dosari', phone: '+966 55 123 9876', email: 'yusuf@example.com',
    totalSpend: 5600, purchaseCount: 16, lastVisit: '2026-02-06', memberSince: '2024-07-22', tier: 'Regular',
    purchases: [
      { date: '2026-02-06', items: 'Portable Charger 20K, HDMI Cable', total: 255 },
      { date: '2026-01-28', items: 'Wireless Mouse', total: 85 },
      { date: '2026-01-15', items: 'Laptop Stand Aluminum', total: 195 },
    ],
  },
];

const TIER_BADGE: Record<Customer['tier'], 'gray' | 'blue' | 'purple'> = {
  Regular: 'gray',
  VIP: 'blue',
  Premium: 'purple',
};

const purchaseColumns: Column<Purchase>[] = [
  { key: 'date', header: 'Date' },
  { key: 'items', header: 'Items' },
  { key: 'total', header: 'Total', render: (row) => <span className="font-semibold">{row.total} SAR</span> },
];

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filtered = CUSTOMERS.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchTier = filterTier === 'all' || c.tier === filterTier;
    return matchSearch && matchTier;
  });

  const totalCustomers = CUSTOMERS.length;
  const vipCustomers = CUSTOMERS.filter((c) => c.tier === 'VIP' || c.tier === 'Premium').length;
  const avgSpend = Math.round(CUSTOMERS.reduce((sum, c) => sum + c.totalSpend, 0) / totalCustomers);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Customers" value={totalCustomers} sub="in database" />
        <StatCard label="VIP / Premium" value={vipCustomers} sub="high-value customers" />
        <StatCard label="Avg Spend" value={`${avgSpend.toLocaleString()} SAR`} sub="per customer" />
        <StatCard label="Active This Week" value={CUSTOMERS.filter((c) => c.lastVisit >= '2026-02-01').length} sub="recent visitors" />
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <SearchInput placeholder="Search by name, phone, or email..." onSearch={setSearch} className="w-80" />
        <div className="flex gap-2">
          {['all', 'Regular', 'VIP', 'Premium'].map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterTier(tier)}
              className={`px-4 py-2 text-sm rounded-lg border transition-all ${
                filterTier === tier
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300'
              }`}
            >
              {tier === 'all' ? 'All Tiers' : tier}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="space-y-3">
          {filtered.map((customer) => (
            <button
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selectedCustomer?.id === customer.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm">{customer.name}</span>
                <Badge variant={TIER_BADGE[customer.tier]}>{customer.tier}</Badge>
              </div>
              <div className="text-xs text-gray-500">{customer.phone}</div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-400">{customer.purchaseCount} purchases</span>
                <span className="text-xs font-medium">{customer.totalSpend.toLocaleString()} SAR</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No customers found</div>
          )}
        </div>

        {/* Customer Detail */}
        <div className="lg:col-span-2 space-y-4">
          {!selectedCustomer ? (
            <Card className="flex items-center justify-center h-64">
              <div className="text-center text-gray-400">
                <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm">Select a customer to view details</p>
              </div>
            </Card>
          ) : (
            <>
              {/* Customer Header */}
              <Card>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-lg font-bold">{selectedCustomer.name}</h2>
                      <Badge variant={TIER_BADGE[selectedCustomer.tier]}>{selectedCustomer.tier}</Badge>
                    </div>
                    <div className="text-sm text-gray-500 space-y-0.5">
                      <div>{selectedCustomer.phone}</div>
                      <div>{selectedCustomer.email}</div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <div>Member since {selectedCustomer.memberSince}</div>
                    <div>Last visit: {selectedCustomer.lastVisit}</div>
                  </div>
                </div>
              </Card>

              {/* Customer Stats */}
              <div className="grid grid-cols-3 gap-3">
                <StatCard label="Total Spend" value={`${selectedCustomer.totalSpend.toLocaleString()} SAR`} />
                <StatCard label="Purchases" value={selectedCustomer.purchaseCount} />
                <StatCard label="Avg Order" value={`${Math.round(selectedCustomer.totalSpend / selectedCustomer.purchaseCount)} SAR`} />
              </div>

              {/* Purchase History */}
              <Card padding={false}>
                <div className="px-5 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-sm">Purchase History</h3>
                </div>
                <DataTable columns={purchaseColumns} data={selectedCustomer.purchases} emptyMessage="No purchases recorded" />
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
