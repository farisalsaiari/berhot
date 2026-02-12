/* ──────────────────────────────────────────────────────────────────
   Settings Content Pages — placeholder components for each settings sub-page
   Renders inside DashboardPage <main> area
   ────────────────────────────────────────────────────────────────── */

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
function SettingsPlaceholder({ C, title, description }: { C: Theme; title: string; description: string }) {
  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: '0 0 6px 0' }}>
        {title}
      </h1>
      <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 28px 0', lineHeight: 1.5 }}>
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
          Coming soon.
        </p>
      </div>
    </div>
  );
}

// ── General ─────────────────────────────────────────────────────

export function SettingsTimezoneContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Time Zone" description="Configure your default time zone for orders and reporting." />;
}

export function SettingsCurrencyContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Currency" description="Set your default currency for pricing and invoices." />;
}

export function SettingsMultiTabContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Enable Multi-Tab Login" description="Allow simultaneous sessions across multiple browser tabs." />;
}

export function SettingsThemeContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Theme Settings" description="Choose between light, dark, or system default themes for your workspace." />;
}

// ── Schedules ───────────────────────────────────────────────────

export function SettingsDisplayPreferencesContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Display Preferences" description="Customize how schedules and calendar views are displayed." />;
}

export function SettingsNotificationsActionsContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Notifications & Actions" description="Configure notification triggers and automated actions for schedules." />;
}

// ── Billing & Payment ───────────────────────────────────────────

export function SettingsInvoiceContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Invoice" description="Manage invoice templates, numbering, and default settings." />;
}

export function SettingsSubscriptionContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Subscription Management" description="View and manage your current plan, billing cycle, and usage." />;
}

export function SettingsPaymentGatewayContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Payment Gateway" description="Configure payment providers and processing settings." />;
}

// ── Privacy & Security ──────────────────────────────────────────

export function SettingsTwoFactorContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Two-factor Authentication" description="Add an extra layer of security to your account with 2FA." />;
}

export function SettingsEncryptionContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Data Encryption" description="Manage encryption settings for sensitive data at rest and in transit." />;
}

// ── User Permissions ────────────────────────────────────────────

export function SettingsRoleContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Role" description="Define roles and their associated permissions for your team." />;
}

export function SettingsTeamContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Team" description="Manage team members, invitations, and access levels." />;
}

// ── Integrations ────────────────────────────────────────────────

export function SettingsThirdPartyContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Third-party" description="Connect and manage third-party service integrations." />;
}

export function SettingsApiAccessContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="API Access" description="Manage API keys, webhooks, and developer access." />;
}

// ── Notification ────────────────────────────────────────────────

export function SettingsEmailInappContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Email and In-app" description="Configure email and in-app notification preferences." />;
}

export function SettingsCustomAlertsContent({ C }: SettingsContentProps) {
  return <SettingsPlaceholder C={C} title="Custom Alerts" description="Set up custom alert rules and notification triggers." />;
}
