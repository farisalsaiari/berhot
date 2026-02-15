import React, { useState, useEffect } from 'react';
import { useTranslation } from '@berhot/i18n';

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

interface ThemeSettingsProps {
  C: Theme;
  isLight: boolean;
  onAccentPreview?: (color: string | null) => void;
  onDarkSidebarPreview?: (v: boolean | null) => void;
  onShowHeaderPreview?: (v: boolean | null) => void;
  onThemePreview?: (theme: 'light' | 'dark' | null) => void;
  onSave?: () => void;
}

// ── Saudi Riyal Symbol (official SVG) ────────────────────────────
function SarSymbol({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 1124 1257" fill={color} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <path d="M699.62,1113.02h0c-20.06,44.48-33.32,92.75-38.4,143.37l424.51-90.24c20.06-44.47,33.31-92.75,38.4-143.37l-424.51,90.24Z" />
      <path d="M1085.73,895.8c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.33v-135.2l292.27-62.11c20.06-44.47,33.32-92.75,38.4-143.37l-330.68,70.27V66.13c-50.67,28.45-95.67,66.32-132.25,110.99v403.35l-132.25,28.11V0c-50.67,28.44-95.67,66.32-132.25,110.99v525.69l-295.91,62.88c-20.06,44.47-33.33,92.75-38.42,143.37l334.33-71.05v170.26l-358.3,76.14c-20.06,44.47-33.32,92.75-38.4,143.37l375.04-79.7c30.53-6.35,56.77-24.4,73.83-49.24l68.78-101.97v-.02c7.14-10.55,11.3-23.27,11.3-36.97v-149.98l132.25-28.11v270.4l424.53-90.28Z" />
    </svg>
  );
}

// ── Helpers ─────────────────────────────────────────────────────
function Divider({ color }: { color: string }) {
  return <div style={{ height: 1, background: color, opacity: 0.5 }} />;
}

function SectionTitle({ children, badge, color }: { children: string; color: string; badge?: { label: string; color: string; bg: string } }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color, margin: 0 }}>{children}</h2>
      {badge && (
        <span style={{
          fontSize: 12,
          fontWeight: 500,
          color: badge.color,
          background: badge.bg,
          padding: '3px 10px',
          borderRadius: 12,
        }}>{badge.label}</span>
      )}
    </div>
  );
}

function ActionLink({ children, color, hoverColor, onClick }: { children: string; color: string; hoverColor?: string; onClick?: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        fontSize: 15,
        fontWeight: 600,
        color: hoverColor && hovered ? hoverColor : color,
        cursor: 'pointer',
        textDecoration: hovered ? 'underline' : 'none',
      }}
    >
      {children}
    </button>
  );
}

