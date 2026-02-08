import { StatCard, Card, Badge, DataTable, Button } from '@berhot/ui';
import type { BadgeVariant, Column } from '@berhot/ui';

type CampaignStatus = 'active' | 'completed' | 'draft';

interface RecentCampaign {
  id: string;
  name: string;
  type: string;
  status: CampaignStatus;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
}

const CAMPAIGNS: RecentCampaign[] = [
  { id: 'C001', name: 'Ramadan Special Offers', type: 'Email', status: 'active', sent: 12500, opened: 4200, clicked: 1800, converted: 340 },
  { id: 'C002', name: 'Weekend Brunch Promo', type: 'SMS', status: 'active', sent: 5800, opened: 5100, clicked: 2100, converted: 580 },
  { id: 'C003', name: 'New Menu Launch', type: 'Email', status: 'active', sent: 8900, opened: 3100, clicked: 1200, converted: 210 },
  { id: 'C004', name: 'Loyalty Points Reminder', type: 'Push', status: 'completed', sent: 15000, opened: 6200, clicked: 2800, converted: 950 },
  { id: 'C005', name: 'Valentine Dinner', type: 'Email', status: 'completed', sent: 7200, opened: 2800, clicked: 1100, converted: 280 },
];

const STATUS_BADGE: Record<CampaignStatus, { variant: BadgeVariant; label: string }> = {
  active: { variant: 'green', label: 'Active' },
  completed: { variant: 'blue', label: 'Completed' },
  draft: { variant: 'gray', label: 'Draft' },
};

export default function DashboardPage() {
  const columns: Column<RecentCampaign>[] = [
    {
      key: 'name',
      header: 'Campaign',
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-400">{row.type}</div>
        </div>
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
    {
      key: 'sent',
      header: 'Sent',
      render: (row) => <span className="text-gray-700">{row.sent.toLocaleString()}</span>,
    },
    {
      key: 'opened',
      header: 'Opened',
      render: (row) => (
        <div>
          <span className="text-gray-700">{row.opened.toLocaleString()}</span>
          <span className="text-xs text-gray-400 ml-1">({((row.opened / row.sent) * 100).toFixed(1)}%)</span>
        </div>
      ),
    },
    {
      key: 'clicked',
      header: 'Clicked',
      render: (row) => (
        <div>
          <span className="text-gray-700">{row.clicked.toLocaleString()}</span>
          <span className="text-xs text-gray-400 ml-1">({((row.clicked / row.sent) * 100).toFixed(1)}%)</span>
        </div>
      ),
    },
    {
      key: 'converted',
      header: 'Converted',
      render: (row) => (
        <span className="font-semibold text-green-700">{row.converted.toLocaleString()}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Campaigns Active" value={3} sub="+1 launched this week" trend="up" />
        <StatCard label="Total Reach" value="27.2K" sub="Across all channels" trend="up" />
        <StatCard label="Open Rate" value="38.4%" sub="+5.2% vs last month" trend="up" />
        <StatCard label="Conversion Rate" value="4.7%" sub="Above industry avg" trend="up" />
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3">
        <Button variant="primary">Create Campaign</Button>
        <Button variant="secondary">Send Quick SMS</Button>
        <Button variant="secondary">Schedule Email</Button>
      </div>

      {/* Recent Campaigns */}
      <Card padding={false}>
        <div className="px-5 pt-4 pb-2 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Recent Campaign Performance</h2>
            <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
          </div>
          <Button variant="ghost" size="sm">View All</Button>
        </div>
        <DataTable columns={columns} data={CAMPAIGNS} emptyMessage="No campaigns yet" />
      </Card>
    </div>
  );
}
