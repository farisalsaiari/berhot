/* ──────────────────────────────────────────────────────────────────
   Settings Content Pages — placeholder components for each settings sub-page
   Renders inside DashboardPage <main> area
   ────────────────────────────────────────────────────────────────── */

import { useState, useEffect } from 'react';
import { useTranslation } from '@berhot/i18n';
import { fetchMyTenant, changeSubscriptionPlan } from '../lib/api';
import ThemeSettings from './ThemeSettings';
import SecuritySettings from './SecuritySettings';

interface Theme {
  bg: string;
  sidebar: string;
  card: string;
  cardBorder: string;
  hover: string;
  active: string;
  divider: string;
  textPrimary: string;
  textSecond: string;
  textLight: string;
  textDim: string;
  accent: string;
  btnBg: string;
  btnBorder: string;
}

interface SettingsContentProps {
  C: Theme;
  isLight: boolean;
}

// ── Shared placeholder ──────────────────────────────────────────
function SettingsPlaceholder({ C, title, description, comingSoon }: { C: Theme; title: string; description: string; comingSoon: string }) {
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 4px 0' }}>
        {title}
      </h2>
      <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 18px 0', lineHeight: 1.5 }}>
        {description}
      </p>
      <div style={{ height: 1, background: C.divider, opacity: 0.4, marginBottom: 20 }} />
      <div style={{
        background: C.card,
        border: `1px solid ${C.cardBorder}`,
        borderRadius: 12,
        padding: 24,
        minHeight: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{ color: C.textDim, fontSize: 14 }}>
          {comingSoon}
        </p>
      </div>
    </div>
  );
}

// ── Account ─────────────────────────────────────────────────────

export function SettingsPasswordContent({ C, isLight }: SettingsContentProps) {
  return <SecuritySettings C={C} isLight={isLight} />;
}

// ── Toggle switch component ──────────────────────────────────────
function Toggle({ on, onChange, C, isLight }: { on: boolean; onChange: (v: boolean) => void; C: Theme; isLight: boolean }) {
  const accent = C.accent === '#000000' && !isLight ? '#e5e7eb' : C.accent;
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        border: 'none',
        cursor: 'pointer',
        background: on ? accent : (isLight ? '#d1d5db' : '#404040'),
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
        padding: 0,
      }}
    >
      <div style={{
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: '#ffffff',
        position: 'absolute',
        top: 3,
        left: on ? 23 : 3,
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

// ── Notification row: toggle + title/desc (middle column) ────────
function NotifRow({ C, isLight, title, description, on, onChange }: {
  C: Theme; isLight: boolean; title: string; description: string; on: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 14,
      padding: '18px 0',
    }}>
      <div style={{ paddingTop: 2 }}>
        <Toggle on={on} onChange={onChange} C={C} isLight={isLight} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: 13, color: C.textSecond, lineHeight: 1.5 }}>{description}</div>
      </div>
    </div>
  );
}

