import { useState, useEffect } from 'react';
import { useTranslation } from '@berhot/i18n';
import {
  fetchMyProfile,
  updateMyProfile,
  fetchMyTenant,
  updateMyTenant,
  fetchRegions,
  fetchCities,
} from '../lib/api';
import type { Region, City } from '../lib/api';

const STORAGE_KEY = 'berhot_auth';

export default function ProfilePage() {
  const { t, lang } = useTranslation();

  // Personal info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [personalSaving, setPersonalSaving] = useState(false);
  const [personalMsg, setPersonalMsg] = useState('');

  // Business info
  const [businessName, setBusinessName] = useState('');
  const [countryCode, setCountryCode] = useState('SA');
  const [regionId, setRegionId] = useState('');
  const [cityId, setCityId] = useState('');
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [businessSaving, setBusinessSaving] = useState(false);
  const [businessMsg, setBusinessMsg] = useState('');
  const [currentPlan, setCurrentPlan] = useState('free');

  // Load data on mount
  useEffect(() => {
    fetchMyProfile()
      .then((user) => {
        setFirstName(user.firstName || '');
        setLastName(user.lastName || '');
        setEmail(user.email || '');
      })
      .catch(() => {});

    fetchMyTenant()
      .then((tenant) => {
        setBusinessName(tenant.name || '');
        setCountryCode(tenant.countryCode || 'SA');
        setRegionId(tenant.regionId || '');
        setCityId(tenant.cityId || '');
        setCurrentPlan(tenant.plan || 'free');

        // Load regions for country
        const cc = tenant.countryCode || 'SA';
        fetchRegions(cc)
          .then((r) => {
            setRegions(r);
            // If region is set, load cities
            if (tenant.regionId) {
              fetchCities(tenant.regionId)
                .then((c) => setCities(c))
                .catch(() => {});
            }
          })
          .catch(() => {});
      })
      .catch(() => {});
  }, []);

  const handleRegionChange = (rid: string) => {
    setRegionId(rid);
    setCityId('');
    setCities([]);
    if (rid) {
      fetchCities(rid)
        .then((c) => setCities(c))
        .catch(() => {});
    }
  };

  const handleSavePersonal = async () => {
    setPersonalSaving(true);
    setPersonalMsg('');
    try {
      await updateMyProfile({ firstName, lastName });
      // Update localStorage so sidebar reflects new name
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.user) {
            parsed.user.firstName = firstName;
            parsed.user.lastName = lastName;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          }
        }
      } catch { /* ignore */ }
      setPersonalMsg(t('profile.saved'));
    } catch {
      setPersonalMsg(t('profile.error'));
    } finally {
      setPersonalSaving(false);
    }
  };

  const handleSaveBusiness = async () => {
    setBusinessSaving(true);
    setBusinessMsg('');
    try {
      await updateMyTenant({
        name: businessName,
        countryCode,
        regionId,
        cityId,
      });
      setBusinessMsg(t('profile.saved'));
    } catch {
      setBusinessMsg(t('profile.error'));
    } finally {
      setBusinessSaving(false);
    }
  };

  const nameEn = (r: { name_en: string; name_ar: string }) => lang === 'ar' ? r.name_ar : r.name_en;

  const planLabel = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('titles.profile')}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {t('profile.subtitle') === 'profile.subtitle'
            ? 'Manage your personal and business information'
            : t('profile.subtitle')}
        </p>
      </div>

      {/* Current plan badge */}
      <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
        <span className="text-sm font-medium text-blue-700">
          {t('plan.currentPlan')}: {planLabel}
        </span>
        <a
          href={`/${lang}/dashboard2/upgrade-plan`}
          className="ml-auto text-sm font-semibold text-blue-600 hover:text-blue-700 underline underline-offset-2"
        >
          {t('plan.upgrade')}
        </a>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.personalInfo')}</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.firstName')}</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.lastName')}</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.email')}</label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSavePersonal}
              disabled={personalSaving}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              {personalSaving ? t('profile.saving') : t('profile.save')}
            </button>
            {personalMsg && (
              <span className={`text-sm ${personalMsg === t('profile.saved') ? 'text-green-600' : 'text-red-600'}`}>
                {personalMsg}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('profile.businessInfo')}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.businessName')}</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.country')}</label>
            <div className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-500 bg-gray-50">
              {'\u{1F1F8}\u{1F1E6}'} Saudi Arabia
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.region')}</label>
              <select
                value={regionId}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors bg-white"
              >
                <option value="">{t('profile.selectRegion')}</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{nameEn(r)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.city')}</label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                disabled={!regionId}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">{t('profile.selectCity')}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{nameEn(c)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveBusiness}
              disabled={businessSaving}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-60"
            >
              {businessSaving ? t('profile.saving') : t('profile.save')}
            </button>
            {businessMsg && (
              <span className={`text-sm ${businessMsg === t('profile.saved') ? 'text-green-600' : 'text-red-600'}`}>
                {businessMsg}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
