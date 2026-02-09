import { useState, useEffect } from 'react';
import { SignUpPage } from '@berhot/ui';
import type { CountryOption } from '@berhot/ui';
import { useTranslation, LanguageSwitcher } from '@berhot/i18n';
import { signUp } from '../lib/auth-api';
import { fetchCountries } from '../lib/location-api';
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

const STORAGE_KEY = 'berhot_auth';

export default function SignUpPageWrapper() {
  const { t, lang } = useTranslation();
  const { isAuthenticated, login, user } = useAuth();
  const [countries, setCountries] = useState<CountryOption[]>([]);

  // Fetch countries on mount
  useEffect(() => {
    fetchCountries()
      .then((data) => {
        setCountries(
          data.map((c) => ({
            code: c.code,
            name_en: c.name_en,
            name_ar: c.name_ar,
            flag_emoji: c.flag_emoji,
            phone_code: c.phone_code,
          })),
        );
      })
      .catch(() => {
        // Fallback: Saudi Arabia hardcoded
        setCountries([
          {
            code: 'SA',
            name_en: 'Saudi Arabia',
            name_ar: '\u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629',
            flag_emoji: '\u{1F1F8}\u{1F1E6}',
            phone_code: '+966',
          },
        ]);
      });
  }, []);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    window.location.href = `/${lang}/dashboard`;
    return null;
  }

  const handleSignUp = async (data: {
    email: string;
    password: string;
    countryCode: string;
    agreedToTerms: boolean;
  }) => {
    // Call the register API with the new signup data
    const result = await signUp({
      identifier: data.email,
      firstName: '',
      lastName: '',
      businessName: '',
      password: data.password,
      countryCode: data.countryCode,
    });

    // Login immediately and redirect to onboarding (business type selection)
    login(result.accessToken, result.refreshToken, result.user);

    // Redirect to signin page which handles the onboarding flow
    // (business-type → revenue → POS redirect)
    // We go to the dashboard selector since they haven't chosen a business type yet
    window.location.href = `/${lang}/signin`;
  };

  return (
    <SignUpPage
      onSignUp={handleSignUp}
      countries={countries}
      defaultCountryCode="SA"
      logo={<BerhotLogo />}
      languageSwitcher={<LanguageSwitcher />}
      signinUrl={`/${lang}/signin`}
      termsUrl={`/${lang}/terms`}
      additionalTermsUrl={`/${lang}/terms`}
      privacyUrl={`/${lang}/privacy`}
      t={t}
    />
  );
}
