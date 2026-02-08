import { useState } from 'react';
import { Card, Badge, Button, SearchInput, DataTable } from '@berhot/ui';
import type { BadgeVariant, Column } from '@berhot/ui';

interface Member {
  id: number;
  name: string;
  email: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  pointsBalance: number;
  joinDate: string;
  lastActivity: string;
  totalSpent: number;
  phone: string;
}

const TIER_CONFIG: Record<Member['tier'], { label: string; variant: BadgeVariant; color: string }> = {
  bronze: { label: 'Bronze', variant: 'orange', color: 'text-amber-700 bg-amber-50' },
  silver: { label: 'Silver', variant: 'gray', color: 'text-gray-600 bg-gray-100' },
  gold: { label: 'Gold', variant: 'orange', color: 'text-yellow-700 bg-yellow-50' },
  platinum: { label: 'Platinum', variant: 'purple', color: 'text-purple-700 bg-purple-50' },
};

const MEMBERS: Member[] = [
  { id: 1, name: 'Fatima Al-Rashid', email: 'fatima@email.com', tier: 'platinum', pointsBalance: 12_450, joinDate: '2024-03-15', lastActivity: '2026-02-07', totalSpent: 28_500, phone: '+966 50 123 4567' },
  { id: 2, name: 'Omar Ibrahim', email: 'omar@email.com', tier: 'gold', pointsBalance: 8_200, joinDate: '2024-06-20', lastActivity: '2026-02-06', totalSpent: 18_900, phone: '+966 54 555 6666' },
  { id: 3, name: 'Layla Mahmoud', email: 'layla@email.com', tier: 'gold', pointsBalance: 6_740, joinDate: '2024-08-10', lastActivity: '2026-02-05', totalSpent: 15_300, phone: '+966 55 234 5678' },
  { id: 4, name: 'Khalid Nasser', email: 'khalid@email.com', tier: 'silver', pointsBalance: 3_100, joinDate: '2025-01-05', lastActivity: '2026-02-07', totalSpent: 7_600, phone: '+966 59 999 0000' },
  { id: 5, name: 'Nora Al-Qahtani', email: 'nora@email.com', tier: 'gold', pointsBalance: 7_850, joinDate: '2024-04-22', lastActivity: '2026-02-04', totalSpent: 16_200, phone: '+966 56 777 8888' },
  { id: 6, name: 'Dina Saeed', email: 'dina@email.com', tier: 'platinum', pointsBalance: 15_600, joinDate: '2024-01-10', lastActivity: '2026-02-07', totalSpent: 35_100, phone: '+966 50 678 9012' },
  { id: 7, name: 'Hana Yusuf', email: 'hana@email.com', tier: 'bronze', pointsBalance: 450, joinDate: '2025-12-01', lastActivity: '2026-02-03', totalSpent: 1_200, phone: '+966 54 345 6789' },
  { id: 8, name: 'Salma Idris', email: 'salma@email.com', tier: 'silver', pointsBalance: 2_800, joinDate: '2025-04-15', lastActivity: '2026-02-06', totalSpent: 6_400, phone: '+966 56 901 2345' },
  { id: 9, name: 'Amira Hassan', email: 'amira@email.com', tier: 'bronze', pointsBalance: 180, joinDate: '2026-01-20', lastActivity: '2026-02-01', totalSpent: 580, phone: '+966 59 567 8901' },
  { id: 10, name: 'Reem Abdullah', email: 'reem@email.com', tier: 'silver', pointsBalance: 4_200, joinDate: '2025-02-28', lastActivity: '2026-02-05', totalSpent: 9_100, phone: '+966 56 456 7890' },
  { id: 11, name: 'Yasmin Nabil', email: 'yasmin@email.com', tier: 'bronze', pointsBalance: 320, joinDate: '2026-01-05', lastActivity: '2026-01-30', totalSpent: 900, phone: '+966 59 012 3456' },
  { id: 12, name: 'Noura Al-Dosari', email: 'noura@email.com', tier: 'gold', pointsBalance: 9_100, joinDate: '2024-05-18', lastActivity: '2026-02-07', totalSpent: 21_400, phone: '+966 50 111 2222' },
  { id: 13, name: 'Lina Qasim', email: 'lina@email.com', tier: 'bronze', pointsBalance: 75, joinDate: '2026-01-31', lastActivity: '2026-01-31', totalSpent: 150, phone: '+966 55 333 4444' },
  { id: 14, name: 'Mariam Al-Subaie', email: 'mariam@email.com', tier: 'silver', pointsBalance: 3_500, joinDate: '2025-06-10', lastActivity: '2026-02-02', totalSpent: 8_200, phone: '+966 50 222 3333' },
  { id: 15, name: 'Sara Hassan', email: 'sara@email.com', tier: 'platinum', pointsBalance: 18_200, joinDate: '2023-11-01', lastActivity: '2026-02-07', totalSpent: 42_700, phone: '+966 55 444 5555' },
];

const TIER_FILTERS = [
  { key: 'all', label: 'All Tiers' },
  { key: 'platinum', label: 'Platinum' },
  { key: 'gold', label: 'Gold' },
  { key: 'silver', label: 'Silver' },
  { key: 'bronze', label: 'Bronze' },
];

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('all');

  const filtered = MEMBERS.filter((m) => {
    const matchSearch = !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    const matchTier = tierFilter === 'all' || m.tier === tierFilter;
    return matchSearch && matchTier;
  });

  const columns: Column<Member>[] = [
    {
      key: 'name',
      header: 'Member',
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
      key: 'tier',
      header: 'Tier',
      render: (row) => {
        const cfg = TIER_CONFIG[row.tier];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'pointsBalance',
      header: 'Points Balance',
      render: (row) => (
        <span className="font-semibold text-gray-900">{row.pointsBalance.toLocaleString()}</span>
      ),
    },
    {
      key: 'totalSpent',
      header: 'Total Spent',
      render: (row) => (
        <span className="text-gray-700">SAR {row.totalSpent.toLocaleString()}</span>
      ),
    },
    {
      key: 'joinDate',
      header: 'Join Date',
      render: (row) => <span className="text-gray-600">{row.joinDate}</span>,
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      render: (row) => {
        const isRecent = row.lastActivity >= '2026-02-05';
        return (
          <span className={isRecent ? 'text-green-600 font-medium' : 'text-gray-500'}>
            {row.lastActivity}
          </span>
        );
      },
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
          <SearchInput placeholder="Search members..." onSearch={setSearch} className="w-72" />
          <div className="flex gap-1">
            {TIER_FILTERS.map((f) => (
              <Button
                key={f.key}
                variant={tierFilter === f.key ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setTierFilter(f.key)}
              >
                {f.label}
              </Button>
            ))}
          </div>
        </div>
        <Button variant="primary" size="md">+ Add Member</Button>
      </div>

      {/* Member Table */}
      <Card padding={false}>
        <div className="p-1">
          <DataTable columns={columns} data={filtered} emptyMessage="No members found" />
        </div>
      </Card>
    </div>
  );
}
