import { useState } from 'react';
import { Card, Badge, Button, SearchInput, StatCard, DataTable, ProgressBar } from '@berhot/ui';
import type { Column } from '@berhot/ui';

type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

interface Visit {
  date: string;
  order: string;
  amount: number;
  pointsEarned: number;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  points: number;
  tier: Tier;
  totalVisits: number;
  totalSpend: number;
  memberSince: string;
  visits: Visit[];
}

const TIER_CONFIG: Record<Tier, { variant: 'gray' | 'blue' | 'orange' | 'purple'; nextAt: number }> = {
  Bronze: { variant: 'gray', nextAt: 200 },
  Silver: { variant: 'blue', nextAt: 500 },
  Gold: { variant: 'orange', nextAt: 1000 },
  Platinum: { variant: 'purple', nextAt: 9999 },
};

const CUSTOMERS: Customer[] = [
  {
    id: 1, name: 'Ahmad Al-Mansour', phone: '+966 50 123 4567',
    points: 340, tier: 'Silver', totalVisits: 48, totalSpend: 1920, memberSince: '2024-03-15',
    visits: [
      { date: '2026-02-07', order: 'Cappuccino + Croissant', amount: 32, pointsEarned: 3 },
      { date: '2026-02-05', order: 'Iced Latte', amount: 22, pointsEarned: 2 },
      { date: '2026-02-03', order: 'Flat White x2', amount: 40, pointsEarned: 4 },
      { date: '2026-01-30', order: 'Matcha Latte + Muffin', amount: 41, pointsEarned: 4 },
    ],
  },
  {
    id: 2, name: 'Sara Al-Khalidi', phone: '+966 55 987 6543',
    points: 780, tier: 'Gold', totalVisits: 112, totalSpend: 5040, memberSince: '2023-08-20',
    visits: [
      { date: '2026-02-07', order: 'Cold Brew + Scone', amount: 35, pointsEarned: 4 },
      { date: '2026-02-06', order: 'Americano', amount: 15, pointsEarned: 2 },
      { date: '2026-02-04', order: 'Caramel Frappe', amount: 28, pointsEarned: 3 },
    ],
  },
  {
    id: 3, name: 'Omar Bin Jassim', phone: '+966 54 456 7890',
    points: 120, tier: 'Bronze', totalVisits: 15, totalSpend: 450, memberSince: '2025-11-10',
    visits: [
      { date: '2026-02-06', order: 'Espresso x2', amount: 24, pointsEarned: 2 },
      { date: '2026-01-28', order: 'Turkish Coffee', amount: 14, pointsEarned: 1 },
    ],
  },
  {
    id: 4, name: 'Lina Al-Rashidi', phone: '+966 50 234 5678',
    points: 1250, tier: 'Platinum', totalVisits: 205, totalSpend: 9800, memberSince: '2022-05-01',
    visits: [
      { date: '2026-02-07', order: 'Lavender Latte + Affogato', amount: 48, pointsEarned: 5 },
      { date: '2026-02-07', order: 'Rose Cardamom Latte', amount: 28, pointsEarned: 3 },
      { date: '2026-02-06', order: 'Cappuccino + Cinnamon Roll', amount: 36, pointsEarned: 4 },
    ],
  },
  {
    id: 5, name: 'Khaled Al-Harbi', phone: '+966 56 345 6789',
    points: 55, tier: 'Bronze', totalVisits: 7, totalSpend: 175, memberSince: '2026-01-05',
    visits: [
      { date: '2026-02-02', order: 'Americano', amount: 15, pointsEarned: 2 },
    ],
  },
];

const visitColumns: Column<Visit>[] = [
  { key: 'date', header: 'Date' },
  { key: 'order', header: 'Order' },
  { key: 'amount', header: 'Amount', render: (row) => <span>{row.amount} SAR</span> },
  { key: 'pointsEarned', header: 'Points', render: (row) => <span className="text-green-600 font-medium">+{row.pointsEarned}</span> },
];

export default function LoyaltyPage() {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [addPointsValue, setAddPointsValue] = useState('');

  const filteredCustomers = CUSTOMERS.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const handleAddPoints = () => {
    if (!selectedCustomer || !addPointsValue) return;
    const pts = parseInt(addPointsValue, 10);
    if (isNaN(pts) || pts <= 0) return;
    setSelectedCustomer((prev) => prev ? { ...prev, points: prev.points + pts } : null);
    setAddPointsValue('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Customer Search / List */}
      <div className="space-y-4">
        <SearchInput
          placeholder="Search by name or phone..."
          onSearch={setSearch}
        />
        <div className="space-y-2">
          {filteredCustomers.map((customer) => {
            const tierCfg = TIER_CONFIG[customer.tier];
            return (
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
                  <Badge variant={tierCfg.variant}>{customer.tier}</Badge>
                </div>
                <div className="text-xs text-gray-500">{customer.phone}</div>
                <div className="text-xs text-gray-400 mt-1">{customer.points} points | {customer.totalVisits} visits</div>
              </button>
            );
          })}
          {filteredCustomers.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">No customers found</div>
          )}
        </div>
      </div>

      {/* Customer Detail */}
      <div className="lg:col-span-2 space-y-4">
        {!selectedCustomer ? (
          <Card className="flex items-center justify-center h-64">
            <div className="text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p className="text-sm">Select a customer to view details</p>
            </div>
          </Card>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard label="Points" value={selectedCustomer.points} sub={`${selectedCustomer.tier} tier`} />
              <StatCard label="Total Visits" value={selectedCustomer.totalVisits} />
              <StatCard label="Total Spend" value={`${selectedCustomer.totalSpend} SAR`} />
              <StatCard label="Member Since" value={selectedCustomer.memberSince} />
            </div>

            {/* Tier Progress */}
            <Card>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">Tier Progress</h3>
                <Badge variant={TIER_CONFIG[selectedCustomer.tier].variant}>
                  {selectedCustomer.tier}
                </Badge>
              </div>
              {selectedCustomer.tier !== 'Platinum' ? (
                <>
                  <ProgressBar
                    value={selectedCustomer.points}
                    max={TIER_CONFIG[selectedCustomer.tier].nextAt}
                    color="bg-blue-600"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {TIER_CONFIG[selectedCustomer.tier].nextAt - selectedCustomer.points} points to next tier
                  </p>
                </>
              ) : (
                <p className="text-xs text-gray-500">Highest tier reached</p>
              )}
            </Card>

            {/* Quick Points Add */}
            <Card>
              <h3 className="font-semibold text-sm mb-3">Quick Points Add</h3>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Points to add"
                  value={addPointsValue}
                  onChange={(e) => setAddPointsValue(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button onClick={handleAddPoints}>Add Points</Button>
              </div>
              <div className="flex gap-2 mt-2">
                {[5, 10, 25, 50].map((pts) => (
                  <button
                    key={pts}
                    onClick={() => setAddPointsValue(String(pts))}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    +{pts}
                  </button>
                ))}
              </div>
            </Card>

            {/* Visit History */}
            <Card padding={false}>
              <div className="px-5 py-4 border-b border-gray-200">
                <h3 className="font-semibold text-sm">Visit History</h3>
              </div>
              <DataTable columns={visitColumns} data={selectedCustomer.visits} emptyMessage="No visits recorded" />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
