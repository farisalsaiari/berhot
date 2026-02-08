import { StatCard, Card, Badge, DataTable } from '@berhot/ui';
import type { Column, BadgeVariant } from '@berhot/ui';

interface RecentSignup {
  id: string;
  name: string;
  email: string;
  plan: string;
  date: string;
  status: 'active' | 'trial';
}

const RECENT_SIGNUPS: RecentSignup[] = [
  { id: '1', name: 'Nadia Al-Rashid', email: 'nadia@example.com', plan: 'Pro', date: 'Feb 7, 2026', status: 'active' },
  { id: '2', name: 'Tariq Hussain', email: 'tariq@example.com', plan: 'Basic', date: 'Feb 6, 2026', status: 'trial' },
  { id: '3', name: 'Mariam Zahir', email: 'mariam@example.com', plan: 'Enterprise', date: 'Feb 6, 2026', status: 'active' },
  { id: '4', name: 'Rayan Khalil', email: 'rayan@example.com', plan: 'Pro', date: 'Feb 5, 2026', status: 'active' },
  { id: '5', name: 'Huda Faisal', email: 'huda@example.com', plan: 'Basic', date: 'Feb 5, 2026', status: 'trial' },
  { id: '6', name: 'Salim Nasser', email: 'salim@example.com', plan: 'Pro', date: 'Feb 4, 2026', status: 'active' },
];

const STATUS_BADGE: Record<RecentSignup['status'], { variant: BadgeVariant; label: string }> = {
  active: { variant: 'green', label: 'Active' },
  trial: { variant: 'blue', label: 'Trial' },
};

const columns: Column<RecentSignup>[] = [
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
    render: (row) => <span className="font-medium">{row.plan}</span>,
  },
  { key: 'date', header: 'Signed Up' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => {
      const cfg = STATUS_BADGE[row.status];
      return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
    },
  },
];

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard label="Total Members" value="1,248" sub="+32 this month" trend="up" />
        <StatCard label="Active" value="1,105" sub="88.5% of total" trend="up" />
        <StatCard label="Paused" value="87" sub="7.0% of total" trend="neutral" />
        <StatCard label="Cancelled" value="18" sub="This month" trend="down" />
        <StatCard label="Monthly Revenue" value="SAR 89,400" sub="+12% vs last month" trend="up" />
        <StatCard label="Churn Rate" value="1.4%" sub="-0.3% vs last month" trend="up" />
      </div>

      {/* Growth Chart Placeholder */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Membership Growth</h3>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">6 Months</button>
            <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-full">1 Year</button>
            <button className="px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 rounded-full">All Time</button>
          </div>
        </div>
        <div className="h-56 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-sm">Membership growth chart</div>
            <div className="text-gray-300 text-xs mt-1">Line chart showing active members over time</div>
          </div>
        </div>
      </Card>

      {/* Recent Signups */}
      <Card padding={false}>
        <div className="px-5 pt-4 pb-3">
          <h3 className="font-semibold text-gray-900">Recent Signups</h3>
        </div>
        <DataTable columns={columns} data={RECENT_SIGNUPS} emptyMessage="No recent signups" />
      </Card>
    </div>
  );
}
