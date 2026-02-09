import { useState, useEffect } from 'react';
import { useTranslation } from '@berhot/i18n';
import { fetchMyTenant, updateMyPlan } from '../lib/api';

interface Tier {
  key: string;
  name: string;
  price: { monthly: string; yearly: string };
  description: string;
  features: string[];
  highlighted: boolean;
  badge?: string;
}

const tiers: Tier[] = [
  {
    key: 'starter',
    name: 'Starter',
    price: { monthly: '$29', yearly: '$24' },
    description: 'Perfect for small businesses just getting started.',
    features: [
      'Up to 3 products included',
      '1 location',
      '2 team members',
      'Basic analytics',
      'Email support',
      'Community access',
    ],
    highlighted: false,
  },
  {
    key: 'professional',
    name: 'Professional',
    price: { monthly: '$79', yearly: '$66' },
    description: 'For growing businesses that need the full platform.',
    features: [
      'All 23 products included',
      'Up to 5 locations',
      'Unlimited team members',
      'Advanced analytics & reports',
      'Priority support (chat & phone)',
      'API access',
      'Custom integrations',
      'White-label options',
    ],
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    key: 'enterprise',
    name: 'Enterprise',
    price: { monthly: 'Custom', yearly: 'Custom' },
    description: 'For large organizations with custom requirements.',
    features: [
      'All 23 products included',
      'Unlimited locations',
      'Unlimited team members',
      'Custom analytics & BI',
      'Dedicated account manager',
      'SLA guarantee (99.99%)',
      'Custom development',
      'On-premise deployment',
      'SSO & advanced security',
      'Training & onboarding',
    ],
    highlighted: false,
  },
];

const planOrder = ['free', 'starter', 'professional', 'enterprise'];

export default function UpgradePlanPage() {
  const { t } = useTranslation();
  const [annual, setAnnual] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMyTenant()
      .then((tenant) => {
        setCurrentPlan(tenant.plan || 'free');
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChangePlan = async (plan: string) => {
    if (plan === currentPlan) return;
    const tierName = plan.charAt(0).toUpperCase() + plan.slice(1);
    if (!confirm(t('plan.confirmUpgrade').replace('{{plan}}', tierName))) return;

    setUpdating(plan);
    setMessage('');
    try {
      await updateMyPlan(plan);
      setCurrentPlan(plan);
      setMessage(t('plan.planUpdated'));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update plan');
    } finally {
      setUpdating('');
    }
  };

  const currentIdx = planOrder.indexOf(currentPlan);

  const getButtonLabel = (tierKey: string): string => {
    if (tierKey === currentPlan) return t('plan.currentBadge');
    if (tierKey === 'enterprise') return t('plan.contactSales');
    const tierIdx = planOrder.indexOf(tierKey);
    return tierIdx > currentIdx ? t('plan.upgrade') : t('plan.downgrade');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">{t('titles.upgradePlan')}</h1>
        <p className="text-sm text-gray-500 mt-2">
          {t('plan.currentPlan')}: <span className="font-semibold text-gray-900">{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</span>
        </p>

        {/* Success message */}
        {message && (
          <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-green-700">{message}</span>
          </div>
        )}

        {/* Billing toggle */}
        <div className="mt-6 inline-flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
              !annual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('plan.monthly')}
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
              annual ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('plan.annual')}
            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
              {t('plan.save20')}
            </span>
          </button>
        </div>
      </div>

      {/* Tier cards */}
      <div className="grid md:grid-cols-3 gap-6 items-start">
        {tiers.map((tier) => {
          const isCurrent = tier.key === currentPlan;
          return (
            <div
              key={tier.key}
              className={`relative rounded-2xl border p-6 transition-shadow ${
                tier.highlighted
                  ? 'border-blue-500 shadow-xl shadow-blue-500/10 scale-[1.02] bg-white z-10'
                  : 'border-gray-200 bg-white hover:shadow-lg'
              } ${isCurrent ? 'ring-2 ring-green-400' : ''}`}
            >
              {/* Badges */}
              {tier.badge && !isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full shadow">
                    {tier.badge}
                  </span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center px-3 py-0.5 bg-green-500 text-white text-xs font-semibold rounded-full shadow">
                    {t('plan.currentBadge')}
                  </span>
                </div>
              )}

              <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{tier.description}</p>

              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900">
                  {annual ? tier.price.yearly : tier.price.monthly}
                </span>
                {tier.price.monthly !== 'Custom' && (
                  <span className="text-sm text-gray-500">{t('plan.perMonth')}</span>
                )}
              </div>
              {annual && tier.price.monthly !== 'Custom' && (
                <p className="mt-1 text-xs text-gray-400">{t('plan.billedAnnually')}</p>
              )}

              {/* Action button */}
              <button
                onClick={() => {
                  if (!isCurrent && tier.key !== 'enterprise') {
                    handleChangePlan(tier.key);
                  }
                }}
                disabled={isCurrent || updating === tier.key}
                className={`mt-6 block w-full text-center px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                  isCurrent
                    ? 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                    : tier.key === 'enterprise'
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer'
                      : tier.highlighted
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/25'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                } disabled:opacity-60`}
              >
                {updating === tier.key ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  getButtonLabel(tier.key)
                )}
              </button>

              {/* Features */}
              <ul className="mt-6 space-y-2.5">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm text-gray-700">
                    <svg
                      className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                        tier.highlighted ? 'text-blue-500' : 'text-gray-400'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
