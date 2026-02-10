import { useState } from 'react';

/* ──────────────────────────────────────────────────────────────────
   Account Settings Content — renders inside DashboardPage2 <main>
   Receives theme colors (C) and isLight as props
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

// ── Helpers ─────────────────────────────────────────────────────
function Divider({ color }: { color: string }) {
  return <div style={{ height: 1, background: color, opacity: 0.5 }} />;
}

function SectionTitle({ children, badge, color }: { children: string; color: string; badge?: { label: string; color: string; bg: string } }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color, margin: 0 }}>{children}</h2>
      {badge && (
        <span style={{
          fontSize: 12,
          fontWeight: 500,
          color: badge.color,
          background: badge.bg,
          padding: '3px 10px',
          borderRadius: 12,
        }}>{badge.label}</span>
      )}
    </div>
  );
}

function ActionLink({ children, color, hoverColor }: { children: string; color: string; hoverColor?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        fontSize: 15,
        fontWeight: 600,
        color: hoverColor && hovered ? hoverColor : color,
        cursor: 'pointer',
        textDecoration: hovered ? 'underline' : 'none',
      }}
    >
      {children}
    </button>
  );
}

// ── Main content component ──────────────────────────────────────
export default function AccountSettingsContent({ C, isLight, userEmail }: { C: Theme; isLight: boolean; userEmail?: string }) {
  return (
    <>
      {/* Page title */}
      {/* <h1 style={{ fontSize: 28, fontWeight: 700, color: C.textPrimary, margin: '0 0 30px 0' }}>
        Account settings
      </h1> */}

      {/* ═══════════ SECTION 1: Sign in ═══════════ */}
      <SectionTitle color={C.textPrimary}>Account settings</SectionTitle>
      <div style={{ marginTop: 14 }}>
        {/* Email row */}
        <div style={{ padding: '16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Email</span>
              <span style={{
                fontSize: 12,
                fontWeight: 500,
                color: '#d97706',
                background: isLight ? '#fef3c7' : '#78350f40',
                padding: '3px 10px',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Verification needed
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ActionLink color={C.textPrimary}>Verify</ActionLink>
              <span style={{ color: C.divider }}>|</span>
              <ActionLink color={C.textPrimary}>Update</ActionLink>
            </div>
          </div>
          <div style={{ fontSize: 14, color: C.textSecond, marginTop: 4 }}>{userEmail || 'user@email.com'}</div>
        </div>
        <Divider color={C.divider} />

        {/* Phone row */}
        <div style={{ padding: '16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Phone</span>
            <ActionLink color={C.textPrimary}>Add</ActionLink>
          </div>
          <div style={{ fontSize: 14, color: C.textSecond, marginTop: 4 }}>No phone number</div>
        </div>
        <Divider color={C.divider} />

        {/* Password row */}
        <div style={{ padding: '16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Password</span>
            <ActionLink color={C.textPrimary}>Update</ActionLink>
          </div>
          <div style={{ fontSize: 14, color: C.textSecond, marginTop: 4 }}>Last changed 24 Apr 2025</div>
        </div>
        <Divider color={C.divider} />
      </div>

      {/* ═══════════ SECTION 2: Personal POS Passcode ═══════════ */}
      <div style={{ marginTop: 48 }}>
        <SectionTitle color={C.textPrimary}>Personal POS Passcode for Lunor</SectionTitle>
        <p style={{ fontSize: 15, color: C.textSecond, lineHeight: 1.6, margin: '8px 0 20px 0' }}>
          Your personal POS passcode is used to log in and clock in on the Lunor point of sale.
          Please don't share this passcode with anyone.
        </p>
        <button style={{
          padding: '12px 24px',
          borderRadius: 24,
          border: 'none',
          background: isLight ? '#f0f0f0' : C.hover,
          color: C.textPrimary,
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          Add passcode
        </button>
      </div>

      {/* ═══════════ SECTION 3: Passkeys ═══════════ */}
      <div style={{ marginTop: 48 }}>
        <SectionTitle color={C.textPrimary} badge={{ label: 'Beta', color: '#16a34a', bg: isLight ? '#dcfce7' : '#14532d40' }}>Passkeys</SectionTitle>
        <p style={{ fontSize: 15, color: C.textSecond, lineHeight: 1.6, margin: '8px 0 20px 0' }}>
          Sign in quickly and securely with passkeys. No passwords are required. Just use your
          fingerprint, face or PIN. Passkeys are safe from phishing and password breaches, and your
          biometrics stay private. Sync up to five passkeys across devices.
        </p>

        {/* Passkey row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
            </svg>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Passkeys</div>
              <div style={{ fontSize: 13, color: C.textSecond }}>No passkey</div>
            </div>
          </div>
          <ActionLink color={C.textPrimary}>Create a passkey</ActionLink>
        </div>
      </div>
      <div style={{ margin: '28px 0' }}>
        <Divider color={C.divider} />
      </div>
      {/* ═══════════ SECTION 4: Two-step verification ═══════════ */}
      <div style={{ marginTop: 30 }}>
        <SectionTitle color={C.textPrimary} badge={{ label: 'Recommended', color: '#6366f1', bg: isLight ? '#e0e7ff' : '#312e8140' }}>Two-step verification</SectionTitle>
        <p style={{ fontSize: 15, color: C.textSecond, lineHeight: 1.6, margin: '8px 0 4px 0' }}>
          An extra layer to boost your account security. A verification code will be required in
          addition to your password each time you sign in.{' '}
          <ActionLink color={C.textPrimary}>Learn more</ActionLink>
        </p>
        <button style={{
          marginTop: 20,
          padding: '12px 28px',
          borderRadius: 24,
          border: 'none',
          background: isLight ? C.textPrimary : '#ffffff',
          color: isLight ? '#ffffff' : '#000000',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
        }}>
          Enable
        </button>
      </div>

      <div style={{ margin: '28px 0' }}>
        <Divider color={C.divider} />
      </div>

      {/* ═══════════ SECTION 5: Sign out everywhere ═══════════ */}
      <div>
        <SectionTitle color={C.textPrimary}>Sign out everywhere</SectionTitle>
        <p style={{ fontSize: 15, color: C.textSecond, lineHeight: 1.6, margin: '8px 0 16px 0' }}>
          If you lost a device or left logged in to a public computer, you can sign out everywhere except
          your current browser.
        </p>
        <ActionLink color="#ef4444">Sign out everywhere</ActionLink>
      </div>
      <div style={{ margin: '28px 0' }}>
        <Divider color={C.divider} />
      </div>
      {/* ═══════════ SECTION 6: Security ═══════════ */}
      <div style={{ marginTop: 30 }}>
        <SectionTitle color={C.textPrimary}>Security</SectionTitle>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: '16px 0 8px 0' }}>
          Ways to verify it's you
        </h3>
        <p style={{ fontSize: 15, color: C.textSecond, lineHeight: 1.6, margin: '0 0 16px 0' }}>
          Berhot can contact you if there's unusual activity in your account, help you access and
          recover your account and send you other transactional messages about your account.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ActionLink color={C.textPrimary}>Add phone number</ActionLink>
          <span style={{ color: C.divider }}>|</span>
          <ActionLink color={C.textPrimary}>Add email address</ActionLink>
        </div>
      </div>
    </>
  );
}