// ── Tab Components ──────────────────────────────────────────────
function PersonalInformationTab({ C }: { C: Theme }) {
  const { t } = useTranslation();

  return (
    <div style={{ marginTop: 14 }}>
      {/* First Name row */}
      <div style={{ padding: '16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>First Name</span>
          <ActionLink color={C.textPrimary}>Edit</ActionLink>
        </div>
        <div style={{ fontSize: 13, color: C.textSecond, marginTop: 4 }}>John</div>
      </div>
      <Divider color={C.divider} />

      {/* Last Name row */}
      <div style={{ padding: '16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Last Name</span>
          <ActionLink color={C.textPrimary}>Edit</ActionLink>
        </div>
        <div style={{ fontSize: 13, color: C.textSecond, marginTop: 4 }}>Doe</div>
      </div>
      <Divider color={C.divider} />

      {/* Email row */}
      <div style={{ padding: '16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>Email</span>
          <ActionLink color={C.textPrimary}>Edit</ActionLink>
        </div>
        <div style={{ fontSize: 13, color: C.textSecond, marginTop: 4 }}>john.doe@example.com</div>
      </div>
      <Divider color={C.divider} />
    </div>
  );
}

// ── Reusable custom dropdown ─────────────────────────────────────
function CustomSelect({ C, options, value, onChange, isOpen, setIsOpen, isLight }: {
  C: Theme;
  options: { value: string; label: string; symbol?: React.ReactNode }[];
  value: string;
  onChange: (v: string) => void;
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  isLight?: boolean;
}) {
  const isBlackAccentDark = C.accent === '#000000' && isLight === false;
  const selected = options.find(o => o.value === value) || options[0];
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        className="d2-input"
        style={{
          width: '100%',
          maxWidth: 300,
          padding: '10px 40px 10px 16px',
          border: `2px solid ${isOpen ? (isBlackAccentDark ? '#e5e7eb' : C.accent) : C.cardBorder}`,
          borderRadius: 8,
          background: C.bg,
          color: C.textPrimary,
          fontSize: 13,
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textAlign: 'left',
          position: 'relative',
          transition: 'border-color 0.15s',
        }}
      >
        {selected.symbol}
        <span>{selected.label}</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          style={{ position: 'absolute', right: 12, top: '50%', transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`, transition: 'transform 0.15s', color: C.textDim }}
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          width: '100%',
          maxWidth: 300,
          marginTop: 4,
          background: C.card,
          border: `1px solid ${C.cardBorder}`,
          borderRadius: 8,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          zIndex: 10,
          overflow: 'hidden',
        }}>
          {options.map((opt) => (
            <button
              key={opt.value}
              onMouseDown={(e) => { e.preventDefault(); onChange(opt.value); setIsOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '10px 16px',
                border: 'none',
                background: value === opt.value ? C.hover : 'transparent',
                color: C.textPrimary,
                fontSize: 13,
                fontWeight: value === opt.value ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.1s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = C.hover; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = value === opt.value ? C.hover : 'transparent'; }}
            >
              {opt.symbol}
              <span>{opt.label}</span>
              {value === opt.value && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isBlackAccentDark ? C.textSecond : C.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 'auto' }}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DefaultConfigurationsTab({ C, isLight }: { C: Theme; isLight: boolean }) {
  const { t, lang: currentLang, setLang } = useTranslation();

  // Read saved values from localStorage
  const [selectedLang, setSelectedLang] = useState(() => {
    if (typeof localStorage === 'undefined') return currentLang || 'en';
    return localStorage.getItem('d2_language') || currentLang || 'en';
  });
  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    if (typeof localStorage === 'undefined') return 'Asia/Riyadh';
    return localStorage.getItem('d2_timezone') || 'Asia/Riyadh';
  });
  const [selectedCurrency, setSelectedCurrency] = useState(() => {
    if (typeof localStorage === 'undefined') return 'SAR';
    return localStorage.getItem('d2_currency') || 'SAR';
  });
  const [saving, setSaving] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [tzOpen, setTzOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);

  const isDefault = selectedLang === 'en' && selectedTimezone === 'Asia/Riyadh' && selectedCurrency === 'SAR';

  const handleSave = () => {
    setSaving(true);
    localStorage.setItem('d2_language', selectedLang);
    localStorage.setItem('d2_timezone', selectedTimezone);
    localStorage.setItem('d2_currency', selectedCurrency);
    // If language changed, use i18n setLang to switch URL + dir + translations (no reload needed — setLang navigates)
    if (selectedLang !== currentLang) {
      setLang(selectedLang as 'en' | 'ar');
      setSaving(false);
    } else {
      // Only reload if timezone or currency changed (language didn't change)
      setTimeout(() => window.location.reload(), 400);
    }
  };

  const handleReset = () => {
    setSelectedLang('en');
    setSelectedTimezone('Asia/Riyadh');
    setSelectedCurrency('SAR');
  };

  // Close other dropdowns when one opens
  const openLang = (v: boolean) => { setLangOpen(v); if (v) { setTzOpen(false); setCurrencyOpen(false); } };
  const openTz = (v: boolean) => { setTzOpen(v); if (v) { setLangOpen(false); setCurrencyOpen(false); } };
  const openCurrency = (v: boolean) => { setCurrencyOpen(v); if (v) { setLangOpen(false); setTzOpen(false); } };

  // Language options
  const langOptions = [
    { value: 'en', label: 'English' },
    { value: 'ar', label: '\u0627\u0644\u0639\u0631\u0628\u064A\u0629 (Arabic)' },
  ];

  // Timezone options
  const tzOptions = [
    { value: 'Asia/Riyadh', label: 'Riyadh (UTC+3)', symbol: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
    { value: 'UTC', label: 'UTC (UTC+0)', symbol: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg> },
  ];

  // Currency options with symbols
  const currencyOptions = [
    { value: 'SAR', label: 'Saudi Riyal', symbol: <SarSymbol size={14} color={C.textPrimary} /> },
    { value: 'USD', label: 'US Dollar', symbol: <span style={{ fontSize: 14, fontWeight: 700, color: C.textPrimary, lineHeight: 1 }}>$</span> },
  ];

  return (
    <div style={{ marginTop: 14 }}>
      {/* Language Section */}
      <div style={{ padding: '0px 0 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Language</span>
        </div>
        <p style={{ fontSize: 13, color: C.textDim, marginTop: 4, margin: 0 }}>
          Select the display language for the application
        </p>
        <div style={{ marginTop: 10 }}>
          <CustomSelect C={C} options={langOptions} value={selectedLang} onChange={setSelectedLang} isOpen={langOpen} setIsOpen={openLang} isLight={isLight} />
        </div>
      </div>
      <Divider color={C.divider} />

      {/* Timezone Section */}
      <div style={{ padding: '24px 0 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Time zone</span>
        </div>
        <p style={{ fontSize: 13, color: C.textDim, marginTop: 4, margin: 0 }}>
          Set the time zone for dates and times across the system
        </p>
        <div style={{ marginTop: 10 }}>
          <CustomSelect C={C} options={tzOptions} value={selectedTimezone} onChange={setSelectedTimezone} isOpen={tzOpen} setIsOpen={openTz} isLight={isLight} />
        </div>
      </div>
      <Divider color={C.divider} />

      {/* Currency Section */}
      <div style={{ padding: '24px 0 24px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Currency</span>
        </div>
        <p style={{ fontSize: 13, color: C.textDim, marginTop: 4, margin: 0 }}>
          Set the default currency for prices and transactions
        </p>
        <div style={{ marginTop: 10 }}>
          <CustomSelect C={C} options={currencyOptions} value={selectedCurrency} onChange={setSelectedCurrency} isOpen={currencyOpen} setIsOpen={openCurrency} isLight={isLight} />
        </div>
      </div>
      <Divider color={C.divider} />

      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
        <button
          onClick={handleReset}
          disabled={isDefault}
          style={{
            marginTop: 20,
            padding: '10px 20px',
            borderRadius: 24,
            background: 'transparent',
            border: 'none',
            color: isLight ? C.textDim : '#9ca3af',
            fontSize: 13,
            fontWeight: 500,
            cursor: isDefault ? 'default' : 'pointer',
            opacity: isDefault ? 0.3 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {t('Reset to default')}
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            marginTop: 20,
            padding: '12px 28px',
            borderRadius: 24,
            border: 'none',
            background: C.accent === '#000000' && !isLight ? '#e5e7eb' : C.accent,
            color: C.accent === '#000000' && !isLight ? '#000000' : '#ffffff',
            fontSize: 12,
            fontWeight: 600,
            cursor: saving ? 'wait' : 'pointer',
            opacity: saving ? 0.7 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {saving ? t('Saving...') : t('Save Preferences')}
        </button>
      </div>
    </div>
  );
}

// ── Resolve system preference ────────────────────────────────────
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

function getSavedThemeMode(): 'light' | 'dark' | 'system' {
  if (typeof localStorage === 'undefined') return 'light';
  return (localStorage.getItem('d2_theme_mode') as 'light' | 'dark' | 'system') ||
    (localStorage.getItem('d2_theme') as 'light' | 'dark') || 'light';
}

function getSavedAccent(): string {
  if (typeof localStorage === 'undefined') return '#000000';
  return localStorage.getItem('d2_accent') || '#000000';
}

function ThemeSettingsTab({ C, isLight, onAccentPreview, onDarkSidebarPreview, onShowHeaderPreview, onThemePreview, onSave }: { C: Theme; isLight: boolean; onAccentPreview?: (color: string | null) => void; onDarkSidebarPreview?: (v: boolean | null) => void; onShowHeaderPreview?: (v: boolean | null) => void; onThemePreview?: (theme: 'light' | 'dark' | null) => void; onSave?: () => void }) {
  const { t } = useTranslation();
  const savedMode = getSavedThemeMode();
  const savedAccentColor = getSavedAccent();
  const [selectedTheme, setSelectedTheme] = useState<'light' | 'dark' | 'system'>(
    savedMode === 'system' ? (isLight ? 'light' : 'dark') : savedMode
  );
  const [syncWithSystem, setSyncWithSystem] = useState(savedMode === 'system');
  const [selectedAccent, setSelectedAccent] = useState(savedAccentColor);
  const [customHex, setCustomHex] = useState(() => {
    const presets = ['#000000', '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    return presets.includes(savedAccentColor) ? '' : savedAccentColor.replace('#', '');
  });
  const [darkSidebar, setDarkSidebar] = useState(
    typeof localStorage !== 'undefined' && localStorage.getItem('d2_dark_sidebar') === 'true'
  );
  const [showHeader, setShowHeader] = useState(
    typeof localStorage !== 'undefined' ? localStorage.getItem('d2_show_header') !== 'false' : true
  );
  const [animationSpeed, setAnimationSpeed] = useState(() => {
    if (typeof localStorage === 'undefined') return 'normal';
    return localStorage.getItem('d2_animation_speed') || 'normal';
  });
  const [saving, setSaving] = useState(false);
  // Black accent on dark theme = invisible; use visible fallback
  const isBlackOnDark = selectedAccent === '#000000' && !isLight;

  // The effective mode that will be saved
  const effectiveMode = syncWithSystem ? 'system' : selectedTheme;

  // Whether the user has changed the theme mode from saved (for unsaved hint under theme cards)
  const hasThemeChanges = effectiveMode !== savedMode;

  const accentColors = [
    '#000000', // black (default)
    '#3b82f6', // blue
    '#ef4444', // red
    '#10b981', // green
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
  ];

  // Save theme + accent to localStorage and reload
  const handleSave = () => {
    setSaving(true);
    // Store the mode (light/dark/system)
    localStorage.setItem('d2_theme_mode', effectiveMode);
    // Resolve the actual theme for rendering
    const resolvedTheme = effectiveMode === 'system' ? getSystemTheme() : effectiveMode;
    localStorage.setItem('d2_theme', resolvedTheme);
    // Store accent color
    localStorage.setItem('d2_accent', selectedAccent);
    // Store dark sidebar preference
    localStorage.setItem('d2_dark_sidebar', String(darkSidebar));
    // Store animation speed
    localStorage.setItem('d2_animation_speed', animationSpeed);
    // Store header visibility
    localStorage.setItem('d2_show_header', String(showHeader));
    // Notify parent to re-read saved values (no page reload)
    setTimeout(() => { setSaving(false); onSave?.(); }, 400);
  };

  // Reset everything to factory defaults
  const handleReset = () => {
    setSelectedTheme('light');
    setSyncWithSystem(false);
    setSelectedAccent('#000000');
    setDarkSidebar(false);
    setShowHeader(true);
    setAnimationSpeed('normal');
    onAccentPreview?.('#000000');
    onDarkSidebarPreview?.(false);
    onShowHeaderPreview?.(true);
    onThemePreview?.('light');
  };

  // Check if anything differs from factory defaults
  const isDefault = selectedTheme === 'light' && !syncWithSystem && selectedAccent === '#000000' && !darkSidebar && showHeader && animationSpeed === 'normal';

  return (
    <div style={{ marginTop: 0 }}>
      {/* Theme Section */}
      <div style={{ padding: '0 0 20px 0', paddingTop: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 0 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Theme</span>
        </div>
        <p style={{ fontSize: 13, color: C.textDim, marginTop: 4, margin: 0 }}>
          Customize your application appearance
        </p>

        {/* Theme Options */}
        <div style={{
          display: 'flex',
          gap: 20,
          marginTop: 20,
        }}>
          {[
            { value: 'light' as const, label: 'Light', bg: '#ffffff', border: '#e5e5e5' },
            { value: 'dark' as const, label: 'Dark', bg: '#0f0f0f', border: '#3f3f3f' },
            { value: 'system' as const, label: 'System', bg: 'linear-gradient(135deg, #ffffff 50%, #0f0f0f 50%)', border: '#3f3f3f' },
          ].map((theme) => {
            const isSelected = theme.value === 'system' ? syncWithSystem : (!syncWithSystem && selectedTheme === theme.value);
            const isSaved = savedMode === theme.value;
            return (
              <div key={theme.value} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => {
                    if (theme.value === 'system') {
                      setSyncWithSystem(true);
                      // Preview the resolved system theme
                      const sysTheme = getSystemTheme();
                      onThemePreview?.(sysTheme);
                    } else {
                      setSyncWithSystem(false);
                      setSelectedTheme(theme.value);
                      onThemePreview?.(theme.value);
                    }
                  }}
                  style={{
                    padding: 12,
                    border: `2px solid ${isSelected ? (selectedAccent === '#000000' && !isLight ? '#e5e7eb' : selectedAccent) : (isLight ? '#e5e5e5' : '#3f3f3f')}`,
                    borderRadius: 8,
                    background: theme.bg,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 38,
                      borderRadius: 6,
                      background: theme.bg,
                      border: `1px solid ${theme.border}`,
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Mini preview content */}
                    <div style={{
                      position: 'absolute',
                      top: 3,
                      left: 3,
                      right: 3,
                      height: 5,
                      borderRadius: 1,
                      background: theme.value === 'dark' ? '#3f3f3f' : theme.value === 'system' ? 'linear-gradient(90deg, #e5e5e5 50%, #3f3f3f 50%)' : '#e5e5e5',
                    }} />
                    {/* Checkmark for selected theme */}
                    {isSelected && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        background: selectedAccent === '#000000' && !isLight ? '#e5e7eb' : selectedAccent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
                <span style={{ fontSize: 13, fontWeight: isSelected ? 700 : 500, color: C.textPrimary }}>
                  {theme.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Unsaved hint — below theme cards */}
        {hasThemeChanges && (
          <p style={{ fontSize: 11, color: C.textDim, marginTop: 14, margin: '14px 0 0 0', fontStyle: 'italic' }}>
            Unsaved — click Save Preferences to apply
          </p>
        )}

        {/* System theme info */}
        {syncWithSystem && (
          <p style={{ fontSize: 12, color: C.textDim, marginTop: hasThemeChanges ? 6 : 12, margin: `${hasThemeChanges ? 6 : 12}px 0 0 0` }}>
            Follows your operating system preference (currently {getSystemTheme()})
          </p>
        )}
      </div>
      <Divider color={C.divider} />

      {/* Accent Color Section */}
      <div style={{ padding: '20px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Accent Color</span>
        </div>
        <p style={{ fontSize: 13, color: C.textDim, marginTop: 4, margin: 0 }}>
          Set Primary Color for Highlights and Accents.
        </p>

        {/* Accent Color Options */}
        <div style={{
          display: 'flex', gap: 25, padding: '0px 10px 0px 14px',
          flexWrap: 'wrap', marginTop: 20
        }}>
          {accentColors.map((color) => (
            <div key={color} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, width: 10 }}>
              <button
                onClick={() => { setSelectedAccent(color); setCustomHex(''); onAccentPreview?.(color); }}
                style={{
                  width: 30,
                  height: 30,
                  padding: '0px 10px', borderRadius: '50%',
                  background: color,
                  border: `2.5px solid ${selectedAccent === color
                    ? C.textPrimary
                    : (color === '#000000' && !isLight ? '#3f3f3f' : 'transparent')}`,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative',
                  boxShadow: selectedAccent === color ? `0 0 0 2px ${color === '#000000' ? (!isLight ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)') : `${color}40`}` : 'none',
                }}
              >
                {/* Checkmark for selected color */}
                {selectedAccent === color && (
                  <svg
                    width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke={color === '#000000' && !isLight ? '#a0a0a0' : '#ffffff'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
                    }}
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Custom Color */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8, paddingInlineStart: 0 }}>
          <span style={{ fontSize: 13, color: C.textSecond }}>Custom color:</span>
          <div style={{
            display: 'flex', alignItems: 'center',
            border: `1px solid ${C.cardBorder}`, borderRadius: 8,
            padding: '6px 11px', gap: 4,
            background: isLight ? '#fff' : C.card,
          }}>
            <span style={{ fontSize: 13, color: C.textDim }}>#</span>
            <input
              type="text"
              maxLength={6}
              value={customHex}
              placeholder="2C68F6"
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9a-fA-F]/g, '').slice(0, 6);
                setCustomHex(val);
                if (val.length === 6) {
                  const hex = `#${val}`;
                  setSelectedAccent(hex);
                  onAccentPreview?.(hex);
                }
              }}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: 13, fontWeight: 500, color: C.textPrimary,
                width: 70, fontFamily: 'monospace',
              }}
            />
          </div>
          <label
            style={{
              width: 30, height: 30, borderRadius: '50%',
              background: !accentColors.includes(selectedAccent) ? selectedAccent : C.divider,
              border: `2.5px solid ${!accentColors.includes(selectedAccent) ? C.textPrimary : 'transparent'}`,
              cursor: 'pointer', position: 'relative', display: 'block',
              boxShadow: !accentColors.includes(selectedAccent) ? `0 0 0 2px ${selectedAccent}40` : 'none',
              transition: 'all 0.2s', overflow: 'hidden',
            }}
          >
            <input
              type="color"
              value={!accentColors.includes(selectedAccent) ? selectedAccent : '#2C68F6'}
              onChange={(e) => {
                const hex = e.target.value;
                setSelectedAccent(hex);
                setCustomHex(hex.replace('#', ''));
                onAccentPreview?.(hex);
              }}
              style={{
                position: 'absolute', top: 0, left: 0,
                width: '100%', height: '100%',
                opacity: 0, cursor: 'pointer',
              }}
            />
            {!accentColors.includes(selectedAccent) && (
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.3))',
                  pointerEvents: 'none',
                }}
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </label>
        </div>
      </div>
      <Divider color={C.divider} />

      {/* Dark Sidebar toggle */}
      <div style={{ padding: '15px 0' }}>
        <div style={{ marginTop: 0 }}>
          <button
            onClick={() => { const next = !darkSidebar; setDarkSidebar(next); onDarkSidebarPreview?.(next); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderRadius: 8,
              background: C.bg,
              cursor: 'pointer',
              border: 'none',
              padding: 0,
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Dark sidebar</span>
              <span style={{ fontSize: 13, color: C.textDim, fontWeight: 400 }}>
                Use a dark-colored sidebar even in light mode
              </span>
            </div>
            <div style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: darkSidebar
                ? (selectedAccent === '#000000' && !isLight ? '#e5e7eb' : selectedAccent)
                : (isLight ? '#d1d5db' : '#4b5563'),
              position: 'relative',
              transition: 'all 0.2s',
              flexShrink: 0,
              marginLeft: 16,
            }}>
              <div style={{
                position: 'absolute',
                top: 2,
                left: darkSidebar ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#ffffff',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }} />
            </div>
          </button>
        </div>
      </div>
      <Divider color={C.divider} />

      {/* Top Header Bar toggle */}
      <div style={{ padding: '15px 0 15px 0' }}>
        <div style={{ marginTop: 0 }}>
          <button
            onClick={() => { const next = !showHeader; setShowHeader(next); onShowHeaderPreview?.(next); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              borderRadius: 8,
              background: C.bg,
              cursor: 'pointer',
              border: 'none',
              padding: 0,
              textAlign: 'left',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Top header bar</span>
              <span style={{ fontSize: 13, color: C.textDim, fontWeight: 400 }}>
                Show a full-width header with logo and navigation icons
              </span>
            </div>
            <div style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: showHeader
                ? (selectedAccent === '#000000' && !isLight ? '#e5e7eb' : selectedAccent)
                : (isLight ? '#d1d5db' : '#4b5563'),
              position: 'relative',
              transition: 'all 0.2s',
              flexShrink: 0,
              marginLeft: 16,
            }}>
              <div style={{
                position: 'absolute',
                top: 2,
                left: showHeader ? 22 : 2,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#ffffff',
                transition: 'all 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }} />
            </div>
          </button>
        </div>
      </div>

      <Divider color={C.divider} />

      {/* Animation Speed Section */}
      <div style={{ padding: '30px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>Animation Speed</span>
        </div>
        <p style={{ fontSize: 13, color: C.textDim, marginTop: 4, margin: 0 }}>
          Control page transitions and navigation animations speed.
        </p>

        {/* Animation Speed Options */}
        <div style={{ marginTop: 20 }}>
          <select
            className="d2-input"
            value={animationSpeed}
            onChange={(e) => setAnimationSpeed(e.target.value)}
            style={{
              width: '100%',
              maxWidth: 300,
              padding: '10px 40px 10px 16px',
              border: `2px solid ${C.cardBorder}`,
              borderRadius: 8,
              background: C.bg,
              color: C.textPrimary,
              fontSize: 13,
              fontWeight: 500,
              appearance: 'none',
              WebkitAppearance: 'none',
              MozAppearance: 'none',
              backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '14px',
            }}
          >
            <option value="slow">Slow</option>
            <option value="normal">Normal</option>
            <option value="fast">Fast</option>
            <option value="none">No Animation</option>
          </select>
        </div>
      </div>
      <Divider color={C.divider} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 16, marginTop: 24 }}>

        <button
          onClick={handleReset}
          disabled={isDefault}
          style={{
            padding: 0,
            background: 'transparent',
            border: 'none',
            color: isLight ? C.textDim : '#9ca3af',
            fontSize: 12,
            fontWeight: 500,
            cursor: isDefault ? 'default' : 'pointer',
            opacity: isDefault ? 0.3 : 0.7,
            transition: 'opacity 0.2s',
            textDecoration: 'underline',
          }}
        >
          {t('Reset to default')}
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: '10px 28px',
            borderRadius: 24,
            border: 'none',
            background: saving ? (isLight ? '#9ca3af' : '#6b7280') : (isBlackOnDark ? '#e5e7eb' : selectedAccent),
            color: isBlackOnDark && !saving ? '#000000' : '#ffffff',
            fontSize: 13,
            fontWeight: 600,
            cursor: saving ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {saving ? t('Saving...') : t('Save Preferences')}
        </button>

      </div>

    </div>
  );
}

// ── Main Component ──────────────────────────────────────────────
export default function ThemeSettings({ C, isLight, onAccentPreview, onDarkSidebarPreview, onShowHeaderPreview, onThemePreview, onSave }: ThemeSettingsProps) {
  const [activeTab, setActiveTab] = useState<'configurations' | 'theme'>('theme');
  const [previousTab, setPreviousTab] = useState<'configurations' | 'theme' | null>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  const tabs = [
    // { id: 'personal', label: 'Personal Information' },
    { id: 'theme', label: 'Theme Settings' },
    { id: 'configurations', label: 'Default Configurations' },
  ] as const;

  const updateUnderline = (tabId: string) => {
    const button = document.querySelector(`[data-tab="${tabId}"]`) as HTMLElement;
    const parent = button?.parentElement;
    if (button && parent) {
      const buttonRect = button.getBoundingClientRect();
      const parentRect = parent.getBoundingClientRect();
      setUnderlineStyle({
        left: buttonRect.left - parentRect.left,
        width: buttonRect.width
      });
    }
  };

  useEffect(() => {
    updateUnderline(activeTab);
  }, [activeTab]);

  useEffect(() => {
    updateUnderline(activeTab);
  }, []);

  return (
    <>
      {/* ── Page Header ── */}
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 4px 0' }}>
        Appearance
      </h2>
      <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 18px 0', lineHeight: 1.5 }}>
        Set or customize your visual preferences for the system.
      </p>
      <div style={{ height: 1, background: C.divider, opacity: 0.4 }} />

      {/* Tab Navigation */}
      <div style={{
        marginTop: 28,
        borderBottom: `1px solid ${C.divider}`,
        marginBottom: 24,
        position: 'relative',
      }}>
        <div style={{ display: 'flex', gap: 32, position: 'relative' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              data-tab={tab.id}
              onClick={() => {
                if (tab.id !== activeTab) {
                  setPreviousTab(activeTab);
                  setActiveTab(tab.id);
                }
              }}
              style={{
                padding: '0px 0 8px 0',
                background: 'none',
                border: 'none',
                color: activeTab === tab.id ? C.textPrimary : C.textLight,
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                zIndex: 2,
              }}
            >
              {tab.label}
            </button>
          ))}
          {/* Sliding Underline */}
          <div
            style={{
              position: 'absolute',
              bottom: -1,
              height: 2,
              background: (C.accent === '#000000' && !isLight) ? '#ffffff' : C.accent,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              zIndex: 1,
              left: underlineStyle.left,
              width: underlineStyle.width,
            }}
          />
        </div>
      </div>

      {/* Tab Content with Sliding Animation */}
      <style>{`
        @keyframes tab-slide-forward-in {
          from { transform: translateX(40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes tab-slide-back-in {
          from { transform: translateX(-40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes tab-slide-out {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(-20px); opacity: 0; }
        }
      `}</style>
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: 400 }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isPrevious = previousTab === tab.id;
          const shouldRender = isActive || (previousTab !== null && isPrevious);

          if (!shouldRender) return null;

          const currentIndex = tabs.findIndex(t => t.id === activeTab);
          const previousIndex = previousTab ? tabs.findIndex(t => t.id === previousTab) : currentIndex;
          const isForward = currentIndex > previousIndex;

          // Skip animation on initial mount (previousTab is null)
          // Active tab animates in, previous tab animates out
          const animation = previousTab === null
            ? 'none'
            : isActive
              ? `${isForward ? 'tab-slide-forward-in' : 'tab-slide-back-in'} 0.18s ease-out forwards`
              : `${'tab-slide-out'} 0.15s ease-out forwards`;

          return (
            <div
              key={`${tab.id}-${activeTab}`}
              style={{
                width: '100%',
                animation,
                position: isActive ? 'relative' : 'absolute',
                top: 0,
                left: 0,
                zIndex: isActive ? 2 : 1,
              }}
            >
              {tab.id === 'configurations' && <DefaultConfigurationsTab C={C} isLight={isLight} />}
              {tab.id === 'theme' && <ThemeSettingsTab C={C} isLight={isLight} onAccentPreview={onAccentPreview} onDarkSidebarPreview={onDarkSidebarPreview} onShowHeaderPreview={onShowHeaderPreview} onThemePreview={onThemePreview} onSave={onSave} />}
            </div>
          );
        })}
      </div>
    </>
  );
}
