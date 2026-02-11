import { useRef } from 'react';
import { SignInPage } from '@berhot/ui';
import { useTranslation, LanguageSwitcher } from '@berhot/i18n';
import type { CheckUserResult } from '@berhot/ui';
import { checkUser, signIn, sendOtp, verifyOtp, otpLogin, signUp, getGoogleAuthUrl, passkeyLogin } from '../lib/auth-api';
import { useAuth } from '../lib/auth-context';

function BerhotLogo() {
  return (
    <a href="/" className="flex items-center gap-2">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#2563eb" />
        <path
          d="M8 10h6a4 4 0 010 8H8V10zm0 4h6M10 18h5a4 4 0 010 8H10V18z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className="text-xl font-bold text-gray-900 tracking-tight">berhot</span>
    </a>
  );
}

// ── Business Type → POS Product Mapping ──────────────────
const BUSINESS_TYPE_TO_POS: Record<string, { name: string; port: number }> = {
  'Restaurant': { name: 'Restaurant POS', port: 3001 },
  'Cafe': { name: 'Cafe POS', port: 3002 },
  'Retail': { name: 'Retail POS', port: 3003 },
  'Appointment': { name: 'Appointment POS', port: 3004 },
};

// ── Dev/Preview port resolution ──────────────────────────
const IS_PREVIEW = Number(window.location.port) >= 5000;
const DEV_TO_PREVIEW: Record<number, number> = { 3001: 5002, 3002: 5003, 3003: 5004, 3004: 5005 };
function resolvePort(devPort: number) { return IS_PREVIEW ? (DEV_TO_PREVIEW[devPort] || devPort) : devPort; }

const STORAGE_KEY = 'berhot_auth';
const POS_PRODUCTS_KEY = 'berhot_pos_products'; // per-user map: { "email": { name, port } }

// ── Per-user POS product storage ─────────────────────────
// Stored as a map keyed by email so each user keeps their own POS choice

