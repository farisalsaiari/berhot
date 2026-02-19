import { useState, useEffect } from 'react';
import { useTranslation } from '@berhot/i18n';
import { fetchMyTenant, changeSubscriptionPlan } from '../lib/api';

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

/* ── Palette ── */
const light = {
  textPrimary: '#111827',
  textSecond: '#6b7280',
  textDim: '#9ca3af',
  divider: '#e5e7eb',
  cardBorder: '#e5e7eb',
  bg: '#ffffff',
  cardBg: '#ffffff',
  toggleBg: '#f3f4f6',
  toggleActive: '#ffffff',
  accent: '#111827',
  highlightBorder: '#2563eb',
  highlightShadow: 'rgba(37,99,235,0.08)',
  badgeBg: '#2563eb',
  currentBadgeBg: '#10b981',
  successBg: '#ecfdf5',
  successBorder: '#d1fae5',
  successText: '#059669',
  saveBg: '#dcfce7',
  saveText: '#15803d',
};

export default function UpgradePlanPage() {
  const { t } = useTranslation();
  const [annual, setAnnual] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMyTenant()
      .then((tenant) => {
        setCurrentPlan(tenant.plan || 'free');
        setTenantId(tenant.id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChangePlan = async (plan: string) => {
    if (plan === currentPlan || !tenantId) return;
    const tierName = plan.charAt(0).toUpperCase() + plan.slice(1);
    if (!confirm(t('plan.confirmUpgrade').replace('{{plan}}', tierName))) return;

    setUpdating(plan);
    setMessage('');
    try {
      const billingCycle = annual ? 'yearly' : 'monthly';
      const sub = await changeSubscriptionPlan(tenantId, plan, billingCycle);
      setCurrentPlan(sub.planKey);
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

  const C = light;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{
          width: 28, height: 28, borderRadius: '50%',
          border: `3px solid ${C.divider}`, borderTopColor: C.accent,
          animation: 'spin 0.6s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── Page Header ── */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 4px 0' }}>
          {t('titles.upgradePlan')}
        </h2>
        <p style={{ fontSize: 13, color: C.textSecond, margin: '0 0 6px 0' }}>
          {t('plan.currentPlan')}: <span style={{ fontWeight: 600, color: C.textPrimary }}>{currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}</span>
        </p>

        {/* Success message */}
        {message && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', marginTop: 10,
            background: C.successBg, border: `1px solid ${C.successBorder}`, borderRadius: 10,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.successText} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 13l4 4L19 7" />
            </svg>
            <span style={{ fontSize: 13, fontWeight: 500, color: C.successText }}>{message}</span>
          </div>
        )}

        {/* Billing toggle */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 2,
          background: C.toggleBg, borderRadius: 12, padding: 3, marginTop: 20,
        }}>
          <button
            onClick={() => setAnnual(false)}
            style={{
              padding: '8px 20px', fontSize: 13, fontWeight: 500, borderRadius: 10,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: !annual ? C.toggleActive : 'transparent',
              color: !annual ? C.textPrimary : C.textSecond,
              boxShadow: !annual ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {t('plan.monthly')}
          </button>
          <button
            onClick={() => setAnnual(true)}
            style={{
              padding: '8px 20px', fontSize: 13, fontWeight: 500, borderRadius: 10,
              border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: annual ? C.toggleActive : 'transparent',
              color: annual ? C.textPrimary : C.textSecond,
              boxShadow: annual ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {t('plan.annual')}
            <span style={{
              fontSize: 11, fontWeight: 600,
              background: C.saveBg, color: C.saveText,
              padding: '2px 8px', borderRadius: 20,
            }}>
              {t('plan.save20')}
            </span>
          </button>
        </div>
      </div>

      {/* ── Tier Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, alignItems: 'start' }}>
        {tiers.map((tier) => {
          const isCurrent = tier.key === currentPlan;
          const isHighlighted = tier.highlighted;

          return (
            <div
              key={tier.key}
              style={{
                position: 'relative',
                background: C.cardBg,
                border: `1.5px solid ${isCurrent ? C.currentBadgeBg : isHighlighted ? C.highlightBorder : C.cardBorder}`,
                borderRadius: 16,
                padding: '28px 24px 24px',
                boxShadow: isHighlighted
                  ? `0 8px 30px ${C.highlightShadow}`
                  : '0 1px 3px rgba(0,0,0,0.04)',
                transform: isHighlighted ? 'scale(1.02)' : 'none',
                zIndex: isHighlighted ? 1 : 0,
                transition: 'box-shadow 0.2s, transform 0.2s',
              }}
            >
              {/* Badge */}
              {(tier.badge && !isCurrent) && (
                <div style={{
                  position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: '#fff',
                    background: C.badgeBg, padding: '3px 12px', borderRadius: 20,
                    boxShadow: '0 2px 6px rgba(37,99,235,0.25)',
                  }}>
                    {tier.badge}
                  </span>
                </div>
              )}
              {isCurrent && (
                <div style={{
                  position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: '#fff',
                    background: C.currentBadgeBg, padding: '3px 12px', borderRadius: 20,
                    boxShadow: '0 2px 6px rgba(16,185,129,0.25)',
                  }}>
                    {t('plan.currentBadge')}
                  </span>
                </div>
              )}

              {/* Tier name & description */}
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                {tier.name}
              </h3>
              <p style={{ fontSize: 13, color: C.textSecond, margin: '4px 0 0 0', lineHeight: 1.5 }}>
                {tier.description}
              </p>

              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 20 }}>
                <span style={{ fontSize: 28, fontWeight: 700, color: C.textPrimary }}>
                  {annual ? tier.price.yearly : tier.price.monthly}
                </span>
                {tier.price.monthly !== 'Custom' && (
                  <span style={{ fontSize: 13, color: C.textSecond }}>{t('plan.perMonth')}</span>
                )}
              </div>
              {annual && tier.price.monthly !== 'Custom' && (
                <p style={{ fontSize: 11, color: C.textDim, margin: '2px 0 0 0' }}>
                  {t('plan.billedAnnually')}
                </p>
              )}

              {/* Action button */}
              <button
                onClick={() => {
                  if (!isCurrent && tier.key !== 'enterprise') {
                    handleChangePlan(tier.key);
                  }
                }}
                disabled={isCurrent || updating === tier.key}
                style={{
                  display: 'block', width: '100%', marginTop: 20,
                  padding: '10px 20px', fontSize: 13, fontWeight: 600,
                  borderRadius: 24, border: 'none', cursor: isCurrent ? 'default' : 'pointer',
                  transition: 'all 0.15s',
                  opacity: (isCurrent || updating === tier.key) ? 0.7 : 1,
                  ...(isCurrent
                    ? { background: C.successBg, color: C.successText, border: `1px solid ${C.successBorder}` }
                    : tier.key === 'enterprise'
                      ? { background: C.toggleBg, color: C.textPrimary }
                      : isHighlighted
                        ? { background: C.highlightBorder, color: '#fff', boxShadow: '0 4px 14px rgba(37,99,235,0.2)' }
                        : { background: C.accent, color: '#fff' }
                  ),
                }}
              >
                {updating === tier.key ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                      animation: 'spin 0.6s linear infinite',
                    }} />
                    Updating...
                  </span>
                ) : (
                  getButtonLabel(tier.key)
                )}
              </button>

              {/* Features divider */}
              <div style={{ height: 1, background: C.divider, opacity: 0.4, margin: '20px 0 16px 0' }} />

              {/* Features list */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {tier.features.map((feature) => (
                  <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: C.textPrimary, lineHeight: 1.4 }}>
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke={isHighlighted ? C.highlightBorder : C.textDim}
                      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                      style={{ flexShrink: 0, marginTop: 2 }}
                    >
                      <path d="M5 13l4 4L19 7" />
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
