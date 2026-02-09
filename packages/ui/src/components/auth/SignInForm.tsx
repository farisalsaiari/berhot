import { useState, useEffect, useRef, useCallback, type FormEvent } from 'react';
import { OtpInput, type OtpInputHandle } from './OtpInput';

export type AuthStep = 'identifier' | 'password' | 'otp' | 'register' | 'protect' | 'forgot' | 'passkey' | 'business-type' | 'revenue';

export interface CheckUserResult {
  exists: boolean;
  method?: 'password' | 'otp';
  destination?: string;
  firstName?: string;
}

export interface GoogleProfileData {
  email: string;
  firstName: string;
  lastName: string;
  googleId: string;
}

interface SignInFormProps {
  onCheckUser: (identifier: string) => Promise<CheckUserResult>;
  onSignIn: (identifier: string, password: string) => Promise<void>;
  onVerifyOtp: (identifier: string, code: string) => Promise<void>;
  onSignUp: (data: {
    identifier: string;
    firstName: string;
    lastName: string;
    businessName: string;
    password: string;
    googleId?: string;
  }) => Promise<void>;
  onResendOtp?: (identifier: string) => Promise<void>;
  onGoogleSignIn?: () => void;
  onPasskeySignIn?: () => Promise<void>;
  onProtectAccount?: (phone: string) => Promise<void>;
  onSkipProtect?: () => void;
  onForgotPassword?: (identifier: string) => Promise<void>;
  onLostEmailOrPhone?: () => void;
  onOnboardingComplete?: (data: { businessType: string; annualRevenue: string }) => void;
  googleProfile?: GoogleProfileData | null;
  loading?: boolean;
  error?: string;
  t?: (key: string, params?: Record<string, string | number>) => string;
}

// ── Validation helpers ──────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SAUDI_PHONE_REGEX = /^05\d{8}$/;

function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value);
}

function isSaudiPhone(value: string): boolean {
  const cleaned = value.replace(/[\s\-()]/g, '');
  return SAUDI_PHONE_REGEX.test(cleaned);
}

function looksLikePhone(value: string): boolean {
  const cleaned = value.replace(/[\s\-()]/g, '');
  return /^\d+$/.test(cleaned) || /^0\d+$/.test(cleaned) || /^\+?\d+$/.test(cleaned);
}

// ── Floating Label Input ────────────────────────────────────
function FloatingInput({
  label,
  value,
  onChange,
  type = 'text',
  autoFocus,
  autoComplete,
  dir,
  error,
  right,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  dir?: string;
  error?: boolean;
  right?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const floated = focused || hasValue;

  return (
    <div
      className={`relative border rounded-xl px-4 pt-5 pb-2 transition-colors ${error
        ? 'border-red-400'
        : focused
          ? 'border-gray-900'
          : 'border-gray-300'
        } bg-white`}
    >
      <label
        className={`absolute left-4 transition-all pointer-events-none ${floated
          ? 'top-2 text-xs text-gray-500'
          : 'top-1/2 -translate-y-1/2 text-base text-gray-400'
          }`}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        dir={dir}
        className="w-full text-base text-gray-900 bg-transparent outline-none pr-10"
      />
      {right && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2">{right}</div>
      )}
    </div>
  );
}

// ── Icons ───────────────────────────────────────────────────
function EyeIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function EyeSlashIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function PasskeyIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C9.24 2 7 4.24 7 7s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3zm-1 4H6c-3.31 0-6 2.69-6 6v1h14v-1c0-3.31-2.69-6-6-6zm8-2h-2v3h-3v2h3v3h2v-3h3v-2h-3v-3z" />
    </svg>
  );
}

