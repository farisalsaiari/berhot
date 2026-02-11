import { useState, useEffect, useCallback, useRef } from 'react';
import { Modal, OtpInput, type OtpInputHandle } from '@berhot/ui';

/* ──────────────────────────────────────────────────────────────────
   Account Settings Content — renders inside DashboardPage2 <main>
   Receives theme colors (C) and isLight as props
   ────────────────────────────────────────────────────────────────── */

const EMAIL_SERVICE_URL = 'http://localhost:4002/api/v1/email';
const IDENTITY_URL = 'http://localhost:8080';

const COUNTRIES: { code: string; name: string; dial: string; flag: string }[] = [
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
  { code: 'AE', name: 'United Arab Emirates', dial: '+971', flag: '🇦🇪' },
  { code: 'EG', name: 'Egypt', dial: '+20', flag: '🇪🇬' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
];

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

// ── Email validation ────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
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

function ActionLink({ children, color, hoverColor, onClick }: { children: string; color: string; hoverColor?: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
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

// ── Floating label input (inline-styled) ────────────────────────
function FloatingInput({
  label, value, onChange, error, errorMessage, onBlur,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  error?: boolean;
  errorMessage?: string;
  onBlur?: () => void;
}) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div>
      <div style={{
        position: 'relative',
        border: `1.5px solid ${error ? '#ef4444' : focused ? '#1a1a1a' : '#d1d5db'}`,
        borderRadius: 12,
        padding: '20px 16px 8px 16px',
        background: '#ffffff',
        transition: 'border-color 0.15s',
      }}>
        <label style={{
          position: 'absolute',
          left: 16,
          transition: 'all 0.15s',
          pointerEvents: 'none',
          ...(floated
            ? { top: 8, fontSize: 12, color: error ? '#ef4444' : '#6b7280' }
            : { top: '50%', transform: 'translateY(-50%)', fontSize: 15, color: '#9ca3af' }
          ),
        }}>
          {label}
        </label>
        <input
          type="email"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          style={{
            width: '100%',
            fontSize: 15,
            color: '#1a1a1a',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            padding: 0,
          }}
        />
      </div>
      {error && errorMessage && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#ef4444', marginTop: 6, paddingLeft: 4 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {errorMessage}
        </div>
      )}
    </div>
  );
}

