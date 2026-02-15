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

/* ── Shared inline-style constants (matching SecuritySettings typography) ── */
const PAGE_TITLE = { fontSize: 22, fontWeight: 700 as const, margin: '0 0 4px 0' };
const PAGE_DESC = { fontSize: 14, margin: '0 0 18px 0', lineHeight: 1.5 };
const SECTION_TITLE = { fontSize: 14, fontWeight: 600 as const, marginBottom: 16 };
const LABEL = { fontSize: 13, fontWeight: 500 as const, marginBottom: 6, display: 'block' as const };
const INPUT_BASE = {
  width: '100%', fontSize: 13, padding: '10px 14px', borderRadius: 8,
  outline: 'none', transition: 'border-color 0.15s',
};
const BTN_PRIMARY = {
  padding: '10px 24px', borderRadius: 24, border: 'none',
  fontSize: 14, fontWeight: 600 as const, cursor: 'pointer' as const, transition: 'background 0.15s',
};

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
      .catch(() => { });

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
                .catch(() => { });
            }
          })
          .catch(() => { });
      })
      .catch(() => { });
  }, []);

  const handleRegionChange = (rid: string) => {
    setRegionId(rid);
    setCityId('');
    setCities([]);
    if (rid) {
      fetchCities(rid)
        .then((c) => setCities(c))
        .catch(() => { });
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

  // Simple light-mode palette (matching SecuritySettings defaults)
  const textPrimary = '#111827';
  const textSecond = '#6b7280';
  const textDim = '#9ca3af';
  const divider = '#e5e7eb';
  const cardBorder = '#e5e7eb';
  const inputBorder = '#d1d5db';
  const accent = '#111827';
  const bg = '#ffffff';

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: '0 auto' }}>
      {/* ── Page Header ── */}
      <h2 style={{ ...PAGE_TITLE, color: textPrimary }}>
        {t('titles.profile')}
      </h2>
      <p style={{ ...PAGE_DESC, color: textSecond }}>
        {t('profile.subtitle') === 'profile.subtitle'
          ? 'Manage your personal and business information'
          : t('profile.subtitle')}
      </p>
      <div style={{ height: 1, background: divider, opacity: 0.4 }} />

      {/* ── Current plan badge ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', background: '#eff6ff', border: '1px solid #bfdbfe',
        borderRadius: 12, marginBottom: 24,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
        </svg>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#1d4ed8' }}>
          {t('plan.currentPlan')}: {planLabel}
        </span>
        <a
          href={`/${lang}/dashboard2/settings/subscription`}
          style={{
            marginInlineStart: 'auto', fontSize: 13, fontWeight: 600,
            color: '#2563eb', textDecoration: 'underline', textUnderlineOffset: 2,
          }}
        >
          {t('plan.upgrade')}
        </a>
      </div>

      {/* ══════════════════════════════════════════════════════════════
         Personal Information
         ══════════════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ ...SECTION_TITLE, color: textPrimary }}>
          {t('profile.personalInfo')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ ...LABEL, color: textSecond }}>{t('profile.firstName')}</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={{
                  ...INPUT_BASE,
                  border: `1.5px solid ${inputBorder}`, background: bg, color: textPrimary,
                }}
              />
            </div>
            <div>
              <label style={{ ...LABEL, color: textSecond }}>{t('profile.lastName')}</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={{
                  ...INPUT_BASE,
                  border: `1.5px solid ${inputBorder}`, background: bg, color: textPrimary,
                }}
              />
            </div>
          </div>
          <div>
            <label style={{ ...LABEL, color: textSecond }}>{t('profile.email')}</label>
            <input
              type="email"
              value={email}
              disabled
              style={{
                ...INPUT_BASE,
                border: `1.5px solid ${cardBorder}`, background: '#f9fafb', color: textDim,
                cursor: 'not-allowed',
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handleSavePersonal}
              disabled={personalSaving}
              style={{
                ...BTN_PRIMARY,
                background: personalSaving ? '#d1d5db' : accent,
                color: '#ffffff',
                opacity: personalSaving ? 0.6 : 1,
              }}
            >
              {personalSaving ? t('profile.saving') : t('profile.save')}
            </button>
            {personalMsg && (
              <span style={{
                fontSize: 13, fontWeight: 500,
                color: personalMsg === t('profile.saved') ? '#10b981' : '#ef4444',
              }}>
                {personalMsg}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ height: 1, background: divider, opacity: 0.3, margin: '0 0 28px 0' }} />

      {/* ══════════════════════════════════════════════════════════════
         Business Information
         ══════════════════════════════════════════════════════════════ */}
      <div>
        <div style={{ ...SECTION_TITLE, color: textPrimary }}>
          {t('profile.businessInfo')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ ...LABEL, color: textSecond }}>{t('profile.businessName')}</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              style={{
                ...INPUT_BASE,
                border: `1.5px solid ${inputBorder}`, background: bg, color: textPrimary,
              }}
            />
          </div>
          <div>
            <label style={{ ...LABEL, color: textSecond }}>{t('profile.country')}</label>
            <div style={{
              ...INPUT_BASE,
              border: `1.5px solid ${cardBorder}`, background: '#f9fafb', color: textDim,
            }}>
              {'\u{1F1F8}\u{1F1E6}'} Saudi Arabia
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={{ ...LABEL, color: textSecond }}>{t('profile.region')}</label>
              <select
                value={regionId}
                onChange={(e) => handleRegionChange(e.target.value)}
                style={{
                  ...INPUT_BASE,
                  border: `1.5px solid ${inputBorder}`, background: bg, color: textPrimary,
                  cursor: 'pointer', appearance: 'none' as const,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  paddingInlineEnd: 36,
                }}
              >
                <option value="">{t('profile.selectRegion')}</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>{nameEn(r)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ ...LABEL, color: textSecond }}>{t('profile.city')}</label>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                disabled={!regionId}
                style={{
                  ...INPUT_BASE,
                  border: `1.5px solid ${regionId ? inputBorder : cardBorder}`,
                  background: regionId ? bg : '#f9fafb',
                  color: regionId ? textPrimary : textDim,
                  cursor: regionId ? 'pointer' : 'not-allowed',
                  appearance: 'none' as const,
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23999' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 14px center',
                  paddingInlineEnd: 36,
                }}
              >
                <option value="">{t('profile.selectCity')}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{nameEn(c)}</option>
                ))}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              onClick={handleSaveBusiness}
              disabled={businessSaving}
              style={{
                ...BTN_PRIMARY,
                background: businessSaving ? '#d1d5db' : accent,
                color: '#ffffff',
                opacity: businessSaving ? 0.6 : 1,
              }}
            >
              {businessSaving ? t('profile.saving') : t('profile.save')}
            </button>
            {businessMsg && (
              <span style={{
                fontSize: 13, fontWeight: 500,
                color: businessMsg === t('profile.saved') ? '#10b981' : '#ef4444',
              }}>
                {businessMsg}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