function Spinner({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

// ── Business Type + Revenue Data ─────────────────────────
const BUSINESS_TYPES = [
  'Restaurant', 'Cafe', 'Retail', 'Appointment',
];

const REVENUE_OPTIONS = [
  'Unknown / No revenue', '1-300k', '301k-500k', '501k-1M',
  '1M-2M', '2M-5M', '5M+',
];

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-0">
      {Array.from({ length: total }, (_, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < current;
        const isActive = stepNum === current;
        return (
          <div key={stepNum} className="flex items-center">
            {i > 0 && (
              <div className={`w-8 h-0.5 ${stepNum <= current ? 'bg-red-500' : 'bg-gray-600'}`} />
            )}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 ${
                isCompleted
                  ? 'bg-red-500 border-red-500 text-white'
                  : isActive
                    ? 'bg-transparent border-red-500 text-red-500'
                    : 'bg-transparent border-gray-600 text-gray-500'
              }`}
            >
              {isCompleted ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : (
                stepNum
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StorefrontIcon() {
  return (
    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  );
}

function DollarIcon() {
  return (
    <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <circle cx="12" cy="12" r="10" strokeWidth="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.5 9.5c-.5-1-1.5-1.5-2.5-1.5s-2 .5-2 1.5 1 1.5 2 1.5 2 .5 2 1.5-1 1.5-2 1.5-2-.5-2.5-1.5M12 7v1m0 8v1" />
    </svg>
  );
}

// ── Main Component ──────────────────────────────────────────
export function SignInForm({
  onCheckUser,
  onSignIn,
  onVerifyOtp,
  onSignUp,
  onResendOtp,
  onGoogleSignIn,
  onPasskeySignIn,
  onProtectAccount,
  onSkipProtect,
  onForgotPassword,
  onLostEmailOrPhone,
  onOnboardingComplete,
  googleProfile,
  loading = false,
  error,
  t = (key) => {
    const fallbacks: Record<string, string> = {
      'auth.signIn': 'Sign in',
      'auth.enterIdentifier': 'Enter your email or phone number',
      'auth.emailOrPhone': 'Email or phone number',
      'auth.continue': 'Continue',
      'auth.welcomeBack': 'Welcome back.',
      'auth.welcomeNew': 'Welcome.',
      'auth.niceToHaveYou': 'Great to have you on board!',
      'auth.welcomeBackMsg': 'Good to see you again!',
      'auth.change': 'Change',
      'auth.password': 'Password',
      'auth.forgotPassword': 'Forgot password?',
      'auth.enterCode': 'Enter the verification code sent to',
      'auth.resendCode': 'Resend code',
      'auth.resendIn': 'Resend in {{seconds}}s',
      'auth.createAccount': 'Create your account',
      'auth.firstName': 'First name',
      'auth.lastName': 'Last name',
      'auth.businessName': 'Business name',
      'auth.signUp': 'Sign up',
      'auth.newToBerhot': 'New to Berhot?',
      'auth.alreadyHaveAccount': 'Already have an account? Sign in',
      'auth.orContinueWith': 'or',
      'auth.signInWithGoogle': 'Sign in with Google',
      'auth.signInWithPasskey': 'Sign in with a passkey',
      'auth.invalidEmail': 'Please enter a valid email address',
      'auth.invalidPhone': 'Saudi phone numbers must start with 05 and be 10 digits',
      'auth.protectAccount': 'Protect your account',
      'auth.protectAccountDesc': "We\u2019ll send you a one-time passcode now and each time you log in to ensure that you\u2019re the only one with access to your account.",
      'auth.mobileNumber': 'Mobile phone number',
      'auth.country': 'Country',
      'auth.sendCode': 'Send code',
      'auth.remindMeNextTime': 'Remind me next time',
      'auth.resetPassword': 'Reset your password',
      'auth.resetPasswordDesc': 'Enter the email address or phone number you used to register with.',
      'auth.sendInstructions': 'Send instructions',
      'auth.backToLogin': 'Back to login',
      'auth.lostEmailOrPhone': 'Forgot or lost your email or phone number?',
      'auth.otpInvalidCode': 'Incorrect code. {{remaining}} attempts remaining.',
      'auth.otpLastAttempt': 'Incorrect code. Last attempt before lockout.',
      'auth.otpLocked': 'Too many failed attempts. Try again in {{minutes}}:{{seconds}}.',
      'auth.otpMaxResends': 'Maximum resend attempts reached. Please try again later.',
      'auth.invalidPassword': 'Invalid email or password',
      'auth.passwordTooShort': 'Password must be at least 8 characters',
      'auth.verifyingYou': "Verifying it\u2019s you\u2026",
      'auth.completePasskey': 'Complete sign-in using your passkey.',
      'auth.signInAnotherWay': 'Sign in another way',
      'auth.passkeyFailed': 'Passkey authentication failed. Please try another sign-in method.',
      'common.back': 'Back',
    };
    return fallbacks[key] || key;
  },
}: SignInFormProps) {
  const [step, setStep] = useState<AuthStep>('identifier');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpDestination, setOtpDestination] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [isExistingUser, setIsExistingUser] = useState(false);
  const [userName, setUserName] = useState('');
  const [protectPhone, setProtectPhone] = useState('');
  const [protectPhoneError, setProtectPhoneError] = useState('');
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetValidationError, setResetValidationError] = useState('');
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [googleId, setGoogleId] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [regPasswordError, setRegPasswordError] = useState('');
  const [passkeyError, setPasskeyError] = useState('');
  const [passkeyLoading, setPasskeyLoading] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [selectedBusinessType, setSelectedBusinessType] = useState('');
  const [selectedRevenue, setSelectedRevenue] = useState('');

  // ── OTP security state ──────────────────────────────────
  const otpInputRef = useRef<OtpInputHandle>(null);
  const [otpError, setOtpError] = useState('');
  const [otpAttempts, setOtpAttempts] = useState(0);
  const [otpLockoutUntil, setOtpLockoutUntil] = useState<number>(0);
  const [otpLockoutDisplay, setOtpLockoutDisplay] = useState('');
  const [otpResendCount, setOtpResendCount] = useState(0);
  const MAX_OTP_ATTEMPTS = 3;
  const LOCKOUT_DURATION = 10 * 60 * 1000; // 10 minutes
  const MAX_RESENDS = 3;

  // Lockout countdown timer
  useEffect(() => {
    if (otpLockoutUntil <= Date.now()) {
      setOtpLockoutDisplay('');
      return;
    }
    const tick = () => {
      const remaining = otpLockoutUntil - Date.now();
      if (remaining <= 0) {
        setOtpLockoutDisplay('');
        setOtpAttempts(0);
        setOtpError('');
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setOtpLockoutDisplay(
        t('auth.otpLocked', {
          minutes: String(mins).padStart(2, '0'),
          seconds: String(secs).padStart(2, '0'),
        })
      );
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [otpLockoutUntil, t]);

  const isOtpLocked = otpLockoutUntil > Date.now();

  // Auto-fill from Google profile (new Google user → register step)
  useEffect(() => {
    if (googleProfile) {
      setIdentifier(googleProfile.email);
      setFirstName(googleProfile.firstName);
      setLastName(googleProfile.lastName);
      setGoogleId(googleProfile.googleId);
      setIsExistingUser(false);
      setStep('register');
    }
  }, [googleProfile]);

  // Resend OTP timer
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (resendTimer > 0) {
      timerRef.current = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resendTimer]);

  const startResendTimer = () => setResendTimer(60);

  // ── Validation ──────────────────────────────────────────
  const validateIdentifier = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (looksLikePhone(trimmed)) {
      if (!isSaudiPhone(trimmed)) return t('auth.invalidPhone');
      return null;
    }
    if (!isValidEmail(trimmed)) return t('auth.invalidEmail');
    return null;
  };

  const identifierValid = (() => {
    const trimmed = identifier.trim();
    if (!trimmed) return false;
    return validateIdentifier(trimmed) === null;
  })();

  const resetIdentifierValid = (() => {
    const trimmed = resetIdentifier.trim();
    if (!trimmed) return false;
    return validateIdentifier(trimmed) === null;
  })();

  // ── Handlers ────────────────────────────────────────────
  const handleCheckUser = async (e: FormEvent) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);
    const trimmed = identifier.trim();
    if (!trimmed) return;

    const valError = validateIdentifier(trimmed);
    if (valError) {
      setValidationError(valError);
      return;
    }
    setValidationError('');

    const isPhone = looksLikePhone(trimmed) && isSaudiPhone(trimmed);
    setIdentifierType(isPhone ? 'phone' : 'email');

    const result = await onCheckUser(trimmed);
    if (result.exists) {
      setIsExistingUser(true);
      setUserName(result.firstName || '');
      if (result.method === 'otp' || isPhone) {
        setOtpDestination(result.destination || identifier);
        setStep('otp');
        startResendTimer();
      } else {
        setStep('password');
      }
    } else {
      setIsExistingUser(false);
      if (isPhone) {
        setOtpDestination(trimmed);
        setStep('otp');
        startResendTimer();
      } else {
        setStep('register');
      }
    }
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setSignInLoading(true);
    try {
      await onSignIn(identifier, password);
      // Existing users skip onboarding — go to protect only, then redirect
      // New users (shouldn't reach here, but just in case) get onboarding
      if (isExistingUser) {
        // Skip protect + onboarding for returning users — let the wrapper redirect
        return;
      }
      if (identifierType === 'email') {
        setStep('protect');
      }
    } catch {
      setPasswordError(t('auth.invalidPassword'));
    } finally {
      setSignInLoading(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    // Check lockout
    if (isOtpLocked) return;

    try {
      await onVerifyOtp(identifier, code);
      // Success — clear error state
      setOtpError('');
      setOtpAttempts(0);
      if (!isExistingUser) {
        // New users go to register step after OTP
        setStep('register');
      }
      // Existing phone users — the wrapper handles redirect via otpLogin, no step change needed
    } catch {
      // Wrong code — increment attempts
      const newAttempts = otpAttempts + 1;
      setOtpAttempts(newAttempts);

      if (newAttempts >= MAX_OTP_ATTEMPTS) {
        // Lockout
        setOtpLockoutUntil(Date.now() + LOCKOUT_DURATION);
        setOtpError('');
      } else if (newAttempts === MAX_OTP_ATTEMPTS - 1) {
        // Last attempt warning
        setOtpError(t('auth.otpLastAttempt'));
      } else {
        setOtpError(
          t('auth.otpInvalidCode', { remaining: MAX_OTP_ATTEMPTS - newAttempts })
        );
      }

      // Clear inputs and refocus
      otpInputRef.current?.reset();
    }
  };

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    if (regPassword.length < 8) {
      setRegPasswordError(t('auth.passwordTooShort'));
      return;
    }
    setRegPasswordError('');
    await onSignUp({ identifier, firstName, lastName, businessName, password: regPassword, googleId: googleId || undefined });
    if (identifierType === 'email') {
      setStep('protect');
    } else if (onOnboardingComplete) {
      setStep('business-type');
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isOtpLocked) return;
    if (otpResendCount >= MAX_RESENDS) {
      setOtpError(t('auth.otpMaxResends'));
      return;
    }
    await onResendOtp?.(identifier);
    setOtpResendCount((c) => c + 1);
    setOtpError('');
    setOtpAttempts(0);
    otpInputRef.current?.reset();
    startResendTimer();
  };

  const handleProtectSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const cleaned = protectPhone.replace(/[\s\-()]/g, '');
    if (!SAUDI_PHONE_REGEX.test(cleaned)) {
      setProtectPhoneError(t('auth.invalidPhone'));
      return;
    }
    setProtectPhoneError('');
    await onProtectAccount?.(cleaned);
    if (onOnboardingComplete) {
      setStep('business-type');
    }
  };

  const handleForgotPassword = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = resetIdentifier.trim();
    if (!trimmed) return;

    const valError = validateIdentifier(trimmed);
    if (valError) {
      setResetValidationError(valError);
      return;
    }
    setResetValidationError('');
    await onForgotPassword?.(trimmed);
  };

  const goToForgot = () => {
    setResetIdentifier(identifier);
    setResetValidationError('');
    setStep('forgot');
  };

  const goBack = () => {
    setStep('identifier');
    setPassword('');
    setShowPassword(false);
    setValidationError('');
    setHasAttemptedSubmit(false);
    setResendTimer(0);
    // Reset OTP security state
    setOtpError('');
    setOtpAttempts(0);
    setOtpLockoutUntil(0);
    setOtpResendCount(0);
    // Reset passkey state
    setPasskeyError('');
    setPasskeyLoading(false);
    // Reset password errors
    setPasswordError('');
    setRegPasswordError('');
  };

  // ── Styles ──────────────────────────────────────────────
  const btnBlack =
    'inline-flex items-center justify-center px-8 py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const btnBlackFull =
    'w-full flex items-center justify-center py-3.5 bg-gray-900 text-white text-sm font-semibold rounded-full hover:bg-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const btnGrayFull =
    'w-full flex items-center justify-center py-3.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors gap-2.5';
  const btnGrayPill =
    'inline-flex items-center justify-center px-8 py-3.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-200 transition-colors';
  const linkUnderline =
    'text-sm text-gray-900 underline underline-offset-4 decoration-gray-400 hover:decoration-gray-900 font-medium transition-colors';

  return (
    <div className="w-full max-w-md">
      {error && step !== 'password' && step !== 'passkey' && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          STEP 1: SIGN IN — Email / Phone + Passkey
          ════════════════════════════════════════════════════════ */}
      {step === 'identifier' && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('auth.signIn')}</h1>
            <p className="text-base text-gray-500 mt-2">
              {t('auth.newToBerhot')}{' '}
              <a href={`/${(typeof window !== 'undefined' && window.location.pathname.split('/')[1]) || 'en'}/signup`} className={linkUnderline}>
                {t('auth.createAccount')}
              </a>
            </p>
          </div>

          <form onSubmit={handleCheckUser} className="space-y-6">
            <div>
              <FloatingInput
                label={t('auth.emailOrPhone')}
                value={identifier}
                onChange={(val) => {
                  setIdentifier(val);
                  if (hasAttemptedSubmit) {
                    const trimmed = val.trim();
                    if (!trimmed) {
                      setValidationError('');
                    } else {
                      const err = validateIdentifier(trimmed);
                      setValidationError(err || '');
                    }
                  }
                }}
                autoFocus
                autoComplete="username"
                error={!!validationError}
              />
              {validationError && (
                <p className="text-xs text-red-600 mt-1.5 ml-1">{validationError}</p>
              )}
            </div>

            <button type="submit" disabled={loading || !identifier.trim()} className={btnBlackFull}>
              {loading ? <Spinner /> : t('auth.continue')}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-400">{t('auth.orContinueWith')}</span>
            </div>
          </div>

          {/* Google + Passkey buttons */}
          <div className="space-y-3">
            {onGoogleSignIn && (
              <button onClick={onGoogleSignIn} className="w-full flex items-center justify-center py-3.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-full hover:bg-gray-50 transition-colors gap-2.5">
                <GoogleIcon />
                {t('auth.signInWithGoogle')}
              </button>
            )}
            {onPasskeySignIn && (
              <button onClick={() => {
                setStep('passkey');
                setPasskeyError('');
                setPasskeyLoading(true);
                onPasskeySignIn().catch((err) => {
                  setPasskeyError(err instanceof Error ? err.message : t('auth.passkeyFailed'));
                }).finally(() => {
                  setPasskeyLoading(false);
                });
              }} className={btnGrayFull}>
                <PasskeyIcon />
                {t('auth.signInWithPasskey')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          STEP 2a: PASSWORD (existing email user)
          ════════════════════════════════════════════════════════ */}
      {step === 'password' && (
        <form onSubmit={handleSignIn} className="space-y-8">
          {/* Welcome heading */}
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {isExistingUser ? t('auth.welcomeBack') : t('auth.welcomeNew')}
          </h1>

          {/* Email + Change link */}
          <div className="flex items-center gap-3">
            <span className="text-base text-gray-700">{identifier}</span>
            <button type="button" onClick={goBack} className={linkUnderline}>
              {t('auth.change')}
            </button>
          </div>

          {/* Password with floating label + eye icon */}
          <div>
            <FloatingInput
              label={t('auth.password')}
              value={password}
              onChange={(val) => {
                setPassword(val);
                if (passwordError) setPasswordError('');
              }}
              type={showPassword ? 'text' : 'password'}
              autoFocus
              autoComplete="current-password"
              error={!!passwordError}
              right={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:opacity-70 transition-opacity"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </button>
              }
            />
            {passwordError && (
              <p className="text-xs text-red-600 mt-1.5 ml-1">{passwordError}</p>
            )}
          </div>

          {/* Forgot password */}
          <div>
            <button type="button" onClick={goToForgot} className={linkUnderline}>
              {t('auth.forgotPassword')}
            </button>
          </div>

          {/* Sign In button — left aligned, not full width */}
          <div>
            <button type="submit" disabled={signInLoading || !password} className={btnBlack}>
              {signInLoading ? <Spinner /> : t('auth.signIn')}
            </button>
          </div>
        </form>
      )}

      {/* ════════════════════════════════════════════════════════
          STEP 2b: OTP (phone user)
          ════════════════════════════════════════════════════════ */}
      {step === 'otp' && (
        <div className="space-y-8">
          {/* Welcome heading */}
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {isExistingUser ? t('auth.welcomeBack') : t('auth.welcomeNew')}
          </h1>

          {/* Phone + Change */}
          <div className="flex items-center gap-3">
            <span className="text-base text-gray-700">{identifier}</span>
            <button type="button" onClick={goBack} className={linkUnderline}>
              {t('auth.change')}
            </button>
          </div>

          {/* OTP info */}
          <p className="text-base text-gray-600">
            {t('auth.enterCode')} <span className="font-medium">{otpDestination}</span>
          </p>

          {/* OTP boxes — 4 digits + error + lockout */}
          {isOtpLocked ? (
            <div className="text-center py-4">
              <div className="inline-flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl">
                <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p className="text-sm font-medium text-red-700">{otpLockoutDisplay}</p>
              </div>
            </div>
          ) : (
            <OtpInput
              ref={otpInputRef}
              length={4}
              onComplete={handleVerifyOtp}
              disabled={loading || isOtpLocked}
              error={otpError}
            />
          )}

          {/* Resend with countdown timer */}
          {!isOtpLocked && (
            <div>
              {resendTimer > 0 ? (
                <p className="text-sm text-gray-400">
                  {t('auth.resendIn', { seconds: resendTimer })}
                </p>
              ) : otpResendCount >= MAX_RESENDS ? (
                <p className="text-sm text-gray-400">
                  {t('auth.otpMaxResends')}
                </p>
              ) : (
                <button type="button" onClick={handleResendOtp} disabled={loading} className={linkUnderline}>
                  {t('auth.resendCode')}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          STEP 2c: REGISTER (new email user)
          ════════════════════════════════════════════════════════ */}
      {step === 'register' && (
        <form onSubmit={handleSignUp} className="space-y-6">
          {/* Welcome heading */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('auth.welcomeNew')}</h1>
            <p className="text-base text-gray-500 mt-1">{t('auth.niceToHaveYou')}</p>
          </div>

          {/* Email + Change */}
          <div className="flex items-center gap-3">
            <span className="text-base text-gray-700">{identifier}</span>
            <button type="button" onClick={goBack} className={linkUnderline}>
              {t('auth.change')}
            </button>
          </div>

          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <FloatingInput
              label={t('auth.firstName')}
              value={firstName}
              onChange={setFirstName}
              autoFocus
              autoComplete="given-name"
            />
            <FloatingInput
              label={t('auth.lastName')}
              value={lastName}
              onChange={setLastName}
              autoComplete="family-name"
            />
          </div>

          {/* Business name */}
          <FloatingInput
            label={t('auth.businessName')}
            value={businessName}
            onChange={setBusinessName}
            autoComplete="organization"
          />

          {/* Password with eye toggle */}
          <div>
            <FloatingInput
              label={t('auth.password')}
              value={regPassword}
              onChange={(val) => {
                setRegPassword(val);
                if (regPasswordError) {
                  if (val.length >= 8) setRegPasswordError('');
                }
              }}
              type={showRegPassword ? 'text' : 'password'}
              autoComplete="new-password"
              error={!!regPasswordError}
              right={
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="p-1 hover:opacity-70 transition-opacity"
                  tabIndex={-1}
                >
                  {showRegPassword ? <EyeIcon /> : <EyeSlashIcon />}
                </button>
              }
            />
            {regPasswordError && (
              <p className="text-xs text-red-600 mt-1.5 ml-1">{regPasswordError}</p>
            )}
          </div>

          {/* Sign Up button */}
          <div>
            <button
              type="submit"
              disabled={loading || !firstName || !lastName || !regPassword}
              className={btnBlack}
            >
              {loading ? <Spinner /> : t('auth.signUp')}
            </button>
          </div>

          <div>
            <button type="button" onClick={goBack} className={linkUnderline}>
              {t('auth.alreadyHaveAccount')}
            </button>
          </div>
        </form>
      )}

      {/* ════════════════════════════════════════════════════════
          STEP 3: PROTECT YOUR ACCOUNT
          ════════════════════════════════════════════════════════ */}
      {step === 'protect' && (
        <form onSubmit={handleProtectSubmit} className="space-y-8">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {t('auth.protectAccount')}
          </h1>

          {/* Description */}
          <p className="text-base text-gray-600 leading-relaxed">
            {t('auth.protectAccountDesc')}
          </p>

          {/* Country + Phone side by side */}
          <div className="grid grid-cols-5 gap-4">
            {/* Country selector */}
            <div className="col-span-2 border border-gray-300 rounded-xl px-4 pt-5 pb-2 bg-white relative">
              <label className="absolute left-4 top-2 text-xs text-gray-500">{t('auth.country')}</label>
              <div className="flex items-center gap-2 text-base text-gray-900">
                <span className="text-lg">🇸🇦</span>
                <span>Saudi +966</span>
                <svg className="w-4 h-4 text-gray-400 ml-auto" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            {/* Phone input */}
            <div className="col-span-3">
              <FloatingInput
                label={t('auth.mobileNumber')}
                value={protectPhone}
                onChange={(val) => {
                  setProtectPhone(val);
                  if (protectPhoneError) setProtectPhoneError('');
                }}
                type="tel"
                autoFocus
                dir="ltr"
                error={!!protectPhoneError}
              />
              {protectPhoneError && (
                <p className="text-xs text-red-600 mt-1.5 ml-1">{protectPhoneError}</p>
              )}
            </div>
          </div>

          {/* Buttons: Remind me (left) — Send code (right) */}
          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={() => {
  onSkipProtect?.();
  if (onOnboardingComplete) {
    setStep('business-type');
  }
}} className={btnGrayPill}>
              {t('auth.remindMeNextTime')}
            </button>
            <button type="submit" disabled={loading || !protectPhone.trim()} className={btnBlack}>
              {loading ? <Spinner /> : t('auth.sendCode')}
            </button>
          </div>
        </form>
      )}

      {/* ════════════════════════════════════════════════════════
          FORGOT PASSWORD
          ════════════════════════════════════════════════════════ */}
      {step === 'forgot' && (
        <form onSubmit={handleForgotPassword} className="space-y-8">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {t('auth.resetPassword')}
          </h1>

          {/* Description */}
          <p className="text-base text-gray-600">
            {t('auth.resetPasswordDesc')}
          </p>

          {/* Email or phone input — pre-filled */}
          <div>
            <FloatingInput
              label={t('auth.emailOrPhone')}
              value={resetIdentifier}
              onChange={(val) => {
                setResetIdentifier(val);
                const trimmed = val.trim();
                if (!trimmed) {
                  setResetValidationError('');
                } else {
                  const err = validateIdentifier(trimmed);
                  setResetValidationError(err || '');
                }
              }}
              autoFocus
              autoComplete="username"
              error={!!resetValidationError}
            />
            {resetValidationError && (
              <p className="text-xs text-red-600 mt-1.5 ml-1">{resetValidationError}</p>
            )}
          </div>

          {/* Lost email/phone link */}
          <div>
            <button type="button" onClick={onLostEmailOrPhone} className={linkUnderline}>
              {t('auth.lostEmailOrPhone')}
            </button>
          </div>

          {/* Buttons: Back to login (left) — Send instructions (right) */}
          <div className="flex items-center justify-between pt-2">
            <button type="button" onClick={goBack} className={btnGrayPill}>
              {t('auth.backToLogin')}
            </button>
            <button type="submit" disabled={loading || !resetIdentifierValid} className={btnBlack}>
              {loading ? <Spinner /> : t('auth.sendInstructions')}
            </button>
          </div>
        </form>
      )}

      {/* ════════════════════════════════════════════════════════
          PASSKEY VERIFICATION
          ════════════════════════════════════════════════════════ */}
      {step === 'passkey' && (
        <div className="space-y-8">
          {/* Magnifying glass icon */}
          <div>
            <svg className="w-16 h-16" viewBox="0 0 64 64" fill="none">
              <circle cx="28" cy="28" r="18" stroke="currentColor" strokeWidth="4" fill="none" />
              <line x1="40.5" y1="40.5" x2="56" y2="56" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
              <circle cx="28" cy="28" r="6" fill="currentColor" opacity="0.2" />
              <circle cx="26" cy="26" r="2.5" fill="#2563eb" />
            </svg>
          </div>

          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {t('auth.verifyingYou')}
          </h1>

          {/* Subtext */}
          <p className="text-base text-gray-600">
            {t('auth.completePasskey')}
          </p>

          {/* Loading indicator while passkey prompt is active */}
          {passkeyLoading && (
            <div className="flex items-center gap-3 text-gray-500">
              <Spinner className="w-5 h-5" />
              <span className="text-sm">Waiting for passkey...</span>
            </div>
          )}

          {/* Error message */}
          {passkeyError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {passkeyError}
            </div>
          )}

          {/* Sign in another way button */}
          <button
            type="button"
            onClick={goBack}
            className={btnGrayFull}
          >
            {t('auth.signInAnotherWay')}
          </button>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          BUSINESS TYPE (new user onboarding)
          ════════════════════════════════════════════════════════ */}
      {step === 'business-type' && (
        <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center px-4 overflow-y-auto">
          {/* Close button */}
          <button
            type="button"
            onClick={goBack}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-full max-w-4xl py-12">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <StorefrontIcon />
            </div>

            {/* Step indicator */}
            <div className="mb-8">
              <StepIndicator current={2} total={4} />
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-10">
              What kind of business do you own?
            </h1>

            {/* Business type grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setSelectedBusinessType(type);
                    setStep('revenue');
                  }}
                  className={`px-4 py-5 bg-white rounded-xl text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors text-center ${
                    selectedBusinessType === type ? 'ring-2 ring-red-500' : ''
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Previous button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setStep('protect')}
                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Previous
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          ANNUAL REVENUE (new user onboarding)
          ════════════════════════════════════════════════════════ */}
      {step === 'revenue' && (
        <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col items-center justify-center px-4 overflow-y-auto">
          {/* Close button */}
          <button
            type="button"
            onClick={goBack}
            className="absolute top-6 right-6 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="w-full max-w-4xl py-12">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <DollarIcon />
            </div>

            {/* Step indicator */}
            <div className="mb-8">
              <StepIndicator current={3} total={4} />
            </div>

            {/* Heading */}
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center mb-2">
              What is your annual revenue?
            </h1>
            <p className="text-gray-400 text-center mb-10">in USD ($)</p>

            {/* Revenue grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-10">
              {REVENUE_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setSelectedRevenue(option);
                    onOnboardingComplete?.({ businessType: selectedBusinessType, annualRevenue: option });
                  }}
                  className={`px-4 py-5 bg-white rounded-xl text-sm font-medium text-gray-900 hover:bg-gray-100 transition-colors text-center ${
                    selectedRevenue === option ? 'ring-2 ring-red-500' : ''
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Previous + Skip */}
            <div className="flex items-center justify-center gap-8">
              <button
                type="button"
                onClick={() => setStep('business-type')}
                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Previous
              </button>

              <button
                type="button"
                onClick={() => {
                  onOnboardingComplete?.({ businessType: selectedBusinessType, annualRevenue: 'prefer-not-to-say' });
                }}
                className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition-colors"
              >
                I prefer not to say
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>

            {/* Why are we asking link */}
            <div className="text-center mt-12">
              <button type="button" className="text-red-400 hover:text-red-300 text-sm font-medium transition-colors">
                Why are we asking?
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
