import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@berhot/i18n';

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
  textLight: string;
  textDim: string;
  accent: string;
  btnBg: string;
  btnBorder: string;
}

interface Region { id: string; code: string; nameEn: string; nameAr: string }
interface City { id: string; nameEn: string; nameAr: string }

interface LogoSettings {
  logoShape: 'square' | 'circle' | 'rectangle';
  showBusinessName: boolean;
}

interface BusinessProfileContentProps {
  C: Theme;
  isLight: boolean;
  onLogoChange?: (url: string, croppedDataUrl?: string) => void;
  onBusinessNameChange?: (name: string) => void;
  onLogoSettingsChange?: (settings: LogoSettings) => void;
}

function getAccessToken(): string {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return JSON.parse(s).accessToken || '';
  } catch { /* ignore */ }
  return '';
}

// Refresh the access token using the refresh token
async function refreshAccessToken(): Promise<string> {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return '';
    const stored = JSON.parse(s);
    if (!stored.refreshToken) return '';

    const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: stored.refreshToken }),
    });
    if (!res.ok) return '';
    const data = await res.json();
    if (data.accessToken) {
      stored.accessToken = data.accessToken;
      if (data.refreshToken) stored.refreshToken = data.refreshToken;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
      return data.accessToken;
    }
  } catch { /* ignore */ }
  return '';
}

// Fetch with automatic token refresh on 401
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  let token = getAccessToken();
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers as Record<string, string>, Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    token = await refreshAccessToken();
    if (token) {
      return fetch(url, {
        ...options,
        headers: { ...options.headers as Record<string, string>, Authorization: `Bearer ${token}` },
      });
    }
  }
  return res;
}

/* ── Logo Crop Modal ─────────────────────────────────────────────
   Shows a square crop overlay the user can drag & resize over the image.
   Returns { x, y, size } as percentages (0–100) of the original image.
   ─────────────────────────────────────────────────────────────────── */
