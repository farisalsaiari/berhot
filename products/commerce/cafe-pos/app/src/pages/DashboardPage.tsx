import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SlidePanel, Modal, useSessionTimeout } from '@berhot/ui';
import { useTranslation } from '@berhot/i18n';
import AccountSettingsContent from './AccountSettingsContent';
import BusinessProfileContent from './BusinessProfileContent';
import {
  SettingsTimezoneContent, SettingsCurrencyContent, SettingsMultiTabContent, SettingsThemeContent,
  SettingsDisplayPreferencesContent, SettingsNotificationsActionsContent,
  SettingsInvoiceContent, SettingsSubscriptionContent, SettingsPaymentGatewayContent,
  SettingsTwoFactorContent, SettingsEncryptionContent,
  SettingsRoleContent, SettingsTeamContent,
  SettingsThirdPartyContent, SettingsApiAccessContent,
  SettingsEmailInappContent, SettingsCustomAlertsContent,
} from './SettingsContent';

/* ──────────────────────────────────────────────────────────────────
   Dashboard — Dark / Light theme, Lunor-style layout
   Self-contained page with its own sidebar (doesn't use Layout.tsx)
   ────────────────────────────────────────────────────────────────── */

// ── Theme palettes ──────────────────────────────────────────────
const darkTheme = {
  bg: '#0f0f0f',
  sidebar: '#151515',
  card: '#151515',
  cardBorder: '#3f3f3f',
  hover: '#1d1d1d',
  /* OLD active ↓ */
  active: '#1d1d1d',
  // active: 'rgba(56, 152, 236, 0.10)',
  activeBorder: 'rgba(56, 152, 236, 0.25)',
  activeText: '#60b5ff',
  activeIcon: '#60b5ff',
  divider: '#3f3f3f',
  textPrimary: '#e7e7e7',
  textSecond: '#a0a0a0',
  textDim: '#949494',
  accent: '#3b82f6',
  btnBg: '#2993f0',
  btnBorder: '#3f3f3f',
};

const lightTheme = {
  bg: '#ffffff',
  sidebar: '#fafafa',
  card: '#ffffff',
  cardBorder: '#e5e5e5',
  hover: '#f0f0f0',
  /* OLD active ↓ */
  // active: '#f0f0f0',
  active: 'rgba(37, 130, 220, 0.08)',
  activeBorder: 'rgba(37, 130, 220, 0.20)',
  activeText: '#2570c0',
  activeIcon: '#2570c0',
  divider: '#c7c7c7',
  textPrimary: '#1a1a1a',
  textSecond: '#444444',
  textDim: '#999999',
  accent: '#3b82f6',
  btnBg: '#2993f0',
  btnBorder: '#d4d4d4',
};

// ── Read saved theme (before render) ────────────────────────────
const savedTheme = (typeof localStorage !== 'undefined' && localStorage.getItem('d2_theme')) || 'light';
const C = savedTheme === 'light' ? lightTheme : darkTheme;

// ── Read user data from auth session ────────────────────────────
const STORAGE_KEY = 'berhot_auth';
const APP_PORT = 3002;
const LANDING_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_LANDING_URL || (Number(window.location.port) >= 5000 ? 'http://localhost:5001' : 'http://localhost:3000');

function parseAuthFromHash(): { accessToken: string; refreshToken: string; user: unknown; posProduct?: { name: string; port: number } } | null {
  try {
    const hash = window.location.hash;
    if (!hash || !hash.includes('auth=')) return null;
    const params = new URLSearchParams(hash.substring(1));
    const authData = params.get('auth');
    if (!authData) return null;
    const parsed = JSON.parse(atob(authData));
    if (parsed.user && parsed.accessToken) {
      window.history.replaceState(null, '', window.location.pathname);
      return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

function getAuthUser(): { firstName: string; lastName: string; email: string; role: string } {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.user) return parsed.user;
    }
  } catch { /* ignore */ }
  return { firstName: '', lastName: '', email: '', role: '' };
}

const authUser = getAuthUser();

// ── Icon components ─────────────────────────────────────────────
function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function ChevronUpDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textSecond} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 15l5 5 5-5" /><path d="M7 9l5-5 5 5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}


function AnalyticsIcon() {
  // Bar chart inside rounded square — matches design
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="8" y1="16" x2="8" y2="12" />
      <line x1="12" y1="16" x2="12" y2="8" />
      <line x1="16" y1="16" x2="16" y2="10" />
    </svg>
  );
}

function ProductsIcon() {
  // Clipboard with checkmark — matches design
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 14l2 2 4-4" />
    </svg>
  );
}

function OrdersIcon() {
  // Clock with circular arrow — history/time icon — matches design
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 4v6h6" />
      <path d="M3.51 15a9 9 0 102.13-9.36L1 10" />
      <polyline points="12 7 12 12 16 14" />
    </svg>
  );
}

