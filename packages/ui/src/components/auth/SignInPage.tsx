import { useState, type ReactNode } from 'react';
import { SignInForm, type AuthStep, type CheckUserResult, type GoogleProfileData } from './SignInForm';

export interface SignInPageProps {
  onCheckUser: (identifier: string) => Promise<CheckUserResult>;
  onSignIn: (identifier: string, password: string) => Promise<void>;
  onVerifyOtp: (identifier: string, code: string) => Promise<void>;
  onSignUp: (data: {
    identifier: string;
    firstName: string;
    lastName: string;
    businessName: string;
    password: string;
    country?: string;
    googleId?: string;
  }) => Promise<void>;
  onGoogleSignIn?: () => void;
  onPasskeySignIn?: () => Promise<void>;
  onResendOtp?: (identifier: string) => Promise<void>;
  onProtectAccount?: (phone: string) => Promise<void>;
  onVerifyProtectOtp?: (phone: string, code: string) => Promise<void>;
  onSkipProtect?: () => void;
  onForgotPassword?: (identifier: string) => Promise<void>;
  onLostEmailOrPhone?: () => void;
  onOnboardingComplete?: (data: { businessType: string; annualRevenue: string }) => void;
  googleProfile?: GoogleProfileData | null;
  logo?: ReactNode;
  languageSwitcher?: ReactNode;
  initialStep?: AuthStep;
  t?: (key: string, params?: Record<string, string | number>) => string;
}

export function SignInPage({
  onCheckUser,
  onSignIn,
  onVerifyOtp,
  onSignUp,
  onGoogleSignIn,
  onPasskeySignIn,
  onResendOtp,
  onProtectAccount,
  onVerifyProtectOtp,
  onSkipProtect,
  onForgotPassword,
  onLostEmailOrPhone,
  onOnboardingComplete,
  googleProfile,
  logo,
  languageSwitcher,
  initialStep,
  t,
}: SignInPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const withLoading = <T extends unknown[], R>(fn: (...args: T) => Promise<R>) => {
    return async (...args: T): Promise<R> => {
      setLoading(true);
      setError('');
      try {
        const result = await fn(...args);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        throw err;
      } finally {
        setLoading(false);
      }
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Header: logo top-left ── */}
      <header className="px-4 sm:px-6 pt-4 sm:pt-6">
        {logo}
      </header>

      {/* ── Center: form ── */}
      <main className="flex-1 flex items-start sm:items-center justify-center px-4 sm:px-6 pt-10 sm:pt-0">
        <div className="w-full max-w-lg">
          <SignInForm
            onCheckUser={withLoading(onCheckUser)}
            onSignIn={onSignIn}
            onVerifyOtp={onVerifyOtp}
            onSignUp={withLoading(onSignUp)}
            onGoogleSignIn={onGoogleSignIn}
            onPasskeySignIn={onPasskeySignIn}
            onResendOtp={onResendOtp}
            onProtectAccount={onProtectAccount ? withLoading(onProtectAccount) : undefined}
            onVerifyProtectOtp={onVerifyProtectOtp}
            onSkipProtect={onSkipProtect}
            onForgotPassword={onForgotPassword ? withLoading(onForgotPassword) : undefined}
            onLostEmailOrPhone={onLostEmailOrPhone}
            onOnboardingComplete={onOnboardingComplete}
            googleProfile={googleProfile}
            loading={loading}
            error={error}
            initialStep={initialStep}
            t={t}
          />
        </div>
      </main>

      {/* ── Footer: copyright + language switcher + reCAPTCHA ── */}
      <footer className="px-4 sm:px-8 pb-4 sm:pb-6 pt-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} Berhot. All rights reserved.
        </p>

        <div className="flex items-center gap-4">
          {languageSwitcher}

          {/* reCAPTCHA badge */}
          {/* <div className="flex items-center gap-1.5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#1C3AA9" />
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#4285F4" />
              <path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="#1C3AA9" />
            </svg>
            <div className="leading-tight">
              <p className="text-[10px] text-gray-500">protected by <span className="font-semibold text-gray-700">reCAPTCHA</span></p>
              <p className="text-[9px] text-gray-400">
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="hover:underline">Privacy</a>
                {' - '}
                <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="hover:underline">Terms</a>
              </p>
            </div>
          </div> */}
        </div>
      </footer>
    </div>
  );
}
