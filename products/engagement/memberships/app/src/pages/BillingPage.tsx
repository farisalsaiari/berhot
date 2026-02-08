import { useState } from 'react';
import { StatCard, Card, DataTable, Badge, Button, TabBar } from '@berhot/ui';
import type { Column, BadgeVariant } from '@berhot/ui';

type TransactionStatus = 'paid' | 'failed' | 'pending' | 'refunded';

interface Transaction {
  id: string;
  member: string;
  email: string;
  plan: string;
  amount: string;
  date: string;
  status: TransactionStatus;
}

const TRANSACTIONS: Transaction[] = [
  { id: 'TXN-001', member: 'Nadia Al-Rashid', email: 'nadia@example.com', plan: 'Pro', amount: 'SAR 99', date: 'Feb 7, 2026', status: 'paid' },
  { id: 'TXN-002', member: 'Tariq Hussain', email: 'tariq@example.com', plan: 'Basic', amount: 'SAR 49', date: 'Feb 7, 2026', status: 'paid' },
  { id: 'TXN-003', member: 'Rayan Khalil', email: 'rayan@example.com', plan: 'Pro', amount: 'SAR 99', date: 'Feb 6, 2026', status: 'failed' },
  { id: 'TXN-004', member: 'Mariam Zahir', email: 'mariam@example.com', plan: 'Enterprise', amount: 'SAR 199', date: 'Feb 6, 2026', status: 'paid' },
  { id: 'TXN-005', member: 'Huda Faisal', email: 'huda@example.com', plan: 'Basic', amount: 'SAR 49', date: 'Feb 5, 2026', status: 'paid' },
  { id: 'TXN-006', member: 'Dina Waleed', email: 'dina@example.com', plan: 'Pro', amount: 'SAR 99', date: 'Feb 5, 2026', status: 'failed' },
  { id: 'TXN-007', member: 'Salim Nasser', email: 'salim@example.com', plan: 'Pro', amount: 'SAR 99', date: 'Feb 4, 2026', status: 'paid' },
  { id: 'TXN-008', member: 'Amal Qadir', email: 'amal@example.com', plan: 'Basic', amount: 'SAR 49', date: 'Feb 4, 2026', status: 'refunded' },
  { id: 'TXN-009', member: 'Faris Majed', email: 'faris@example.com', plan: 'Enterprise', amount: 'SAR 199', date: 'Feb 3, 2026', status: 'paid' },
  { id: 'TXN-010', member: 'Zain Rashid', email: 'zain@example.com', plan: 'Basic', amount: 'SAR 49', date: 'Feb 3, 2026', status: 'pending' },
];

const STATUS_BADGE: Record<TransactionStatus, { variant: BadgeVariant; label: string }> = {
  paid: { variant: 'green', label: 'Paid' },
  failed: { variant: 'red', label: 'Failed' },
  pending: { variant: 'orange', label: 'Pending' },
  refunded: { variant: 'gray', label: 'Refunded' },
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'paid', label: 'Paid' },
  { key: 'failed', label: 'Failed' },
  { key: 'pending', label: 'Pending' },
  { key: 'refunded', label: 'Refunded' },
];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = TRANSACTIONS.filter((t) => activeTab === 'all' || t.status === activeTab);

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    count: t.key === 'all' ? TRANSACTIONS.length : TRANSACTIONS.filter((tx) => tx.status === t.key).length,
  }));

  const columns: Column<Transaction>[] = [
    {
      key: 'id',
      header: 'Transaction',
      render: (row) => <span className="font-mono text-xs text-gray-500">{row.id}</span>,
    },
    {
      key: 'member',
      header: 'Member',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.member}</div>
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
      key: 'amount',
      header: 'Amount',
      render: (row) => <span className="font-semibold text-gray-900">{row.amount}</span>,
    },
    { key: 'date', header: 'Date' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const cfg = STATUS_BADGE[row.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.status === 'failed' ? (
          <Button variant="secondary" size="sm">Retry</Button>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Monthly Recurring Revenue" value="SAR 89,400" sub="+12% vs last month" trend="up" />
        <StatCard label="Failed Payments" value="2" sub="SAR 198 outstanding" trend="down" />
        <StatCard label="Upcoming Renewals" value="145" sub="Next 7 days" trend="neutral" />
        <StatCard label="Avg Revenue/Member" value="SAR 81" sub="+5% vs last month" trend="up" />
      </div>

      {/* Transactions */}
      <Card padding={false}>
        <div className="px-5 pt-4 flex items-center justify-between">
          <div className="flex-1">
            <TabBar tabs={tabsWithCounts} activeKey={activeTab} onChange={setActiveTab} />
          </div>
          <div className="pb-2 ml-4">
            <Button variant="secondary" size="sm">Export</Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No transactions found" />
      </Card>
    </div>
  );
}
