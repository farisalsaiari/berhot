import { useState } from 'react';
import { Card, DataTable, Badge, Button, SearchInput, TabBar } from '@berhot/ui';
import type { Column, BadgeVariant } from '@berhot/ui';

type MemberStatus = 'active' | 'paused' | 'cancelled';

interface Member {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: MemberStatus;
  startDate: string;
  nextBilling: string;
  phone: string;
}

const MEMBERS: Member[] = [
  { id: '1', name: 'Nadia Al-Rashid', email: 'nadia@example.com', plan: 'Pro', status: 'active', startDate: 'Jan 15, 2025', nextBilling: 'Feb 15, 2026', phone: '+966 50 111 2222' },
  { id: '2', name: 'Tariq Hussain', email: 'tariq@example.com', plan: 'Basic', status: 'active', startDate: 'Mar 2, 2025', nextBilling: 'Mar 2, 2026', phone: '+966 50 222 3333' },
  { id: '3', name: 'Mariam Zahir', email: 'mariam@example.com', plan: 'Enterprise', status: 'active', startDate: 'Nov 10, 2024', nextBilling: 'Feb 10, 2026', phone: '+966 50 333 4444' },
  { id: '4', name: 'Rayan Khalil', email: 'rayan@example.com', plan: 'Pro', status: 'paused', startDate: 'Jun 20, 2025', nextBilling: 'Paused', phone: '+966 50 444 5555' },
  { id: '5', name: 'Huda Faisal', email: 'huda@example.com', plan: 'Basic', status: 'active', startDate: 'Sep 5, 2025', nextBilling: 'Mar 5, 2026', phone: '+966 50 555 6666' },
  { id: '6', name: 'Salim Nasser', email: 'salim@example.com', plan: 'Pro', status: 'active', startDate: 'Dec 1, 2025', nextBilling: 'Mar 1, 2026', phone: '+966 50 666 7777' },
  { id: '7', name: 'Amal Qadir', email: 'amal@example.com', plan: 'Basic', status: 'cancelled', startDate: 'Apr 12, 2025', nextBilling: '-', phone: '+966 50 777 8888' },
  { id: '8', name: 'Faris Majed', email: 'faris@example.com', plan: 'Enterprise', status: 'active', startDate: 'Aug 22, 2025', nextBilling: 'Feb 22, 2026', phone: '+966 50 888 9999' },
  { id: '9', name: 'Dina Waleed', email: 'dina@example.com', plan: 'Pro', status: 'paused', startDate: 'Jul 8, 2025', nextBilling: 'Paused', phone: '+966 50 999 0000' },
  { id: '10', name: 'Zain Rashid', email: 'zain@example.com', plan: 'Basic', status: 'cancelled', startDate: 'Feb 14, 2025', nextBilling: '-', phone: '+966 50 000 1111' },
];

const STATUS_BADGE: Record<MemberStatus, { variant: BadgeVariant; label: string }> = {
  active: { variant: 'green', label: 'Active' },
  paused: { variant: 'orange', label: 'Paused' },
  cancelled: { variant: 'red', label: 'Cancelled' },
};

const PLAN_TABS = [
  { key: 'all', label: 'All Plans' },
  { key: 'Basic', label: 'Basic' },
  { key: 'Pro', label: 'Pro' },
  { key: 'Enterprise', label: 'Enterprise' },
];

export default function MembersPage() {
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('all');

  const filtered = MEMBERS
    .filter((m) => planFilter === 'all' || m.plan === planFilter)
    .filter(
      (m) =>
        search === '' ||
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase()),
    );

  const tabsWithCounts = PLAN_TABS.map((t) => ({
    ...t,
    count: t.key === 'all' ? MEMBERS.length : MEMBERS.filter((m) => m.plan === t.key).length,
  }));

  const columns: Column<Member>[] = [
    {
      key: 'name',
      header: 'Member',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-400">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'plan',
      header: 'Plan',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-gray-100 text-gray-700">
          {row.plan}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const cfg = STATUS_BADGE[row.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    { key: 'startDate', header: 'Start Date' },
    {
      key: 'nextBilling',
      header: 'Next Billing',
      render: (row) => (
        <span className={row.nextBilling === 'Paused' || row.nextBilling === '-' ? 'text-gray-400' : 'text-gray-700'}>
          {row.nextBilling}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: () => (
        <Button variant="ghost" size="sm">View</Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Card padding={false}>
        <div className="px-5 pt-4 flex items-center justify-between">
          <div className="flex-1">
            <TabBar tabs={tabsWithCounts} activeKey={planFilter} onChange={setPlanFilter} />
          </div>
          <div className="flex items-center gap-3 ml-4 pb-2">
            <SearchInput placeholder="Search members..." onSearch={setSearch} className="w-64" />
            <Button variant="primary" size="sm">+ Add Member</Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No members found" />
      </Card>
    </div>
  );
}