function LogoCropModal({ src, C, isLight, onConfirm, onSkip, onCancel, t, initialCropPct, isReCrop }: {
  src: string;
  C: Theme;
  isLight: boolean;
  onConfirm: (croppedDataUrl: string, cropPct: { x: number; y: number; size: number }) => void;
  onSkip: () => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  onCancel: () => void;
  initialCropPct?: { x: number; y: number; size: number } | null;
  isReCrop?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  // crop in px relative to the displayed image
  const [crop, setCrop] = useState({ x: 0, y: 0, size: 0 });
  const [dragging, setDragging] = useState<'move' | 'resize' | null>(null);
  const dragStart = useRef({ mx: 0, my: 0, cx: 0, cy: 0, cs: 0 });
  // If image is already square, hide crop overlay by default
  const [cropActive, setCropActive] = useState(false);

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const w = img.clientWidth;
    const h = img.clientHeight;
    setImgSize({ w, h });
    // If re-cropping with a previous crop position, restore it
    if (isReCrop && initialCropPct) {
      const cx = (initialCropPct.x / 100) * w;
      const cy = (initialCropPct.y / 100) * h;
      const cs = (initialCropPct.size / 100) * Math.min(w, h);
      setCrop({ x: cx, y: cy, size: cs });
      setCropActive(true);
    } else if (isReCrop) {
      // Re-crop with no saved position — prepare default crop but keep overlay hidden until user toggles it
      const s = Math.min(w, h) * 0.7;
      setCrop({ x: (w - s) / 2, y: (h - s) / 2, size: s });
      setCropActive(false);
    } else {
      const s = Math.min(w, h) * 0.7;
      setCrop({ x: (w - s) / 2, y: (h - s) / 2, size: s });
      setCropActive(false);
    }
  };

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const onMouseDown = (e: React.MouseEvent, type: 'move' | 'resize') => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(type);
    dragStart.current = { mx: e.clientX, my: e.clientY, cx: crop.x, cy: crop.y, cs: crop.size };
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - dragStart.current.mx;
      const dy = e.clientY - dragStart.current.my;
      if (dragging === 'move') {
        setCrop(prev => ({
          ...prev,
          x: clamp(dragStart.current.cx + dx, 0, imgSize.w - prev.size),
          y: clamp(dragStart.current.cy + dy, 0, imgSize.h - prev.size),
        }));
      } else {
        const delta = Math.max(dx, dy);
        const newSize = clamp(dragStart.current.cs + delta, 40, Math.min(imgSize.w - dragStart.current.cx, imgSize.h - dragStart.current.cy));
        setCrop(prev => ({ ...prev, size: newSize }));
      }
    };
    const onUp = () => setDragging(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging, imgSize]);

  const handleConfirm = async () => {
    if (!imgSize.w || !imgSize.h) return;
    const img = containerRef.current?.querySelector('img');
    if (!img) return;
    const natW = img.naturalWidth;
    const natH = img.naturalHeight;

    // If crop is not active, use the full image as-is (skip cropping)
    if (!cropActive) {
      onSkip();
      return;
    }

    const scaleX = natW / imgSize.w;
    const scaleY = natH / imgSize.h;

    // Save crop position as percentages for restoring later
    const cropPct = {
      x: (crop.x / imgSize.w) * 100,
      y: (crop.y / imgSize.h) * 100,
      size: (crop.size / Math.min(imgSize.w, imgSize.h)) * 100,
    };

    // Helper to draw crop on canvas
    const drawCrop = (source: CanvasImageSource) => {
      const canvas = document.createElement('canvas');
      const outputSize = 256; // high-res square output
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(
        source,
        crop.x * scaleX, crop.y * scaleY, crop.size * scaleX, crop.size * scaleY,
        0, 0, outputSize, outputSize,
      );
      return canvas.toDataURL('image/png');
    };

    // Try direct canvas draw first
    try {
      const result = drawCrop(img);
      if (result) { onConfirm(result, cropPct); return; }
    } catch { /* tainted canvas — fall through to blob fetch */ }

    // Fallback: fetch image as blob to avoid cross-origin taint
    try {
      const resp = await fetch(src, { mode: 'cors' });
      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const freshImg = new Image();
      freshImg.onload = () => {
        try {
          const result = drawCrop(freshImg);
          if (result) onConfirm(result, cropPct);
        } finally {
          URL.revokeObjectURL(blobUrl);
        }
      };
      freshImg.src = blobUrl;
    } catch { /* ignore */ }
  };

  return createPortal(
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: C.card, borderRadius: 16, padding: 24, maxWidth: 500, width: '90%',
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.textPrimary }}>
          {t('businessProfile.adjustLogoArea')}
        </h3>
        <p style={{ margin: 0, fontSize: 13, color: C.textSecond }}>
          {t('businessProfile.cropDescription')}
        </p>
        <div ref={containerRef} style={{ position: 'relative', overflow: 'hidden', borderRadius: 8, background: '#f0f0f0', userSelect: 'none' }}>
          <img src={src} alt="Crop preview" onLoad={onImgLoad} crossOrigin="anonymous" style={{ display: 'block', maxWidth: '100%', maxHeight: 350 }} draggable={false} />
          {imgSize.w > 0 && (<>
            {cropActive && (<>
              {/* Dark overlay with hole */}
              <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
                  <defs>
                    <mask id="crop-mask">
                      <rect width="100%" height="100%" fill="white" />
                      <rect x={crop.x} y={crop.y} width={crop.size} height={crop.size} fill="black" rx="4" />
                    </mask>
                  </defs>
                  <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#crop-mask)" />
                </svg>
              </div>
              {/* Draggable crop area */}
              <div
                onMouseDown={(e) => onMouseDown(e, 'move')}
                style={{
                  position: 'absolute',
                  left: crop.x, top: crop.y, width: crop.size, height: crop.size,
                  border: '2px solid #fff', borderRadius: 4, cursor: 'move', boxSizing: 'border-box',
                }}
              >
                {/* Resize handle — bottom right */}
                <div
                  onMouseDown={(e) => onMouseDown(e, 'resize')}
                  style={{
                    position: 'absolute', right: -5, bottom: -5, width: 12, height: 12,
                    background: '#fff', borderRadius: 3, cursor: 'nwse-resize',
                    border: '1px solid rgba(0,0,0,0.2)',
                  }}
                />
              </div>
            </>)}
            {/* Crop toggle icon — top right of preview */}
            <button
              onClick={() => setCropActive(!cropActive)}
              title={cropActive ? t('businessProfile.hideCrop') : t('businessProfile.showCrop')}
              style={{
                position: 'absolute', top: 8, insetInlineEnd: 8,
                width: 32, height: 32, borderRadius: 8,
                background: cropActive ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.5)',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s',
                zIndex: 2,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={cropActive ? '#1a1a1a' : '#ffffff'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.13 1L6 16a2 2 0 002 2h15" />
                <path d="M1 6.13L16 6a2 2 0 012 2v15" />
              </svg>
            </button>
          </>)}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{
            padding: '8px 20px', borderRadius: 8, border: `1px solid ${C.divider}`,
            background: 'transparent', color: C.textSecond, fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{t('businessProfile.cancel')}</button>
          <button onClick={handleConfirm} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: C.accent === '#000000' && !isLight ? '#e5e7eb' : C.accent, color: C.accent === '#000000' && !isLight ? '#000000' : '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>{t('businessProfile.confirm')}</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function BusinessProfileContent({ C, isLight, onLogoChange, onBusinessNameChange, onLogoSettingsChange }: BusinessProfileContentProps) {
  const { t } = useTranslation();
  // ── Form state ──
  const [businessName, setBusinessName] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [countryCode, setCountryCode] = useState('SA');
  const [regionId, setRegionId] = useState('');
  const [cityId, setCityId] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  // ── Logo display settings ──
  const [logoShape, setLogoShape] = useState<'square' | 'circle' | 'rectangle'>('square');
  const [showBusinessName, setShowBusinessName] = useState(true);

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
  const [cropModalSrc, setCropModalSrc] = useState('');
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [reCropping, setReCropping] = useState(false);
  // Last crop position as percentages — for restoring on re-crop (persisted in localStorage)
  const [lastCropPct, setLastCropPct] = useState<{ x: number; y: number; size: number } | null>(() => {
    try {
      const saved = localStorage.getItem('berhot_last_crop_pct');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  // Cropped logo data URL — matches what sidebar displays
  const [logoCroppedUrl, setLogoCroppedUrl] = useState(() => {
    try { return localStorage.getItem('berhot_sidebar_logo') || ''; } catch { return ''; }
  });
  // Original (uncropped) logo data URL — used for re-cropping to avoid progressive zoom
  const [logoOriginalUrl, setLogoOriginalUrl] = useState(() => {
    try { return localStorage.getItem('berhot_logo_original') || ''; } catch { return ''; }
  });

  const logoRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  // ── Fetch tenant data on mount ──
  useEffect(() => {
    const token = getAccessToken();
    if (!token) { setLoading(false); return; }

    authFetch(`${API_URL}/api/v1/tenants/me`)
      .then(r => {
        if (!r.ok) throw new Error('Failed to fetch tenant');
        return r.json();
      })
      .then(data => {
        setBusinessName(data.name || '');
        setRegistrationNo(data.registrationNo || '');
        setCountryCode(data.countryCode || 'SA');
        setRegionId(data.regionId || '');
        setCityId(data.cityId || '');
        setLogoUrl(data.logoUrl || '');
        setCoverUrl(data.coverUrl || '');
        if (data.logoShape) setLogoShape(data.logoShape);
        if (typeof data.showBusinessName === 'boolean') setShowBusinessName(data.showBusinessName);
      })
      .catch(() => { })
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
    if (file.size > MAX_FILE_SIZE) return t('businessProfile.fileTooLarge');
    if (!ALLOWED_TYPES.includes(file.type)) return t('businessProfile.invalidFileType');
    return null;
  };

  // ── Upload image (logo or cover) ──
  const uploadImage = async (file: File, type: 'logo' | 'cover', croppedDataUrl?: string) => {
    const error = validateFile(file);
    if (error) { setUploadError(error); setTimeout(() => setUploadError(''), 3000); return; }

    const setter = type === 'logo' ? setUploadingLogo : setUploadingCover;
    setter(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await authFetch(`${API_URL}/api/v1/tenants/me/${type}`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Upload failed');
      }

      const data = await res.json();
      const url = data.url;

      if (type === 'logo') {
        setLogoUrl(url);
        // Save cropped image to localStorage for sidebar display
        if (croppedDataUrl) {
          try { localStorage.setItem('berhot_sidebar_logo', croppedDataUrl); } catch { /* ignore */ }
        }
        onLogoChange?.(url, croppedDataUrl);
      } else {
        setCoverUrl(url);
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setTimeout(() => setUploadError(''), 3000);
    } finally {
      setter(false);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateFile(file);
      if (error) { setUploadError(error); setTimeout(() => setUploadError(''), 3000); return; }
      setPendingLogoFile(file);
      const objectUrl = URL.createObjectURL(file);
      setCropModalSrc(objectUrl);
      // Save original image as data URL for future re-cropping (avoids CORS + progressive zoom)
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setLogoOriginalUrl(dataUrl);
        try { localStorage.setItem('berhot_logo_original', dataUrl); } catch { /* ignore */ }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropConfirm = async (croppedDataUrl: string, cropPct?: { x: number; y: number; size: number }) => {
    setCropModalSrc('');
    setLogoCroppedUrl(croppedDataUrl);
    const pct = cropPct || null;
    setLastCropPct(pct);
    try {
      if (pct) localStorage.setItem('berhot_last_crop_pct', JSON.stringify(pct));
      else localStorage.removeItem('berhot_last_crop_pct');
    } catch { /* ignore */ }
    if (reCropping) {
      // Re-cropping existing logo — just update localStorage and sidebar
      try { localStorage.setItem('berhot_sidebar_logo', croppedDataUrl); } catch { /* ignore */ }
      onLogoChange?.(logoUrl, croppedDataUrl);
      setReCropping(false);
      return;
    }
    if (!pendingLogoFile) return;
    await uploadImage(pendingLogoFile, 'logo', croppedDataUrl);
    setPendingLogoFile(null);
  };

  const handleCropSkip = async () => {
    setCropModalSrc('');
    setLogoCroppedUrl('');
    setLastCropPct(null);
    try { localStorage.removeItem('berhot_last_crop_pct'); } catch { /* ignore */ }
    if (reCropping) {
      // Re-cropping skipped — clear crop, use original logo
      try { localStorage.removeItem('berhot_sidebar_logo'); } catch { /* ignore */ }
      onLogoChange?.(logoUrl);
      setReCropping(false);
      return;
    }
    if (!pendingLogoFile) return;
    // Clear any previous crop from localStorage
    try { localStorage.removeItem('berhot_sidebar_logo'); } catch { /* ignore */ }
    await uploadImage(pendingLogoFile, 'logo');
    setPendingLogoFile(null);
  };

  const handleCropCancel = () => {
    if (cropModalSrc && !reCropping) URL.revokeObjectURL(cropModalSrc);
    setCropModalSrc('');
    setPendingLogoFile(null);
    setReCropping(false);
  };

  const handleReCrop = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!logoUrl) return;
    setReCropping(true);
    // Use the original uncropped image to avoid progressive zoom on re-crop.
    // Priority: original data URL (localStorage) > server URL (may have CORS issues)
    setCropModalSrc(logoOriginalUrl || resolveImg(logoUrl));
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
      const res = await authFetch(`${API_URL}/api/v1/tenants/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: businessName,
          registrationNo,
          countryCode,
          regionId,
          cityId,
          logoShape,
          showBusinessName: logoShape === 'rectangle' ? false : showBusinessName,
        }),
      });
      if (!res.ok) throw new Error('Save failed');
      setSaved(true);
      if (businessName) onBusinessNameChange?.(businessName);
      onLogoSettingsChange?.({ logoShape, showBusinessName: logoShape === 'rectangle' ? false : showBusinessName });
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

  const isRTL = document.documentElement.dir === 'rtl';

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='${encodeURIComponent(C.textSecond)}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: isRTL ? 'left 14px center' : 'right 14px center',
    paddingInlineEnd: 36,
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
      {/* Logo crop modal */}
      {cropModalSrc && (
        <LogoCropModal src={cropModalSrc} C={C} isLight={isLight} t={t} onConfirm={handleCropConfirm} onSkip={handleCropSkip} onCancel={handleCropCancel} initialCropPct={reCropping ? lastCropPct : null} isReCrop={reCropping} />
      )}

      {/* Page title */}
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 4px 0' }}>
        {t('businessProfile.title')}
      </h2>
      <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 18px 0', lineHeight: 1.5 }}>
        {t('businessProfile.subtitle')}
      </p>
      <div style={{ height: 1, background: C.divider, opacity: 0.4 }} />

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

        {/* Logo — overlaid on bottom-start of cover */}
        <div style={{ position: 'absolute', bottom: -36, insetInlineStart: 24 }}>
          <div
            onClick={() => !uploadingLogo && logoRef.current?.click()}
            onMouseEnter={() => setHoveredBtn('logo')}
            onMouseLeave={() => setHoveredBtn(null)}
            style={{
              width: logoShape === 'rectangle' ? 110 : 80,
              height: 80,
              borderRadius: logoShape === 'circle' ? '50%' : 16,
              border: `3px solid ${C.bg}`,
              backgroundColor: '#ffffff',
              background: (logoCroppedUrl || logoOriginalUrl || logoUrl)
                ? `#ffffff url(${logoCroppedUrl || logoOriginalUrl || resolveImg(logoUrl)}) center/${logoShape === 'rectangle' ? 'contain' : 'cover'} no-repeat`
                : isLight ? '#f3f4f6' : '#374151',
              cursor: uploadingLogo ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden',
              transition: 'opacity 0.15s',
              opacity: hoveredBtn === 'logo' ? 0.85 : 1,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
          >
            {!logoUrl && !logoCroppedUrl && !logoOriginalUrl && !uploadingLogo && (
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
              transition: 'opacity 0.15s', borderRadius: logoShape === 'circle' ? '50%' : 13,
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
          {/* Edit icon — bottom-right of logo */}
          {(logoUrl || logoCroppedUrl || logoOriginalUrl) && !uploadingLogo && (
            <div
              onClick={handleReCrop}
              onMouseEnter={() => setHoveredBtn('crop')}
              onMouseLeave={() => setHoveredBtn(null)}
              title={t('businessProfile.adjustCrop')}
              style={{
                position: 'absolute', insetInlineEnd: -4, bottom: -4,
                width: 26, height: 26, borderRadius: 8,
                background: isLight ? '#1a1a1a' : '#ffffff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
                transition: 'transform 0.15s',
                transform: hoveredBtn === 'crop' ? 'scale(1.1)' : 'scale(1)',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={isLight ? '#ffffff' : '#000000'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </div>
          )}
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
          <label style={labelStyle}>{t('businessProfile.businessName')}</label>
          <input
            className="d2-input"
            type="text"
            placeholder={t('businessProfile.businessNamePlaceholder')}
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = C.accent)}
            onBlur={(e) => (e.target.style.borderColor = C.cardBorder)}
          />
        </div>

        {/* Registration Number */}
        <div>
          <label style={labelStyle}>{t('businessProfile.registrationNo')}</label>
          <input
            className="d2-input"
            type="text"
            placeholder={t('businessProfile.registrationNoPlaceholder')}
            value={registrationNo}
            onChange={(e) => setRegistrationNo(e.target.value)}
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = C.accent)}
            onBlur={(e) => (e.target.style.borderColor = C.cardBorder)}
          />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: C.divider, opacity: 0.5 }} />

        {/* ── Logo Display Settings ── */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 4px 0' }}>
            {t('businessProfile.logoSettings')}
          </h3>
          <p style={{ fontSize: 13, color: C.textSecond, margin: '0 0 20px 0' }}>
            {t('businessProfile.logoSettingsDesc')}
          </p>

          {/* Live preview */}
          <div style={{
            background: isLight ? '#f8f9fa' : '#1a1f2e',
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 12,
            padding: '16px 20px',
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: C.textDim, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {t('businessProfile.logoPreview')}
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginTop: 12,
              padding: '10px 12px',
              background: C.sidebar,
              borderRadius: 10,
              border: `1px solid ${C.cardBorder}`,
              maxWidth: 240,
            }}>
              {/* Preview logo with selected shape */}
              <div style={{
                width: logoShape === 'rectangle'
                  ? (showBusinessName ? 52 : 100)
                  : 35,
                height: 35,
                flexShrink: 0,
                borderRadius: logoShape === 'circle' ? '50%' : logoShape === 'rectangle' ? 8 : 6,
                background: (logoCroppedUrl || logoOriginalUrl || logoUrl)
                  ? `url(${logoCroppedUrl || logoOriginalUrl || resolveImg(logoUrl)}) center/${logoShape === 'rectangle' && !showBusinessName ? 'contain' : 'cover'} no-repeat`
                  : isLight ? '#e5e7eb' : '#374151',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {!logoUrl && !logoCroppedUrl && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <path d="M21 15l-5-5L5 21" />
                  </svg>
                )}
              </div>
              {/* Preview name */}
              {showBusinessName && (
                <span style={{
                  fontWeight: 700,
                  fontSize: 14,
                  color: C.textPrimary,
                  maxWidth: 120,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  textTransform: 'capitalize',
                }}>
                  {businessName || 'Berhot'}
                </span>
              )}
            </div>
          </div>

          {/* Shape selector */}
          <label style={{ ...labelStyle, marginBottom: 10 }}>{t('businessProfile.logoShape')}</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
            {(['square', 'circle', 'rectangle'] as const).map((shape) => {
              const isActive = logoShape === shape;
              const shapeLabels = { square: t('businessProfile.shapeSquare'), circle: t('businessProfile.shapeCircle'), rectangle: t('businessProfile.shapeRectangle') };
              const shapeDescs = { square: t('businessProfile.shapeSquareDesc'), circle: t('businessProfile.shapeCircleDesc'), rectangle: t('businessProfile.shapeRectangleDesc') };
              return (
                <button
                  key={shape}
                  onClick={() => { setLogoShape(shape); if (shape === 'rectangle') setShowBusinessName(false); }}
                  onMouseEnter={() => setHoveredBtn(`shape-${shape}`)}
                  onMouseLeave={() => setHoveredBtn(null)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    padding: '16px 10px',
                    borderRadius: 10,
                    border: `2px solid ${isActive ? (C.accent === '#000000' && !isLight ? '#e5e7eb' : C.accent) : C.cardBorder}`,
                    background: isActive
                      ? (isLight ? 'rgba(59,130,246,0.06)' : (C.accent === '#000000' ? 'rgba(229,231,235,0.1)' : `${C.accent}1a`))
                      : hoveredBtn === `shape-${shape}` ? C.hover : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {/* Shape icon */}
                  <div style={{
                    width: shape === 'rectangle' ? 48 : 32,
                    height: 32,
                    borderRadius: shape === 'circle' ? '50%' : shape === 'rectangle' ? 6 : 6,
                    background: isActive ? (C.accent === '#000000' && !isLight ? '#e5e7eb' : C.accent) : (isLight ? '#d1d5db' : '#4b5563'),
                    transition: 'background 0.15s',
                    opacity: isActive ? 1 : 0.7,
                  }} />
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: isActive ? (C.accent === '#000000' && !isLight ? '#e5e7eb' : C.accent) : C.textPrimary,
                    transition: 'color 0.15s',
                  }}>
                    {shapeLabels[shape]}
                  </span>
                  <span style={{
                    fontSize: 10,
                    color: C.textDim,
                    textAlign: 'center',
                    lineHeight: 1.3,
                  }}>
                    {shapeDescs[shape]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Show business name toggle — disabled when rectangle (wide) logo */}
          <div
            onClick={() => { if (logoShape !== 'rectangle') setShowBusinessName(!showBusinessName); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderRadius: 10,
              border: `1px solid ${C.cardBorder}`,
              background: C.card,
              cursor: logoShape === 'rectangle' ? 'not-allowed' : 'pointer',
              transition: 'border-color 0.15s',
              opacity: logoShape === 'rectangle' ? 0.45 : 1,
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
                {t('businessProfile.showBusinessName')}
              </div>
              <div style={{ fontSize: 12, color: C.textDim, marginTop: 2 }}>
                {t('businessProfile.showBusinessNameDesc')}
              </div>
            </div>
            {/* Toggle switch */}
            <div style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: (showBusinessName && logoShape !== 'rectangle')
                ? C.accent
                : (isLight ? '#d1d5db' : '#4b5563'),
              padding: 2,
              cursor: logoShape === 'rectangle' ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              flexShrink: 0,
              marginInlineStart: 16,
            }}>
              <div style={{
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                transition: 'transform 0.2s',
                transform: (showBusinessName && logoShape !== 'rectangle')
                  ? (document.documentElement.dir === 'rtl' ? 'translateX(-20px)' : 'translateX(20px)')
                  : 'translateX(0)',
              }} />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: C.divider, opacity: 0.5 }} />

        {/* Location section heading */}
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 4px 0' }}>
            {t('businessProfile.location')}
          </h3>
          <p style={{ fontSize: 13, color: C.textSecond, margin: 0 }}>
            {t('businessProfile.locationSubtitle')}
          </p>
        </div>

        {/* Country */}
        <div>
          <label style={labelStyle}>{t('businessProfile.country')}</label>
          <select
            className="d2-input"
            value={countryCode}
            onChange={(e) => {
              setCountryCode(e.target.value);
              setRegionId('');
              setCityId('');
            }}
            style={selectStyle}
          >
            <option value="SA">{t('businessProfile.saudiArabia')}</option>
            <option value="AE">{t('businessProfile.uae')}</option>
            <option value="EG">{t('businessProfile.egypt')}</option>
            <option value="US">{t('businessProfile.usa')}</option>
            <option value="GB">{t('businessProfile.uk')}</option>
          </select>
        </div>

        {/* Region + City dropdowns side by side */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Region first */}
          <div>
            <label style={labelStyle}>{t('businessProfile.region')}</label>
            <select
              className="d2-input"
              value={regionId}
              onChange={(e) => {
                setRegionId(e.target.value);
                setCityId('');
              }}
              style={selectStyle}
            >
              <option value="">{t('businessProfile.selectRegion')}</option>
              {regions.map(r => (
                <option key={r.id} value={r.id}>{r.nameEn}</option>
              ))}
            </select>
          </div>

          {/* City (depends on region) */}
          <div>
            <label style={labelStyle}>{t('businessProfile.city')}</label>
            <select
              className="d2-input"
              value={cityId}
              onChange={(e) => setCityId(e.target.value)}
              disabled={!regionId}
              style={{
                ...selectStyle,
                opacity: regionId ? 1 : 0.5,
                cursor: regionId ? 'pointer' : 'not-allowed',
              }}
            >
              <option value="">{regionId ? t('businessProfile.selectCity') : t('businessProfile.selectRegionFirst')}</option>
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
              background: C.accent === '#000000' && !isLight ? '#e5e7eb' : C.accent,
              color: C.accent === '#000000' && !isLight ? '#000000' : '#ffffff',
              fontSize: 14,
              fontWeight: 600,
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.6 : hoveredBtn === 'save' ? 0.85 : 1,
              transition: 'opacity 0.15s',
            }}
          >
            {saving ? t('businessProfile.saving') : t('businessProfile.updateProfile')}
          </button>
          {saved && (
            <span style={{ fontSize: 13, color: '#22c55e', fontWeight: 500 }}>
              {t('businessProfile.profileUpdated')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
