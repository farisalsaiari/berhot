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
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 8px 0' }}>
        {title}
      </h2>
      <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 14px 0', lineHeight: 1.5 }}>
        {description}
      </p>
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
  const [emailNews, setEmailNews] = useState(true);
  const [emailTips, setEmailTips] = useState(true);
  const [emailResearch, setEmailResearch] = useState(true);
  const [emailComments, setEmailComments] = useState(false);
  const [emailReminders, setEmailReminders] = useState(false);

  // Push notification toggles
  const [pushComments, setPushComments] = useState(true);
  const [pushReminders, setPushReminders] = useState(true);
  const [pushActivity, setPushActivity] = useState(false);

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 8px 0' }}>
        {t('settingsNav.accountNotifications')}
      </h2>
      <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 14px 0', lineHeight: 1.5 }}>
        {t('settingsPages.accountNotificationsDesc')}
      </p>

      <div style={{ height: 1, background: C.divider, opacity: 0.4, margin: '0 0 20px 0' }} />

      {/* Email notifications */}
      <NotifSection
        C={C}
        isLight={isLight}
        sectionTitle="Email notifications"
        sectionDesc="Get emails to find out what's going on when you're not online. You can turn these off."
        items={[
          { key: 'news', title: 'News and updates', desc: 'News about product and feature updates.', on: emailNews, onChange: setEmailNews },
          { key: 'tips', title: 'Tips and tutorials', desc: 'Tips on getting more out of your dashboard.', on: emailTips, onChange: setEmailTips },
          { key: 'research', title: 'User research', desc: 'Get involved in our beta testing program or participate in paid product user research.', on: emailResearch, onChange: setEmailResearch },
          { key: 'comments', title: 'Comments', desc: 'Comments on your posts and replies to comments.', on: emailComments, onChange: setEmailComments },
          { key: 'reminders', title: 'Reminders', desc: 'These are notifications to remind you of updates you might have missed.', on: emailReminders, onChange: setEmailReminders },
        ]}
      />

      <div style={{ height: 1, background: C.divider, opacity: 0.4 }} />

      {/* Push notifications */}
      <NotifSection
        C={C}
        isLight={isLight}
        sectionTitle="Push notifications"
        sectionDesc="Get push notifications in-app to find out what's going on when you're online."
        items={[
          { key: 'push-comments', title: 'Comments', desc: 'Comments on your posts and replies to comments.', on: pushComments, onChange: setPushComments },
          { key: 'push-reminders', title: 'Reminders', desc: 'These are notifications to remind you of updates you might have missed.', on: pushReminders, onChange: setPushReminders },
          { key: 'push-activity', title: 'More activity about you', desc: 'These are notifications for posts on your profile, likes and other reactions to your posts, and more.', on: pushActivity, onChange: setPushActivity },
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
