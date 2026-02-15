/* ──────────────────────────────────────────────────────────────────
   Settings Content Pages — placeholder components for each settings sub-page
   Renders inside DashboardPage <main> area
   ────────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { useTranslation } from '@berhot/i18n';
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

export function SettingsSubscriptionContent({ C }: SettingsContentProps) {
  const { t } = useTranslation();
  return <SettingsPlaceholder C={C} title={t('settingsNav.subscriptionManagement')} description={t('settingsPages.subscriptionManagementDesc')} comingSoon={t('settingsPages.comingSoon')} />;
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
