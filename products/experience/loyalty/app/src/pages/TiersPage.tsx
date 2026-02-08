import { Card, Badge, Button, ProgressBar } from '@berhot/ui';

interface Tier {
  id: number;
  name: string;
  pointsThreshold: number;
  benefits: string[];
  memberCount: number;
  color: string;
  bgColor: string;
  borderColor: string;
  badgeColor: string;
  icon: string;
}

const TIERS: Tier[] = [
  {
    id: 1,
    name: 'Bronze',
    pointsThreshold: 0,
    benefits: [
      'Earn 1 point per SAR spent',
      'Birthday bonus (50 points)',
      'Access to basic rewards catalog',
      'Monthly newsletter with offers',
    ],
    memberCount: 1_842,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    badgeColor: 'bg-amber-600',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    id: 2,
    name: 'Silver',
    pointsThreshold: 2_000,
    benefits: [
      'Earn 1.5x points per SAR spent',
      'Birthday bonus (150 points)',
      'Early access to sales events',
      'Free gift wrapping',
      'Priority customer support',
    ],
    memberCount: 1_056,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    badgeColor: 'bg-gray-400',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
  {
    id: 3,
    name: 'Gold',
    pointsThreshold: 5_000,
    benefits: [
      'Earn 2x points per SAR spent',
      'Birthday bonus (300 points)',
      'Exclusive Gold member events',
      'Free shipping on all orders',
      'Complimentary annual service',
      'Dedicated account manager',
    ],
    memberCount: 498,
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    badgeColor: 'bg-yellow-500',
    icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  },
  {
    id: 4,
    name: 'Platinum',
    pointsThreshold: 10_000,
    benefits: [
      'Earn 3x points per SAR spent',
      'Birthday bonus (500 points)',
      'VIP lounge access at events',
      'Free shipping and priority delivery',
      'Complimentary quarterly services',
      'Personal concierge service',
      'Exclusive partner brand discounts',
      'Annual appreciation gift',
    ],
    memberCount: 142,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    badgeColor: 'bg-purple-600',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  },
];

const totalMembers = TIERS.reduce((sum, t) => sum + t.memberCount, 0);

export default function TiersPage() {
  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Tier Structure</h2>
            <p className="text-sm text-gray-500 mt-1">
              {totalMembers.toLocaleString()} total members across {TIERS.length} tiers
            </p>
          </div>
          <Button variant="primary" size="md">+ Add Tier</Button>
        </div>

        {/* Visual tier progression */}
        <div className="mt-6 flex items-center gap-2">
          {TIERS.map((tier, i) => (
            <div key={tier.id} className="flex items-center gap-2 flex-1">
              <div className={`flex-1 h-2 rounded-full ${tier.badgeColor}`} />
              {i < TIERS.length - 1 && (
                <svg className="w-4 h-4 text-gray-300 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 5l7 7-7 7" />
                </svg>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          {TIERS.map((tier) => (
            <div key={tier.id} className="flex-1 text-center">
              <span className={`text-xs font-semibold ${tier.color}`}>{tier.name}</span>
              <span className="text-xs text-gray-400 ml-1">({tier.pointsThreshold.toLocaleString()}+ pts)</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tier Cards */}
      <div className="grid grid-cols-2 gap-6">
        {TIERS.map((tier) => {
          const memberPct = Math.round((tier.memberCount / totalMembers) * 100);

          return (
            <Card key={tier.id} className={`${tier.bgColor} border ${tier.borderColor}`}>
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${tier.badgeColor} rounded-lg flex items-center justify-center`}>
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={tier.icon} />
                    </svg>
                  </div>
                  <div>
                    <h3 className={`text-lg font-bold ${tier.color}`}>{tier.name}</h3>
                    <div className="text-sm text-gray-500">
                      {tier.pointsThreshold === 0
                        ? 'Starting tier'
                        : `${tier.pointsThreshold.toLocaleString()}+ points required`}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </Button>
              </div>

              {/* Member Count */}
              <div className="mb-4 p-3 bg-white/60 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Members</span>
                  <span className="text-sm font-bold text-gray-900">{tier.memberCount.toLocaleString()} ({memberPct}%)</span>
                </div>
                <ProgressBar value={memberPct} color={tier.badgeColor} />
              </div>

              {/* Benefits */}
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Benefits</div>
                <ul className="space-y-1.5">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <svg className={`w-4 h-4 mt-0.5 shrink-0 ${tier.color}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
