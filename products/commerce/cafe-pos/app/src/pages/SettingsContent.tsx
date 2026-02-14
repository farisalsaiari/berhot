/* ──────────────────────────────────────────────────────────────────
   Settings Content Pages — placeholder components for each settings sub-page
   Renders inside DashboardPage <main> area
   ────────────────────────────────────────────────────────────────── */

import { useTranslation } from '@berhot/i18n';
import ThemeSettings from './ThemeSettings';

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
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 2px 0' }}>
        {title}
      </h2>
      <p style={{ fontSize: 15, color: C.textSecond, margin: '0 0 28px 0', lineHeight: 1.6 }}>
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
