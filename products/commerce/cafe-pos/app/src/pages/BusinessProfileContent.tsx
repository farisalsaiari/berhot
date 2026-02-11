import { useState, useEffect, useRef, useCallback } from 'react';

/* ──────────────────────────────────────────────────────────────────
   Business Profile — Company settings page
   Renders inside DashboardPage2 <main>
   Fetches tenant data + location dropdowns from backend
   Uploads logo/cover images via multipart form
   ────────────────────────────────────────────────────────────────── */

const API_URL = 'http://localhost:8080';
const STORAGE_KEY = 'berhot_auth';

// Max image sizes
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
const ALLOWED_EXTS = '.jpg,.jpeg,.png,.svg,.webp';

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

interface Region { id: string; code: string; nameEn: string; nameAr: string }
interface City   { id: string; nameEn: string; nameAr: string }

interface BusinessProfileContentProps {
  C: Theme;
  isLight: boolean;
}

function getAccessToken(): string {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s).accessToken || '';
  } catch { /* ignore */ }
  return '';
}

export default function BusinessProfileContent({ C, isLight }: BusinessProfileContentProps) {
  // ── Form state ──
  const [businessName, setBusinessName] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [countryCode, setCountryCode] = useState('SA');
  const [regionId, setRegionId] = useState('');
  const [cityId, setCityId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  // ── Dropdown data ──
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // ── UI state ──
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  // ── Fetch tenant data on mount ──
  useEffect(() => {
    const token = getAccessToken();
    if (!token) { setLoading(false); return; }

    fetch(`${API_URL}/api/v1/tenants/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setBusinessName(data.name || '');
        setRegistrationNo(data.registrationNo || '');
        setCountryCode(data.countryCode || 'SA');
        setRegionId(data.regionId || '');
        setCityId(data.cityId || '');
        setLogoUrl(data.logoUrl || '');
        setCoverUrl(data.coverUrl || '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // ── Fetch regions when countryCode changes ──
  const fetchRegions = useCallback((code: string) => {
    fetch(`${API_URL}/api/v1/locations/countries/${code}/regions`)
      .then(r => r.json())
      .then(data => {
        const list: Region[] = (data.regions || []).map((r: { id: string; code: string; name_en: string; name_ar: string }) => ({
          id: r.id, code: r.code, nameEn: r.name_en, nameAr: r.name_ar,
        }));
        setRegions(list);
      })
      .catch(() => setRegions([]));
  }, []);

  useEffect(() => { fetchRegions(countryCode); }, [countryCode, fetchRegions]);

  // ── Fetch cities when regionId changes ──
  useEffect(() => {
    if (!regionId) { setCities([]); return; }
    fetch(`${API_URL}/api/v1/locations/regions/${regionId}/cities`)
      .then(r => r.json())
      .then(data => {
        const list: City[] = (data.cities || []).map((c: { id: string; name_en: string; name_ar: string }) => ({
          id: c.id, nameEn: c.name_en, nameAr: c.name_ar,
        }));
        setCities(list);
      })
      .catch(() => setCities([]));
  }, [regionId]);

  // ── Validate file before upload ──
  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) return 'File too large. Maximum size is 5MB';
    if (!ALLOWED_TYPES.includes(file.type)) return 'Invalid file type. Allowed: JPG, PNG, SVG, WebP';
    return null;
  };

  // ── Upload image (logo or cover) ──
  const uploadImage = async (file: File, type: 'logo' | 'cover') => {
    const error = validateFile(file);
    if (error) { setUploadError(error); setTimeout(() => setUploadError(''), 3000); return; }

    const setter = type === 'logo' ? setUploadingLogo : setUploadingCover;
    setter(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/api/v1/tenants/me/${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getAccessToken()}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      const url = data.url;

      if (type === 'logo') setLogoUrl(url);
      else setCoverUrl(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setTimeout(() => setUploadError(''), 3000);
    } finally {
      setter(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, 'logo');
    e.target.value = ''; // Reset so same file can be re-selected
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, 'cover');
    e.target.value = '';
  };

  // ── Save profile data ──
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/tenants/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify({
          name: businessName,
          registrationNo,
          countryCode,
          regionId,
          cityId,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch { /* silent */ }
    finally { setSaving(false); }
  };

  // ── Resolve image URL ──
  const resolveImg = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${API_URL}${url}`;
  };

  // ── Styles ──
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: `1px solid ${C.cardBorder}`,
    background: C.card,
    color: C.textPrimary,
    fontSize: 14,
    outline: 'none',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(C.textSecond)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: 36,
    cursor: 'pointer',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 13,
    fontWeight: 600,
    color: C.textSecond,
    marginBottom: 6,
    display: 'block',
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{
          width: 28, height: 28,
          border: `3px solid ${C.divider}`, borderTopColor: C.btnBg,
          borderRadius: '50%', animation: 'd2-spin 0.6s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div>
      {/* Page title */}
      <h1 style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, margin: '0 0 6px 0' }}>
        Business Profile
      </h1>
      <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 28px 0' }}>
        Manage your company information and branding
      </p>

      {/* ── Cover photo + Logo (Twitter-style) ── */}
      <div style={{ marginBottom: 32, position: 'relative' }}>
        {/* Cover / Banner */}
        <div
          onClick={() => !uploadingCover && coverRef.current?.click()}
          onMouseEnter={() => setHoveredBtn('cover')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            width: '100%',
            height: 180,
            borderRadius: 12,
            background: coverUrl
              ? `url(${resolveImg(coverUrl)}) center/cover no-repeat`
              : isLight
                ? 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)'
                : 'linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)',
            border: `1px solid ${C.cardBorder}`,
            cursor: uploadingCover ? 'wait' : 'pointer',
            position: 'relative',
            overflow: 'hidden',
            transition: 'opacity 0.15s',
            opacity: hoveredBtn === 'cover' ? 0.85 : 1,
          }}
        >
          {/* Overlay */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.25)',
            opacity: hoveredBtn === 'cover' || uploadingCover ? 1 : 0,
            transition: 'opacity 0.15s',
          }}>
            {uploadingCover ? (
              <div style={{
                width: 24, height: 24,
                border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                borderRadius: '50%', animation: 'd2-spin 0.6s linear infinite',
              }} />
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            )}
          </div>
          <input ref={coverRef} type="file" accept={ALLOWED_EXTS} onChange={handleCoverChange} style={{ display: 'none' }} />
        </div>

        {/* Logo — overlaid on bottom-left of cover */}
        <div style={{ position: 'absolute', bottom: -36, left: 24 }}>
          <div
            onClick={() => !uploadingLogo && logoRef.current?.click()}
            onMouseEnter={() => setHoveredBtn('logo')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              width: 80, height: 80, borderRadius: 16,
              border: `3px solid ${C.bg}`,
              background: logoUrl
                ? `url(${resolveImg(logoUrl)}) center/cover no-repeat`
                : isLight ? '#f3f4f6' : '#374151',
              cursor: uploadingLogo ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
              transition: 'opacity 0.15s',
              opacity: hoveredBtn === 'logo' ? 0.85 : 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            {!logoUrl && !uploadingLogo && (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isLight ? '#9ca3af' : '#6b7280'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            )}
            {/* Hover overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.3)',
              opacity: hoveredBtn === 'logo' || uploadingLogo ? 1 : 0,
              transition: 'opacity 0.15s', borderRadius: 13,
            }}>
              {uploadingLogo ? (
                <div style={{
                  width: 20, height: 20,
                  border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#fff',
                  borderRadius: '50%', animation: 'd2-spin 0.6s linear infinite',
                }} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              )}
            </div>
            <input ref={logoRef} type="file" accept={ALLOWED_EXTS} onChange={handleLogoChange} style={{ display: 'none' }} />
          </div>
        </div>
      </div>

      {/* Spacer for logo overlap */}
      <div style={{ height: 44 }} />

      {/* Upload error message */}
      {uploadError && (
        <div style={{
          padding: '10px 14px', marginBottom: 16, borderRadius: 8,
          background: isLight ? '#fef2f2' : '#451a1a',
          color: '#ef4444', fontSize: 13, fontWeight: 500,
        }}>
          {uploadError}
        </div>
      )}

      {/* ── Form Fields ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Business Name */}
        <div>
          <label style={labelStyle}>Business Name</label>
          <input
            type="text"
            placeholder="Enter your business name"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = C.accent)}
            onBlur={(e) => (e.target.style.borderColor = C.cardBorder)}
          />
        </div>

        {/* Registration Number */}
        <div>
          <label style={labelStyle}>Registration Number</label>
          <input
            type="text"
            placeholder="Commercial registration number"
            value={registrationNo}
            onChange={(e) => setRegistrationNo(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = C.accent)}
            onBlur={(e) => (e.target.style.borderColor = C.cardBorder)}
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: C.divider, opacity: 0.5 }} />

        {/* Location section heading */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 4px 0' }}>
            Location
          </h3>
          <p style={{ fontSize: 13, color: C.textSecond, margin: 0 }}>
            Where is your business located?
          </p>
        </div>

        {/* Country */}
        <div>
          <label style={labelStyle}>Country</label>
          <select
            value={countryCode}
            onChange={(e) => {
              setCountryCode(e.target.value);
              setRegionId('');
              setCityId('');
            }}
            style={selectStyle}
          >
            <option value="SA">Saudi Arabia</option>
            <option value="AE">United Arab Emirates</option>
            <option value="EG">Egypt</option>
            <option value="US">United States</option>
            <option value="GB">United Kingdom</option>
          </select>
        </div>

        {/* Region + City dropdowns side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Region first */}
          <div>
            <label style={labelStyle}>Region</label>
            <select
              value={regionId}
              onChange={(e) => {
                setRegionId(e.target.value);
                setCityId('');
              }}
              style={selectStyle}
            >
              <option value="">Select region</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.nameEn}</option>
              ))}
            </select>
          </div>

          {/* City (depends on region) */}
          <div>
            <label style={labelStyle}>City</label>
            <select
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              disabled={!regionId}
              style={{
                ...selectStyle,
                opacity: regionId ? 1 : 0.5,
                cursor: regionId ? 'pointer' : 'not-allowed',
              }}
            >
              <option value="">{regionId ? 'Select city' : 'Select region first'}</option>
              {cities.map(c => (
                <option key={c.id} value={c.id}>{c.nameEn}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: C.divider, opacity: 0.5 }} />

        {/* Save button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            onMouseEnter={() => setHoveredBtn('save')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              padding: '12px 32px',
              borderRadius: 8,
              border: 'none',
              background: isLight ? '#1a1a1a' : '#ffffff',
              color: isLight ? '#ffffff' : '#000000',
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : hoveredBtn === 'save' ? 0.85 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {saving ? 'Saving...' : 'Update Profile'}
          </button>
          {saved && (
            <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 500 }}>
              Profile updated successfully
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