// ── Main content component ──────────────────────────────────────
export default function AccountSettingsContent({ C, isLight, userEmail }: { C: Theme; isLight: boolean; userEmail?: string }) {
  // Detect phone-only user (no real email — backend sends phone in the email field)
  const hasNoEmail = !userEmail || !userEmail.includes('@');

  // ── Email update modal state ──────────────────────────────────
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailModalStep, setEmailModalStep] = useState<'form' | 'success'>('form');
  const [newEmail, setNewEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [newEmailError, setNewEmailError] = useState('');
  const [confirmEmailError, setConfirmEmailError] = useState('');
  const [newEmailTouched, setNewEmailTouched] = useState(false);
  const [confirmEmailTouched, setConfirmEmailTouched] = useState(false);

  // Email display state (local override after email change)
  const [displayEmail, setDisplayEmail] = useState(hasNoEmail ? '' : (userEmail || 'user@email.com'));

  // Per-user localStorage key for verified status
  const verifiedKey = `berhot_email_verified_${(displayEmail || '').toLowerCase()}`;

  // Read persisted verification status from localStorage
  const [emailStatus, setEmailStatus] = useState<'verification_needed' | 'pending_verification' | 'verified' | 'no_email'>(() => {
    if (hasNoEmail) return 'no_email';
    try {
      const stored = localStorage.getItem(verifiedKey);
      if (stored === 'true') return 'verified';
    } catch { /* ignore */ }
    return 'verification_needed';
  });

  // Resend countdown
  const [resendCountdown, setResendCountdown] = useState(0);

  // Check URL for ?verified=true on mount (redirect from verification success page)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('verified') === 'true') {
      setEmailStatus('verified');
      try { localStorage.setItem(verifiedKey, 'true'); } catch { /* ignore */ }
      // Clean URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete('verified');
      window.history.replaceState(null, '', url.pathname);
    }
  }, []);

  // Derived validation
  const newEmailValid = isValidEmail(newEmail);
  const confirmEmailValid = isValidEmail(confirmEmail);
  const emailsMatch = newEmail === confirmEmail && newEmail.length > 0;
  const confirmEnabled = newEmailValid && confirmEmailValid && emailsMatch;

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Loading/error state for API calls
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Poll verification status while pending
  useEffect(() => {
    if (emailStatus !== 'pending_verification') return;
    const poll = setInterval(async () => {
      try {
        const userId = (() => { try { const s = localStorage.getItem('berhot_auth'); if (s) { const p = JSON.parse(s); return p.user?.id || p.user?.email || 'unknown'; } } catch { } return 'unknown'; })();
        const res = await fetch(`${EMAIL_SERVICE_URL}/verify/status?email=${encodeURIComponent(displayEmail)}&userId=${encodeURIComponent(userId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.verified) {
            setEmailStatus('verified');
            localStorage.setItem(verifiedKey, 'true');
            clearInterval(poll);
          }
        }
      } catch { /* ignore */ }
    }, 5000);
    return () => clearInterval(poll);
  }, [emailStatus, displayEmail]);

  // Helper: get userId from localStorage
  const getUserId = useCallback((): string => {
    try {
      const stored = localStorage.getItem('berhot_auth');
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.user?.id || parsed.user?.email || 'unknown';
      }
    } catch { /* ignore */ }
    return 'unknown';
  }, []);

  // ── Phone modal state ────────────────────────────────────────
  const [phoneModalOpen, setPhoneModalOpen] = useState(false);
  const [phoneModalStep, setPhoneModalStep] = useState<'form' | 'otp' | 'verifying'>('form');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [phoneLoading, setPhoneLoading] = useState(false);
  const otpRef = useRef<OtpInputHandle>(null);

  // Phone display state (persisted via localStorage per-user + berhot_auth)
  const phoneStorageKey = `berhot_phone_${getUserId()}`;
  const [displayPhone, setDisplayPhone] = useState<string | null>(() => {
    try {
      // First check localStorage phone cache
      const uid = (() => { try { const s = localStorage.getItem('berhot_auth'); if (s) { const p = JSON.parse(s); return p.user?.id || p.user?.email || 'unknown'; } } catch { } return 'unknown'; })();
      const stored = localStorage.getItem(`berhot_phone_${uid}`);
      if (stored) { const p = JSON.parse(stored); if (p.phone) return p.phone; }
      // Fallback: read phone from berhot_auth user object (set during registration/login)
      const authStr = localStorage.getItem('berhot_auth');
      if (authStr) { const auth = JSON.parse(authStr); if (auth.user?.phone) return auth.user.phone; }
    } catch { /* ignore */ }
    return null;
  });
  const [phoneVerified, setPhoneVerified] = useState<boolean>(() => {
    try {
      const uid = (() => { try { const s = localStorage.getItem('berhot_auth'); if (s) { const p = JSON.parse(s); return p.user?.id || p.user?.email || 'unknown'; } } catch { } return 'unknown'; })();
      const stored = localStorage.getItem(`berhot_phone_${uid}`);
      if (stored) { const p = JSON.parse(stored); return p.verified === true; }
    } catch { /* ignore */ }
    return false;
  });

  // ── Password state ────────────────────────────────────────
  const [hasPassword, setHasPassword] = useState<boolean | null>(null); // null = loading
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Fetch phone + email + password data from DB on mount (covers cases where localStorage doesn't have it)
  useEffect(() => {
    const userId = getUserId();
    if (userId === 'unknown') return;
    fetch(`${IDENTITY_URL}/internal/users/${userId}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (!data) return;
        if (data.phone) {
          setDisplayPhone(data.phone);
          const verified = data.phoneVerified === true;
          if (verified) {
            setPhoneVerified(true);
            localStorage.setItem(phoneStorageKey, JSON.stringify({ phone: data.phone, verified: true }));
          }
        }
        // Also sync email verified status from DB
        if (data.emailVerified && displayEmail && displayEmail.includes('@')) {
          setEmailStatus('verified');
          try { localStorage.setItem(verifiedKey, 'true'); } catch { /* ignore */ }
        }
        // Sync hasPassword from DB
        setHasPassword(data.hasPassword === true);
      })
      .catch(() => { /* ignore */ });
  }, []);

  // ── Handlers ──────────────────────────────────────────────────
  const handleOpenEmailModal = () => {
    setNewEmail('');
    setConfirmEmail('');
    setNewEmailError('');
    setConfirmEmailError('');
    setNewEmailTouched(false);
    setConfirmEmailTouched(false);
    setEmailModalStep('form');
    setEmailModalOpen(true);
  };

  const handleCloseEmailModal = () => {
    setEmailModalOpen(false);
  };

  /** Verify — sends verification email for the current email address */
  const handleVerify = async () => {
    if (verifyLoading) return;
    setVerifyLoading(true);
    try {
      const res = await fetch(`${EMAIL_SERVICE_URL}/verify/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: displayEmail, userId: getUserId() }),
      });
      if (res.ok) {
        setEmailStatus('pending_verification');
        setResendCountdown(30);
      }
    } catch { /* silently fail */ }
    setVerifyLoading(false);
  };

  /** Confirm email change — calls email-service to send verification to new email */
  const handleConfirmEmailChange = async () => {
    if (!confirmEnabled || verifyLoading) return;
    setVerifyLoading(true);
    try {
      const res = await fetch(`${EMAIL_SERVICE_URL}/change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, userId: getUserId() }),
      });
      if (res.ok) {
        // Update localStorage
        try {
          const stored = localStorage.getItem('berhot_auth');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.user) {
              parsed.user.email = newEmail;
              localStorage.setItem('berhot_auth', JSON.stringify(parsed));
            }
          }
        } catch { /* ignore */ }

        setDisplayEmail(newEmail);
        setEmailStatus('pending_verification');
        try { localStorage.removeItem(verifiedKey); } catch { /* ignore */ }
        setEmailModalStep('success');
        setResendCountdown(30);
      } else if (res.status === 409) {
        // Email already taken
        const data = await res.json().catch(() => ({}));
        setNewEmailError(data.message || 'This email is already associated with another account.');
      } else {
        setNewEmailError('Something went wrong. Please try again.');
      }
    } catch { /* silently fail */ }
    setVerifyLoading(false);
  };

  /** Resend — re-sends the pending verification email, falls back to new verification */
  const handleResend = async () => {
    if (resendCountdown > 0) return;
    try {
      const res = await fetch(`${EMAIL_SERVICE_URL}/resend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: displayEmail, userId: getUserId() }),
      });
      // If no pending verification found (404), send a fresh one
      if (!res.ok) {
        await fetch(`${EMAIL_SERVICE_URL}/verify/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: displayEmail, userId: getUserId() }),
        });
      }
    } catch { /* silently fail */ }
    setResendCountdown(30);
  };

  // ── Phone handlers ──────────────────────────────────────────
  const handleOpenPhoneModal = () => {
    setPhoneNumber('');
    setSelectedCountry(COUNTRIES[0]);
    setCountryDropdownOpen(false);
    setPhoneError('');
    setOtpError('');
    setPhoneModalStep('form');
    setPhoneModalOpen(true);
  };

  const handleClosePhoneModal = () => {
    setPhoneModalOpen(false);
  };

  const handlePhoneContinue = async () => {
    if (phoneLoading) return;
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Country-specific validation
    if (selectedCountry.code === 'SA') {
      // Saudi: 10 digits starting with 05, or 9 digits starting with 5
      const isValid10 = cleaned.length === 10 && cleaned.startsWith('05');
      const isValid9 = cleaned.length === 9 && cleaned.startsWith('5');
      if (!isValid10 && !isValid9) {
        setPhoneError('Enter a valid Saudi number (05XXXXXXXX or 5XXXXXXXX)');
        return;
      }
    } else {
      if (cleaned.length < 7 || cleaned.length > 12) {
        setPhoneError('Enter a valid phone number');
        return;
      }
    }

    // Normalize Saudi number: always store as 5XXXXXXXX (9 digits without leading 0)
    const normalizedLocal = selectedCountry.code === 'SA' && cleaned.startsWith('0')
      ? cleaned.slice(1)
      : cleaned;
    const fullPhone = selectedCountry.dial + normalizedLocal;

    // Check uniqueness against DB
    setPhoneLoading(true);
    setPhoneError('');
    try {
      const res = await fetch(
        `${IDENTITY_URL}/internal/check-phone?phone=${encodeURIComponent(fullPhone)}&exclude_user_id=${encodeURIComponent(getUserId())}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.taken) {
          setPhoneError('This phone number is already associated with another account.');
          setPhoneLoading(false);
          return;
        }
      }
    } catch {
      // If check fails, let it proceed (backend will catch duplicate on save)
    }
    setPhoneLoading(false);

    setPhoneError('');
    setPhoneModalStep('otp');
    setTimeout(() => otpRef.current?.focus(), 200);
  };

  const handleOtpComplete = async (code: string) => {
    if (code !== '1234') {
      setOtpError('Invalid code. Try again.');
      otpRef.current?.reset();
      return;
    }
    setOtpError('');
    setPhoneModalStep('verifying');

    const cleaned = phoneNumber.replace(/\D/g, '');
    const normalizedLocal = selectedCountry.code === 'SA' && cleaned.startsWith('0') ? cleaned.slice(1) : cleaned;
    const fullPhone = selectedCountry.dial + normalizedLocal;
    try {
      const res = await fetch(`${IDENTITY_URL}/internal/users/${getUserId()}/phone`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: fullPhone }),
      });
      if (res.ok) {
        localStorage.setItem(phoneStorageKey, JSON.stringify({ phone: fullPhone, verified: true }));
        try {
          const authStr = localStorage.getItem('berhot_auth');
          if (authStr) {
            const auth = JSON.parse(authStr);
            if (auth.user) { auth.user.phone = fullPhone; localStorage.setItem('berhot_auth', JSON.stringify(auth)); }
          }
        } catch { /* ignore */ }
        setDisplayPhone(fullPhone);
        setPhoneVerified(true);
        setTimeout(() => setPhoneModalOpen(false), 800);
      } else if (res.status === 409) {
        const data = await res.json().catch(() => ({}));
        setPhoneError(data.error || 'This phone number is already associated with another account.');
        setPhoneModalStep('form');
      } else {
        setPhoneError('Failed to save phone number. Please try again.');
        setPhoneModalStep('form');
      }
    } catch {
      setPhoneError('Network error. Please try again.');
      setPhoneModalStep('form');
    }
  };

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
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
              {emailStatus === 'verified' ? (
                <span style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#16a34a',
                  background: isLight ? '#dcfce7' : '#14532d40',
                  padding: '3px 10px',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Verified
                </span>
              ) : emailStatus === 'no_email' ? null : emailStatus === 'verification_needed' ? (
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
              ) : (
                <span style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#2563eb',
                  background: isLight ? '#dbeafe' : '#1e3a5f40',
                  padding: '3px 10px',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Pending verification
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {emailStatus === 'no_email' ? (
                <ActionLink color={C.textPrimary} onClick={handleOpenEmailModal}>Add</ActionLink>
              ) : emailStatus === 'verified' ? (
                <ActionLink color={C.textPrimary} onClick={handleOpenEmailModal}>Update</ActionLink>
              ) : emailStatus === 'verification_needed' ? (
                <ActionLink color={C.textPrimary} onClick={handleVerify}>{verifyLoading ? 'Sending...' : 'Verify'}</ActionLink>
              ) : resendCountdown > 0 ? (
                <span style={{ fontSize: 15, fontWeight: 600, color: '#9ca3af', cursor: 'default' }}>
                  Resend ({resendCountdown})
                </span>
              ) : (
                <ActionLink color={C.textPrimary} onClick={handleResend}>Resend</ActionLink>
              )}
              {emailStatus !== 'verified' && emailStatus !== 'no_email' && (
                <>
                  <span style={{ color: C.divider }}>|</span>
                  <ActionLink color={C.textPrimary} onClick={handleOpenEmailModal}>Update</ActionLink>
                </>
              )}
            </div>
          </div>
          <div style={{ fontSize: 14, color: C.textSecond, marginTop: 4 }}>{displayEmail || 'No email address'}</div>
        </div>
        <Divider color={C.divider} />

        {/* Phone row */}
        <div style={{ padding: '16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Phone</span>
              {phoneVerified && displayPhone && (
                <span style={{
                  fontSize: 12, fontWeight: 500, color: '#16a34a',
                  background: isLight ? '#dcfce7' : '#14532d40',
                  padding: '3px 10px', borderRadius: 12,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            <ActionLink color={C.textPrimary} onClick={handleOpenPhoneModal}>
              {displayPhone ? 'Update' : 'Add'}
            </ActionLink>
          </div>
          <div style={{ fontSize: 14, color: C.textSecond, marginTop: 4 }}>{displayPhone || 'No phone number'}</div>
        </div>
        <Divider color={C.divider} />

        {/* Password row */}
        <div style={{ padding: '16px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Password</span>
            {hasPassword === true ? (
              <ActionLink color={C.textPrimary} onClick={() => {
                setNewPassword('');
                setConfirmPassword('');
                setNewPasswordError('');
                setConfirmPasswordError('');
                setShowNewPassword(false);
                setShowConfirmPassword(false);
                setPasswordModalOpen(true);
              }}>Update</ActionLink>
            ) : hasPassword === false && emailStatus === 'verified' ? (
              <ActionLink color={C.textPrimary} onClick={() => {
                setNewPassword('');
                setConfirmPassword('');
                setNewPasswordError('');
                setConfirmPasswordError('');
                setShowNewPassword(false);
                setShowConfirmPassword(false);
                setPasswordModalOpen(true);
              }}>Add</ActionLink>
            ) : hasPassword === false ? (
              <span style={{ fontSize: 14, color: C.textDim, cursor: 'default' }}>—</span>
            ) : null}
          </div>
          <div style={{ fontSize: 14, color: C.textSecond, marginTop: 4 }}>
            {hasPassword === true
              ? 'Password is set'
              : hasPassword === false && emailStatus === 'verified'
                ? 'No password set. Add a password to sign in with your email.'
                : hasPassword === false
                  ? 'Add and verify an email address first to set a password.'
                  : ''}
          </div>
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

      {/* ═══════════ EMAIL UPDATE MODAL ═══════════ */}
      <Modal open={emailModalOpen} onClose={handleCloseEmailModal} width={480}>
        <div style={{
          background: '#ffffff',
          borderRadius: 16,
          padding: 32,
        }}>
          {emailModalStep === 'form' ? (
            <>
              {/* Header: X button (left) + Confirm button (right) */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
              }}>
                {/* X close button */}
                <button
                  onClick={handleCloseEmailModal}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: '#f3f4f6',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                {/* Confirm button */}
                <button
                  onClick={handleConfirmEmailChange}
                  disabled={!confirmEnabled || verifyLoading}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 24,
                    border: 'none',
                    background: verifyLoading ? '#9ca3af' : confirmEnabled ? '#1a1a1a' : '#e5e7eb',
                    color: verifyLoading ? '#ffffff' : confirmEnabled ? '#ffffff' : '#9ca3af',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: verifyLoading ? 'wait' : confirmEnabled ? 'pointer' : 'not-allowed',
                    transition: 'background 0.15s, color 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  {verifyLoading && (
                    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 0.6s linear infinite' }}>
                      <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
                      <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  )}
                  {verifyLoading ? 'Sending...' : 'Confirm'}
                </button>
              </div>

              {/* Title */}
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px 0' }}>
                {emailStatus === 'no_email' ? 'Add email address' : 'Change email address'}
              </h2>

              {/* Description */}
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, margin: '0 0 24px 0' }}>
                {emailStatus === 'no_email' ? (
                  'Add an email address to your account for login, receipts, account and marketing emails.'
                ) : (
                  <>
                    Enter a new email address that you'd like to associate with your account
                    for login, receipts, account and marketing emails.{' '}
                    <strong style={{ color: '#1a1a1a' }}>
                      You will no longer be able to log in with {displayEmail}.
                    </strong>
                  </>
                )}
              </p>

              {/* New Email input */}
              <div style={{ marginBottom: 16 }}>
                <FloatingInput
                  label={emailStatus === 'no_email' ? 'Email Address' : 'New Email Address'}
                  value={newEmail}
                  onChange={(val) => {
                    setNewEmail(val);
                    if (newEmailTouched) {
                      setNewEmailError(val.length > 0 && !isValidEmail(val) ? 'Enter a valid email.' : '');
                    }
                    // Also re-validate confirm if it was touched
                    if (confirmEmailTouched && confirmEmail.length > 0) {
                      if (!isValidEmail(confirmEmail)) {
                        setConfirmEmailError('Enter a valid email.');
                      } else if (val !== confirmEmail) {
                        setConfirmEmailError('Emails do not match.');
                      } else {
                        setConfirmEmailError('');
                      }
                    }
                  }}
                  onBlur={() => {
                    setNewEmailTouched(true);
                    if (newEmail.length > 0 && !isValidEmail(newEmail)) {
                      setNewEmailError('Enter a valid email.');
                    } else {
                      setNewEmailError('');
                    }
                  }}
                  error={!!newEmailError}
                  errorMessage={newEmailError}
                />
              </div>

              {/* Confirm Email input */}
              <div>
                <FloatingInput
                  label="Confirm Email Address"
                  value={confirmEmail}
                  onChange={(val) => {
                    setConfirmEmail(val);
                    if (confirmEmailTouched) {
                      if (val.length > 0 && !isValidEmail(val)) {
                        setConfirmEmailError('Enter a valid email.');
                      } else if (val.length > 0 && newEmail !== val) {
                        setConfirmEmailError('Emails do not match.');
                      } else {
                        setConfirmEmailError('');
                      }
                    }
                  }}
                  onBlur={() => {
                    setConfirmEmailTouched(true);
                    if (confirmEmail.length > 0 && !isValidEmail(confirmEmail)) {
                      setConfirmEmailError('Enter a valid email.');
                    } else if (confirmEmail.length > 0 && newEmail !== confirmEmail) {
                      setConfirmEmailError('Emails do not match.');
                    } else {
                      setConfirmEmailError('');
                    }
                  }}
                  error={!!confirmEmailError}
                  errorMessage={confirmEmailError}
                />
              </div>
            </>
          ) : (
            /* ── Step 2: "Check your email" success ── */
            <>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 12px 0' }}>
                Check your email
              </h2>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, margin: '0 0 32px 0' }}>
                We've sent a verification email with instructions to{' '}
                <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{newEmail}</span>
              </p>

              {/* Close button */}
              <button
                onClick={handleCloseEmailModal}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  borderRadius: 28,
                  border: 'none',
                  background: '#1a1a1a',
                  color: '#ffffff',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: 12,
                  transition: 'opacity 0.15s',
                }}
              >
                Close
              </button>

              {/* Resend verification button */}
              <button
                onClick={handleResend}
                disabled={resendCountdown > 0}
                style={{
                  width: '100%',
                  padding: '14px 0',
                  borderRadius: 28,
                  border: 'none',
                  background: '#f3f4f6',
                  color: resendCountdown > 0 ? '#9ca3af' : '#374151',
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: resendCountdown > 0 ? 'not-allowed' : 'pointer',
                  transition: 'color 0.15s',
                }}
              >
                {resendCountdown > 0 ? `Resend verification (${resendCountdown})` : 'Resend verification'}
              </button>
            </>
          )}
        </div>
      </Modal>

      {/* ═══════════ SET PASSWORD MODAL ═══════════ */}
      <Modal open={passwordModalOpen} onClose={() => setPasswordModalOpen(false)} width={480}>
        <div style={{ background: '#ffffff', borderRadius: 16, padding: 32 }}>
          {/* Header: X + Confirm */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <button
              onClick={() => setPasswordModalOpen(false)}
              style={{
                width: 36, height: 36, borderRadius: '50%', background: '#f3f4f6',
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <button
              onClick={async () => {
                // Validate
                if (newPassword.length < 8) {
                  setNewPasswordError('Password must be at least 8 characters.');
                  return;
                }
                if (newPassword !== confirmPassword) {
                  setConfirmPasswordError('Passwords do not match.');
                  return;
                }
                setNewPasswordError('');
                setConfirmPasswordError('');
                setPasswordSaving(true);
                try {
                  const res = await fetch(`${IDENTITY_URL}/internal/users/${getUserId()}/password`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password: newPassword }),
                  });
                  if (res.ok) {
                    setHasPassword(true);
                    setPasswordModalOpen(false);
                  } else {
                    const data = await res.json().catch(() => ({}));
                    setNewPasswordError(data.error || 'Failed to set password. Please try again.');
                  }
                } catch {
                  setNewPasswordError('Network error. Please try again.');
                }
                setPasswordSaving(false);
              }}
              disabled={passwordSaving || newPassword.length < 8 || newPassword !== confirmPassword || confirmPassword.length === 0}
              style={{
                padding: '10px 24px', borderRadius: 24, border: 'none',
                background: passwordSaving
                  ? '#9ca3af'
                  : (newPassword.length >= 8 && newPassword === confirmPassword && confirmPassword.length > 0)
                    ? '#1a1a1a'
                    : '#e5e7eb',
                color: passwordSaving
                  ? '#ffffff'
                  : (newPassword.length >= 8 && newPassword === confirmPassword && confirmPassword.length > 0)
                    ? '#ffffff'
                    : '#9ca3af',
                fontSize: 14, fontWeight: 600,
                cursor: passwordSaving
                  ? 'wait'
                  : (newPassword.length >= 8 && newPassword === confirmPassword && confirmPassword.length > 0)
                    ? 'pointer'
                    : 'not-allowed',
                transition: 'background 0.15s, color 0.15s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {passwordSaving && (
                <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 0.6s linear infinite' }}>
                  <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
                  <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              )}
              {passwordSaving ? 'Saving...' : 'Confirm'}
            </button>
          </div>

          {/* Title */}
          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px 0' }}>
            {hasPassword ? 'Update password' : 'Set a password'}
          </h2>

          {/* Description */}
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, margin: '0 0 24px 0' }}>
            {hasPassword
              ? 'Enter a new password for your account.'
              : 'Create a password to sign in with your email address instead of phone OTP.'}
          </p>

          {/* Password input */}
          <div style={{ marginBottom: 16 }}>
            <div style={{
              position: 'relative',
              border: `1.5px solid ${newPasswordError ? '#ef4444' : '#d1d5db'}`,
              borderRadius: 12,
              padding: '20px 16px 8px 16px',
              background: '#ffffff',
              transition: 'border-color 0.15s',
            }}>
              <label style={{
                position: 'absolute', left: 16, top: 8,
                fontSize: 12, color: newPasswordError ? '#ef4444' : '#6b7280',
                pointerEvents: 'none',
              }}>
                Password
              </label>
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newPasswordError && e.target.value.length >= 8) setNewPasswordError('');
                  if (confirmPasswordError && e.target.value === confirmPassword) setConfirmPasswordError('');
                }}
                style={{
                  width: '100%', fontSize: 15, color: '#1a1a1a',
                  background: 'transparent', border: 'none', outline: 'none', padding: 0,
                  paddingRight: 36,
                }}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {showNewPassword ? (
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
            {newPasswordError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#ef4444', marginTop: 6, paddingLeft: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {newPasswordError}
              </div>
            )}
          </div>

          {/* Confirm Password input */}
          <div>
            <div style={{
              position: 'relative',
              border: `1.5px solid ${confirmPasswordError ? '#ef4444' : '#d1d5db'}`,
              borderRadius: 12,
              padding: '20px 16px 8px 16px',
              background: '#ffffff',
              transition: 'border-color 0.15s',
            }}>
              <label style={{
                position: 'absolute', left: 16, top: 8,
                fontSize: 12, color: confirmPasswordError ? '#ef4444' : '#6b7280',
                pointerEvents: 'none',
              }}>
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError && newPassword === e.target.value) setConfirmPasswordError('');
                }}
                style={{
                  width: '100%', fontSize: 15, color: '#1a1a1a',
                  background: 'transparent', border: 'none', outline: 'none', padding: 0,
                  paddingRight: 36,
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  {showConfirmPassword ? (
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
            {confirmPasswordError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#ef4444', marginTop: 6, paddingLeft: 4 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {confirmPasswordError}
              </div>
            )}
          </div>

          {/* Password requirements hint */}
          <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5, marginTop: 16 }}>
            Password must be at least 8 characters long.
          </p>
        </div>
      </Modal>

      {/* ═══════════ PHONE ADD/UPDATE MODAL ═══════════ */}
      <Modal open={phoneModalOpen} onClose={handleClosePhoneModal} width={480}>
        <div style={{ background: '#ffffff', borderRadius: 16, padding: 32 }}>
          {phoneModalStep === 'form' ? (
            <>
              {/* Header: X + Continue */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <button onClick={handleClosePhoneModal} style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#f3f4f6',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <button onClick={handlePhoneContinue} disabled={phoneLoading} style={{
                  padding: '10px 24px', borderRadius: 24, border: 'none',
                  background: phoneLoading ? '#9ca3af' : phoneNumber.replace(/\D/g, '').length >= 7 ? '#1a1a1a' : '#e5e7eb',
                  color: phoneLoading ? '#ffffff' : phoneNumber.replace(/\D/g, '').length >= 7 ? '#ffffff' : '#9ca3af',
                  fontSize: 14, fontWeight: 600,
                  cursor: phoneLoading ? 'wait' : phoneNumber.replace(/\D/g, '').length >= 7 ? 'pointer' : 'not-allowed',
                  transition: 'background 0.15s, color 0.15s',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  {phoneLoading && (
                    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 0.6s linear infinite' }}>
                      <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" />
                      <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  )}
                  {phoneLoading ? 'Checking...' : 'Continue'}
                </button>
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px 0' }}>
                Add phone number
              </h2>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, margin: '0 0 24px 0' }}>
                You can use this phone number to sign in to your Berhot account. We'll send you a
                one-time verification code now to verify this phone number is yours.
              </p>

              {/* Country selector + Phone input */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                {/* Country dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '14px 12px',
                      borderRadius: 12, border: '1.5px solid #d1d5db', background: '#ffffff',
                      cursor: 'pointer', fontSize: 15, color: '#1a1a1a', minWidth: 160,
                      justifyContent: 'space-between', height: 52,
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 20 }}>{selectedCountry.flag}</span>
                      {/* <span>{selectedCountry.name} {selectedCountry.dial}</span> */}
                      <span> {selectedCountry.dial}</span>

                    </span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {countryDropdownOpen && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, minWidth: 240,
                      background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 12,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 10, marginTop: 4,
                      maxHeight: 200, overflowY: 'auto',
                    }}>
                      {COUNTRIES.map((c) => (
                        <button
                          key={c.code}
                          onClick={() => { setSelectedCountry(c); setCountryDropdownOpen(false); }}
                          style={{
                            width: '100%', padding: '10px 12px', border: 'none',
                            background: c.code === selectedCountry.code ? '#f3f4f6' : 'transparent',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                            fontSize: 14, color: '#1a1a1a', textAlign: 'left',
                          }}
                        >
                          <span style={{ fontSize: 18 }}>{c.flag}</span>
                          <span>{c.name}</span>
                          <span style={{ color: '#6b7280', marginLeft: 'auto' }}>{c.dial}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Phone input */}
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => { setPhoneNumber(e.target.value); setPhoneError(''); }}
                  placeholder="Mobile phone number"
                  style={{
                    flex: 1, padding: '14px 16px', borderRadius: 12,
                    border: `1.5px solid ${phoneError ? '#ef4444' : '#d1d5db'}`,
                    fontSize: 15, color: '#1a1a1a', outline: 'none', background: '#ffffff', height: 52,
                  }}
                />
              </div>

              {phoneError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#ef4444', marginTop: 6, paddingLeft: 4 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {phoneError}
                </div>
              )}

              <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.5, marginTop: 16 }}>
                Message and data rates may apply. Message frequency varies. Reply HELP for help or STOP to
                opt out.
              </p>
            </>
          ) : phoneModalStep === 'otp' ? (
            <>
              {/* Back button */}
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
                <button onClick={() => { setPhoneModalStep('form'); setOtpError(''); }} style={{
                  width: 36, height: 36, borderRadius: '50%', background: '#f3f4f6',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', margin: '0 0 8px 0', textAlign: 'center' }}>
                Verify your phone
              </h2>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, margin: '0 0 24px 0', textAlign: 'center' }}>
                Enter the 4-digit code sent to{' '}
                <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{selectedCountry.dial} {phoneNumber}</span>
              </p>
              <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginBottom: 24 }}>
                Dev mode: use code <strong style={{ color: '#1a1a1a' }}>1234</strong>
              </p>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <OtpInput
                  ref={otpRef}
                  length={4}
                  onComplete={handleOtpComplete}
                  error={otpError}
                />
              </div>

              {otpError && (
                <p style={{ fontSize: 13, color: '#ef4444', textAlign: 'center', marginTop: 12 }}>{otpError}</p>
              )}
            </>
          ) : (
            /* Verifying spinner */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0' }}>
              <svg width="40" height="40" viewBox="0 0 40 40" style={{ animation: 'spin 0.8s linear infinite', marginBottom: 16 }}>
                <circle cx="20" cy="20" r="16" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                <path d="M20 4a16 16 0 0 1 16 16" fill="none" stroke="#1a1a1a" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a1a' }}>Verifying...</p>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
