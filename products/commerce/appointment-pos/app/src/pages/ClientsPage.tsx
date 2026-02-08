import { useState } from 'react';
import { Card, Badge, Button, SearchInput, DataTable } from '@berhot/ui';
import type { BadgeVariant, Column } from '@berhot/ui';

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  visitCount: number;
  totalSpent: number;
  favoriteServices: string[];
  nextAppointment: string | null;
  lastVisit: string;
  tier: 'vip' | 'regular' | 'new';
}

const TIER_CONFIG: Record<Client['tier'], { label: string; variant: BadgeVariant }> = {
  vip: { label: 'VIP', variant: 'purple' },
  regular: { label: 'Regular', variant: 'blue' },
  new: { label: 'New', variant: 'green' },
};

const CLIENTS: Client[] = [
  { id: 1, name: 'Fatima Al-Rashid', phone: '+966 50 123 4567', email: 'fatima@email.com', visitCount: 34, totalSpent: 8_750, favoriteServices: ['Haircut & Style', 'Blowout'], nextAppointment: '2026-02-07 9:00 AM', lastVisit: '2026-01-28', tier: 'vip' },
  { id: 2, name: 'Layla Mahmoud', phone: '+966 55 234 5678', email: 'layla@email.com', visitCount: 22, totalSpent: 12_400, favoriteServices: ['Full Color', 'Balayage'], nextAppointment: '2026-02-07 10:00 AM', lastVisit: '2026-01-20', tier: 'vip' },
  { id: 3, name: 'Hana Yusuf', phone: '+966 54 345 6789', email: 'hana@email.com', visitCount: 8, totalSpent: 2_100, favoriteServices: ['Deep Conditioning'], nextAppointment: '2026-02-07 11:00 AM', lastVisit: '2026-01-15', tier: 'regular' },
  { id: 4, name: 'Reem Abdullah', phone: '+966 56 456 7890', email: 'reem@email.com', visitCount: 15, totalSpent: 4_800, favoriteServices: ['Swedish Massage', 'Hot Stone Massage'], nextAppointment: '2026-02-07 1:00 PM', lastVisit: '2026-01-30', tier: 'regular' },
  { id: 5, name: 'Amira Hassan', phone: '+966 59 567 8901', email: 'amira@email.com', visitCount: 3, totalSpent: 320, favoriteServices: ['Gel Manicure'], nextAppointment: '2026-02-07 2:00 PM', lastVisit: '2026-02-01', tier: 'new' },
  { id: 6, name: 'Dina Saeed', phone: '+966 50 678 9012', email: 'dina@email.com', visitCount: 28, totalSpent: 15_200, favoriteServices: ['Balayage', 'Keratin Treatment'], nextAppointment: '2026-02-08 10:00 AM', lastVisit: '2026-01-25', tier: 'vip' },
  { id: 7, name: 'Mona Khalil', phone: '+966 55 789 0123', email: 'mona@email.com', visitCount: 5, totalSpent: 680, favoriteServices: ["Men's Haircut"], nextAppointment: '2026-02-08 11:00 AM', lastVisit: '2026-01-18', tier: 'regular' },
  { id: 8, name: 'Nadia Farooq', phone: '+966 54 890 1234', email: 'nadia@email.com', visitCount: 12, totalSpent: 3_640, favoriteServices: ['Hot Stone Massage', 'Deep Tissue'], nextAppointment: null, lastVisit: '2026-01-10', tier: 'regular' },
  { id: 9, name: 'Salma Idris', phone: '+966 56 901 2345', email: 'salma@email.com', visitCount: 19, totalSpent: 7_600, favoriteServices: ['Keratin Treatment', 'Highlights'], nextAppointment: '2026-02-10 10:00 AM', lastVisit: '2026-01-22', tier: 'vip' },
  { id: 10, name: 'Yasmin Nabil', phone: '+966 59 012 3456', email: 'yasmin@email.com', visitCount: 2, totalSpent: 220, favoriteServices: ['Pedicure'], nextAppointment: '2026-02-10 2:00 PM', lastVisit: '2026-01-05', tier: 'new' },
  { id: 11, name: 'Noura Al-Dosari', phone: '+966 50 111 2222', email: 'noura@email.com', visitCount: 41, totalSpent: 9_350, favoriteServices: ['Blowout', 'Haircut & Style', 'Color'], nextAppointment: '2026-02-12 9:30 AM', lastVisit: '2026-02-03', tier: 'vip' },
  { id: 12, name: 'Lina Qasim', phone: '+966 55 333 4444', email: 'lina@email.com', visitCount: 1, totalSpent: 150, favoriteServices: ['Highlights'], nextAppointment: '2026-02-14 1:00 PM', lastVisit: '2026-01-31', tier: 'new' },
];

export default function ClientsPage() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | Client['tier']>('all');

  const filtered = CLIENTS.filter((c) => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === 'all' || c.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const columns: Column<Client>[] = [
    {
      key: 'name',
      header: 'Client',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-500 shrink-0">
            {row.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{row.name}</div>
            <div className="text-xs text-gray-400">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'phone',
      header: 'Phone',
      render: (row) => <span className="text-gray-600">{row.phone}</span>,
    },
    {
      key: 'tier',
      header: 'Tier',
      render: (row) => {
        const cfg = TIER_CONFIG[row.tier];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'visitCount',
      header: 'Visits',
      render: (row) => <span className="font-semibold">{row.visitCount}</span>,
    },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      render: (row) => <span className="font-semibold">SAR {row.totalSpent.toLocaleString()}</span>,
    },
    {
      key: 'favoriteServices',
      header: 'Favorite Services',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.favoriteServices.slice(0, 2).map((s) => (
            <span key={s} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{s}</span>
          ))}
          {row.favoriteServices.length > 2 && (
            <span className="text-xs text-gray-400">+{row.favoriteServices.length - 2}</span>
          )}
        </div>
      ),
    },
    {
      key: 'nextAppointment',
      header: 'Next Appointment',
      render: (row) =>
        row.nextAppointment ? (
          <span className="text-sm text-gray-700">{row.nextAppointment}</span>
        ) : (
          <span className="text-sm text-gray-400">None scheduled</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: () => (
        <Button variant="ghost" size="sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
          </svg>
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SearchInput placeholder="Search clients..." onSearch={setSearch} className="w-72" />
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'vip', label: 'VIP' },
              { key: 'regular', label: 'Regular' },
              { key: 'new', label: 'New' },
            ].map((f) => (
              <Button
                key={f.key}
                variant={tierFilter === f.key ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTierFilter(f.key as typeof tierFilter)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="primary" size="md">+ Add Client</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-gray-500">Total Clients</div>
          <div className="text-2xl font-bold mt-1">{CLIENTS.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">VIP Clients</div>
          <div className="text-2xl font-bold mt-1">{CLIENTS.filter((c) => c.tier === 'vip').length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">Avg. Spend</div>
          <div className="text-2xl font-bold mt-1">
            SAR {Math.round(CLIENTS.reduce((sum, c) => sum + c.totalSpent, 0) / CLIENTS.length).toLocaleString()}
          </div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500">New This Month</div>
          <div className="text-2xl font-bold mt-1">{CLIENTS.filter((c) => c.tier === 'new').length}</div>
        </Card>
      </div>

      {/* Client Table */}
      <Card padding={false}>
        <div className="p-1">
          <DataTable columns={columns} data={filtered} emptyMessage="No clients found" />
        </div>
      </Card>
    </div>
  );
}
