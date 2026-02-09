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

const BUSINESS_TYPE_TO_POS: Record<string, { name: string; port: number }> = {
  'Restaurant': { name: 'Restaurant POS', port: 3001 },
  'Cafe': { name: 'Cafe POS', port: 3002 },
  'Retail': { name: 'Retail POS', port: 3003 },
  'Appointment': { name: 'Appointment POS', port: 3004 },
};

const IS_PREVIEW = Number(window.location.port) >= 5000;
const DEV_TO_PREVIEW: Record<number, number> = { 3001: 5002, 3002: 5003, 3003: 5004, 3004: 5005 };
function resolvePort(devPort: number) { return IS_PREVIEW ? (DEV_TO_PREVIEW[devPort] || devPort) : devPort; }

const STORAGE_KEY = 'berhot_auth';
const POS_PRODUCTS_KEY = 'berhot_pos_products';

function getAllPosProducts(): Record<string, { name: string; port: number }> {
  try {
    const raw = localStorage.getItem(POS_PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

function getSavedPosProduct(email?: string): { name: string; port: number } | null {
  if (!email) {
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
    const all = getAllPosProducts();
    all[email] = posProduct;
    localStorage.setItem(POS_PRODUCTS_KEY, JSON.stringify(all));
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.posProduct = posProduct;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch { /* ignore */ }
}

/** Redirect to the user's saved POS dashboard, or product selector if none saved */
function redirectToDashboard(email?: string, lang?: string) {
  lang = lang || document.documentElement.lang || 'en';
  const savedProduct = getSavedPosProduct(email);

  if (savedProduct) {
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
    window.location.href = `/${lang}/dashboard`;
  }
}

export default function SignUpPageWrapper() {
  const { t, lang } = useTranslation();
  const { login, googleProfile, clearGoogleProfile } = useAuth();

  const pendingAuth = useRef<{
    accessToken: string;
    refreshToken: string;
    user: { id: string; email: string; firstName: string; lastName: string; role: string; tenantId: string };
  } | null>(null);

  const handleCheckUser = async (identifier: string): Promise<CheckUserResult> => {
    return checkUser(identifier);
  };

  const handleSignIn = async (email: string, password: string) => {
    const data = await signIn(email, password);
    login(data.accessToken, data.refreshToken, data.user);
    redirectToDashboard(data.user.email, lang);
  };

  const handleVerifyOtp = async (identifier: string, code: string) => {
    if (code !== '1234') throw new Error('Invalid code');
    const result = await checkUser(identifier);
    if (result.exists) {
      const data = await otpLogin(identifier, code);
      login(data.accessToken, data.refreshToken, data.user);
      redirectToDashboard(data.user.email, lang);
    }
  };

  const handleSignUp = async (data: {
    identifier: string;
    firstName: string;
    lastName: string;
    businessName: string;
    password: string;
    country?: string;
    googleId?: string;
  }) => {
    const result = await signUp(data);
    if (data.googleId) clearGoogleProfile();
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
    redirectToDashboard(data.user.email, lang);
  };

  const handleResendOtp = async (_identifier: string) => {
    // Dummy
  };

  const finalizePendingAuth = () => {
    if (pendingAuth.current) {
      login(pendingAuth.current.accessToken, pendingAuth.current.refreshToken, pendingAuth.current.user);
      const authData = { ...pendingAuth.current };
      pendingAuth.current = null;
      return authData;
    }
    return null;
  };

  const handleProtectAccount = async (phone: string) => {
    await sendOtp(phone);
  };

  const handleSkipProtect = () => {};

  const handleOnboardingComplete = (data: { businessType: string; annualRevenue: string }) => {
    const posProduct = BUSINESS_TYPE_TO_POS[data.businessType] || { name: 'Cafe POS', port: 3002 };
    const authData = finalizePendingAuth();
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
    if (userEmail) savePosProduct(userEmail, posProduct);
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
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

  const handleForgotPassword = async (_identifier: string) => {
    window.location.href = `/password?lang_code=${lang}`;
  };

  const handleLostEmailOrPhone = () => {
    window.location.href = `https://localhost/help/us/${lang}?reset_password=true&show_sq_bot=true`;
  };

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
      initialStep="register"
      t={t}
    />
  );
}
