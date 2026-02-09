import { useState, useRef, useEffect, type ReactNode, type FormEvent } from 'react';

// ── Types ───────────────────────────────────────────────────
export interface CountryOption {
  code: string;
  name_en: string;
  name_ar: string;
  flag_emoji: string;
  phone_code: string;
}

export interface SignUpPageProps {
  onSignUp: (data: {
    email: string;
    password: string;
    countryCode: string;
    agreedToTerms: boolean;
  }) => Promise<void>;
  countries?: CountryOption[];
  defaultCountryCode?: string;
  logo?: ReactNode;
  languageSwitcher?: ReactNode;
  signinUrl?: string;
  termsUrl?: string;
  additionalTermsUrl?: string;
  privacyUrl?: string;
  t?: (key: string, params?: Record<string, string | number>) => string;
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

function InfoIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16v-4m0-4h.01" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

// ── Floating Label Input ────────────────────────────────────
function FloatingInput({
  label,
  value,
  onChange,
  type = 'text',
  autoFocus,
  autoComplete,
  error,
  right,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  autoFocus?: boolean;
  autoComplete?: string;
  error?: boolean;
  right?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const hasValue = value.length > 0;
  const floated = focused || hasValue;

  return (
    <div
      className={`relative border rounded-xl px-4 pt-5 pb-2 transition-colors ${
        error
          ? 'border-red-400'
          : focused
            ? 'border-gray-900'
            : 'border-gray-300'
      } bg-white`}
    >
      <label
        className={`absolute left-4 transition-all pointer-events-none ${
          floated
            ? 'top-2 text-xs text-gray-500'
            : 'top-1/2 -translate-y-1/2 text-base text-gray-400'
        }`}
      >
        {label}
      </label>
      <input
        className="w-full text-base text-gray-900 bg-transparent outline-none pr-8"
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
      />
      {right && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>
      )}
    </div>
  );
}

// ── Validation ──────────────────────────────────────────────
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ── Main Component ──────────────────────────────────────────
export function SignUpPage({
  onSignUp,
  countries = [],
  defaultCountryCode = 'SA',
  logo,
  languageSwitcher,
  signinUrl = '/en/signin',
  termsUrl = '#',
  additionalTermsUrl = '#',
  privacyUrl = '#',
  t = (key) => {
    const fallbacks: Record<string, string> = {
      'signup.title': "Let's create your account",
      'signup.subtitle': 'Signing up for Berhot is fast and free \u2013 no commitments or long-term contracts.',
      'signup.email': 'Email',
      'signup.password': 'Password',
      'signup.countryLanguage': 'Country/language',
      'signup.termsPrefix': 'I have read and agree to Berhot\u2019s ',
      'signup.generalTerms': 'General Terms',
      'signup.andApplicable': ' and the applicable ',
      'signup.additionalTerms': 'Additional Terms',
      'signup.includingThe': ', including the ',
      'signup.privacyPolicy': 'Privacy Policy',
      'signup.termsSuffix': '.',
      'signup.createAccount': 'Create account',
      'signup.alreadyHaveAccount': 'Already have a Berhot account?',
      'signup.signIn': 'Sign in',
      'signup.recaptchaNotice': 'This site is protected by reCAPTCHA Enterprise and the Google Privacy Policy and Terms of Service apply.',
      'signup.invalidEmail': 'Please enter a valid email address',
      'signup.passwordTooShort': 'Password must be at least 8 characters',
      'signup.mustAgreeTerms': 'You must agree to the terms',
    };
    return fallbacks[key] || key;
  },
}: SignUpPageProps) {
  // ── State ─────────────────────────────────────────────────
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(defaultCountryCode);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [termsError, setTermsError] = useState('');
  const [countryOpen, setCountryOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCountryOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get current country display
  const currentCountry = countries.find((c) => c.code === selectedCountry);
  const countryDisplay = currentCountry
    ? `${currentCountry.flag_emoji} ${currentCountry.name_en}`
    : `\u{1F1F8}\u{1F1E6} Saudi Arabia`;

  // ── Handlers ──────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');
    setTermsError('');

    // Validate
    let hasError = false;

    if (!email || !EMAIL_REGEX.test(email)) {
      setEmailError(t('signup.invalidEmail'));
      hasError = true;
    }
    if (!password || password.length < 8) {
      setPasswordError(t('signup.passwordTooShort'));
      hasError = true;
    }
    if (!agreedToTerms) {
      setTermsError(t('signup.mustAgreeTerms'));
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      await onSignUp({
        email,
        password,
        countryCode: selectedCountry,
        agreedToTerms,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header — logo */}
      <header className="px-8 py-6">
        {logo || (
          <div className="w-8 h-8 bg-gray-900 rounded-md flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
        )}
      </header>

      {/* Main — centered form */}
      <main className="flex-1 flex items-start justify-center px-6 pt-4 pb-16">
        <div className="w-full max-w-md">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">
            {t('signup.title')}
          </h1>
          <p className="text-base text-gray-600 mb-8 leading-relaxed">
            {t('signup.subtitle')}
          </p>

          {/* Global error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <FloatingInput
                label={t('signup.email')}
                value={email}
                onChange={(val) => {
                  setEmail(val);
                  if (emailError && EMAIL_REGEX.test(val)) setEmailError('');
                }}
                type="email"
                autoFocus
                autoComplete="email"
                error={!!emailError}
              />
              {emailError && (
                <p className="text-xs text-red-600 mt-1.5 ml-1">{emailError}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <FloatingInput
                label={t('signup.password')}
                value={password}
                onChange={(val) => {
                  setPassword(val);
                  if (passwordError && val.length >= 8) setPasswordError('');
                }}
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
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

            {/* Country/language dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setCountryOpen(!countryOpen)}
                className="w-full border border-gray-300 rounded-xl px-4 pt-5 pb-2 bg-white text-left transition-colors hover:border-gray-400 focus:border-gray-900 focus:outline-none relative"
              >
                <span className="absolute left-4 top-2 text-xs text-gray-500">
                  {t('signup.countryLanguage')}
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-base text-gray-900">{countryDisplay}</span>
                  <div className="flex items-center gap-1.5">
                    <InfoIcon />
                    <ChevronDownIcon />
                  </div>
                </div>
              </button>

              {/* Dropdown menu */}
              {countryOpen && countries.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                  {countries.map((country) => (
                    <button
                      key={country.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(country.code);
                        setCountryOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
                        selectedCountry === country.code ? 'bg-blue-50' : ''
                      }`}
                    >
                      <span className="text-lg">{country.flag_emoji}</span>
                      <span className="text-sm text-gray-900">{country.name_en}</span>
                      {country.name_ar && (
                        <span className="text-sm text-gray-400">({country.name_ar})</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Terms checkbox */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (termsError && e.target.checked) setTermsError('');
                  }}
                  className={`mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 shrink-0 ${
                    termsError ? 'border-red-400' : ''
                  }`}
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  {t('signup.termsPrefix')}
                  <a href={termsUrl} className="text-gray-900 font-medium underline underline-offset-2 hover:text-blue-600">
                    {t('signup.generalTerms')}
                  </a>
                  {t('signup.andApplicable')}
                  <a href={additionalTermsUrl} className="text-gray-900 font-medium underline underline-offset-2 hover:text-blue-600">
                    {t('signup.additionalTerms')}
                  </a>
                  {t('signup.includingThe')}
                  <a href={privacyUrl} className="text-gray-900 font-medium underline underline-offset-2 hover:text-blue-600">
                    {t('signup.privacyPolicy')}
                  </a>
                  {t('signup.termsSuffix')}
                </span>
              </label>
              {termsError && (
                <p className="text-xs text-red-600 mt-1.5 ml-7">{termsError}</p>
              )}
            </div>

            {/* Create account button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? <Spinner /> : t('signup.createAccount')}
            </button>
          </form>

          {/* Sign in link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            {t('signup.alreadyHaveAccount')}{' '}
            <a href={signinUrl} className="text-gray-900 font-semibold underline underline-offset-2 hover:text-blue-600">
              {t('signup.signIn')}
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-8 py-6 text-center">
        <p className="text-xs text-gray-400 mb-3 max-w-md mx-auto leading-relaxed">
          {t('signup.recaptchaNotice')}
        </p>
        {languageSwitcher && <div className="flex justify-center">{languageSwitcher}</div>}
      </footer>
    </div>
  );
}
