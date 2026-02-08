import { Card, Badge, Button } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  activeMembers: number;
  revenue: string;
  color: BadgeVariant;
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: '1',
    name: 'Basic',
    price: 49,
    interval: 'month',
    features: [
      'Access to main facilities',
      'Standard operating hours',
      'Email support',
      'Basic reporting',
      '1 user seat',
    ],
    activeMembers: 420,
    revenue: 'SAR 20,580',
    color: 'gray',
  },
  {
    id: '2',
    name: 'Pro',
    price: 99,
    interval: 'month',
    features: [
      'All Basic features',
      'Extended operating hours',
      'Priority support',
      'Advanced analytics',
      'Up to 5 user seats',
      'API access',
    ],
    activeMembers: 530,
    revenue: 'SAR 52,470',
    color: 'blue',
    popular: true,
  },
  {
    id: '3',
    name: 'Enterprise',
    price: 199,
    interval: 'month',
    features: [
      'All Pro features',
      '24/7 facility access',
      'Dedicated account manager',
      'Custom integrations',
      'Unlimited user seats',
      'SLA guarantee',
      'White-label options',
    ],
    activeMembers: 155,
    revenue: 'SAR 30,845',
    color: 'purple',
  },
];

export default function PlansPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Membership Plans</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your pricing plans and features</p>
        </div>
        <Button variant="primary" size="md">+ Create Plan</Button>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={plan.popular ? 'ring-2 ring-blue-500 relative' : ''}>
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="blue">Most Popular</Badge>
              </div>
            )}

            <div className="text-center mb-6">
              <Badge variant={plan.color} className="mb-3">{plan.name}</Badge>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">SAR {plan.price}</span>
                <span className="text-gray-500 text-sm">/{plan.interval}</span>
              </div>
            </div>

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-green-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-gray-100 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Active Members</span>
                <span className="font-semibold text-gray-900">{plan.activeMembers}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Monthly Revenue</span>
                <span className="font-semibold text-gray-900">{plan.revenue}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <Button variant="secondary" size="sm" className="flex-1">Edit Plan</Button>
              <Button variant="ghost" size="sm">Archive</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