function getAllPosProducts(): Record<string, { name: string; port: number }> {
  try {
    const raw = localStorage.getItem(POS_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function getSavedPosProduct(email?: string): { name: string; port: number } | null {
  if (!email) {
    // Try to get email from current auth
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        email = parsed.user?.email;
      }
    } catch { /* ignore */ }
  }
  if (!email) return null;

  const all = getAllPosProducts();
  return all[email] || null;
}

function savePosProduct(email: string, posProduct: { name: string; port: number }) {
  try {
    // Save to per-user map
    const all = getAllPosProducts();
    all[email] = posProduct;
    localStorage.setItem(POS_PRODUCTS_KEY, JSON.stringify(all));

    // Also save inside berhot_auth for cross-origin handoff
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.posProduct = posProduct;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch { /* ignore */ }
}

/** Redirect to the user's POS dashboard, or product selector if none saved */
function redirectToDashboard(email?: string) {
  const lang = document.documentElement.lang || 'en';
  const savedProduct = getSavedPosProduct(email);

  if (savedProduct) {
    // Ensure posProduct is in berhot_auth for cross-origin handoff
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (!parsed.posProduct || parsed.posProduct.port !== savedProduct.port) {
          parsed.posProduct = savedProduct;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
      } catch { /* ignore */ }
      const authHash = btoa(localStorage.getItem(STORAGE_KEY)!);
      window.location.href = `http://localhost:${resolvePort(savedProduct.port)}/${lang}/dashboard/#auth=${authHash}`;
    } else {
      window.location.href = `http://localhost:${resolvePort(savedProduct.port)}/${lang}/dashboard/`;
    }
  } else {
    // No saved product — go to product selector
    window.location.href = `/${lang}/dashboard`;
  }
}

export default function SignInPageWrapper() {
  const { t, lang } = useTranslation();
  const { isAuthenticated, login, logout, user, googleProfile, clearGoogleProfile } = useAuth();

  // Hold pending auth data until protect step is resolved
  const pendingAuth = useRef<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; firstName: string; lastName: string; role: string; tenantId: string };
  } | null>(null);

  // ── Handle logout from POS apps (they redirect here with ?logout=true) ──
  const urlParams = new URLSearchParams(window.location.search);
  const isLoggingOut = urlParams.get('logout') === 'true';
  if (isLoggingOut) {
    // Sync the user's current POS product from the logout URL params
    // (POS apps send posProduct + email so landing app can update its own localStorage)
    const logoutEmail = urlParams.get('email');
    const logoutPosProduct = urlParams.get('posProduct');
    if (logoutEmail && logoutPosProduct) {
      try {
        const posProduct = JSON.parse(decodeURIComponent(logoutPosProduct));
        if (posProduct?.name && posProduct?.port) {
          savePosProduct(logoutEmail, posProduct);
        }
      } catch { /* ignore */ }
    }

    // Clear landing app auth and clean up the URL
    // (berhot_pos_products is per-user and preserved across logouts)
    localStorage.removeItem(STORAGE_KEY);
    logout();
    window.history.replaceState(null, '', window.location.pathname);
    // Don't redirect — fall through to show sign-in form
  } else if (isAuthenticated) {
    // ── Route protection: redirect authenticated users to dashboard ──
    redirectToDashboard(user?.email);
    return null;
  }

  const handleCheckUser = async (identifier: string): Promise<CheckUserResult> => {
    const result = await checkUser(identifier);
    return result;
  };

  const handleSignIn = async (email: string, password: string) => {
    const data = await signIn(email, password);
    // Existing user — finalize auth immediately and redirect to dashboard
    // (skips protect account + onboarding steps)
    login(data.accessToken, data.refreshToken, data.user);

    // Redirect to this user's saved POS product
    redirectToDashboard(data.user.email);
  };

  const handleVerifyOtp = async (identifier: string, code: string) => {
    // Dummy OTP verification for now — accept "1234"
    if (code !== '1234') {
      throw new Error('Invalid code');
    }

    // Check if user exists — if so, log them in via backend OTP login
    const result = await checkUser(identifier);
    if (result.exists) {
      // Existing phone user — authenticate via OTP login endpoint
      const data = await otpLogin(identifier, code);
      login(data.accessToken, data.refreshToken, data.user);
      redirectToDashboard(data.user.email);
      return;
    }
    // New user — form will transition to register step (no throw = success)
  };

  const handleSignUp = async (data: {
    identifier: string;
    firstName: string;
    lastName: string;
    businessName: string;
    password: string;
    country?: string;
    googleId?: string;
    email?: string;
  }) => {
    const result = await signUp(data);
    // Clear Google profile if this was a Google sign-up
    if (data.googleId) {
      clearGoogleProfile();
    }
    // Don't login yet — store pending auth for after protect step
    pendingAuth.current = {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      user: result.user,
    };
  };

  const handleGoogleSignIn = () => {
    const redirectUri = window.location.href.split('#')[0];
    window.location.href = getGoogleAuthUrl(lang, redirectUri);
  };

  const handlePasskeySignIn = async () => {
    const data = await passkeyLogin();
    login(data.accessToken, data.refreshToken, data.user);
    redirectToDashboard(data.user.email);
  };

  const handleResendOtp = async (_identifier: string) => {
    // Dummy — no real OTP send for now. Just restart the timer.
  };

  const finalizePendingAuth = () => {
    if (pendingAuth.current) {
      login(
        pendingAuth.current.accessToken,
        pendingAuth.current.refreshToken,
        pendingAuth.current.user,
      );
      const authData = { ...pendingAuth.current };
      pendingAuth.current = null;
      return authData;
    }
    return null;
  };

  const handleProtectAccount = async (phone: string) => {
    // Send OTP to the phone number for account protection
    await sendOtp(phone);

    // Save phone to user's account in the database
    if (pendingAuth.current?.user?.id) {
      try {
        await fetch(`http://localhost:8080/internal/users/${pendingAuth.current.user.id}/phone`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone }),
        });
        // Also update pending auth and localStorage with the phone
        if (pendingAuth.current.user) {
          (pendingAuth.current.user as Record<string, string>).phone = phone;
        }
      } catch {
        // Non-critical — phone can be added later from account settings
      }
    }
    // Don't redirect — form will advance to business-type step for new users
  };

  const handleVerifyProtectOtp = async (_phone: string, code: string) => {
    // Dummy OTP verification for protect step — accept "1234"
    if (code !== '1234') {
      throw new Error('Invalid code');
    }
    // OTP verified — form will advance to business-type step
  };

  const handleSkipProtect = () => {
    // Don't redirect — form will advance to business-type step for new users
  };

  const handleOnboardingComplete = (data: { businessType: string; annualRevenue: string }) => {
    // Map business type to POS product
    const posProduct = BUSINESS_TYPE_TO_POS[data.businessType] || { name: 'Cafe POS', port: 3002 };

    // Finalize pending auth (store tokens in context + localStorage)
    const authData = finalizePendingAuth();

    // Get user email — try authData first, then read from localStorage (most reliable)
    let userEmail = authData?.user?.email || '';
    if (!userEmail) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          userEmail = parsed.user?.email || '';
        }
      } catch { /* ignore */ }
    }

    // Save the chosen POS product for THIS user
    if (userEmail) {
      savePosProduct(userEmail, posProduct);
    }

    // Redirect to the chosen POS dashboard
    const lang = document.documentElement.lang || 'en';
    // Re-read berhot_auth to include posProduct in the hash
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      // Ensure posProduct is in the auth data for cross-origin handoff
      try {
        const parsed = JSON.parse(stored);
        parsed.posProduct = posProduct;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch { /* ignore */ }
      const authHash = btoa(localStorage.getItem(STORAGE_KEY)!);
      window.location.href = `http://localhost:${resolvePort(posProduct.port)}/${lang}/dashboard/#auth=${authHash}`;
    } else {
      window.location.href = `http://localhost:${resolvePort(posProduct.port)}/${lang}/dashboard/`;
    }
  };

  const handleForgotPassword = async (identifier: string) => {
    window.location.href = `/password?lang_code=${lang}`;
  };

  const handleLostEmailOrPhone = () => {
    window.location.href = `https://localhost/help/us/${lang}?reset_password=true&show_sq_bot=true`;
  };

  // ── Sign-in / Sign-up form ─────────────────────────────────
  return (
    <SignInPage
      onCheckUser={handleCheckUser}
      onSignIn={handleSignIn}
      onVerifyOtp={handleVerifyOtp}
      onSignUp={handleSignUp}
      onGoogleSignIn={handleGoogleSignIn}
      onPasskeySignIn={handlePasskeySignIn}
      onResendOtp={handleResendOtp}
      onProtectAccount={handleProtectAccount}
      onVerifyProtectOtp={handleVerifyProtectOtp}
      onSkipProtect={handleSkipProtect}
      onForgotPassword={handleForgotPassword}
      onLostEmailOrPhone={handleLostEmailOrPhone}
      onOnboardingComplete={handleOnboardingComplete}
      googleProfile={googleProfile}
      logo={<BerhotLogo />}
      languageSwitcher={<LanguageSwitcher />}
      t={t}
    />
  );
}
