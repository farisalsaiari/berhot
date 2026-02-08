import { StatCard, Card, Badge } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

interface ActivityItem {
  id: number;
  member: string;
  action: string;
  detail: string;
  points: number;
  type: 'earned' | 'redeemed' | 'joined';
  time: string;
}

const ACTIVITY: ActivityItem[] = [
  { id: 1, member: 'Fatima Al-Rashid', action: 'Earned points', detail: 'Purchase at Main Branch', points: 150, type: 'earned', time: '5 min ago' },
  { id: 2, member: 'Omar Ibrahim', action: 'Redeemed reward', detail: '20% Discount Coupon', points: -500, type: 'redeemed', time: '12 min ago' },
  { id: 3, member: 'Layla Mahmoud', action: 'Earned points', detail: 'Referral bonus', points: 300, type: 'earned', time: '28 min ago' },
  { id: 4, member: 'Salma Idris', action: 'Joined program', detail: 'Bronze tier', points: 50, type: 'joined', time: '1 hr ago' },
  { id: 5, member: 'Khalid Nasser', action: 'Redeemed reward', detail: 'Free Coffee', points: -200, type: 'redeemed', time: '1 hr ago' },
  { id: 6, member: 'Nora Al-Qahtani', action: 'Tier upgrade', detail: 'Silver to Gold', points: 0, type: 'earned', time: '2 hr ago' },
  { id: 7, member: 'Dina Saeed', action: 'Earned points', detail: 'Double points campaign', points: 400, type: 'earned', time: '2 hr ago' },
  { id: 8, member: 'Hana Yusuf', action: 'Joined program', detail: 'Bronze tier', points: 50, type: 'joined', time: '3 hr ago' },
  { id: 9, member: 'Amira Hassan', action: 'Redeemed reward', detail: 'SAR 50 Gift Card', points: -1000, type: 'redeemed', time: '4 hr ago' },
  { id: 10, member: 'Reem Abdullah', action: 'Earned points', detail: 'Birthday bonus', points: 500, type: 'earned', time: '5 hr ago' },
];

const ACTIVITY_BADGE: Record<ActivityItem['type'], { variant: BadgeVariant; label: string }> = {
  earned: { variant: 'green', label: 'Earned' },
  redeemed: { variant: 'blue', label: 'Redeemed' },
  joined: { variant: 'purple', label: 'Joined' },
};

interface TierDistribution {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

const TIER_DISTRIBUTION: TierDistribution[] = [
  { name: 'Bronze', count: 1_842, percentage: 52, color: 'bg-amber-600' },
  { name: 'Silver', count: 1_056, percentage: 30, color: 'bg-gray-400' },
  { name: 'Gold', count: 498, percentage: 14, color: 'bg-yellow-500' },
  { name: 'Platinum', count: 142, percentage: 4, color: 'bg-purple-600' },
];

export default function OverviewPage() {
  const totalMembers = 3_538;
  const activeMembers = 2_847;
  const pointsIssued = 1_245_000;
  const pointsRedeemed = 487_300;
  const redemptionRate = Math.round((pointsRedeemed / pointsIssued) * 100);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard label="Total Members" value={totalMembers.toLocaleString()} sub="+124 this month" trend="up" />
        <StatCard label="Active Members" value={activeMembers.toLocaleString()} sub={`${Math.round((activeMembers / totalMembers) * 100)}% of total`} trend="up" />
        <StatCard label="Points Issued" value={`${(pointsIssued / 1000).toFixed(0)}K`} sub="This month" trend="up" />
        <StatCard label="Points Redeemed" value={`${(pointsRedeemed / 1000).toFixed(0)}K`} sub="This month" trend="up" />
        <StatCard label="Redemption Rate" value={`${redemptionRate}%`} sub="+3% vs last month" trend="up" />
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Tier Distribution</h2>

          {/* Bar chart placeholder */}
          <div className="flex items-end gap-6 h-40 mb-6 px-4">
            {TIER_DISTRIBUTION.map((tier) => (
              <div key={tier.name} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-sm font-bold text-gray-700">{tier.count.toLocaleString()}</span>
                <div className="w-full rounded-t-lg relative" style={{ height: `${tier.percentage * 2.5}px` }}>
                  <div className={`w-full h-full ${tier.color} rounded-t-lg`} />
                </div>
                <span className="text-xs font-medium text-gray-500">{tier.name}</span>
              </div>
            ))}
          </div>

          {/* Tier breakdown */}
          <div className="space-y-3">
            {TIER_DISTRIBUTION.map((tier) => (
              <div key={tier.name} className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                <span className="text-sm text-gray-600 flex-1">{tier.name}</span>
                <span className="text-sm font-semibold text-gray-900">{tier.count.toLocaleString()}</span>
                <span className="text-sm text-gray-400 w-10 text-right">{tier.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card padding={false}>
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-base font-semibold text-gray-900">Recent Activity</h2>
          </div>

          <div className="divide-y divide-gray-100">
            {ACTIVITY.map((item) => {
              const badgeCfg = ACTIVITY_BADGE[item.type];
              return (
                <div key={item.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                    {item.member.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">{item.member}</span>
                      <Badge variant={badgeCfg.variant}>{badgeCfg.label}</Badge>
                    </div>
                    <div className="text-xs text-gray-400 truncate">{item.action} - {item.detail}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-sm font-semibold ${item.points > 0 ? 'text-green-600' : item.points < 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                      {item.points > 0 ? '+' : ''}{item.points !== 0 ? item.points.toLocaleString() : '--'} pts
                    </div>
                    <div className="text-xs text-gray-400">{item.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