// ── Notification section: 3 columns matching reference design ─────
function NotifSection({ C, isLight, sectionTitle, sectionDesc, items }: {
  C: Theme; isLight: boolean;
  sectionTitle: string; sectionDesc: string;
  items: { key: string; title: string; desc: string; on: boolean; onChange: (v: boolean) => void }[];
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'flex-start',
      gap: 32,
      padding: '28px 0',
    }}>
      {/* Left column: section label */}
      <div style={{ width: 220, flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{sectionTitle}</div>
        <div style={{ fontSize: 13, color: C.textSecond, marginTop: 6, lineHeight: 1.5 }}>{sectionDesc}</div>
      </div>
      {/* Right column: toggle rows */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {items.map((item, i) => (
          <div key={item.key}>
            {i > 0 && <div style={{ height: 1, background: C.divider, opacity: 0.3 }} />}
            <NotifRow C={C} isLight={isLight} title={item.title} description={item.desc} on={item.on} onChange={item.onChange} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SettingsAccountNotificationsContent({ C, isLight }: SettingsContentProps) {
  const { t } = useTranslation();

  // Email notification toggles
  const [emailDailyReport, setEmailDailyReport] = useState(true);
  const [emailWeeklyReport, setEmailWeeklyReport] = useState(true);
  const [emailLowStock, setEmailLowStock] = useState(true);
  const [emailExpiring, setEmailExpiring] = useState(false);
  const [emailTipReport, setEmailTipReport] = useState(false);
  const [emailBilling, setEmailBilling] = useState(true);
  const [emailNewFeatures, setEmailNewFeatures] = useState(false);

  // Push notification toggles
  const [pushNewOrder, setPushNewOrder] = useState(true);
  const [pushOrderReady, setPushOrderReady] = useState(true);
  const [pushLowStock, setPushLowStock] = useState(true);
  const [pushPeakHour, setPushPeakHour] = useState(true);
  const [pushDeviceOffline, setPushDeviceOffline] = useState(true);
  const [pushStaffLogin, setPushStaffLogin] = useState(false);
  const [pushShiftHandover, setPushShiftHandover] = useState(false);
  const [pushDailySummary, setPushDailySummary] = useState(true);

  // Order & POS alert toggles
  const [alertLargeOrder, setAlertLargeOrder] = useState(true);
  const [alertRefund, setAlertRefund] = useState(true);
  const [alertVoidItem, setAlertVoidItem] = useState(true);
  const [alertDiscountAbuse, setAlertDiscountAbuse] = useState(false);
  const [alertCashDrawer, setAlertCashDrawer] = useState(false);

  // Customer toggles
  const [customerLoyalty, setCustomerLoyalty] = useState(false);
  const [customerSlowItem, setCustomerSlowItem] = useState(false);

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 4px 0' }}>
        {t('settingsNav.accountNotifications')}
      </h2>
      <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 18px 0', lineHeight: 1.5 }}>
        {t('settingsPages.accountNotificationsDesc')}
      </p>
      <div style={{ height: 1, background: C.divider, opacity: 0.4 }} />

      {/* Email notifications */}
      <NotifSection
        C={C}
        isLight={isLight}
        sectionTitle={t('notif.emailTitle')}
        sectionDesc={t('notif.emailDesc')}
        items={[
          { key: 'daily-report', title: t('notif.dailyReport'), desc: t('notif.dailyReportDesc'), on: emailDailyReport, onChange: setEmailDailyReport },
          { key: 'weekly-report', title: t('notif.weeklyReport'), desc: t('notif.weeklyReportDesc'), on: emailWeeklyReport, onChange: setEmailWeeklyReport },
          { key: 'low-stock-email', title: t('notif.lowStockAlert'), desc: t('notif.lowStockAlertEmailDesc'), on: emailLowStock, onChange: setEmailLowStock },
          { key: 'expiring-email', title: t('notif.expiringIngredients'), desc: t('notif.expiringIngredientsDesc'), on: emailExpiring, onChange: setEmailExpiring },
          { key: 'tip-report', title: t('notif.tipReport'), desc: t('notif.tipReportDesc'), on: emailTipReport, onChange: setEmailTipReport },
          { key: 'billing', title: t('notif.billing'), desc: t('notif.billingDesc'), on: emailBilling, onChange: setEmailBilling },
          { key: 'new-features', title: t('notif.newFeatures'), desc: t('notif.newFeaturesDesc'), on: emailNewFeatures, onChange: setEmailNewFeatures },
        ]}
      />

      <div style={{ height: 1, background: C.divider, opacity: 0.4 }} />

      {/* Push notifications */}
      <NotifSection
        C={C}
        isLight={isLight}
        sectionTitle={t('notif.pushTitle')}
        sectionDesc={t('notif.pushDesc')}
        items={[
          { key: 'push-new-order', title: t('notif.newOrder'), desc: t('notif.newOrderDesc'), on: pushNewOrder, onChange: setPushNewOrder },
          { key: 'push-order-ready', title: t('notif.orderReady'), desc: t('notif.orderReadyDesc'), on: pushOrderReady, onChange: setPushOrderReady },
          { key: 'push-low-stock', title: t('notif.lowStockAlert'), desc: t('notif.lowStockAlertPushDesc'), on: pushLowStock, onChange: setPushLowStock },
          { key: 'push-peak-hour', title: t('notif.peakHour'), desc: t('notif.peakHourDesc'), on: pushPeakHour, onChange: setPushPeakHour },
          { key: 'push-device-offline', title: t('notif.deviceOffline'), desc: t('notif.deviceOfflineDesc'), on: pushDeviceOffline, onChange: setPushDeviceOffline },
          { key: 'push-staff-login', title: t('notif.staffLogin'), desc: t('notif.staffLoginDesc'), on: pushStaffLogin, onChange: setPushStaffLogin },
          { key: 'push-shift-handover', title: t('notif.shiftHandover'), desc: t('notif.shiftHandoverDesc'), on: pushShiftHandover, onChange: setPushShiftHandover },
          { key: 'push-daily-summary', title: t('notif.dailySummary'), desc: t('notif.dailySummaryDesc'), on: pushDailySummary, onChange: setPushDailySummary },
        ]}
      />

      <div style={{ height: 1, background: C.divider, opacity: 0.4 }} />

      {/* Order & POS alerts */}
      <NotifSection
        C={C}
        isLight={isLight}
        sectionTitle={t('notif.orderAlertsTitle')}
        sectionDesc={t('notif.orderAlertsDesc')}
        items={[
          { key: 'large-order', title: t('notif.largeOrder'), desc: t('notif.largeOrderDesc'), on: alertLargeOrder, onChange: setAlertLargeOrder },
          { key: 'refund', title: t('notif.refundRequest'), desc: t('notif.refundRequestDesc'), on: alertRefund, onChange: setAlertRefund },
          { key: 'void-item', title: t('notif.voidItem'), desc: t('notif.voidItemDesc'), on: alertVoidItem, onChange: setAlertVoidItem },
          { key: 'discount-abuse', title: t('notif.discountAbuse'), desc: t('notif.discountAbuseDesc'), on: alertDiscountAbuse, onChange: setAlertDiscountAbuse },
          { key: 'cash-drawer', title: t('notif.cashDrawer'), desc: t('notif.cashDrawerDesc'), on: alertCashDrawer, onChange: setAlertCashDrawer },
        ]}
      />

      <div style={{ height: 1, background: C.divider, opacity: 0.4 }} />

      {/* Customer & Menu insights */}
      <NotifSection
        C={C}
        isLight={isLight}
        sectionTitle={t('notif.insightsTitle')}
        sectionDesc={t('notif.insightsDesc')}
        items={[
          { key: 'loyalty-milestone', title: t('notif.loyaltyMilestone'), desc: t('notif.loyaltyMilestoneDesc'), on: customerLoyalty, onChange: setCustomerLoyalty },
          { key: 'slow-item', title: t('notif.slowItem'), desc: t('notif.slowItemDesc'), on: customerSlowItem, onChange: setCustomerSlowItem },
        ]}
      />
    </div>
  );
}

// ── Business ────────────────────────────────────────────────────

export function SettingsStoreInfoContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.storeInfo')} description={t('settingsPages.storeInfoDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

export function SettingsLocationsContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.locations')} description={t('settingsPages.locationsDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

// ── General ─────────────────────────────────────────────────────

export function SettingsTimezoneContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.timezone')} description={t('settingsPages.timezoneDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

export function SettingsCurrencyContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.currency')} description={t('settingsPages.currencyDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

export function SettingsMultiTabContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.multiTab')} description={t('settingsPages.multiTabDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

export function SettingsThemeContent({ C, isLight, onAccentPreview, onDarkSidebarPreview, onShowHeaderPreview, onThemePreview, onSave }: SettingsContentProps & { onAccentPreview?: (color: string | null) => void; onDarkSidebarPreview?: (v: boolean | null) => void; onShowHeaderPreview?: (v: boolean | null) => void; onThemePreview?: (theme: 'light' | 'dark' | null) => void; onSave?: () => void }) {
  return <ThemeSettings C={C} isLight={isLight} onAccentPreview={onAccentPreview} onDarkSidebarPreview={onDarkSidebarPreview} onShowHeaderPreview={onShowHeaderPreview} onThemePreview={onThemePreview} onSave={onSave} />;
}

// ── Schedules ───────────────────────────────────────────────────

export function SettingsDisplayPreferencesContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.displayPreferences')} description={t('settingsPages.displayPreferencesDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

export function SettingsNotificationsActionsContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.notificationsActions')} description={t('settingsPages.notificationsActionsDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

// ── Billing & Payment ───────────────────────────────────────────

export function SettingsInvoiceContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.invoice')} description={t('settingsPages.invoiceDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

/* ── Upgrade plan tiers ── */
const PLAN_TIERS = [
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
    moreCount: 8,
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
    moreCount: 12,
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
    moreCount: 20,
    highlighted: false,
  },
];
const PLAN_ORDER = ['free', 'starter', 'professional', 'enterprise'];

export function SettingsSubscriptionContent({ C, isLight }: SettingsContentProps) {
  const { t } = useTranslation();
  const [annual, setAnnual] = useState(true);
  const [currentPlan, setCurrentPlan] = useState('free');
  const [tenantId, setTenantId] = useState('');
  const [planLoading, setPlanLoading] = useState(true);
  const [updating, setUpdating] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMyTenant()
      .then((tenant) => {
        setCurrentPlan(tenant.plan || 'free');
        setTenantId(tenant.id);
        setPlanLoading(false);
      })
      .catch(() => setPlanLoading(false));
  }, []);

  const handleChangePlan = async (plan: string) => {
    if (plan === currentPlan || !tenantId) return;
    const tierName = plan.charAt(0).toUpperCase() + plan.slice(1);
    if (!confirm(t('plan.confirmUpgrade').replace('{{plan}}', tierName))) return;
    setUpdating(plan); setMessage('');
    try {
      const sub = await changeSubscriptionPlan(tenantId, plan);
      setCurrentPlan(sub.planKey);
      setMessage(t('plan.planUpdated'));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to update plan');
    } finally { setUpdating(''); }
  };

  const currentIdx = PLAN_ORDER.indexOf(currentPlan);
  const getButtonLabel = (tierKey: string): string => {
    if (tierKey === currentPlan) return t('plan.currentBadge');
    if (tierKey === 'enterprise') return t('plan.contactSales');
    return PLAN_ORDER.indexOf(tierKey) > currentIdx ? t('plan.upgrade') : t('plan.downgrade');
  };

  const planLabel = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);

  return (
    <div>
      <style>{`
        .sub-tier-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: stretch; }
        @media (max-width: 860px) { .sub-tier-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .sub-tier-grid { grid-template-columns: 1fr; } }
      `}</style>
      {/* ── Page Header ── */}
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 4px 0' }}>
        {t('settingsNav.subscriptionManagement')}
      </h2>
      <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 18px 0', lineHeight: 1.5 }}>
        {t('settingsPages.subscriptionManagementDesc')}
      </p>
      <div style={{ height: 1, background: C.divider, opacity: 0.4 }} />

      {planLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
          <div style={{
            width: 24, height: 24, borderRadius: '50%',
            border: `3px solid ${C.divider}`, borderTopColor: C.btnBg,
            animation: 'sub-spin 0.6s linear infinite',
          }} />
          <style>{`@keyframes sub-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* ── Current plan ── */}
          <p style={{ fontSize: 13, color: C.textSecond, margin: '16px 0 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
            {t('plan.currentPlan')}:
            {currentPlan === 'starter' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3" fill="#22c55e"/></svg>
            )}
            {currentPlan === 'professional' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 3h12l-3 7h4L7 21l2-8H5l1-10z" fill="url(#cpProFlash)"/><defs><linearGradient id="cpProFlash" x1="5" y1="3" x2="19" y2="21"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient></defs></svg>
            )}
            {currentPlan === 'enterprise' && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M2 20h20M5 20V8l7-5 7 5v12" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 20v-5h6v5M9 11h.01M15 11h.01" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/></svg>
            )}
            <span style={{ fontWeight: 600, color: C.textPrimary }}>{planLabel}</span>
          </p>

          {/* Success message */}
          {message && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', marginTop: 12,
              background: isLight ? `${C.accent}0a` : `${C.accent}14`,
              border: `1px solid ${isLight ? `${C.accent}30` : `${C.accent}33`}`,
              borderRadius: 10,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 13l4 4L19 7" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 500, color: C.accent }}>{message}</span>
            </div>
          )}

          {/* ── Billing toggle ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 20, marginBottom: 24 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 2,
              background: isLight ? '#f3f4f6' : C.hover,
              borderRadius: 12, padding: 3,
            }}>
              <button
                onClick={() => setAnnual(false)}
                style={{
                  padding: '7px 18px', fontSize: 13, fontWeight: 500, borderRadius: 10,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: !annual ? (isLight ? '#fff' : C.card) : 'transparent',
                  color: !annual ? C.textPrimary : C.textSecond,
                  boxShadow: !annual ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                }}
              >
                {t('plan.monthly')}
              </button>
              <button
                onClick={() => setAnnual(true)}
                style={{
                  padding: '7px 18px', fontSize: 13, fontWeight: 500, borderRadius: 10,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: annual ? (isLight ? '#fff' : C.card) : 'transparent',
                  color: annual ? C.textPrimary : C.textSecond,
                  boxShadow: annual ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                {t('plan.annual')}
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  background: isLight ? `${C.accent}18` : `${C.accent}26`,
                  color: C.accent,
                  padding: '2px 8px', borderRadius: 20,
                }}>
                  {t('plan.save20')}
                </span>
              </button>
            </div>
          </div>

          {/* ── Tier Cards ── */}
          <div className="sub-tier-grid">
            {PLAN_TIERS.map((tier) => {
              const isCurrent = tier.key === currentPlan;
              const isHighlighted = tier.highlighted;

              return (
                <div
                  key={tier.key}
                  style={{
                    position: 'relative',
                    display: 'flex', flexDirection: 'column' as const,
                    background: isLight ? '#fff' : C.card,
                    border: `${isCurrent ? '2.5px' : '1.5px'} solid ${isCurrent ? C.accent : isHighlighted ? '#2563eb' : C.cardBorder}`,
                    borderRadius: 14,
                    padding: '24px 20px 20px',
                    boxShadow: isHighlighted
                      ? '0 6px 24px rgba(37,99,235,0.08)'
                      : '0 1px 3px rgba(0,0,0,0.04)',
                    transform: isHighlighted ? 'scale(1.02)' : 'none',
                    zIndex: isHighlighted ? 1 : 0,
                  }}
                >
                  {/* Badge */}
                  {(tier.badge && !isCurrent) && (
                    <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}>
                      <span style={{
                        fontSize: 10, fontWeight: 600, color: '#fff',
                        background: '#2563eb', padding: '3px 10px', borderRadius: 20,
                        whiteSpace: 'nowrap',
                      }}>
                        {tier.badge}
                      </span>
                    </div>
                  )}
                  {isCurrent && (
                    <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: '#fff',
                        background: C.accent,
                        border: 'none',
                        padding: '6px 18px', borderRadius: 20,
                        whiteSpace: 'nowrap',
                      }}>
                        {t('plan.currentBadge')}
                      </span>
                    </div>
                  )}

                  {/* Name & description */}
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                      {tier.key === 'starter' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/><circle cx="12" cy="12" r="3" fill="#22c55e"/></svg>
                      )}
                      {tier.key === 'professional' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 3h12l-3 7h4L7 21l2-8H5l1-10z" fill="url(#proFlash)"/><defs><linearGradient id="proFlash" x1="5" y1="3" x2="19" y2="21"><stop offset="0%" stopColor="#8b5cf6"/><stop offset="100%" stopColor="#3b82f6"/></linearGradient></defs></svg>
                      )}
                      {tier.key === 'enterprise' && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M2 20h20M5 20V8l7-5 7 5v12" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 20v-5h6v5M9 11h.01M15 11h.01" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/></svg>
                      )}
                      {tier.name}
                    </h3>
                    <p style={{ fontSize: 12, color: C.textSecond, margin: '3px 0 0 0', lineHeight: 1.5 }}>
                      {tier.description}
                    </p>

                    {/* Price */}
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 16 }}>
                      <span style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary }}>
                        {annual ? tier.price.yearly : tier.price.monthly}
                      </span>
                      {tier.price.monthly !== 'Custom' && (
                        <span style={{ fontSize: 12, color: C.textSecond }}>{t('plan.perMonth')}</span>
                      )}
                    </div>
                    {annual && tier.price.monthly !== 'Custom' && (
                      <p style={{ fontSize: 11, color: C.textDim, margin: '2px 0 0 0' }}>
                        {t('plan.billedAnnually')}
                      </p>
                    )}
                    {tier.price.monthly === 'Custom' && annual && (
                      <p style={{ fontSize: 11, color: C.textDim, margin: '2px 0 0 0' }}>
                        {t('plan.contactForPricing')}
                      </p>
                    )}

                  {/* Action button */}
                  <button
                    onClick={() => {
                      if (!isCurrent && tier.key !== 'enterprise') handleChangePlan(tier.key);
                    }}
                    disabled={isCurrent || updating === tier.key}
                    style={{
                      display: 'block', width: '100%', marginTop: 16,
                      padding: '9px 16px', fontSize: 13, fontWeight: 600,
                      borderRadius: 24, border: 'none',
                      cursor: isCurrent ? 'default' : 'pointer',
                      transition: 'all 0.15s',
                      opacity: (isCurrent || updating === tier.key) ? 0.7 : 1,
                      ...(isCurrent
                        ? { background: isLight ? `${C.accent}0a` : `${C.accent}1a`, color: C.accent }
                        : tier.key === 'enterprise'
                          ? { background: isLight ? '#f3f4f6' : C.hover, color: C.textPrimary }
                          : isHighlighted
                            ? { background: '#2563eb', color: '#fff' }
                            : { background: C.textPrimary, color: isLight ? '#fff' : '#000' }
                      ),
                    }}
                  >
                    {updating === tier.key ? '...' : getButtonLabel(tier.key)}
                  </button>

                  {/* Divider */}
                  <div style={{ height: 1, background: C.divider, opacity: 0.4, margin: '16px 0 14px 0' }} />

                  {/* Features list */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {tier.features.map((f) => (
                      <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12, color: C.textPrimary, lineHeight: 1.4 }}>
                        <svg
                          width="13" height="13" viewBox="0 0 24 24" fill="none"
                          stroke={isHighlighted ? '#2563eb' : C.textDim}
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          style={{ flexShrink: 0, marginTop: 1 }}
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  {/* More features link */}
                  {tier.moreCount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto', paddingTop: 12 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 500, color: isCurrent ? C.accent : C.textDim,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        more
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function SettingsPaymentGatewayContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.paymentGateway')} description={t('settingsPages.paymentGatewayDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

// ── Privacy & Security ──────────────────────────────────────────

export function SettingsTwoFactorContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.twoFactor')} description={t('settingsPages.twoFactorDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

export function SettingsEncryptionContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.dataEncryption')} description={t('settingsPages.dataEncryptionDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

// ── User Permissions ────────────────────────────────────────────

export function SettingsRoleContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.role')} description={t('settingsPages.roleDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

export function SettingsTeamContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.team')} description={t('settingsPages.teamDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

// ── Integrations ────────────────────────────────────────────────

export function SettingsThirdPartyContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.thirdParty')} description={t('settingsPages.thirdPartyDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

export function SettingsApiAccessContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.apiAccess')} description={t('settingsPages.apiAccessDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

// ── Notification ────────────────────────────────────────────────

export function SettingsEmailInappContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.emailInapp')} description={t('settingsPages.emailInappDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

export function SettingsCustomAlertsContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.customAlerts')} description={t('settingsPages.customAlertsDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

// ── Billing & Payment: Market ──────────────────────────────────

export function SettingsMarketContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.market')} description={t('settingsPages.marketDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}

// ── Billing & Payment: Transactions ────────────────────────────

export function SettingsTransactionsContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.transactions')} description={t('settingsPages.transactionsDesc')} comingSoon={t('settingsPages.comingSoon')} />;
}
