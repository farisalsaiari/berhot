import { useRef } from 'react';
import { SignInPage } from '@berhot/ui';
import { useTranslation, LanguageSwitcher } from '@berhot/i18n';
import type { CheckUserResult } from '@berhot/ui';
import { checkUser, signIn, sendOtp, verifyOtp, signUp, getGoogleAuthUrl, passkeyLogin } from '../lib/auth-api';
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
  'Fine Dining': { name: 'Restaurant POS', port: 4001 },
  'Casual Dining': { name: 'Restaurant POS', port: 4001 },
  'Hotel': { name: 'Restaurant POS', port: 4001 },
  'Bar/Pub': { name: 'Restaurant POS', port: 4001 },
  'Nightclub': { name: 'Restaurant POS', port: 4001 },
  'Counter Service': { name: 'Restaurant POS', port: 4001 },
  'Fast Food': { name: 'Restaurant POS', port: 4001 },
  'Fast Casual': { name: 'Restaurant POS', port: 4001 },
  'Pizzeria': { name: 'Restaurant POS', port: 4001 },
  'Coffee Shop': { name: 'Cafe POS', port: 4002 },
  'Bakery': { name: 'Cafe POS', port: 4002 },
  'Deli/Grocery': { name: 'Retail POS', port: 4003 },
  'Food Truck/Concession': { name: 'Cafe POS', port: 4002 },
  'Delivery': { name: 'Cafe POS', port: 4002 },
  'Cafeteria': { name: 'Cafe POS', port: 4002 },
  'Catering': { name: 'Cafe POS', port: 4002 },
  'Retirement Home': { name: 'Cafe POS', port: 4002 },
  'Festival': { name: 'Cafe POS', port: 4002 },
};

const STORAGE_KEY = 'berhot_auth';

/** Get the saved POS product for the user, if any */
function getSavedPosProduct(): { name: string; port: number } | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.posProduct) return parsed.posProduct;
    }
  } catch {
    // ignore
  }
  return null;
}

/** Save the chosen POS product to auth storage */
function savePosProduct(posProduct: { name: string; port: number }) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.posProduct = posProduct;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch {
    // ignore
  }
}

/** Redirect to the user's POS dashboard, or product selector if none saved */
function redirectToDashboard(_authData?: { accessToken: string; refreshToken: string; user: object } | null) {
  const lang = document.documentElement.lang || 'en';
  const savedProduct = getSavedPosProduct();
  if (savedProduct) {
    // Build auth hash for cross-origin handoff
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const authHash = btoa(stored);
      window.location.href = `http://localhost:${savedProduct.port}/${lang}/dashboard/#auth=${authHash}`;
    } else {
      window.location.href = `http://localhost:${savedProduct.port}/${lang}/dashboard/`;
    }
  } else {
    // No saved product — go to product selector
    window.location.href = `/${lang}/dashboard`;
  }
}

export default function SignInPageWrapper() {
  const { t, lang } = useTranslation();
  const { isAuthenticated, login, googleProfile, clearGoogleProfile } = useAuth();

  // Hold pending auth data until protect step is resolved
  const pendingAuth = useRef<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; firstName: string; lastName: string; role: string; tenantId: string };
  } | null>(null);

  // ── Route protection: redirect authenticated users to dashboard ──
  if (isAuthenticated) {
    redirectToDashboard();
    return null;
  }

  const handleCheckUser = async (identifier: string): Promise<CheckUserResult> => {
    const result = await checkUser(identifier);
    return result;
  };

  const handleSignIn = async (email: string, password: string) => {
    const data = await signIn(email, password);
    // Don't login yet — store pending auth for after protect step
    pendingAuth.current = {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    };
  };

  const handleVerifyOtp = async (identifier: string, code: string) => {
    // Dummy OTP verification for now — accept "1234"
    if (code !== '1234') {
      throw new Error('Invalid code');
    }

    // Check if user exists — if so, log them in via real backend OTP verify
    try {
      const data = await verifyOtp(identifier, code);
      if (data.accessToken && data.user) {
        login(data.accessToken, data.refreshToken!, data.user);
        redirectToDashboard({ accessToken: data.accessToken, refreshToken: data.refreshToken!, user: data.user });
        return;
      }
    } catch {
      // Backend verify failed (no real OTP sent) — check if user exists
      const result = await checkUser(identifier);
      if (result.exists) {
        // Existing user, correct dummy code → redirect to dashboard
        // We don't have tokens here, so just redirect (dashboard will check its own storage)
        redirectToDashboard();
        return;
      }
      // New user — form will transition to register step (no throw = success)
    }
  };

  const handleSignUp = async (data: {
    identifier: string;
    firstName: string;
    lastName: string;
    businessName: string;
    password: string;
    googleId?: string;
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
    redirectToDashboard({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
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
    // Don't redirect — form will advance to business-type step for new users
    // For existing users (no onboarding), finalize and redirect
  };

  const handleSkipProtect = () => {
    // Don't redirect — form will advance to business-type step for new users
    // For existing users (no onboarding), finalize and redirect
  };

  const handleOnboardingComplete = (data: { businessType: string; annualRevenue: string }) => {
    // Map business type to POS product
    const posProduct = BUSINESS_TYPE_TO_POS[data.businessType] || { name: 'Cafe POS', port: 4002 };

    // Finalize pending auth (store tokens in context)
    finalizePendingAuth();

    // Save the chosen POS product
    savePosProduct(posProduct);

    // Redirect to the chosen POS dashboard
    const lang = document.documentElement.lang || 'en';
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const authHash = btoa(stored);
      window.location.href = `http://localhost:${posProduct.port}/${lang}/dashboard/#auth=${authHash}`;
    } else {
      window.location.href = `http://localhost:${posProduct.port}/${lang}/dashboard/`;
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
