import { useState } from 'react';
import { Card, Badge, Button, TabBar, StatCard } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

interface Campaign {
  id: number;
  name: string;
  type: 'bonus_points' | 'double_points' | 'refer_a_friend';
  status: 'active' | 'scheduled' | 'completed';
  startDate: string;
  endDate: string;
  description: string;
  participants: number;
  pointsAwarded: number;
  conversionRate: number;
  target: string;
}

const TYPE_CONFIG: Record<Campaign['type'], { label: string; variant: BadgeVariant }> = {
  bonus_points: { label: 'Bonus Points', variant: 'green' },
  double_points: { label: 'Double Points', variant: 'blue' },
  refer_a_friend: { label: 'Refer-a-Friend', variant: 'purple' },
};

const STATUS_CONFIG: Record<Campaign['status'], { label: string; variant: BadgeVariant }> = {
  active: { label: 'Active', variant: 'green' },
  scheduled: { label: 'Scheduled', variant: 'orange' },
  completed: { label: 'Completed', variant: 'gray' },
};

const CAMPAIGNS: Campaign[] = [
  {
    id: 1,
    name: 'February Double Points',
    type: 'double_points',
    status: 'active',
    startDate: '2026-02-01',
    endDate: '2026-02-28',
    description: 'Earn double points on all purchases throughout February. Applies to all tier levels.',
    participants: 1_247,
    pointsAwarded: 156_000,
    conversionRate: 42,
    target: 'All members',
  },
  {
    id: 2,
    name: 'Refer & Earn 500',
    type: 'refer_a_friend',
    status: 'active',
    startDate: '2026-01-15',
    endDate: '2026-03-15',
    description: 'Refer a friend and both of you earn 500 bonus points when they make their first purchase.',
    participants: 234,
    pointsAwarded: 58_500,
    conversionRate: 28,
    target: 'Silver+ members',
  },
  {
    id: 3,
    name: 'Weekend Warriors',
    type: 'bonus_points',
    status: 'active',
    startDate: '2026-02-05',
    endDate: '2026-02-28',
    description: 'Earn 200 bonus points on any weekend purchase over SAR 100.',
    participants: 456,
    pointsAwarded: 91_200,
    conversionRate: 35,
    target: 'All members',
  },
  {
    id: 4,
    name: 'Spring Collection Launch',
    type: 'double_points',
    status: 'scheduled',
    startDate: '2026-03-01',
    endDate: '2026-03-14',
    description: 'Double points on all new Spring collection items during the launch period.',
    participants: 0,
    pointsAwarded: 0,
    conversionRate: 0,
    target: 'All members',
  },
  {
    id: 5,
    name: 'Ramadan Special',
    type: 'bonus_points',
    status: 'scheduled',
    startDate: '2026-03-10',
    endDate: '2026-04-09',
    description: 'Triple points on all purchases during the blessed month. Additional 1000 bonus points for Gold and Platinum members.',
    participants: 0,
    pointsAwarded: 0,
    conversionRate: 0,
    target: 'All members',
  },
  {
    id: 6,
    name: 'Gold Member Referral Sprint',
    type: 'refer_a_friend',
    status: 'scheduled',
    startDate: '2026-03-15',
    endDate: '2026-04-15',
    description: 'Exclusive referral campaign for Gold and Platinum members. Earn 1000 points per referral.',
    participants: 0,
    pointsAwarded: 0,
    conversionRate: 0,
    target: 'Gold+ members',
  },
  {
    id: 7,
    name: 'January Welcome Bonus',
    type: 'bonus_points',
    status: 'completed',
    startDate: '2026-01-01',
    endDate: '2026-01-31',
    description: 'New members who joined in January received 100 bonus welcome points.',
    participants: 124,
    pointsAwarded: 12_400,
    conversionRate: 78,
    target: 'New members',
  },
  {
    id: 8,
    name: 'Holiday Season Double',
    type: 'double_points',
    status: 'completed',
    startDate: '2025-12-15',
    endDate: '2025-12-31',
    description: 'Double points on all purchases during the holiday season.',
    participants: 2_150,
    pointsAwarded: 430_000,
    conversionRate: 61,
    target: 'All members',
  },
  {
    id: 9,
    name: 'New Year Refer-a-Friend',
    type: 'refer_a_friend',
    status: 'completed',
    startDate: '2025-12-20',
    endDate: '2026-01-15',
    description: 'Start the year right by referring friends. Both parties earned 300 bonus points.',
    participants: 187,
    pointsAwarded: 56_100,
    conversionRate: 31,
    target: 'All members',
  },
];