function DiscountsIcon() {
  // Tag/label icon — diamond shape — matches design
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function AppsIcon() {
  // Grid of 4 circles — app grid icon
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7" cy="7" r="4" />
      <circle cx="17" cy="7" r="4" />
      <circle cx="7" cy="17" r="4" />
      <circle cx="17" cy="17" r="4" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function SupportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function VerifiedBadge() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="#3b82f6">
      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


function SignatureIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill={C.card} stroke={C.cardBorder} strokeWidth="1" />
      <path d="M8 22c2-4 4-12 6-12s2 8 4 8 2-6 4-6 1 4 2 4" stroke={C.textSecond} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── Nav items config ────────────────────────────────────────────
const navTop: { label: string; icon: React.ReactNode; shortcut?: string }[] = [
  { label: 'Search', icon: <SearchIcon />, shortcut: '/' },
];

// Nav items with path mappings for active state
const navMain: { label: string; icon: React.ReactNode; path: string }[] = [
  { label: 'Dashboard', icon: <GridIcon />, path: 'home' },
  { label: 'Analytics', icon: <AnalyticsIcon />, path: 'analytics' },
  { label: 'Products', icon: <ProductsIcon />, path: 'products' },
  { label: 'Orders', icon: <OrdersIcon />, path: 'orders' },
  { label: 'Discounts', icon: <DiscountsIcon />, path: 'discounts' },
  { label: 'Apps', icon: <AppsIcon />, path: 'apps' },
];

// ── Settings sidebar navigation config ───────────────────────────
const settingsNav: { category: string; links: { label: string; path: string }[] }[] = [
  {
    category: 'General',
    links: [
      { label: 'Time Zone', path: 'settings/timezone' },
      { label: 'Currency', path: 'settings/currency' },
      { label: 'Enable Multi-Tab Login', path: 'settings/multi-tab' },
      { label: 'Theme Settings', path: 'settings/theme' },
    ],
  },
  {
    category: 'Schedules',
    links: [
      { label: 'Display Preferences', path: 'settings/display-preferences' },
      { label: 'Notifications & Actions', path: 'settings/notifications-actions' },
    ],
  },
  {
    category: 'Billing & Payment',
    links: [
      { label: 'Invoice', path: 'settings/invoice' },
      { label: 'Subscription Management', path: 'settings/subscription' },
      { label: 'Payment Gateway', path: 'settings/payment-gateway' },
    ],
  },
  {
    category: 'Privacy & Security',
    links: [
      { label: 'Two-factor Authentication', path: 'settings/two-factor' },
      { label: 'Data Encryption', path: 'settings/encryption' },
    ],
  },
  {
    category: 'User Permissions',
    links: [
      { label: 'Role', path: 'settings/role' },
      { label: 'Team', path: 'settings/team' },
    ],
  },
  {
    category: 'Integrations',
    links: [
      { label: 'Third-party', path: 'settings/third-party' },
      { label: 'API Access', path: 'settings/api-access' },
    ],
  },
  {
    category: 'Notification',
    links: [
      { label: 'Email and In-app', path: 'settings/email-inapp' },
      { label: 'Custom Alerts', path: 'settings/custom-alerts' },
    ],
  },
];

// ── Main component ──────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang: i18nLang, setLang } = useTranslation();
  const lang = i18nLang || window.location.pathname.split('/')[1] || 'en';
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);
  const [hoveredSettingsLink, setHoveredSettingsLink] = useState<string | null>(null);
  // Settings sub-menu stack for small-screen sidebar navigation
  const [settingsMenuStack, setSettingsMenuStack] = useState<{ parentLabel: string; children: typeof settingsNav }[]>([]);
  const [settingsSlideDir, setSettingsSlideDir] = useState<'forward' | 'back' | ''>('');
  const [settingsSlideKey, setSettingsSlideKey] = useState(0);
  const [settingsClosing, setSettingsClosing] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [showLangPanel, setShowLangPanel] = useState(false);
  const [selectedLang, setSelectedLang] = useState(lang);
  const [langOverlay, setLangOverlay] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(() => {
    return sessionStorage.getItem('d2_upgrade_dismissed') !== 'true';
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('d2_theme') as 'dark' | 'light') || 'light';
  });
  const [switching, setSwitching] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  // Page transition: displayedPath holds the path currently rendered.
  // When URL changes, we show spinner, then update displayedPath after delay.
  const [displayedPath, setDisplayedPath] = useState(location.pathname);
  const pageLoading = displayedPath !== location.pathname;
  const isLight = savedTheme === 'light';

  // ── Auth guard — same logic as Layout.tsx ──────────────────────
  useEffect(() => {
    const isAuthorized = (data: { posProduct?: { port: number } }) => {
      return data.posProduct?.port === APP_PORT;
    };

    const hashAuth = parseAuthFromHash();
    if (hashAuth) {
      if (!isAuthorized(hashAuth)) {
        if (hashAuth.posProduct?.port) {
          window.location.href = `http://localhost:${hashAuth.posProduct.port}/${lang}/dashboard/#auth=${btoa(JSON.stringify(hashAuth))}`;
        } else {
          window.location.href = `${LANDING_URL}/`;
        }
        return;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hashAuth));
      setAuthChecked(true);
      return;
    }

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user) {
          if (!isAuthorized(parsed)) {
            localStorage.removeItem(STORAGE_KEY);
            window.location.href = `${LANDING_URL}/${lang}/signin`;
            return;
          }
          setAuthChecked(true);
          return;
        }
      }
    } catch { /* ignore */ }
    window.location.href = `${LANDING_URL}/${lang}/signin`;
  }, []);

  // Determine which page to show — uses displayedPath (not location) to avoid flash
  const pagePath = displayedPath.replace(`/${lang}/dashboard`, '').replace(/^\//, '') || 'home';
  const isSettingsPage = pagePath.startsWith('settings');
  const isSettingsActive = pagePath === 'account' || isSettingsPage;

  // Redirect bare /settings to /settings/timezone
  useEffect(() => {
    if (pagePath === 'settings') {
      navigate(`/${lang}/dashboard/settings/timezone`, { replace: true });
    }
  }, [pagePath, lang, navigate]);

  // Auto-open settings submenu on page load if on a settings page
  useEffect(() => {
    if (isSettingsPage && settingsMenuStack.length === 0) {
      // Find which category the current page belongs to
      const currentGroup = settingsNav.find((g) => g.links.some((l) => pagePath === l.path));
      if (currentGroup) {
        setSettingsMenuStack([
          { parentLabel: 'Settings', children: settingsNav },
          { parentLabel: currentGroup.category, children: [currentGroup] },
        ]);
      } else {
        setSettingsMenuStack([{ parentLabel: 'Settings', children: settingsNav }]);
      }
    }
    // Close submenu when navigating away from settings
    if (!isSettingsPage && settingsMenuStack.length > 0) {
      setSettingsMenuStack([]);
      setSettingsSlideDir('');
      setSettingsClosing(false);
    }
  }, [isSettingsPage, pagePath]);

  // Page transition — after URL changes, wait then reveal new content
  useEffect(() => {
    if (displayedPath !== location.pathname) {
      const timer = setTimeout(() => setDisplayedPath(location.pathname), 180);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, displayedPath]);

  // ── Session timeout ──────────────────────────────────────────
  const performLogout = () => {
    try {
      const _a = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const _pp = _a.posProduct;
      const _em = _a.user?.email || '';
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = `${LANDING_URL}/en/signin?logout=true&port=${window.location.port}${_pp ? '&posProduct=' + encodeURIComponent(JSON.stringify(_pp)) : ''}${_em ? '&email=' + encodeURIComponent(_em) : ''}`;
    } catch {
      localStorage.removeItem(STORAGE_KEY);
      window.location.href = `${LANDING_URL}/en/signin?logout=true`;
    }
  };

  const session = useSessionTimeout({
    timeoutMs: 15 * 60_000,  // 15 min idle timeout
    warningMs: 2 * 60_000,   // 2 min warning countdown
    onTimeout: performLogout,
  });

  const [hoveredExtend, setHoveredExtend] = useState<string | null>(null);

  // ── Auth loading spinner ─────────────────────────────────────
  if (!authChecked) {
    return (
      <>
        <style>{`@keyframes d2-spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ background: C.bg, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{
            width: 32, height: 32,
            border: `2px solid ${C.divider}`,
            borderTop: `2px solid ${C.textPrimary}`,
            borderRadius: '50%',
            animation: 'd2-spin 0.6s linear infinite',
          }} />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
      .d2-sidebar-scroll::-webkit-scrollbar { display: none; }
      .d2-sidebar-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      .d2-main-scroll::-webkit-scrollbar { display: none; }
      .d2-main-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      @keyframes d2-spin { to { transform: rotate(360deg); } }
      @keyframes d2-slide-forward { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes d2-slide-back { from { transform: translateX(-40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes d2-overlay-close { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-40px); opacity: 0; } }
      .d2-slide-forward { animation: d2-slide-forward 0.18s ease-out forwards; }
      .d2-slide-back { animation: d2-slide-back 0.18s ease-out forwards; }
      .d2-overlay-close { animation: d2-overlay-close 0.18s ease-out forwards; }
      .d2-settings-sidebar { display: flex; }
      @media (max-width: 1366px) { .d2-settings-sidebar { display: none !important; } }
    `}</style>

      {/* ═══ THEME SWITCH SPINNER OVERLAY ═══ */}
      {switching && (() => {
        // Use the OPPOSITE theme's bg so the spinner matches what loads next
        const target = theme === 'dark' ? lightTheme : darkTheme;
        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: target.bg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <div style={{
              width: 32,
              height: 32,
              border: `3px solid ${target.divider}`,
              borderTopColor: target.btnBg,
              borderRadius: '50%',
              animation: 'd2-spin 0.6s linear infinite',
            }} />
          </div>
        );
      })()}

      {/* ═══ LANGUAGE SWITCH OVERLAY ═══ */}
      {langOverlay && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: C.bg,
        }}>
          <div style={{
            width: 28,
            height: 28,
            border: `3px solid ${C.divider}`,
            borderTopColor: C.btnBg,
            borderRadius: '50%',
            animation: 'd2-spin 0.6s linear infinite',
          }} />
        </div>
      )}

      <div style={{ background: C.bg, color: C.textPrimary, height: '100vh', display: 'flex', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflow: 'hidden' }}>

        {/* ═══ LEFT SIDEBAR ═══ */}
        <aside style={{
          width: 280,
          minWidth: 260,
          background: C.sidebar,
          display: 'flex',
          flexDirection: 'column',
          borderRight: `1px solid ${C.divider}70`,
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
        }}>

          {/* Sidebar header — logo + brand + collapse icon */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 20px 16px 20px',
            // borderBottom: `1px solid ${C.divider}`,
          }}>
            <button onClick={() => setShowWorkspace(true)} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              color: C.textPrimary,
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: isLight ? '#1a1a1a' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={isLight ? '#ffffff' : '#000000'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>Lunor</span>
            </button>
            {/* <div style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              // border: `1px solid ${C.divider}50`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}> */}
            <div>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#949494" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="4" /><line x1="9" y1="3" x2="9" y2="21" /><path d="M15 10l-2 2 2 2" />
              </svg>
            </div>
          </div>

          {/* Divider between header and nav */}
          <div style={{ padding: '0 16px' }}>
            <div style={{ height: 1, background: C.divider, opacity: 0.6 }} />
          </div>

          {/* Top nav items (Search, Reports, Contracts) */}
          {/* <nav style={{ padding: '10px 16px', paddingBottom: 10 }}>
            {navTop.map((item) => (
              <button
                key={item.label}
                onMouseEnter={() => setHoveredNav(item.label)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: savedTheme === 'light' ? '#f2f3f3' : C.card,
                  color: C.textSecond,
                  cursor: 'pointer',
                  fontSize: 13,
                  transition: 'background 0.15s',
                  marginBottom: 1,
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', width: 18, justifyContent: 'center' }}>{item.icon}</span>
                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                {item.shortcut && (
                  <span style={{
                    fontSize: 12,
                    color: C.textDim,
                    borderRadius: 4,
                    padding: '1px 6px',
                    fontFamily: 'monospace',
                  }}>{item.shortcut}</span>
                )}
              </button>
            ))}
          </nav> */}

          {/* Divider */}
          {/* <div style={{ height: 1, background: C.divider,  }} /> */}


          {/* Main nav items (Dashboard, Analytics...) */}
          <nav className="d2-sidebar-scroll" style={{
            display: 'flex',
            flexDirection: 'column', gap: 2, padding: '10px 16px 12px 16px',
            flex: 1,
            overflowY: 'auto',
            minHeight: 0,
          }}>
            {navMain.map((item) => {
              const isActive = pagePath === item.path;
              return (
                <button
                  key={item.label}
                  onMouseEnter={() => setHoveredNav(item.label)}
                  onMouseLeave={() => setHoveredNav(null)}
                  onClick={() => {
                    const target = item.path === 'home'
                      ? `/${lang}/dashboard`
                      : `/${lang}/dashboard/${item.path}`;
                    navigate(target);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 6,
                    border: 'none',
                    background: (isActive || hoveredNav === item.label) ? C.hover : 'transparent',
                    color: isActive ? C.textPrimary : C.textSecond,
                    fontWeight: isActive ? 600 : 500,
                    transition: 'background 0.15s',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: 18,
                    justifyContent: 'center',
                    color: isActive ? C.accent : C.textSecond,
                    transition: 'color 0.15s',
                  }}>{item.icon}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                </button>
              );
            })}

          </nav>

          {/* ── Sidebar footer — Settings, Support, User card, Icon bar (sticky) ── */}
          <div style={{ flexShrink: 0, padding: '0 16px 16px 16px' }}>
            {/* Settings + Support — same gap as main nav items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Settings link */}
              <button
                onMouseEnter={() => setHoveredNav('footer-settings')}
                onMouseLeave={() => setHoveredNav(null)}
                onClick={() => {
                  setSettingsSlideDir('forward');
                  setSettingsSlideKey((k) => k + 1);
                  setSettingsMenuStack([{ parentLabel: 'Settings', children: settingsNav }]);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: (isSettingsActive || hoveredNav === 'footer-settings') ? C.hover : 'transparent',
                  color: isSettingsActive ? C.textPrimary : C.textSecond,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: isSettingsActive ? 600 : 500,
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', width: 18, justifyContent: 'center', color: isSettingsActive ? C.accent : C.textSecond }}><SettingsIcon /></span>
                <span style={{ flex: 1, textAlign: 'left' }}>Settings</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              {/* Support link */}
              <button
                onMouseEnter={() => setHoveredNav('footer-support')}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '9px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: hoveredNav === 'footer-support' ? C.hover : 'transparent',
                  color: C.textSecond,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 600,
                  transition: 'background 0.15s',
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', width: 18, justifyContent: 'center' }}><SupportIcon /></span>
                <span style={{ flex: 1, textAlign: 'left' }}>Support</span>
              </button>
            </div>

            {/* Divider */}
            {/* <div style={{ height: 1, background: C.divider, opacity: 0.4, margin: '10px 0' }} /> */}

            {/* User profile card — photo/name/email are text, only chevron is clickable */}
            {/* <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '8px 6px',
            }}> */}
            {/* Avatar */}
            {/* <div style={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: isLight ? '#e5e7eb' : '#374151',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              overflow: 'hidden',
            }}> */}
            {/* <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg> */}
            {/* </div> */}

            {/* Name + email */}
            {/* <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: C.textPrimary,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {authUser.firstName} {authUser.lastName}
                  </span>
                  <VerifiedBadge />
                </div>
                <div style={{
                  fontSize: 12,
                  color: C.textSecond,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginTop: 1,
                }}>
                  {authUser.email}
                </div>
              </div> */}

            {/* Chevron arrow — only clickable element, navigates to business profile */}
            {/* <button
                onMouseEnter={() => setHoveredNav('footer-chevron')}
                onMouseLeave={() => setHoveredNav(null)}
                onClick={() => navigate(`/${lang}/dashboard/business`)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  border: 'none',
                  background: hoveredNav === 'footer-chevron' ? C.hover : 'transparent',
                  color: C.textDim,
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }}
              >
                <ChevronRightIcon />
              </button> */}
            {/* </div> */}

            {/* Divider */}
            <div style={{ height: 1, background: C.divider, opacity: 0.4, margin: '10px 0 6px 0' }} />

            {/* Icon bar — small icons with tooltips */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
              {([
                {
                  key: 'notif',
                  tooltip: 'Notifications',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
                },
                {
                  key: 'globe',
                  tooltip: 'Language',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
                },
                {
                  key: 'search',
                  tooltip: 'Search',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
                },
                {
                  key: 'help',
                  tooltip: 'Support',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
                },
                {
                  key: 'rewards',
                  tooltip: 'Rewards',
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>,
                },
              ] as { key: string; tooltip: string; icon: React.ReactNode }[]).map((item, idx) => (
                <div key={item.key} style={{ position: 'relative' }}>
                  <button
                    onMouseEnter={() => setHoveredNav(`icon-${item.key}`)}
                    onMouseLeave={() => setHoveredNav(null)}
                    onClick={() => {
                      if (item.key === 'globe') {
                        setSelectedLang(lang);
                        setShowLangPanel(true);
                      } else if (item.key === 'help') {
                        navigate(`/${lang}/dashboard/business`);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 34,
                      height: 34,
                      borderRadius: 6,
                      border: 'none',
                      background: hoveredNav === `icon-${item.key}` ? C.hover : 'transparent',
                      color: C.textSecond,
                      cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s',
                      padding: 0,
                    }}
                  >
                    {item.icon}
                  </button>
                  {/* Tooltip — first icon aligns left to avoid clipping */}
                  {hoveredNav === `icon-${item.key}` && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      ...(idx === 0
                        ? { left: 0 }
                        : { left: '50%', transform: 'translateX(-50%)' }),
                      marginBottom: 6,
                      padding: '5px 10px',
                      background: isLight ? '#1a1a1a' : '#e7e7e7',
                      color: isLight ? '#ffffff' : '#000000',
                      fontSize: 11,
                      fontWeight: 600,
                      borderRadius: 6,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 10,
                    }}>
                      {item.tooltip}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ═══ SETTINGS SUB-MENU OVERLAY (slides over sidebar) ═══ */}
          {settingsMenuStack.length > 0 && (() => {
            const current = settingsMenuStack[settingsMenuStack.length - 1];
            const isTopLevel = current.children === settingsNav;
            return (
              <div
                className={settingsClosing ? 'd2-overlay-close' : ''}
                onAnimationEnd={() => {
                  if (settingsClosing) {
                    setSettingsClosing(false);
                    setSettingsMenuStack([]);
                    setSettingsSlideDir('');
                  }
                }}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: C.sidebar,
                  display: 'flex',
                  flexDirection: 'column',
                  zIndex: 20,
                }}>
                {/* Header — back arrow + label */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '18px 20px 16px 20px',
                }}>
                  <button
                    onClick={() => {
                      if (settingsMenuStack.length <= 1) {
                        // Top level → animate the whole overlay out, then clear
                        setSettingsClosing(true);
                      } else {
                        setSettingsSlideDir('back');
                        setSettingsSlideKey((k) => k + 1);
                        setSettingsMenuStack((prev) => prev.slice(0, -1));
                      }
                    }}
                    onMouseEnter={() => setHoveredNav('settings-back')}
                    onMouseLeave={() => setHoveredNav(null)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: 'none',
                      background: hoveredNav === 'settings-back' ? C.hover : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      padding: 0,
                      flexShrink: 0,
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textSecond} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span style={{ fontWeight: 700, fontSize: 15, color: C.textPrimary }}>{current.parentLabel}</span>
                </div>

                {/* Divider */}
                <div style={{ padding: '0 16px' }}>
                  <div style={{ height: 1, background: C.divider, opacity: 0.6 }} />
                </div>

                {/* Menu items — animated on level change */}
                <nav
                  key={settingsSlideKey}
                  className={settingsSlideDir === 'forward' ? 'd2-slide-forward' : settingsSlideDir === 'back' ? 'd2-slide-back' : ''}
                  onAnimationEnd={() => setSettingsSlideDir('')}
                  style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '10px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  {isTopLevel ? (
                    current.children.map((group) => (
                      <button
                        key={group.category}
                        onMouseEnter={() => setHoveredNav(`settings-cat-${group.category}`)}
                        onMouseLeave={() => setHoveredNav(null)}
                        onClick={() => {
                          setSettingsSlideDir('forward');
                          setSettingsSlideKey((k) => k + 1);
                          setSettingsMenuStack((prev) => [...prev, {
                            parentLabel: group.category,
                            children: [group],
                          }]);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          padding: '9px 10px',
                          borderRadius: 6,
                          border: 'none',
                          background: hoveredNav === `settings-cat-${group.category}` ? C.hover : 'transparent',
                          color: C.textSecond,
                          fontWeight: 500,
                          fontSize: 13,
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                      >
                        <span style={{ flex: 1, textAlign: 'left' }}>{group.category}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    ))
                  ) : (
                    current.children.map((group) =>
                      group.links.map((link) => {
                        const isLinkActive = pagePath === link.path;
                        return (
                          <button
                            key={link.path}
                            onMouseEnter={() => setHoveredNav(`settings-link-${link.path}`)}
                            onMouseLeave={() => setHoveredNav(null)}
                            onClick={() => navigate(`/${lang}/dashboard/${link.path}`)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              padding: '9px 10px',
                              borderRadius: 6,
                              border: 'none',
                              background: (isLinkActive || hoveredNav === `settings-link-${link.path}`) ? C.hover : 'transparent',
                              color: isLinkActive ? C.textPrimary : C.textSecond,
                              fontWeight: isLinkActive ? 600 : 400,
                              fontSize: 13,
                              cursor: 'pointer',
                              transition: 'background 0.15s',
                              textAlign: 'left',
                            }}
                          >
                            {link.label}
                          </button>
                        );
                      })
                    )
                  )}
                </nav>
              </div>
            );
          })()}
        </aside>

        {/* ═══ SETTINGS SECONDARY SIDEBAR (hidden on small screens) ═══ */}
        {isSettingsPage && (
          <aside className="d2-sidebar-scroll d2-settings-sidebar" style={{
            width: 240,
            minWidth: 240,
            background: C.sidebar,
            borderRight: `1px solid ${C.divider}70`,
            height: '100vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 0',
          }}>
            {/* Settings header */}
            <div style={{ padding: '0 20px 20px 20px' }}>
              <h2 style={{
                fontSize: 15,
                fontWeight: 700,
                color: C.textPrimary,
                margin: 0,
                letterSpacing: '-0.01em',
              }}>
                General Settings
              </h2>
            </div>

            {/* Category groups */}
            {settingsNav.map((group) => (
              <div key={group.category} style={{ marginBottom: 16 }}>
                {/* Category header */}
                <div style={{
                  padding: '8px 20px 4px 20px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.textDim,
                  letterSpacing: '0.03em',
                }}>
                  {group.category}
                </div>

                {/* Links */}
                {group.links.map((link) => {
                  const isLinkActive = pagePath === link.path;
                  return (
                    <button
                      key={link.path}
                      onMouseEnter={() => setHoveredSettingsLink(link.path)}
                      onMouseLeave={() => setHoveredSettingsLink(null)}
                      onClick={() => navigate(`/${lang}/dashboard/${link.path}`)}
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'left',
                        padding: '7px 20px',
                        border: 'none',
                        background: (isLinkActive || hoveredSettingsLink === link.path) ? C.hover : 'transparent',
                        color: isLinkActive ? C.textPrimary : C.textSecond,
                        fontWeight: isLinkActive ? 600 : 400,
                        fontSize: 13,
                        cursor: 'pointer',
                        transition: 'background 0.15s, color 0.15s',
                        borderRadius: 0,
                      }}
                    >
                      {link.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </aside>
        )}

        {/* ═══ MAIN CONTENT ═══ */}
        <main className="d2-main-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto', height: '100vh', position: 'relative', background: C.bg }}>

          {/* Page transition spinner — centered in main content area (sidebar stays visible) */}
          {pageLoading ? (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: 28,
                height: 28,
                border: `3px solid ${C.divider}`,
                borderTopColor: C.btnBg,
                borderRadius: '50%',
                animation: 'd2-spin 0.6s linear infinite',
              }} />
            </div>
          ) : (<>

            {/* ── Page: Home (Dashboard) ── */}
            {pagePath === 'home' && (
              <>
                {/* Top header bar */}
                {/* <header style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '16px 28px 0 28px',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', color: C.textSecond }}><GridIcon /></span>
                <span style={{ fontSize: 13, color: C.textSecond, fontWeight: 500 }}>Dashboard</span>
              </header> */}

                {/* Welcome text */}
                <div style={{ padding: '24px 28px 20px 28px' }}>
                  <h1 style={{ fontSize: 24, fontWeight: 600, color: C.textPrimary, margin: 0, letterSpacing: '-0.01em' }}>
                    Home: {authUser.firstName || 'there'}!
                  </h1>
                </div>

                {/* Dashboard cards grid */}
                <div style={{ padding: '0 28px 28px 28px', flex: 1 }}>
                  {/* Row 1: 2 cards side by side */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div style={{
                      background: C.card,
                      border: `1px solid ${C.cardBorder}`,
                      borderRadius: 12,
                      height: 160,
                    }} />
                    <div style={{
                      background: C.card,
                      border: `1px solid ${C.cardBorder}`,
                      borderRadius: 12,
                      height: 160,
                    }} />
                  </div>

                  {/* Row 2: 1 full-width card */}
                  <div style={{
                    background: C.card,
                    border: `1px solid ${C.cardBorder}`,
                    borderRadius: 12,
                    height: 200,
                    marginBottom: 16,
                  }} />

                  {/* Row 3: 1 full-width card */}
                  <div style={{
                    background: C.card,
                    border: `1px solid ${C.cardBorder}`,
                    borderRadius: 12,
                    height: 160,
                  }} />
                </div>
              </>
            )}

            {/* ── Page: Account Settings ── */}
            {pagePath === 'account' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <AccountSettingsContent C={C} isLight={isLight} userEmail={authUser.email} />
              </div>
            )}

            {/* ── Page: Business Profile ── */}
            {pagePath === 'business' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <BusinessProfileContent C={C} isLight={isLight} />
              </div>
            )}

            {/* ── Settings sub-pages ── */}
            {pagePath === 'settings/timezone' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsTimezoneContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/currency' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsCurrencyContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/multi-tab' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsMultiTabContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/theme' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsThemeContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/display-preferences' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsDisplayPreferencesContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/notifications-actions' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsNotificationsActionsContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/invoice' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsInvoiceContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/subscription' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsSubscriptionContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/payment-gateway' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsPaymentGatewayContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/two-factor' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsTwoFactorContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/encryption' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsEncryptionContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/role' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsRoleContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/team' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsTeamContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/third-party' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsThirdPartyContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/api-access' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsApiAccessContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/email-inapp' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsEmailInappContent C={C} isLight={isLight} />
              </div>
            )}
            {pagePath === 'settings/custom-alerts' && (
              <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                <SettingsCustomAlertsContent C={C} isLight={isLight} />
              </div>
            )}

          </>)}
        </main>
      </div>

      {/* ═══ WORKSPACE SLIDE PANEL ═══ */}
      <SlidePanel open={showWorkspace} onClose={() => setShowWorkspace(false)} width={470}>
        <div style={{
          background: C.card,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header — X button left, Earn rewards right */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '20px 20px 16px 20px',
          }}>
            <button onClick={() => setShowWorkspace(false)} style={{
              background: isLight ? '#f0f0f0' : '#2a2a2a',
              border: 'none',
              borderRadius: 8,
              color: isLight ? '#000000' : '#ffffff',
              cursor: 'pointer',
              fontSize: 16,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              lineHeight: 1,
              transition: 'background 0.15s',
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 15px',
              background: C.hover,
              border: 'none',
              borderRadius: 8,
              color: C.textPrimary,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="8" width="18" height="13" rx="2" /><path d="M12 8V5a3 3 0 00-3-3h0a3 3 0 00-3 3v0" /><path d="M18 8V5a3 3 0 00-3-3h0a3 3 0 00-3 3v0" /><line x1="12" y1="8" x2="12" y2="21" /><path d="M3 12h18" />
              </svg>
              Earn rewards
            </button>
          </div>

          {/* Owner name + role */}
          <div style={{ padding: '10px 30px 12px 30px' }}>
            <div style={{ fontSize: 16, color: C.textPrimary, fontWeight: 700 }}>{authUser.firstName} {authUser.lastName}</div>
            <div style={{ fontSize: 13, color: C.textSecond, fontWeight: 400, marginTop: 2 }}>Owner</div>
          </div>

          {/* Menu items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              'Account settings',
              'Feature log',
              'Roadmap',
              'Cookie preferences',
              'Community',
              'Order hardware',
            ].map((item, i, arr) => (
              <div key={item}>
                <button
                  onMouseEnter={() => setHoveredPanel(item)}
                  onMouseLeave={() => setHoveredPanel(null)}
                  onClick={() => {
                    if (item === 'Account settings') {
                      setShowWorkspace(false);
                      navigate(`/${lang}/dashboard/account`);
                    }
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 10px',
                    background: hoveredPanel === item ? C.hover : 'none',
                    border: 'none',
                    borderRadius: 0,
                    color: C.textPrimary,
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {item}
                </button>
                {i < arr.length - 1 && (
                  <div style={{ height: '0.5px', background: C.divider }} />
                )}
              </div>
            ))}

            {/* Divider before Theme */}
            <div style={{ height: '0.5px', background: C.divider }} />

            {/* Theme row */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 10px',
            }}>
              <span style={{ color: C.textPrimary, fontSize: 15, fontWeight: 500 }}>Theme</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                background: theme === 'dark' ? C.bg : '#e8e8e8',
                borderRadius: 20,
                padding: 3,
                gap: 2,
              }}>
                {/* Moon — Dark */}
                <button
                  onClick={() => {
                    if (theme !== 'dark') {
                      localStorage.setItem('d2_theme', 'dark');
                      setSwitching(true);
                      setTimeout(() => window.location.reload(), 400);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: 'none',
                    background: theme === 'dark' ? C.hover : 'transparent',
                    color: theme === 'dark' ? C.textPrimary : C.textSecond,
                    cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                </button>
                {/* Sun — Light */}
                <button
                  onClick={() => {
                    if (theme !== 'light') {
                      localStorage.setItem('d2_theme', 'light');
                      setSwitching(true);
                      setTimeout(() => window.location.reload(), 400);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    border: 'none',
                    background: theme === 'light' ? '#ffffff' : 'transparent',
                    color: theme === 'light' ? C.textPrimary : C.textSecond,
                    cursor: 'pointer',
                    transition: 'background 0.15s, color 0.15s',
                    boxShadow: theme === 'light' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Divider before Sign out */}
            <div style={{ height: '0.5px', background: C.divider }} />

            {/* Sign out */}
            <div>
              <button
                onMouseEnter={() => setHoveredPanel('Sign out')}
                onMouseLeave={() => setHoveredPanel(null)}
                onClick={performLogout}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '12px 10px',
                  background: hoveredPanel === 'Sign out' ? C.hover : 'none',
                  border: 'none',
                  borderRadius: 0,
                  color: '#ef4444',
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </SlidePanel>

      {/* ═══ SESSION WARNING MODAL ═══ */}
      <Modal open={session.phase === 'warning'} width={420}>
        <div style={{
          background: C.card,
          borderRadius: 16,
          border: `1px solid ${C.cardBorder}`,
          padding: '32px',
          textAlign: 'center',
          width: '100%',
        }}>
          {/* Clock icon */}
          <div style={{ marginBottom: 16 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.textSecond} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 8px 0' }}>
            Session expiring soon
          </h2>
          <p style={{ fontSize: 15, color: C.textSecond, lineHeight: 1.5, margin: '0 0 8px 0' }}>
            Your session will expire in
          </p>

          {/* Countdown display */}
          <div style={{
            fontSize: 36,
            fontWeight: 700,
            color: session.secondsLeft <= 10 ? '#ef4444' : C.textPrimary,
            fontVariantNumeric: 'tabular-nums',
            margin: '8px 0 24px 0',
            transition: 'color 0.3s',
          }}>
            {Math.floor(session.secondsLeft / 60)}:{String(session.secondsLeft % 60).padStart(2, '0')}
          </div>

          {/* Continue button (primary action) */}
          <button
            onClick={session.continueSession}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 28,
              border: 'none',
              background: isLight ? '#1a1a1a' : '#ffffff',
              color: isLight ? '#ffffff' : '#000000',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: 16,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Continue Session
          </button>

          {/* Extension time options (pill buttons) */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            {[
              { label: '+5 min', ms: 5 * 60_000 },
              { label: '+15 min', ms: 15 * 60_000 },
              { label: '+30 min', ms: 30 * 60_000 },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => session.extendSession(opt.ms)}
                onMouseEnter={() => setHoveredExtend(opt.label)}
                onMouseLeave={() => setHoveredExtend(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: 20,
                  border: `1px solid ${C.cardBorder}`,
                  background: hoveredExtend === opt.label ? C.hover : 'transparent',
                  color: C.textPrimary,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Sign out (secondary/text action) */}
          <button
            onClick={performLogout}
            style={{
              background: 'none',
              border: 'none',
              color: C.textSecond,
              fontSize: 14,
              cursor: 'pointer',
              padding: '4px 0',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
          >
            Sign out now
          </button>
        </div>
      </Modal>

      {/* ═══ SESSION EXPIRED MODAL ═══ */}
      <Modal
        open={session.phase === 'expired'}
        onClose={() => {
          session.continueSession();
          navigate(`/${lang}/dashboard`);
        }}
        width={420}
      >
        <div style={{
          background: C.card,
          borderRadius: 16,
          border: `1px solid ${C.cardBorder}`,
          padding: '32px',
          textAlign: 'center',
          width: '100%',
          position: 'relative',
        }}>
          {/* X button top-left */}
          <button
            onClick={() => {
              session.continueSession();
              navigate(`/${lang}/dashboard`);
            }}
            style={{
              position: 'absolute',
              top: 16,
              left: 16,
              background: 'none',
              border: `1.5px solid ${C.divider}`,
              borderRadius: '50%',
              color: C.textPrimary,
              cursor: 'pointer',
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              transition: 'background 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = C.hover)}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Lock icon */}
          <div style={{ marginBottom: 16, marginTop: 8 }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.textSecond} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
          </div>

          <h2 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 8px 0' }}>
            Session timeout
          </h2>
          <p style={{ fontSize: 15, color: C.textSecond, lineHeight: 1.5, margin: '0 0 24px 0' }}>
            You have been signed out due to inactivity. Please sign in again.
          </p>

          {/* Sign In button */}
          <button
            onClick={performLogout}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 28,
              border: 'none',
              background: isLight ? '#1a1a1a' : '#ffffff',
              color: isLight ? '#ffffff' : '#000000',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Sign In
          </button>
        </div>
      </Modal>

      {/* ═══ LANGUAGE SLIDE PANEL ═══ */}
      <SlidePanel open={showLangPanel} onClose={() => setShowLangPanel(false)} width={420}>
        <div style={{
          background: C.card,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
          {/* Header — X button left, title center */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '20px 20px 16px 20px',
            gap: 12,
          }}>
            <button onClick={() => setShowLangPanel(false)} style={{
              background: isLight ? '#f0f0f0' : '#2a2a2a',
              border: 'none',
              borderRadius: 8,
              color: isLight ? '#000000' : '#ffffff',
              cursor: 'pointer',
              fontSize: 16,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              lineHeight: 1,
              transition: 'background 0.15s',
              flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>Language</span>
          </div>

          {/* Language options */}
          <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {([
              { value: 'en' as const, label: 'English', nativeLabel: 'English', flag: '🇺🇸' },
              { value: 'ar' as const, label: 'العربية', nativeLabel: 'Arabic', flag: '🇸🇦' },
            ]).map((option) => {
              const isSelected = selectedLang === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedLang(option.value)}
                  onMouseEnter={() => setHoveredPanel(`lang-${option.value}`)}
                  onMouseLeave={() => setHoveredPanel(null)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    width: '100%',
                    padding: '14px 16px',
                    borderRadius: 12,
                    border: `1.5px solid ${isSelected ? C.accent : C.cardBorder}`,
                    background: isSelected
                      ? (isLight ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.10)')
                      : hoveredPanel === `lang-${option.value}` ? C.hover : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                  }}
                >
                  {/* Flag */}
                  <span style={{ fontSize: 24 }}>{option.flag}</span>

                  {/* Label */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary }}>{option.label}</div>
                    <div style={{ fontSize: 12, color: C.textSecond, marginTop: 2 }}>{option.nativeLabel}</div>
                  </div>

                  {/* Radio indicator */}
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    border: `2px solid ${isSelected ? C.accent : C.cardBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'border-color 0.15s',
                  }}>
                    {isSelected && (
                      <div style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        background: C.accent,
                      }} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Save button at bottom */}
          <div style={{ padding: '20px', flexShrink: 0 }}>
            <button
              onClick={() => {
                if (selectedLang !== lang) {
                  setShowLangPanel(false);
                  // Show overlay FIRST to cover page, then switch lang
                  setLangOverlay(true);
                  setTimeout(() => {
                    setLang(selectedLang as 'en' | 'ar');
                    // Hide overlay after re-render settles
                    setTimeout(() => setLangOverlay(false), 500);
                  }, 50);
                } else {
                  setShowLangPanel(false);
                }
              }}
              style={{
                width: '100%',
                padding: '14px 0',
                borderRadius: 28,
                border: 'none',
                background: isLight ? '#1a1a1a' : '#ffffff',
                color: isLight ? '#ffffff' : '#000000',
                fontSize: 15,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              {selectedLang === lang ? 'Done' : 'Save & Apply'}
            </button>
          </div>
        </div>
      </SlidePanel>

    </>
  );
}
