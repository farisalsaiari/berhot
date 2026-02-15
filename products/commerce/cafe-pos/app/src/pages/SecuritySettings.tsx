/* ──────────────────────────────────────────────────────────────────
   Security Settings Page — Password, 2FA, login security, recovery
   Renders inside DashboardPage <main> area
   ────────────────────────────────────────────────────────────────── */

import { useState, useCallback, useMemo } from 'react';
import { useTranslation } from '@berhot/i18n';
import { SlidePanel } from '@berhot/ui';

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

interface SecuritySettingsProps {
  C: Theme;
  isLight: boolean;
}

// ── Toggle ──────────────────────────────────────────────────────

function Toggle({ on, onChange, C, isLight }: { on: boolean; onChange: (v: boolean) => void; C: Theme; isLight: boolean }) {
  const accent = C.accent === '#000000' && !isLight ? '#e5e7eb' : C.accent;
  return (
    <button
      onClick={() => onChange(!on)}
      style={{
        width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
        background: on ? accent : (isLight ? '#d1d5db' : '#404040'),
        position: 'relative', transition: 'background 0.2s', flexShrink: 0, padding: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#ffffff',
        position: 'absolute', top: 3, left: on ? 23 : 3,
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

// ── Security Badge ──────────────────────────────────────────────

function SecurityBadge({ level, label, isLight }: { level: 'secure' | 'warning' | 'critical'; label: string; isLight: boolean }) {
  const config = {
    secure: { bg: isLight ? '#ecfdf5' : '#16532e', text: isLight ? '#059669' : '#6ee7b7', dot: '#10b981' },
    warning: { bg: isLight ? '#fffbeb' : 'rgba(120,53,15,0.25)', text: isLight ? '#d97706' : '#fcd34d', dot: '#f59e0b' },
    critical: { bg: isLight ? '#fef2f2' : '#5c1d1d', text: isLight ? '#dc2626' : '#fca5a5', dot: '#ef4444' },
  };
  const c = config[level];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12, fontWeight: 500, padding: '4px 12px', borderRadius: 20,
      background: c.bg, color: c.text, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />
      {label}
    </span>
  );
}

// ── Password Input ──────────────────────────────────────────────

function PasswordInput({ label, value, onChange, show, onToggleShow, C, isLight, error }: {
  label: string; value: string; onChange: (v: string) => void;
  show: boolean; onToggleShow: () => void;
  C: Theme; isLight: boolean; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: error ? 4 : 0 }}>
      <div style={{
        position: 'relative',
        border: `1.5px solid ${error ? '#ef4444' : focused ? C.accent : C.cardBorder}`,
        borderRadius: 10, padding: '20px 16px 8px 16px',
        background: C.bg, transition: 'border-color 0.15s',
      }}>
        <label style={{
          position: 'absolute', insetInlineStart: 16, top: 8,
          fontSize: 11, fontWeight: 500, color: error ? '#ef4444' : C.textDim, pointerEvents: 'none',
          letterSpacing: 0.3,
        }}>
          {label}
        </label>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', fontSize: 15, color: C.textPrimary,
            background: 'transparent', border: 'none', outline: 'none',
            padding: 0, paddingInlineEnd: 36,
          }}
        />
        <button
          type="button"
          onClick={onToggleShow}
          style={{
            position: 'absolute', insetInlineEnd: 12, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            {show ? (
              <>
                <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </>
            ) : (
              <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            )}
          </svg>
        </button>
      </div>
      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#ef4444', marginTop: 6, paddingInlineStart: 4 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}

// ── Circular Progress Ring ──────────────────────────────────────

function ScoreRing({ score, color, C }: { score: number; color: string; C: Theme }) {
  const r = 40, circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100" style={{ flexShrink: 0 }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke={C.divider} strokeWidth="8" opacity={0.25} />
      <circle
        cx="50" cy="50" r={r} fill="none"
        stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease', transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
      />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fontSize="18" fontWeight="700" fill={C.textPrimary}>
        {score}%
      </text>
    </svg>
  );
}

// ── Section wrapper (two-column) ────────────────────────────────

function Section({ C, title, description, children }: { C: Theme; title: string; description: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 32, padding: '28px 0' }}>
      <div style={{ width: 220, flexShrink: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{title}</div>
        <div style={{ fontSize: 13, color: C.textSecond, marginTop: 6, lineHeight: 1.5 }}>{description}</div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}

// ── Dummy data ──────────────────────────────────────────────────

const SESSIONS = [
  { device: 'Chrome on MacOS', location: 'Riyadh, SA', lastActive: 'Now', current: true, icon: '💻' },
  { device: 'Safari on iPhone', location: 'Dubai, AE', lastActive: '3 hours ago', current: false, icon: '📱' },
  { device: 'Firefox on Windows', location: 'Cairo, EG', lastActive: '2 days ago', current: false, icon: '🖥️' },
];

const LOGIN_HISTORY = [
  { date: 'Feb 14, 2026', time: '10:32 AM', device: 'Chrome', os: 'MacOS', model: '', location: 'Riyadh, SA', ip: '192.168.1.45', status: 'success' as const },
  { date: 'Feb 13, 2026', time: '11:05 PM', device: 'Unknown', os: 'Unknown', model: '', location: 'Cairo, EG', ip: '41.44.128.22', status: 'failed' as const },
  { date: 'Feb 12, 2026', time: '08:15 AM', device: 'Safari', os: 'iOS 18', model: 'iPhone 15 Pro Max', location: 'Dubai, AE', ip: '94.56.78.12', status: 'success' as const },
  { date: 'Feb 10, 2026', time: '02:48 PM', device: 'Chrome', os: 'MacOS', model: '', location: 'Riyadh, SA', ip: '192.168.1.45', status: 'success' as const },
  { date: 'Feb 8, 2026', time: '09:30 PM', device: 'Firefox', os: 'Windows 11', model: '', location: 'Jeddah, SA', ip: '176.34.22.91', status: 'failed' as const },
  { date: 'Feb 6, 2026', time: '07:12 AM', device: 'Safari', os: 'iOS 17', model: 'iPhone 12', location: 'Riyadh, SA', ip: '192.168.1.45', status: 'success' as const },
  { date: 'Feb 5, 2026', time: '04:55 PM', device: 'Chrome', os: 'Android 15', model: 'Samsung Galaxy S24', location: 'Dammam, SA', ip: '85.12.44.67', status: 'success' as const },
  { date: 'Feb 3, 2026', time: '01:20 AM', device: 'Unknown', os: 'Unknown', model: '', location: 'Ankara, TR', ip: '78.160.55.3', status: 'failed' as const },
  { date: 'Feb 1, 2026', time: '11:40 AM', device: 'Safari', os: 'iOS 18', model: 'iPhone 15 Pro', location: 'Riyadh, SA', ip: '192.168.1.45', status: 'success' as const },
  { date: 'Jan 29, 2026', time: '06:30 PM', device: 'Edge', os: 'Windows 11', model: '', location: 'Riyadh, SA', ip: '192.168.1.45', status: 'success' as const },
  { date: 'Jan 27, 2026', time: '03:10 PM', device: 'Safari', os: 'iPadOS 18', model: 'iPad Pro 12.9"', location: 'Dubai, AE', ip: '94.56.78.12', status: 'success' as const },
  { date: 'Jan 25, 2026', time: '08:00 AM', device: 'Chrome', os: 'MacOS', model: '', location: 'Riyadh, SA', ip: '192.168.1.45', status: 'success' as const },
];

const RECOVERY_CODES = ['ABCD-1234', 'EFGH-5678', 'IJKL-9012', 'MNOP-3456', 'QRST-7890', 'UVWX-2345', 'YZAB-6789', 'CDEF-0123'];

// ── Main Component ──────────────────────────────────────────────

export default function SecuritySettings({ C, isLight }: SecuritySettingsProps) {
  const { t } = useTranslation();

  // ── Password state ──
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  // ── Policy state ──
  const [expirationPeriod, setExpirationPeriod] = useState<'30' | '60' | '90' | 'never'>('90');
  const [forceChangeOnLogin, setForceChangeOnLogin] = useState(false);

  // ── 2FA state ──
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQrSetup, setShowQrSetup] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);

  // ── Login security state ──
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [trustedDevicesOnly, setTrustedDevicesOnly] = useState(false);
  const [showLoginHistory, setShowLoginHistory] = useState(false);

  // ── Recovery state ──
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');

  // ── Password strength ──
  const passwordStrength = useMemo(() => {
    const checks = {
      minLength: newPassword.length >= 8,
      hasUppercase: /[A-Z]/.test(newPassword),
      hasLowercase: /[a-z]/.test(newPassword),
      hasNumber: /[0-9]/.test(newPassword),
      hasSpecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
      minLength12: newPassword.length >= 12,
    };
    const passed = Object.values(checks).filter(Boolean).length;
    const total = Object.keys(checks).length;
    const percentage = Math.round((passed / total) * 100);

    let level: 'weak' | 'fair' | 'good' | 'strong' = 'weak';
    let color = '#ef4444';
    if (percentage >= 83) { level = 'strong'; color = '#10b981'; }
    else if (percentage >= 60) { level = 'good'; color = '#10b981'; }
    else if (percentage >= 40) { level = 'fair'; color = '#f59e0b'; }

    return { checks, passed, total, percentage, level, color };
  }, [newPassword]);

  // ── Password generator ──
  const generatePassword = useCallback(() => {
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const nums = '0123456789';
    const special = '!@#$%^&*()_+-=';
    const all = upper + lower + nums + special;
    let pw = '';
    pw += upper[Math.floor(Math.random() * upper.length)];
    pw += lower[Math.floor(Math.random() * lower.length)];
    pw += nums[Math.floor(Math.random() * nums.length)];
    pw += special[Math.floor(Math.random() * special.length)];
    for (let i = 4; i < 16; i++) {
      pw += all[Math.floor(Math.random() * all.length)];
    }
    pw = pw.split('').sort(() => Math.random() - 0.5).join('');
    setNewPassword(pw);
    setShowNewPassword(true);
  }, []);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(newPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  }, [newPassword]);

  // ── Security score ──
  const securityItems = useMemo(() => [
    {
      id: 'password_strength',
      label: t('security.strongPassword'),
      status: (passwordStrength.level === 'strong' || passwordStrength.level === 'good')
        ? 'secure' as const : passwordStrength.level === 'fair'
          ? 'warning' as const : 'critical' as const,
    },
    {
      id: 'two_factor',
      label: t('security.twoFactorAuth'),
      status: twoFactorEnabled ? 'secure' as const : 'critical' as const,
    },
    {
      id: 'password_policy',
      label: t('security.passwordPolicyItem'),
      status: expirationPeriod !== 'never' ? 'secure' as const : 'warning' as const,
    },
    {
      id: 'login_notifications',
      label: t('security.loginAlerts'),
      status: loginNotifications ? 'secure' as const : 'warning' as const,
    },
    {
      id: 'recovery',
      label: t('security.recoveryOptions'),
      status: securityAnswer.length > 0 ? 'secure' as const : 'warning' as const,
    },
    {
      id: 'devices',
      label: t('security.deviceManagement'),
      status: trustedDevicesOnly ? 'secure' as const : 'warning' as const,
    },
  ], [passwordStrength, twoFactorEnabled, expirationPeriod, loginNotifications, securityAnswer, trustedDevicesOnly, t]);

  const securityScore = useMemo(() => {
    const secure = securityItems.filter(i => i.status === 'secure').length;
    return Math.round((secure / securityItems.length) * 100);
  }, [securityItems]);

  const securityRank = useMemo(() => {
    if (securityScore === 100) return { label: t('security.rankTopSecured'), color: '#10b981', bg: isLight ? '#ecfdf5' : '#16532e' };
    if (securityScore >= 70) return { label: t('security.rankGood'), color: '#10b981', bg: isLight ? '#ecfdf5' : '#16532e' };
    if (securityScore >= 40) return { label: t('security.rankNeedsAttention'), color: '#f59e0b', bg: isLight ? '#fffbeb' : 'rgba(120,53,15,0.25)' };
    return { label: t('security.rankAtRisk'), color: '#ef4444', bg: isLight ? '#fef2f2' : '#5c1d1d' };
  }, [securityScore, isLight, t]);

  // ── Validation ──
  const confirmError = confirmPassword.length > 0 && newPassword !== confirmPassword ? 'Passwords do not match' : '';
  const canSave = currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  const strengthLabel = newPassword.length === 0 ? '' :
    passwordStrength.level === 'strong' ? t('security.strengthStrong') :
      passwordStrength.level === 'good' ? t('security.strengthGood') :
        passwordStrength.level === 'fair' ? t('security.strengthFair') :
          t('security.strengthWeak');

  const strengthSegments = newPassword.length === 0 ? 0 :
    passwordStrength.level === 'strong' ? 4 :
      passwordStrength.level === 'good' ? 3 :
        passwordStrength.level === 'fair' ? 2 : 1;

  const requirementsList = [
    { key: 'minLength', label: t('security.reqMinLength'), met: passwordStrength.checks.minLength },
    { key: 'uppercase', label: t('security.reqUppercase'), met: passwordStrength.checks.hasUppercase },
    { key: 'lowercase', label: t('security.reqLowercase'), met: passwordStrength.checks.hasLowercase },
    { key: 'number', label: t('security.reqNumber'), met: passwordStrength.checks.hasNumber },
    { key: 'special', label: t('security.reqSpecial'), met: passwordStrength.checks.hasSpecial },
    { key: 'length12', label: t('security.reqLength12'), met: passwordStrength.checks.minLength12 },
  ];

  const expirationOptions = [
    { value: '30' as const, label: t('security.days30') },
    { value: '60' as const, label: t('security.days60') },
    { value: '90' as const, label: t('security.days90') },
    { value: 'never' as const, label: t('security.never') },
  ];

  const daysUntilExpiry = expirationPeriod === 'never' ? null : 75;

  return (
    <div>
      {/* ── Page Header ── */}
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 8px 0' }}>
        {t('security.title')}
      </h2>
      <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 14px 0', lineHeight: 1.5 }}>
        {t('security.description')}
      </p>
      <div style={{ height: 1, background: C.divider, opacity: 0.4, margin: '0 0 24px 0' }} />

      {/* ══════════════════════════════════════════════════════════════
         SECTION 1: Security Score Overview
         ══════════════════════════════════════════════════════════════ */}
      <div style={{
        // background: C.card, border: `1px solid ${C.cardBorder}`,
        borderRadius: 14, padding: '12px 0 24px 28px', marginBottom: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 22 }}>
          <ScoreRing score={securityScore} color={securityRank.color} C={C} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{t('security.scoreTitle')}</span>
              <span style={{
                fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 20,
                background: securityRank.bg, color: securityRank.color,
              }}>
                {securityRank.label}
              </span>
            </div>
            <div style={{ fontSize: 13, color: C.textSecond, lineHeight: 1.5 }}>
              {securityScore === 100
                ? 'Your account is fully secured. All security measures are enabled.'
                : securityScore >= 70
                  ? 'Your account is well protected. Consider enabling more features for maximum security.'
                  : 'Some security features need attention. Enable them to improve your security score.'
              }
            </div>
          </div>
        </div>

        {/* Checklist grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
          {securityItems.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                background: item.status === 'secure' ? '#10b981' : item.status === 'warning' ? '#f59e0b' : '#ef4444',
              }} />
              <span style={{ fontSize: 13, color: C.textSecond }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
         SECTION 2: Change Password
         ══════════════════════════════════════════════════════════════ */}
      <div style={{ height: 1, background: C.divider, opacity: 0.3 }} />
      <Section C={C} title={t('security.changePasswordTitle')} description={t('security.changePasswordDesc')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Current password */}
          <PasswordInput
            label={t('security.currentPassword')}
            value={currentPassword} onChange={setCurrentPassword}
            show={showCurrentPassword} onToggleShow={() => setShowCurrentPassword(v => !v)}
            C={C} isLight={isLight}
          />

          {/* New password */}
          <PasswordInput
            label={t('security.newPassword')}
            value={newPassword} onChange={setNewPassword}
            show={showNewPassword} onToggleShow={() => setShowNewPassword(v => !v)}
            C={C} isLight={isLight}
          />

          {/* Strength meter */}
          {newPassword.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ display: 'flex', gap: 4, flex: 1 }}>
                  {[1, 2, 3, 4].map(seg => (
                    <div key={seg} style={{
                      flex: 1, height: 4, borderRadius: 2,
                      background: seg <= strengthSegments ? passwordStrength.color : (isLight ? '#e5e7eb' : '#333'),
                      transition: 'background 0.3s',
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: passwordStrength.color, minWidth: 50 }}>
                  {strengthLabel}
                </span>
              </div>

              {/* Requirements checklist */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px' }}>
                {requirementsList.map(req => (
                  <div key={req.key} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      stroke={req.met ? '#10b981' : (isLight ? '#d1d5db' : '#555')}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span style={{
                      fontSize: 12, color: req.met ? (isLight ? '#059669' : '#6ee7b7') : C.textDim,
                      transition: 'color 0.2s',
                    }}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm password */}
          <PasswordInput
            label={t('security.confirmPassword')}
            value={confirmPassword} onChange={setConfirmPassword}
            show={showConfirmPassword} onToggleShow={() => setShowConfirmPassword(v => !v)}
            C={C} isLight={isLight}
            error={confirmError}
          />

          {/* Generate + Copy row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={generatePassword}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 16px', borderRadius: 8,
                border: `1px solid ${C.cardBorder}`, background: C.bg,
                color: C.textPrimary, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = C.hover)}
              onMouseLeave={e => (e.currentTarget.style.background = C.bg)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textSecond} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01" /><path d="M17 12h.01" /><path d="M7 12h.01" />
              </svg>
              {t('security.generatePassword')}
            </button>

            {newPassword.length > 0 && (
              <button
                onClick={copyToClipboard}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 14px', borderRadius: 8,
                  border: `1px solid ${C.cardBorder}`, background: C.bg,
                  color: copiedPassword ? '#10b981' : C.textSecond, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {copiedPassword ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {t('security.copied')}
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textSecond} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    {t('security.copyPassword')}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Update button */}
          <div style={{ marginTop: 4 }}>
            <button
              disabled={!canSave}
              onClick={() => { setPasswordSaved(true); setTimeout(() => setPasswordSaved(false), 3000); }}
              style={{
                padding: '12px 28px', borderRadius: 24,
                background: canSave ? C.accent : (isLight ? '#e5e7eb' : '#333'),
                color: canSave ? '#ffffff' : C.textDim,
                border: 'none', fontSize: 14, fontWeight: 600, cursor: canSave ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {t('security.updatePassword')}
            </button>
            {passwordSaved && (
              <span style={{ marginInlineStart: 14, fontSize: 13, color: '#10b981', fontWeight: 500 }}>
                {t('security.passwordUpdated')}
              </span>
            )}
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
         SECTION 3: Password Policy & Expiration
         ══════════════════════════════════════════════════════════════ */}
      <div style={{ height: 1, background: C.divider, opacity: 0.3 }} />
      <Section C={C} title={t('security.policyTitle')} description={t('security.policyDesc')}>
        {/* Expiration selector */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 10 }}>
            {t('security.expirationPeriod')}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {expirationOptions.map(opt => {
              const selected = expirationPeriod === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setExpirationPeriod(opt.value)}
                  style={{
                    padding: '10px 20px', borderRadius: 10,
                    border: `2px solid ${selected ? C.accent : C.cardBorder}`,
                    background: selected ? (isLight ? `${C.accent}10` : `${C.accent}20`) : C.bg,
                    color: selected ? C.accent : C.textSecond,
                    fontSize: 13, fontWeight: selected ? 600 : 400, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Info rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: C.textSecond }}>{t('security.lastChanged')}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>January 15, 2026</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: C.textSecond }}>{t('security.expiresIn')}</span>
            {daysUntilExpiry !== null ? (
              <span style={{
                fontSize: 13, fontWeight: 500,
                color: daysUntilExpiry <= 30 ? '#f59e0b' : '#10b981',
              }}>
                {daysUntilExpiry} {t('security.daysRemaining')}
              </span>
            ) : (
              <span style={{ fontSize: 13, fontWeight: 500, color: '#10b981' }}>
                {t('security.noExpiration')}
              </span>
            )}
          </div>
        </div>

        {/* Force change toggle */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0' }}>
          <div style={{ paddingTop: 2 }}>
            <Toggle on={forceChangeOnLogin} onChange={setForceChangeOnLogin} C={C} isLight={isLight} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>
              {t('security.forceChange')}
            </div>
            <div style={{ fontSize: 13, color: C.textSecond, lineHeight: 1.5 }}>
              {t('security.forceChangeDesc')}
            </div>
          </div>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
         SECTION 4: Two-Factor Authentication
         ══════════════════════════════════════════════════════════════ */}
      <div style={{ height: 1, background: C.divider, opacity: 0.3 }} />
      <Section C={C} title={t('security.twoFactorTitle')} description={t('security.twoFactorDescFull')}>
        {/* Enable toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Toggle on={twoFactorEnabled} onChange={(v) => { setTwoFactorEnabled(v); if (v) setShowQrSetup(true); else setShowQrSetup(false); }} C={C} isLight={isLight} />
            <span style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary }}>
              {t('security.twoFactorAuth')}
            </span>
          </div>
          <SecurityBadge
            level={twoFactorEnabled ? 'secure' : 'critical'}
            label={twoFactorEnabled ? t('security.twoFactorEnabled') : t('security.twoFactorDisabled')}
            isLight={isLight}
          />
        </div>

        {/* QR Setup */}
        {showQrSetup && twoFactorEnabled && (
          <div style={{
            background: C.bg, border: `1px dashed ${C.cardBorder}`,
            borderRadius: 12, padding: 24, marginBottom: 20,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 6 }}>
              {t('security.setupAuthenticator')}
            </div>
            <div style={{ fontSize: 12, color: C.textSecond, marginBottom: 18, lineHeight: 1.5 }}>
              {t('security.scanInstructions')}
            </div>

            {/* QR placeholder */}
            <div style={{
              width: 160, height: 160, borderRadius: 12,
              border: `2px dashed ${C.cardBorder}`,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              marginBottom: 18, background: isLight ? '#f9fafb' : '#1a1a1a',
            }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="3" height="3" /><rect x="18" y="14" width="3" height="3" /><rect x="14" y="18" width="3" height="3" /><rect x="18" y="18" width="3" height="3" />
              </svg>
              <span style={{ fontSize: 11, color: C.textDim, marginTop: 6 }}>QR Code</span>
            </div>

            {/* Manual key */}
            <div style={{ fontSize: 12, color: C.textSecond, marginBottom: 6 }}>{t('security.manualKey')}</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: isLight ? '#f3f4f6' : '#1f1f1f',
              padding: '10px 14px', borderRadius: 8, marginBottom: 18,
            }}>
              <code style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, letterSpacing: 2, fontFamily: 'monospace', flex: 1 }}>
                JBSW-Y3DP-EHPK-3PXP
              </code>
              <button
                onClick={() => { navigator.clipboard.writeText('JBSWY3DPEHPK3PXP'); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textSecond} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              </button>
            </div>

            {/* Verification code */}
            <div style={{ fontSize: 12, color: C.textSecond, marginBottom: 6 }}>{t('security.enterVerificationCode')}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={totpCode}
                onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                style={{
                  width: 140, padding: '10px 14px', borderRadius: 8,
                  border: `1.5px solid ${C.cardBorder}`, background: C.bg,
                  fontSize: 18, fontWeight: 600, color: C.textPrimary, letterSpacing: 8,
                  fontFamily: 'monospace', outline: 'none', textAlign: 'center',
                }}
              />
              <button
                disabled={totpCode.length !== 6}
                style={{
                  padding: '10px 20px', borderRadius: 8,
                  background: totpCode.length === 6 ? C.accent : (isLight ? '#e5e7eb' : '#333'),
                  color: totpCode.length === 6 ? '#fff' : C.textDim,
                  border: 'none', fontSize: 13, fontWeight: 600,
                  cursor: totpCode.length === 6 ? 'pointer' : 'not-allowed',
                }}
              >
                {t('security.verifyActivate')}
              </button>
            </div>
          </div>
        )}

        {/* Recovery Codes */}
        {twoFactorEnabled && (
          <div>
            <button
              onClick={() => setShowRecoveryCodes(v => !v)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600, color: C.accent, padding: 0,
              }}
            >
              {showRecoveryCodes ? t('security.hideRecoveryCodes') : t('security.showRecoveryCodes')}
            </button>

            {showRecoveryCodes && (
              <div style={{
                marginTop: 14, background: isLight ? '#fffbeb' : 'rgba(120,53,15,0.15)',
                border: `1px solid ${isLight ? '#fde68a' : '#92400e'}`,
                borderRadius: 10, padding: 18,
              }}>
                <div style={{ fontSize: 12, color: isLight ? '#92400e' : '#fcd34d', marginBottom: 12, lineHeight: 1.5 }}>
                  {t('security.recoveryCodesWarning')}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 14 }}>
                  {RECOVERY_CODES.map(code => (
                    <div key={code} style={{
                      padding: '8px 12px', borderRadius: 6,
                      background: isLight ? '#ffffff' : '#1f1f1f',
                      border: `1px solid ${C.cardBorder}`,
                      fontSize: 13, fontWeight: 600, fontFamily: 'monospace',
                      color: C.textPrimary, textAlign: 'center',
                    }}>
                      {code}
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button style={{
                    padding: '8px 16px', borderRadius: 8,
                    border: `1px solid ${C.cardBorder}`, background: C.bg,
                    fontSize: 12, fontWeight: 500, color: C.textPrimary, cursor: 'pointer',
                  }}>
                    {t('security.downloadCodes')}
                  </button>
                  <button style={{
                    padding: '8px 16px', borderRadius: 8,
                    border: `1px solid ${C.cardBorder}`, background: C.bg,
                    fontSize: 12, fontWeight: 500, color: C.textSecond, cursor: 'pointer',
                  }}>
                    {t('security.regenerateCodes')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Section>

      {/* ══════════════════════════════════════════════════════════════
         SECTION 5: Login Security
         ══════════════════════════════════════════════════════════════ */}
      <div style={{ height: 1, background: C.divider, opacity: 0.3 }} />
      <Section C={C} title={t('security.loginSecurityTitle')} description={t('security.loginSecurityDesc')}>
        {/* Active Sessions */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 12 }}>
            {t('security.activeSessions')}
          </div>
          <div style={{
            // background: C.bg, border: `1px solid ${C.cardBorder}`,
            borderRadius: 10, overflow: 'hidden',
          }}>
            {SESSIONS.map((session, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px',
                borderBottom: i < SESSIONS.length - 1 ? `1px solid ${C.divider}30` : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 18 }}>{session.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{session.device}</div>
                    <div style={{ fontSize: 12, color: C.textDim }}>{session.location}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 12, color: C.textDim }}>{session.lastActive}</span>
                  {session.current ? (
                    <SecurityBadge level="secure" label={t('security.currentSession')} isLight={isLight} />
                  ) : (
                    <button style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600, color: '#ef4444', padding: '4px 8px',
                    }}>
                      {t('security.revoke')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Login notifications toggle */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0' }}>
          <div style={{ paddingTop: 2 }}>
            <Toggle on={loginNotifications} onChange={setLoginNotifications} C={C} isLight={isLight} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>
              {t('security.loginNotifications')}
            </div>
            <div style={{ fontSize: 13, color: C.textSecond, lineHeight: 1.5 }}>
              {t('security.loginNotificationsDesc')}
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: C.divider, opacity: 0.2 }} />

        {/* Trusted devices toggle */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0' }}>
          <div style={{ paddingTop: 2 }}>
            <Toggle on={trustedDevicesOnly} onChange={setTrustedDevicesOnly} C={C} isLight={isLight} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 2 }}>
              {t('security.trustedDevices')}
            </div>
            <div style={{ fontSize: 13, color: C.textSecond, lineHeight: 1.5 }}>
              {t('security.trustedDevicesDesc')}
            </div>
          </div>
        </div>

        <div style={{ height: 1, background: C.divider, opacity: 0.2 }} />

        {/* Login History — opens SlidePanel */}
        <div style={{ paddingTop: 14 }}>
          <button
            onClick={() => setShowLoginHistory(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, color: C.accent, padding: 0,
            }}
          >
            {t('security.viewLoginHistory')}
          </button>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
         SECTION 6: Account Recovery
         ══════════════════════════════════════════════════════════════ */}
      <div style={{ height: 1, background: C.divider, opacity: 0.3 }} />
      <Section C={C} title={t('security.recoveryTitle')} description={t('security.recoveryDesc')}>
        {/* Security question */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 8 }}>
            {t('security.securityQuestion')}
          </div>
          <select
            value={securityQuestion}
            onChange={e => setSecurityQuestion(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: 8,
              border: `1.5px solid ${C.cardBorder}`, background: C.bg,
              fontSize: 13, color: securityQuestion ? C.textPrimary : C.textDim,
              outline: 'none', cursor: 'pointer',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 14px center',
              paddingInlineEnd: 36,
            }}
          >
            <option value="" disabled>{t('security.selectQuestion')}</option>
            <option value="q1">{t('security.question1')}</option>
            <option value="q2">{t('security.question2')}</option>
            <option value="q3">{t('security.question3')}</option>
          </select>
        </div>

        {securityQuestion && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 8 }}>
              {t('security.securityAnswer')}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                type="text"
                value={securityAnswer}
                onChange={e => setSecurityAnswer(e.target.value)}
                placeholder={t('security.securityAnswer')}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 8,
                  border: `1.5px solid ${C.cardBorder}`, background: C.bg,
                  fontSize: 13, color: C.textPrimary, outline: 'none',
                }}
              />
              <button
                disabled={securityAnswer.length === 0}
                style={{
                  padding: '10px 20px', borderRadius: 8,
                  background: securityAnswer.length > 0 ? C.accent : (isLight ? '#e5e7eb' : '#333'),
                  color: securityAnswer.length > 0 ? '#fff' : C.textDim,
                  border: 'none', fontSize: 13, fontWeight: 600,
                  cursor: securityAnswer.length > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                {t('security.saveAnswer')}
              </button>
            </div>
          </div>
        )}

        {/* Recovery info */}
        <div style={{ height: 1, background: C.divider, opacity: 0.2, margin: '8px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{t('security.recoveryEmail')}</div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>f***@email.com</div>
          </div>
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: C.accent, padding: '4px 0',
          }}>
            {t('security.update')}
          </button>
        </div>

        <div style={{ height: 1, background: C.divider, opacity: 0.2 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: C.textPrimary }}>{t('security.recoveryPhone')}</div>
            <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>+966 5XX XXX XX</div>
          </div>
          <button style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, color: C.accent, padding: '4px 0',
          }}>
            {t('security.update')}
          </button>
        </div>
      </Section>

      {/* ══════════════════════════════════════════════════════════════
         LOGIN HISTORY SLIDE PANEL
         ══════════════════════════════════════════════════════════════ */}
      <SlidePanel open={showLoginHistory} onClose={() => setShowLoginHistory(false)} width={480}>
        <div style={{ background: C.card, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Panel header */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '18px 20px 14px 20px',
            borderBottom: `1px solid ${C.divider}40`,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{t('security.loginHistory')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                  <span style={{ fontSize: 12, color: C.textDim }}>{LOGIN_HISTORY.length} records</span>
                  <button
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                      fontSize: 12, fontWeight: 600, color: '#ef4444',
                    }}
                  >
                    {t('security.clearHistory')}
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowLoginHistory(false)}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: isLight ? '#f0f0f0' : '#2a2a2a',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Scrollable list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>
            {LOGIN_HISTORY.map((entry, i) => {
              const isFailed = entry.status === 'failed';
              const isMobile = !!entry.model?.match(/iPhone|iPad|Galaxy|Pixel/i);
              const isTablet = !!entry.model?.match(/iPad/i);
              const isUnknown = entry.device === 'Unknown';

              // SVG device icons
              const deviceIconSvg = isUnknown ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : isTablet ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isFailed ? '#ef4444' : C.textSecond} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="2" width="16" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              ) : isMobile ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isFailed ? '#ef4444' : C.textSecond} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={isFailed ? '#ef4444' : C.textSecond} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              );

              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 20px',
                    borderBottom: `1px solid ${C.divider}20`,
                    transition: 'background 0.1s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.hover)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Icon */}
                  <div style={{
                    width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                    background: isFailed
                      ? (isLight ? '#fef2f2' : '#5c1d1d')
                      : (isLight ? '#f5f5f5' : '#2a2a2a'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {deviceIconSvg}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>
                        {entry.device}
                      </span>
                      {entry.os && entry.os !== 'Unknown' && (
                        <span style={{ fontSize: 12, color: C.textSecond }}>{entry.os}</span>
                      )}
                      {entry.model && (
                        <>
                          <span style={{ fontSize: 10, color: C.textDim, opacity: 0.4 }}>·</span>
                          <span style={{ fontSize: 12, color: C.textSecond }}>{entry.model}</span>
                        </>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: C.textDim }}>{entry.location}</span>
                      <span style={{ fontSize: 10, color: C.textDim, opacity: 0.35 }}>·</span>
                      <span style={{ fontSize: 11, color: C.textDim }}>{entry.date}, {entry.time}</span>
                      <span style={{ fontSize: 10, color: C.textDim, opacity: 0.35 }}>·</span>
                      <span style={{ fontSize: 10, color: C.textDim, fontFamily: 'monospace', opacity: 0.7 }}>{entry.ip}</span>
                    </div>
                  </div>

                  {/* Status dot */}
                  <div style={{
                    width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                    background: isFailed ? '#ef4444' : '#10b981',
                  }} />
                </div>
              );
            })}
          </div>
        </div>
      </SlidePanel>
    </div>
  );
}