const TABS = [
  { key: 'active', label: 'Active', count: CAMPAIGNS.filter((c) => c.status === 'active').length },
  { key: 'scheduled', label: 'Scheduled', count: CAMPAIGNS.filter((c) => c.status === 'scheduled').length },
  { key: 'completed', label: 'Completed', count: CAMPAIGNS.filter((c) => c.status === 'completed').length },
];

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState('active');

  const filtered = CAMPAIGNS.filter((c) => c.status === activeTab);

  const totalActiveParticipants = CAMPAIGNS.filter((c) => c.status === 'active').reduce((sum, c) => sum + c.participants, 0);
  const totalPointsAwarded = CAMPAIGNS.filter((c) => c.status === 'active').reduce((sum, c) => sum + c.pointsAwarded, 0);
  const avgConversion = Math.round(
    CAMPAIGNS.filter((c) => c.status === 'active').reduce((sum, c) => sum + c.conversionRate, 0) / CAMPAIGNS.filter((c) => c.status === 'active').length
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Active Campaigns" value={CAMPAIGNS.filter((c) => c.status === 'active').length} sub="Running now" trend="neutral" />
        <StatCard label="Total Participants" value={totalActiveParticipants.toLocaleString()} sub="In active campaigns" trend="up" />
        <StatCard label="Points Awarded" value={`${(totalPointsAwarded / 1000).toFixed(0)}K`} sub="This period" trend="up" />
        <StatCard label="Avg. Conversion" value={`${avgConversion}%`} sub="Across active campaigns" trend="up" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <TabBar tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />
        <Button variant="primary" size="md">+ Create Campaign</Button>
      </div>

      {/* Campaign Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filtered.map((campaign) => {
          const typeCfg = TYPE_CONFIG[campaign.type];
          const statusCfg = STATUS_CONFIG[campaign.status];

          return (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start gap-6">
                {/* Left content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={typeCfg.variant}>{typeCfg.label}</Badge>
                    <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                    <span className="text-xs text-gray-400 ml-2">{campaign.target}</span>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{campaign.name}</h3>
                  <p className="text-sm text-gray-500 mb-3">{campaign.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>{campaign.startDate} to {campaign.endDate}</span>
                    </div>
                  </div>
                </div>

                {/* Right metrics */}
                <div className="shrink-0 w-64 space-y-3 pl-6 border-l border-gray-200">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Participants</span>
                    <span className="text-sm font-bold text-gray-900">{campaign.participants.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Points Awarded</span>
                    <span className="text-sm font-bold text-gray-900">{campaign.pointsAwarded.toLocaleString()}</span>
                  </div>
                  {campaign.status !== 'scheduled' && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Conversion Rate</span>
                      <span className={`text-sm font-bold ${campaign.conversionRate >= 40 ? 'text-green-600' : campaign.conversionRate >= 25 ? 'text-orange-600' : 'text-gray-600'}`}>
                        {campaign.conversionRate}%
                      </span>
                    </div>
                  )}

                  <div className="pt-2 flex gap-1">
                    {campaign.status === 'active' && (
                      <Button variant="secondary" size="sm" className="flex-1">Pause</Button>
                    )}
                    {campaign.status === 'scheduled' && (
                      <Button variant="primary" size="sm" className="flex-1">Launch Now</Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                      </svg>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
