import { useState, useEffect, useCallback, useRef } from 'react';
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
  textLight: '#757575ff',
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
  textLight: '#9c9c9cff',
  accent: '#3b82f6',
  btnBg: '#2993f0',
  btnBorder: '#d4d4d4',
};

// ── Read saved preferences (before render) ─────────────────────
const savedTheme = (typeof localStorage !== 'undefined' && localStorage.getItem('d2_theme')) || 'light';
const savedAccent = (typeof localStorage !== 'undefined' && localStorage.getItem('d2_accent')) || '#3b82f6';
const savedDarkSidebar = typeof localStorage !== 'undefined' && localStorage.getItem('d2_dark_sidebar') === 'true';
const savedShowHeader = typeof localStorage !== 'undefined' ? localStorage.getItem('d2_show_header') !== 'false' : true;
const C0 = { ...(savedTheme === 'light' ? lightTheme : darkTheme), accent: savedAccent, btnBg: savedAccent === '#000000' ? '#2993f0' : savedAccent };
// C0 is the initial theme; inside the component, `C` is shadowed with live-preview values
// eslint-disable-next-line prefer-const
let C = C0;

// ── Read user data from auth session ────────────────────────────
const STORAGE_KEY = 'berhot_auth';
const APP_PORT = 3002;
const API_URL = 'http://localhost:8080';
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

function capitalize(s: string): string {
  if (!s) return s;
  return s.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
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

// ── Nav items config (use tKey for i18n resolution inside component) ──
const navTopConfig: { tKey: string; icon: React.ReactNode; shortcut?: string }[] = [
  { tKey: 'dashboard.search', icon: <SearchIcon />, shortcut: '/' },
];

const navMainConfig: { tKey: string; icon: React.ReactNode; path: string }[] = [
  { tKey: 'dashboard.home', icon: <GridIcon />, path: 'home' },
  { tKey: 'dashboard.analytics', icon: <AnalyticsIcon />, path: 'analytics' },
  { tKey: 'dashboard.products', icon: <ProductsIcon />, path: 'products' },
  { tKey: 'dashboard.orders', icon: <OrdersIcon />, path: 'orders' },
  { tKey: 'dashboard.discounts', icon: <DiscountsIcon />, path: 'discounts' },
  { tKey: 'dashboard.apps', icon: <AppsIcon />, path: 'apps' },
];

// ── Settings sidebar navigation config ───────────────────────────
const settingsNavConfig: { categoryKey: string; links: { tKey: string; path: string }[] }[] = [
  {
    categoryKey: 'settingsNav.general',
    links: [
      { tKey: 'settingsNav.timezone', path: 'settings/timezone' },
      { tKey: 'settingsNav.currency', path: 'settings/currency' },
      { tKey: 'settingsNav.multiTab', path: 'settings/multi-tab' },
      { tKey: 'settingsNav.themeSettings', path: 'settings/theme' },
    ],
  },
  {
    categoryKey: 'settingsNav.schedules',
    links: [
      { tKey: 'settingsNav.displayPreferences', path: 'settings/display-preferences' },
      { tKey: 'settingsNav.notificationsActions', path: 'settings/notifications-actions' },
    ],
  },
  {
    categoryKey: 'settingsNav.billingPayment',
    links: [
      { tKey: 'settingsNav.invoice', path: 'settings/invoice' },
      { tKey: 'settingsNav.subscriptionManagement', path: 'settings/subscription' },
      { tKey: 'settingsNav.paymentGateway', path: 'settings/payment-gateway' },
    ],
  },
  {
    categoryKey: 'settingsNav.privacySecurity',
    links: [
      { tKey: 'settingsNav.twoFactor', path: 'settings/two-factor' },
      { tKey: 'settingsNav.dataEncryption', path: 'settings/encryption' },
    ],
  },
  {
    categoryKey: 'settingsNav.userPermissions',
    links: [
      { tKey: 'settingsNav.role', path: 'settings/role' },
      { tKey: 'settingsNav.team', path: 'settings/team' },
    ],
  },
  {
    categoryKey: 'settingsNav.integrations',
    links: [
      { tKey: 'settingsNav.thirdParty', path: 'settings/third-party' },
      { tKey: 'settingsNav.apiAccess', path: 'settings/api-access' },
    ],
  },
  {
    categoryKey: 'settingsNav.notification',
    links: [
      { tKey: 'settingsNav.emailInapp', path: 'settings/email-inapp' },
      { tKey: 'settingsNav.customAlerts', path: 'settings/custom-alerts' },
    ],
  },
];

// ── Main component ──────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { lang: i18nLang, setLang, t } = useTranslation();
  const lang = i18nLang || window.location.pathname.split('/')[1] || 'en';

  // Resolve nav labels with i18n
  const navTop = navTopConfig.map(n => ({ ...n, label: t(n.tKey) }));
  const navMain = navMainConfig.map(n => ({ ...n, label: t(n.tKey) }));
  const settingsNav = settingsNavConfig.map(g => ({
    category: t(g.categoryKey),
    links: g.links.map(l => ({ ...l, label: t(l.tKey) })),
  }));
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [hoveredPanel, setHoveredPanel] = useState<string | null>(null);
  // Settings sub-menu stack for sidebar navigation
  const [settingsMenuStack, setSettingsMenuStack] = useState<{ parentLabel: string; children: typeof settingsNav; isTopLevel?: boolean }[]>([]);
  const [settingsSlideDir, setSettingsSlideDir] = useState<'forward' | 'back' | ''>('');
  const [settingsSlideKey, setSettingsSlideKey] = useState(0);
  const [settingsClosing, setSettingsClosing] = useState(false);
  const [navReturning, setNavReturning] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(() => typeof window !== 'undefined' && window.innerWidth > 1366);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMenuClosing, setMobileMenuClosing] = useState(false);
  const [hoveredMobileNav, setHoveredMobileNav] = useState<string | null>(null);
  const [mobileSettingsStack, setMobileSettingsStack] = useState<{ parentLabel: string; children: typeof settingsNavConfig; isTopLevel?: boolean }[]>([]);
  const [mobileSettingsSlideDir, setMobileSettingsSlideDir] = useState<'forward' | 'back' | ''>('');
  const [mobileSettingsSlideKey, setMobileSettingsSlideKey] = useState(0);
  const [mobileSettingsClosing, setMobileSettingsClosing] = useState(false);
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
  const [sidebarLogoUrl, setSidebarLogoUrl] = useState('');
  const [sidebarBusinessName, setSidebarBusinessName] = useState('');
  const [sidebarLogoShape, setSidebarLogoShape] = useState<'square' | 'circle' | 'rectangle'>('square');
  const [sidebarShowName, setSidebarShowName] = useState(true);
  const [sidebarLoaded, setSidebarLoaded] = useState(false);
  const [sidebarLogoImg, setSidebarLogoImg] = useState(() => {
    try { return localStorage.getItem('berhot_sidebar_logo') || ''; } catch { return ''; }
  });
  // Page transition: displayedPath holds the path currently rendered.
  // When URL changes, we show spinner, then update displayedPath after delay.
  const [displayedPath, setDisplayedPath] = useState(location.pathname);
  const pageLoading = displayedPath !== location.pathname;

  // ── Theme live-preview state ──────────────────────────────────
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark' | null>(null);
  const [previewAccent, setPreviewAccent] = useState<string | null>(null);
  const [previewDarkSidebar, setPreviewDarkSidebar] = useState<boolean | null>(null);
  const [previewShowHeader, setPreviewShowHeader] = useState<boolean | null>(null);
  // Saved values as component state (so we can re-read after save without reload)
  const [currentTheme, setCurrentTheme] = useState(savedTheme);
  const [currentAccent, setCurrentAccent] = useState(savedAccent);
  const [currentDarkSidebar, setCurrentDarkSidebar] = useState(savedDarkSidebar);
  const [currentShowHeader, setCurrentShowHeader] = useState(savedShowHeader);

  // ── Effective (preview ?? saved) values ────────────────────────
  const isLight = previewTheme ? previewTheme === 'light' : currentTheme === 'light';
  const effectiveAccent = previewAccent ?? currentAccent;
  const effectiveDarkSidebar = previewDarkSidebar ?? currentDarkSidebar;
  const effectiveShowHeader = previewShowHeader ?? currentShowHeader;
  const C = { ...(isLight ? lightTheme : darkTheme), accent: effectiveAccent, btnBg: effectiveAccent === '#000000' ? '#2993f0' : effectiveAccent };
  // Sidebar colors: dark sidebar in light mode uses dark theme colors
  const SC = (effectiveDarkSidebar && isLight)
    ? { ...darkTheme, accent: effectiveAccent, btnBg: C.btnBg }
    : C;
  // When accent is black on a dark background, use visible fallback (gray) instead of invisible black
  const sidebarIsDark = !isLight || effectiveDarkSidebar;
  const accentVisible = (effectiveAccent === '#000000' && sidebarIsDark) ? SC.textSecond : SC.accent;
  const accentVisibleMain = (effectiveAccent === '#000000' && !isLight) ? C.textSecond : C.accent;

  // ── Live clock (for home page) ─────────────────────────────────
  const userTimezone = (typeof localStorage !== 'undefined' && localStorage.getItem('d2_timezone')) || 'Asia/Riyadh';
  const [clockNow, setClockNow] = useState(() => new Date());
  const clockRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    clockRef.current = setInterval(() => setClockNow(new Date()), 1000);
    return () => { if (clockRef.current) clearInterval(clockRef.current); };
  }, []);
  const clockLocale = lang === 'ar' ? 'ar-SA' : 'en-US';
  const clockTime = clockNow.toLocaleTimeString(clockLocale, { timeZone: userTimezone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const clockDate = clockNow.toLocaleDateString(clockLocale, { timeZone: userTimezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const clockTzLabel = userTimezone === 'UTC' ? 'UTC' : 'Riyadh (UTC+3)';

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

  // Fetch tenant logo for sidebar (with token refresh on 401)
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return;
        let parsed = JSON.parse(stored);
        let token = parsed.accessToken;
        if (!token) return;

        let res = await fetch(`${API_URL}/api/v1/tenants/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // If token expired, try refreshing
        if (res.status === 401 && parsed.refreshToken) {
          try {
            const refreshRes = await fetch(`${API_URL}/api/v1/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: parsed.refreshToken }),
            });
            if (refreshRes.ok) {
              const refreshData = await refreshRes.json();
              if (refreshData.accessToken) {
                parsed.accessToken = refreshData.accessToken;
                if (refreshData.refreshToken) parsed.refreshToken = refreshData.refreshToken;
                localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
                token = refreshData.accessToken;
                res = await fetch(`${API_URL}/api/v1/tenants/me`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
              }
            }
          } catch { /* ignore refresh error */ }
        }

        if (!res.ok) { setSidebarLoaded(true); return; }
        const data = await res.json();
        if (data.logoUrl) setSidebarLogoUrl(data.logoUrl);
        if (data.name) setSidebarBusinessName(data.name);
        if (data.logoShape) setSidebarLogoShape(data.logoShape);
        if (typeof data.showBusinessName === 'boolean') setSidebarShowName(data.showBusinessName);
        setSidebarLoaded(true);
      } catch { setSidebarLoaded(true); }
    };
    fetchLogo();
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

  // Track screen size for settings sidebar behavior + mobile
  useEffect(() => {
    const onResize = () => {
      setIsLargeScreen(window.innerWidth > 1366);
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close mobile menu with animation
  const closeMobileMenu = useCallback(() => {
    setMobileMenuClosing(true);
    setTimeout(() => {
      setMobileMenuOpen(false);
      setMobileMenuClosing(false);
      setMobileSettingsStack([]);
      setMobileSettingsSlideDir('');
      setMobileSettingsClosing(false);
    }, 180);
  }, []);

  // Auto-open settings submenu on page load if on a settings page (small screens only)
  useEffect(() => {
    if (isSettingsPage && settingsMenuStack.length === 0 && !settingsClosing) {
      // Find which category the current page belongs to
      const currentGroup = settingsNav.find((g) => g.links.some((l) => pagePath === l.path));
      if (currentGroup) {
        setSettingsMenuStack([
          { parentLabel: t('dashboard.settings'), children: settingsNav, isTopLevel: true },
          { parentLabel: currentGroup.category, children: [currentGroup] },
        ]);
      } else {
        setSettingsMenuStack([{ parentLabel: t('dashboard.settings'), children: settingsNav, isTopLevel: true }]);
      }
    }
    // Close submenu when navigating away from settings or on large screen
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
      @keyframes d2-page-in { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
      .d2-page-in { animation: d2-page-in 0.35s ease-out forwards; }
      @keyframes d2-slide-forward { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes d2-slide-back { from { transform: translateX(-40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes d2-slide-out { from { transform: translateX(0); opacity: 1; } to { transform: translateX(40px); opacity: 0; } }
      @keyframes d2-slide-forward-rtl { from { transform: translateX(-40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes d2-slide-back-rtl { from { transform: translateX(40px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes d2-slide-out-rtl { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-40px); opacity: 0; } }
      .d2-slide-forward { animation: d2-slide-forward 0.18s ease-out forwards; }
      .d2-slide-back { animation: d2-slide-back 0.18s ease-out forwards; }
      .d2-slide-out { animation: d2-slide-out 0.08s ease-out forwards; }
      [dir="rtl"] .d2-slide-forward { animation: d2-slide-forward-rtl 0.18s ease-out forwards; }
      [dir="rtl"] .d2-slide-back { animation: d2-slide-back-rtl 0.18s ease-out forwards; }
      [dir="rtl"] .d2-slide-out { animation: d2-slide-out-rtl 0.08s ease-out forwards; }
[dir="rtl"] .d2-arrow { transform: scaleX(-1); }
      @keyframes d2-mobile-menu-in { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes d2-mobile-menu-out { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(30px); } }
      .d2-mobile-menu { animation: d2-mobile-menu-in 0.22s ease-out forwards; }
      .d2-mobile-menu-closing { animation: d2-mobile-menu-out 0.18s ease-in forwards; }
      @keyframes d2-overlay-in { from { opacity: 0; } to { opacity: 1; } }
      @keyframes d2-overlay-out { from { opacity: 1; } to { opacity: 0; } }
      .d2-mobile-overlay { animation: d2-overlay-in 0.2s ease forwards; }
      .d2-mobile-overlay-closing { animation: d2-overlay-out 0.18s ease forwards; }
      @media (max-width: 768px) {
        .d2-left-sidebar { display: none !important; }
      }
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

      <div style={{ background: C.bg, color: C.textPrimary, height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', overflow: 'hidden' }}>

        {/* ═══ TOP HEADER BAR (full width above sidebar + content) ═══ */}
        {effectiveShowHeader && !isMobile && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px', height: 48, flexShrink: 0,
            borderBottom: `1px solid ${SC.divider}70`,
            background: SC.sidebar,
          }}>
            {/* Left side: Logo + Business Name + S badge + Page title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {/* Logo + Business name */}
              <button onClick={() => navigate(`/${lang}/dashboard/business`)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: SC.textPrimary }}>
                {(sidebarLogoImg || sidebarLogoUrl) ? (
                  <img
                    src={sidebarLogoImg || (sidebarLogoUrl.startsWith('http') ? sidebarLogoUrl : `${API_URL}${sidebarLogoUrl}`)}
                    alt="Logo"
                    style={{
                      width: sidebarLogoShape === 'rectangle' ? (sidebarShowName ? 28 : 40) : 24,
                      height: 24,
                      objectFit: sidebarLogoShape === 'rectangle' && !sidebarShowName ? 'contain' : 'cover',
                      borderRadius: sidebarLogoShape === 'circle' ? '50%' : 4,
                      flexShrink: 0,
                    }}
                  />
                ) : sidebarLoaded ? (
                  <svg width="24" height="24" viewBox="0 0 89 90" fill={SC.sidebar === darkTheme.sidebar || !isLight || effectiveDarkSidebar ? '#ffffff' : '#1a1a1a'}>
                    <g transform="translate(44.165915, 45) scale(1, -1) translate(-44.165915, -45)">
                      <path fillRule="evenodd" d="M69.4192817,22.3611759 C84.2018365,38.081155 88.9828304,59.9401927 88.2622633,84.5632889 C88.1716123,87.6612948 88.2857175,89.4063644 86.470282,89.745827 C84.6548465,90.0852896 45.9204196,90.0841586 43.3635271,89.745827 C41.6589322,89.5202726 40.9198925,87.5799361 41.146408,83.9248175 C41.4268046,70.7590337 39.2744178,62.4474368 33.0811154,56.4790232 C26.8653713,50.4889828 18.8085697,48.4191258 5.53927832,47.9184709 C-0.26992001,47.6992879 0.04198992,45.2973641 0.04198992,42.2339225 L0.0419899201,5.68774353 C0.0419925178,2.64150057 -0.837693553,0 5.45564364,0.00662799493 L5.80171,0 C31.9022526,0.282039646 54.6081099,6.61076494 69.4192817,22.3611759 Z" />
                    </g>
                  </svg>
                ) : null}
                {sidebarShowName && (
                  <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '-0.02em', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textTransform: 'capitalize' }}>
                    {sidebarBusinessName || (sidebarLoaded ? 'Berhot' : '')}
                  </span>
                )}
              </button>

              {/* Divider */}
              <div style={{ width: 1, height: 20, background: SC.divider, opacity: 0.5, flexShrink: 0 }} />

              {/* Accent "S" badge (medium rounded) — hidden for now, will use later */}
              {/* <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: effectiveAccent === '#000000' && sidebarIsDark ? '#e5e7eb' : effectiveAccent,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: effectiveAccent === '#000000' && sidebarIsDark ? '#000000' : '#ffffff' }}>S</span>
              </div> */}

              {/* Page title (breadcrumb for settings) */}
              <span style={{ fontSize: 13, fontWeight: 600, color: SC.textSecond, display: 'flex', alignItems: 'center', gap: 0 }}>
                {(() => {
                  const found = navMainConfig.find(n => n.path === pagePath);
                  if (found) return t(found.tKey);
                  if (pagePath === 'account') return t('dashboard.account');
                  if (pagePath === 'business') return t('dashboard.business');
                  if (pagePath.startsWith('settings')) {
                    // Build breadcrumb: Settings / Category / Page
                    const parts: string[] = [t('dashboard.settings')];
                    const group = settingsNavConfig.find(g => g.links.some(l => l.path === pagePath));
                    if (group) {
                      parts.push(t(group.categoryKey));
                      const link = group.links.find(l => l.path === pagePath);
                      if (link) parts.push(t(link.tKey));
                    }
                    return parts.map((p, i) => (
                      <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                        {i > 0 && <span style={{ margin: '0 6px', opacity: 0.4, fontWeight: 400 }}>/</span>}
                        <span style={{ opacity: i < parts.length - 1 ? 0.6 : 1 }}>{p}</span>
                      </span>
                    ));
                  }
                  return t('dashboard.home');
                })()}
              </span>
            </div>

            {/* Right side: Search + Notification icons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 6, border: 'none', background: 'transparent', color: SC.textSecond, cursor: 'pointer' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              </button>
              <button style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 34, height: 34, borderRadius: 6, border: 'none', background: 'transparent', color: SC.textSecond, cursor: 'pointer' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* ═══ SIDEBAR + CONTENT ROW ═══ */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* ═══ LEFT SIDEBAR ═══ */}
          <aside className="d2-left-sidebar" style={{
            width: 280,
            minWidth: 260,
            background: SC.sidebar,
            display: 'flex',
            flexDirection: 'column',
            borderInlineEnd: `1px solid ${SC.divider}70`,
            height: '100%',
            overflow: 'hidden',
            position: 'relative',
          }}>

            {/* Sidebar header — back arrow when in settings, OR logo + brand */}
            {(settingsMenuStack.length > 0 || settingsClosing) ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px 10px 20px', height: 57, boxSizing: 'border-box' as const }}>
                  <button
                    onClick={() => {
                      if (settingsMenuStack.length <= 1) {
                        setSettingsClosing(true);
                        setSettingsSlideDir('back');
                        setSettingsSlideKey((k) => k + 1);
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
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: 'none',
                      background: hoveredNav === 'settings-back' ? SC.hover : 'transparent',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      padding: 0,
                      flexShrink: 0,
                    }}
                  >
                    <svg className="d2-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={SC.textSecond} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <span style={{ fontWeight: 500, fontSize: 13, color: SC.textPrimary }}>
                    {settingsMenuStack.length > 0 ? settingsMenuStack[settingsMenuStack.length - 1].parentLabel : t('dashboard.settings')}
                  </span>
                </div>
                <div style={{ height: 1, background: SC.divider, opacity: 0.4, margin: '0 16px 4px 16px' }} />
              </>
            ) : effectiveShowHeader && !isMobile ? null : (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 16px 10px 20px',
                  height: 57,
                  boxSizing: 'border-box' as const,
                  flexShrink: 0,
                }}>
                  <button onClick={() => setShowWorkspace(true)} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    color: SC.textPrimary,
                    flex: 1,
                    minWidth: 0,
                  }}>
                    {(sidebarLogoImg || sidebarLogoUrl) ? (
                      <img
                        src={sidebarLogoImg || (sidebarLogoUrl.startsWith('http') ? sidebarLogoUrl : `${API_URL}${sidebarLogoUrl}`)}
                        alt="Logo"
                        style={{
                          width: sidebarLogoShape === 'rectangle' ? (sidebarShowName ? 48 : 70) : 33,
                          height: 33,
                          objectFit: sidebarLogoShape === 'rectangle' && !sidebarShowName ? 'contain' : 'cover',
                          borderRadius: sidebarLogoShape === 'circle' ? '50%' : 5,
                          flexShrink: 0,
                        }}
                      />
                    ) : sidebarLoaded ? (
                      <svg width="33" height="33" viewBox="0 0 89 90" fill={SC.sidebar === darkTheme.sidebar || !isLight || effectiveDarkSidebar ? '#ffffff' : '#1a1a1a'}>
                        <g transform="translate(44.165915, 45) scale(1, -1) translate(-44.165915, -45)">
                          <path fillRule="evenodd" d="M69.4192817,22.3611759 C84.2018365,38.081155 88.9828304,59.9401927 88.2622633,84.5632889 C88.1716123,87.6612948 88.2857175,89.4063644 86.470282,89.745827 C84.6548465,90.0852896 45.9204196,90.0841586 43.3635271,89.745827 C41.6589322,89.5202726 40.9198925,87.5799361 41.146408,83.9248175 C41.4268046,70.7590337 39.2744178,62.4474368 33.0811154,56.4790232 C26.8653713,50.4889828 18.8085697,48.4191258 5.53927832,47.9184709 C-0.26992001,47.6992879 0.04198992,45.2973641 0.04198992,42.2339225 L0.0419899201,5.68774353 C0.0419925178,2.64150057 -0.837693553,0 5.45564364,0.00662799493 L5.80171,0 C31.9022526,0.282039646 54.6081099,6.61076494 69.4192817,22.3611759 Z" />
                        </g>
                      </svg>
                    ) : null}
                    {sidebarShowName && (
                      <span style={{
                        fontWeight: 700,
                        fontSize: 15,
                        letterSpacing: '-0.02em',
                        maxWidth: 140,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textTransform: 'capitalize',
                      }}>
                        {sidebarBusinessName || (sidebarLoaded ? 'Berhot' : '')}
                      </span>
                    )}
                  </button>
                  {/* Chevron icon on the right */}
                  <button
                    onMouseEnter={() => setHoveredNav('sidebar-header-chevron')}
                    onMouseLeave={() => setHoveredNav(null)}
                    onClick={() => setShowWorkspace(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 28,
                      height: 28,
                      borderRadius: 6,
                      border: 'none',
                      background: hoveredNav === 'sidebar-header-chevron' ? SC.hover : 'transparent',
                      color: SC.textDim,
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                      padding: 0,
                      flexShrink: 0,
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 15l5 5 5-5" /><path d="M7 9l5-5 5 5" />
                    </svg>
                  </button>
                </div>
                <div style={{ height: 1, background: SC.divider, opacity: 0.4, margin: '0 16px 4px 16px' }} />
              </>
            )}

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
                <span style={{ flex: 1, textAlign: 'start' }}>{item.label}</span>
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


            {/* Main nav / Settings nav — only the links area transitions */}
            <nav className="d2-sidebar-scroll" style={{
              display: 'flex',
              flexDirection: 'column', gap: 2, padding: '10px 16px 12px 16px',
              flex: 1,
              overflowY: 'auto',
              minHeight: 0,
            }}>
              {settingsMenuStack.length > 0 ? (() => {
                const current = settingsMenuStack[settingsMenuStack.length - 1];
                const isTopLevel = current.isTopLevel === true;
                return (
                  <div
                    key={settingsSlideKey}
                    className={settingsClosing ? 'd2-slide-out' : settingsSlideDir === 'forward' ? 'd2-slide-forward' : settingsSlideDir === 'back' ? 'd2-slide-back' : ''}
                    onAnimationEnd={() => {
                      if (settingsClosing) {
                        setSettingsClosing(false);
                        setSettingsMenuStack([]);
                        setSettingsSlideDir('');
                        setNavReturning(true);
                      } else {
                        setSettingsSlideDir('');
                      }
                    }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
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
                            background: hoveredNav === `settings-cat-${group.category}` ? SC.hover : 'transparent',
                            color: SC.textSecond,
                            fontWeight: 500,
                            fontSize: 13,
                            cursor: 'pointer',
                            transition: 'background 0.15s',
                          }}
                        >
                          <span style={{ flex: 1, textAlign: 'start' }}>{group.category}</span>
                          <svg className="d2-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
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
                                background: (isLinkActive || hoveredNav === `settings-link-${link.path}`) ? SC.hover : 'transparent',
                                color: isLinkActive ? SC.textPrimary : SC.textSecond,
                                fontWeight: isLinkActive ? 600 : 400,
                                fontSize: 13,
                                cursor: 'pointer',
                                transition: 'background 0.15s',
                                textAlign: 'start',
                              }}
                            >
                              {link.label}
                            </button>
                          );
                        })
                      )
                    )}
                  </div>
                );
              })() : (
                <div
                  className={navReturning ? 'd2-slide-back' : ''}
                  onAnimationEnd={() => setNavReturning(false)}
                  style={{ display: 'flex', flexDirection: 'column', gap: 2, ...(navReturning ? { opacity: 0 } : {}) }}
                >
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
                          background: (isActive || hoveredNav === item.label) ? SC.hover : 'transparent',
                          color: isActive ? SC.textPrimary : SC.textSecond,
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
                          color: isActive ? accentVisible : SC.textSecond,
                          transition: 'color 0.15s',
                        }}>{item.icon}</span>
                        <span style={{ flex: 1, textAlign: 'start' }}>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
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
                    setSettingsMenuStack([{ parentLabel: t('dashboard.settings'), children: settingsNav, isTopLevel: true }]);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    width: '100%',
                    padding: '9px 10px',
                    borderRadius: 6,
                    border: 'none',
                    background: (isSettingsActive || hoveredNav === 'footer-settings') ? SC.hover : 'transparent',
                    color: isSettingsActive ? SC.textPrimary : SC.textSecond,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: isSettingsActive ? 600 : 500,
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', width: 18, justifyContent: 'center', color: isSettingsActive ? accentVisible : SC.textSecond }}><SettingsIcon /></span>
                  <span style={{ flex: 1, textAlign: 'start' }}>{t('dashboard.settings')}</span>
                  <svg className="d2-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}>
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
                    background: hoveredNav === 'footer-support' ? SC.hover : 'transparent',
                    color: SC.textSecond,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 500,
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', width: 18, justifyContent: 'center' }}><SupportIcon /></span>
                  <span style={{ flex: 1, textAlign: 'start' }}>{t('dashboard.support')}</span>
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
                    {capitalize(authUser.firstName)} {capitalize(authUser.lastName)}
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
              <div style={{ height: 1, background: SC.divider, opacity: 0.4, margin: '10px 0 6px 0' }} />

              {/* Icon bar — small icons with tooltips */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
                {([
                  {
                    key: 'notif',
                    tooltip: t('dashboard.tooltipNotifications'),
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>,
                  },
                  {
                    key: 'globe',
                    tooltip: t('dashboard.tooltipLanguage'),
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>,
                  },
                  {
                    key: 'search',
                    tooltip: t('dashboard.tooltipSearch'),
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>,
                  },
                  {
                    key: 'help',
                    tooltip: t('dashboard.tooltipSupport'),
                    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>,
                  },
                  {
                    key: 'rewards',
                    tooltip: t('dashboard.tooltipRewards'),
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
                        background: hoveredNav === `icon-${item.key}` ? SC.hover : 'transparent',
                        color: SC.textSecond,
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
                          ? { insetInlineStart: 0 }
                          : { left: '50%', transform: 'translateX(-50%)' }),
                        marginBottom: 6,
                        padding: '5px 10px',
                        background: (isLight && !effectiveDarkSidebar) ? '#1a1a1a' : '#e7e7e7',
                        color: (isLight && !effectiveDarkSidebar) ? '#ffffff' : '#000000',
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

            {/* Old settings overlay removed — settings now renders inline in the nav area above */}
          </aside>

          {/* Secondary settings sidebar removed — unified into main sidebar */}

          {/* ═══ MAIN CONTENT ═══ */}
          <main className="d2-main-scroll" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto', height: '100%', position: 'relative', background: C.bg, paddingBottom: isMobile ? 56 : 0 }}>

            {/* Page transition spinner — centered in main content area (sidebar stays visible) */}
            {pageLoading ? (
              <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  width: 33,
                  height: 33,
                  border: `3px solid ${C.divider}`,
                  borderTopColor: C.btnBg,
                  borderRadius: '50%',
                  animation: 'd2-spin 0.6s linear infinite',
                }} />
              </div>
            ) : (<div key={displayedPath} className="d2-page-in" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>

              {/* ── Page: Home (Dashboard) ── */}
              {pagePath === 'home' && (
                <div style={{ maxWidth: 700, padding: '30px 30px 60px 30px' }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 8px 0' }}>
                    {t('dashboard.homeTitle')}
                  </h2>
                  <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 20px 0', lineHeight: 1.5 }}>
                    {t('dashboard.welcomeBack', { name: capitalize(authUser.firstName) || 'there' })}
                  </p>

                  {/* Live date & time */}
                  <div style={{
                    background: C.card,
                    border: `1px solid ${C.cardBorder}`,
                    borderRadius: 12,
                    padding: '20px 24px',
                    marginBottom: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                  }}>
                    {/* Clock icon */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 10,
                      background: isLight ? '#f3f4f6' : '#1d1d1d',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={C.textSecond} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 24, fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                        {clockTime}
                      </div>
                      <div style={{ fontSize: 13, color: C.textSecond, marginTop: 2 }}>
                        {clockDate}
                      </div>
                    </div>
                    {/* Timezone badge */}
                    <span style={{
                      fontSize: 11, fontWeight: 600, color: C.textDim,
                      background: isLight ? '#f3f4f6' : '#1d1d1d',
                      padding: '4px 10px', borderRadius: 6, flexShrink: 0,
                    }}>
                      {clockTzLabel}
                    </span>
                  </div>

                  {/* Dashboard cards grid */}
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

                  <div style={{
                    background: C.card,
                    border: `1px solid ${C.cardBorder}`,
                    borderRadius: 12,
                    height: 200,
                    marginBottom: 16,
                  }} />

                  <div style={{
                    background: C.card,
                    border: `1px solid ${C.cardBorder}`,
                    borderRadius: 12,
                    height: 160,
                  }} />
                </div>
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
                  <BusinessProfileContent C={C} isLight={isLight} onLogoChange={(url, croppedDataUrl) => { setSidebarLogoUrl(url); setSidebarLogoImg(croppedDataUrl || ''); }} onBusinessNameChange={(name) => setSidebarBusinessName(name)} onLogoSettingsChange={(s) => { setSidebarLogoShape(s.logoShape); setSidebarShowName(s.showBusinessName); }} />
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
                  <SettingsThemeContent C={C} isLight={isLight}
                    onThemePreview={(t) => setPreviewTheme(t)}
                    onAccentPreview={(c) => setPreviewAccent(c)}
                    onDarkSidebarPreview={(v) => setPreviewDarkSidebar(v)}
                    onShowHeaderPreview={(v) => setPreviewShowHeader(v)}
                    onSave={() => {
                      setCurrentTheme(localStorage.getItem('d2_theme') || 'light');
                      setCurrentAccent(localStorage.getItem('d2_accent') || '#3b82f6');
                      setCurrentDarkSidebar(localStorage.getItem('d2_dark_sidebar') === 'true');
                      setCurrentShowHeader(localStorage.getItem('d2_show_header') !== 'false');
                      setPreviewTheme(null);
                      setPreviewAccent(null);
                      setPreviewDarkSidebar(null);
                      setPreviewShowHeader(null);
                    }}
                  />
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

            </div>)}
          </main>

        </div>{/* close SIDEBAR + CONTENT ROW */}

        {/* ═══ MOBILE BOTTOM BAR ═══ */}
        {isMobile && (
          <div style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 52,
            background: C.sidebar,
            borderTop: `1px solid ${C.divider}70`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            zIndex: 9998,
          }}>
            {/* Hamburger + page name */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 0',
                color: C.textPrimary,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                {(() => {
                  const found = navMainConfig.find(n => n.path === pagePath);
                  if (found) return t(found.tKey);
                  if (pagePath === 'account') return t('dashboard.account');
                  if (pagePath === 'business') return t('dashboard.business');
                  if (isSettingsPage) return t('dashboard.settings');
                  return t('dashboard.home');
                })()}
              </span>
            </button>
            {/* Notification bell */}
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 6,
                color: C.textSecond,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 01-3.46 0" />
              </svg>
            </button>
          </div>
        )}

        {/* ═══ MOBILE SLIDE-OUT MENU ═══ */}
        {isMobile && mobileMenuOpen && (
          <>
            {/* Dark overlay backdrop — click to close */}
            <div
              className={mobileMenuClosing ? 'd2-mobile-overlay-closing' : 'd2-mobile-overlay'}
              onClick={closeMobileMenu}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99998,
                background: 'rgba(0,0,0,0.5)',
              }}
            />
            {/* Menu panel — anchored to bottom, auto height */}
            <div className={mobileMenuClosing ? 'd2-mobile-menu-closing' : 'd2-mobile-menu'} style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 99999,
              background: C.sidebar,
              borderTop: `1px solid ${C.divider}70`,
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '85vh',
              overflow: 'auto',
            }}>
              {/* Top bar — X/back + logo + icons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px',
                borderBottom: `1px solid ${C.divider}70`,
              }}>
                {mobileSettingsStack.length > 0 ? (
                  /* Back arrow when in settings */
                  <button
                    onMouseEnter={() => setHoveredMobileNav('mob-back')}
                    onMouseLeave={() => setHoveredMobileNav(null)}
                    onClick={() => {
                      if (mobileSettingsStack.length <= 1) {
                        setMobileSettingsClosing(true);
                        setMobileSettingsSlideDir('back');
                        setMobileSettingsSlideKey((k) => k + 1);
                      } else {
                        setMobileSettingsSlideDir('back');
                        setMobileSettingsSlideKey((k) => k + 1);
                        setMobileSettingsStack((prev) => prev.slice(0, -1));
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: C.textPrimary,
                    }}
                  >
                    <span style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: 6,
                      background: hoveredMobileNav === 'mob-back' ? C.hover : 'transparent',
                      transition: 'background 0.15s',
                    }}>
                      <svg className="d2-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textSecond} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                      </svg>
                    </span>
                    <span style={{ fontWeight: 500, fontSize: 13 }}>
                      {mobileSettingsStack[mobileSettingsStack.length - 1].parentLabel}
                    </span>
                  </button>
                ) : (
                  /* X close button */
                  <button
                    onMouseEnter={() => setHoveredMobileNav('mob-close')}
                    onMouseLeave={() => setHoveredMobileNav(null)}
                    onClick={closeMobileMenu}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      border: 'none',
                      cursor: 'pointer',
                      background: hoveredMobileNav === 'mob-close' ? C.hover : 'transparent',
                      color: C.textPrimary,
                      transition: 'background 0.15s',
                      padding: 0,
                    }}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
                {/* Logo + divider + Icon bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {/* Logo — links to business page */}
                  {mobileSettingsStack.length === 0 && (
                    <>
                      <button
                        onClick={() => { closeMobileMenu(); navigate(`/${lang}/dashboard/business`); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }}
                      >
                        {(sidebarLogoImg || sidebarLogoUrl) ? (
                          <img
                            src={sidebarLogoImg || (sidebarLogoUrl.startsWith('http') ? sidebarLogoUrl : `${API_URL}${sidebarLogoUrl}`)}
                            alt="Logo"
                            style={{
                              width: sidebarLogoShape === 'rectangle'
                                ? (sidebarShowName ? 37 : 57)
                                : 25,
                              height: 25,
                              objectFit: sidebarLogoShape === 'rectangle' && !sidebarShowName ? 'contain' : 'cover',
                              borderRadius: sidebarLogoShape === 'circle' ? '50%' : 4,
                              flexShrink: 0,
                            }}
                          />
                        ) : sidebarLoaded ? (
                          <svg width="21" height="21" viewBox="0 0 89 90" fill={isLight ? '#1a1a1a' : '#ffffff'}>
                            <g transform="translate(44.165915, 45) scale(1, -1) translate(-44.165915, -45)">
                              <path fillRule="evenodd" d="M69.4192817,22.3611759 C84.2018365,38.081155 88.9828304,59.9401927 88.2622633,84.5632889 C88.1716123,87.6612948 88.2857175,89.4063644 86.470282,89.745827 C84.6548465,90.0852896 45.9204196,90.0841586 43.3635271,89.745827 C41.6589322,89.5202726 40.9198925,87.5799361 41.146408,83.9248175 C41.4268046,70.7590337 39.2744178,62.4474368 33.0811154,56.4790232 C26.8653713,50.4889828 18.8085697,48.4191258 5.53927832,47.9184709 C-0.26992001,47.6992879 0.04198992,45.2973641 0.04198992,42.2339225 L0.0419899201,5.68774353 C0.0419925178,2.64150057 -0.837693553,0 5.45564364,0.00662799493 L5.80171,0 C31.9022526,0.282039646 54.6081099,6.61076494 69.4192817,22.3611759 Z" />
                            </g>
                          </svg>
                        ) : null}
                      </button>
                      {/* Vertical divider */}
                      <div style={{ width: 1, height: 20, background: C.divider, opacity: 0.5, flexShrink: 0, margin: '0 4px' }} />
                    </>
                  )}
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.textPrimary, opacity: 0.65 }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </button>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.textPrimary, opacity: 0.65 }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
                      <path d="M13.73 21a2 2 0 01-3.46 0" />
                    </svg>
                  </button>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.textPrimary, opacity: 0.65 }}>
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                  </button>
                  <button
                    onClick={() => { closeMobileMenu(); navigate(`/${lang}/dashboard/account`); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.textPrimary, opacity: 0.65 }}
                  >
                    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Logo is now in the top bar — no separate section needed */}

              {/* Nav items or Settings sliding panels */}
              {mobileSettingsStack.length > 0 ? (
                /* Settings multi-layer sliding menu */
                <div style={{ padding: '10px 16px 20px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {(() => {
                    const current = mobileSettingsStack[mobileSettingsStack.length - 1];
                    const isTopLevel = current.isTopLevel === true;
                    return (
                      <div
                        key={mobileSettingsSlideKey}
                        className={mobileSettingsClosing ? 'd2-slide-out' : mobileSettingsSlideDir === 'forward' ? 'd2-slide-forward' : mobileSettingsSlideDir === 'back' ? 'd2-slide-back' : ''}
                        onAnimationEnd={() => {
                          if (mobileSettingsClosing) {
                            setMobileSettingsClosing(false);
                            setMobileSettingsStack([]);
                            setMobileSettingsSlideDir('');
                          } else {
                            setMobileSettingsSlideDir('');
                          }
                        }}
                        style={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                      >
                        {isTopLevel ? (
                          current.children.map((group) => (
                            <button
                              key={group.categoryKey}
                              onMouseEnter={() => setHoveredMobileNav(`mob-cat-${group.categoryKey}`)}
                              onMouseLeave={() => setHoveredMobileNav(null)}
                              onClick={() => {
                                setMobileSettingsSlideDir('forward');
                                setMobileSettingsSlideKey((k) => k + 1);
                                setMobileSettingsStack((prev) => [...prev, {
                                  parentLabel: t(group.categoryKey),
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
                                background: hoveredMobileNav === `mob-cat-${group.categoryKey}` ? C.hover : 'transparent',
                                color: C.textSecond,
                                fontWeight: 500,
                                fontSize: 13,
                                cursor: 'pointer',
                                transition: 'background 0.15s',
                              }}
                            >
                              <span style={{ flex: 1, textAlign: 'start' }}>{t(group.categoryKey)}</span>
                              <svg className="d2-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
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
                                  onMouseEnter={() => setHoveredMobileNav(`mob-link-${link.path}`)}
                                  onMouseLeave={() => setHoveredMobileNav(null)}
                                  onClick={() => {
                                    closeMobileMenu();
                                    navigate(`/${lang}/dashboard/${link.path}`);
                                  }}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    width: '100%',
                                    padding: '9px 10px',
                                    borderRadius: 6,
                                    border: 'none',
                                    background: (isLinkActive || hoveredMobileNav === `mob-link-${link.path}`) ? C.hover : 'transparent',
                                    color: isLinkActive ? C.textPrimary : C.textSecond,
                                    fontWeight: isLinkActive ? 600 : 500,
                                    fontSize: 13,
                                    cursor: 'pointer',
                                    transition: 'background 0.15s',
                                    textAlign: 'start',
                                  }}
                                >
                                  {t(link.tKey)}
                                </button>
                              );
                            })
                          )
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                /* Main nav items */
                <div style={{ padding: '10px 16px 32px 16px', display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {navMainConfig.map((item) => {
                    const isActive = item.path === 'home'
                      ? (pagePath === 'home' || pagePath === '')
                      : pagePath === item.path;
                    return (
                      <button
                        key={item.path}
                        onMouseEnter={() => setHoveredMobileNav(item.path)}
                        onMouseLeave={() => setHoveredMobileNav(null)}
                        onClick={() => {
                          closeMobileMenu();
                          const target = item.path === 'home'
                            ? `/${lang}/dashboard`
                            : `/${lang}/dashboard/${item.path}`;
                          navigate(target);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '9px 10px',
                          borderRadius: 6,
                          border: 'none',
                          background: (isActive || hoveredMobileNav === item.path) ? C.hover : 'transparent',
                          color: isActive ? C.textPrimary : C.textSecond,
                          fontWeight: isActive ? 600 : 500,
                          fontSize: 13,
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'start',
                          transition: 'background 0.15s',
                        }}
                      >
                        <span style={{
                          display: 'flex',
                          alignItems: 'center',
                          width: 18,
                          justifyContent: 'center',
                          color: isActive ? accentVisibleMain : C.textSecond,
                          transition: 'color 0.15s',
                        }}>{item.icon}</span>
                        <span style={{ flex: 1, textAlign: 'start' }}>{t(item.tKey)}</span>
                      </button>
                    );
                  })}

                  {/* Settings — opens sliding menu */}
                  <button
                    onMouseEnter={() => setHoveredMobileNav('settings')}
                    onMouseLeave={() => setHoveredMobileNav(null)}
                    onClick={() => {
                      setMobileSettingsSlideDir('forward');
                      setMobileSettingsSlideKey((k) => k + 1);
                      setMobileSettingsStack([{ parentLabel: t('dashboard.settings'), children: settingsNavConfig, isTopLevel: true }]);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '9px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: (isSettingsPage || hoveredMobileNav === 'settings') ? C.hover : 'transparent',
                      color: isSettingsPage ? C.textPrimary : C.textSecond,
                      fontWeight: isSettingsPage ? 600 : 500,
                      fontSize: 13,
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'start',
                      transition: 'background 0.15s',
                    }}
                  >
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      width: 18,
                      justifyContent: 'center',
                      color: isSettingsPage ? accentVisibleMain : C.textSecond,
                      transition: 'color 0.15s',
                    }}><SettingsIcon /></span>
                    <span style={{ flex: 1, textAlign: 'start' }}>{t('dashboard.settings')}</span>
                  </button>
                </div>
              )}
            </div>
          </>
        )}
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
              {t('dashboard.earnRewards')}
            </button>
          </div>

          {/* Owner name + role */}
          <div style={{ padding: '10px 30px 12px 30px' }}>
            <div style={{ fontSize: 16, color: C.textPrimary, fontWeight: 700 }}>{capitalize(authUser.firstName)} {capitalize(authUser.lastName)}</div>
            <div style={{ fontSize: 13, color: C.textSecond, fontWeight: 400, marginTop: 2 }}>{t('dashboard.owner')}</div>
          </div>

          {/* Menu items */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 0 }}>
            {([
              { key: 'accountSettings', tKey: 'dashboard.accountSettings' },
              { key: 'featureLog', tKey: 'dashboard.featureLog' },
              { key: 'roadmap', tKey: 'dashboard.roadmap' },
              { key: 'cookiePreferences', tKey: 'dashboard.cookiePreferences' },
              { key: 'community', tKey: 'dashboard.community' },
              { key: 'orderHardware', tKey: 'dashboard.orderHardware' },
            ]).map((item, i, arr) => (
              <div key={item.key}>
                <button
                  onMouseEnter={() => setHoveredPanel(item.key)}
                  onMouseLeave={() => setHoveredPanel(null)}
                  onClick={() => {
                    if (item.key === 'accountSettings') {
                      setShowWorkspace(false);
                      navigate(`/${lang}/dashboard/account`);
                    }
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'start',
                    padding: '12px 10px',
                    background: hoveredPanel === item.key ? C.hover : 'none',
                    border: 'none',
                    borderRadius: 0,
                    color: C.textPrimary,
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                >
                  {t(item.tKey)}
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
              <span style={{ color: C.textPrimary, fontSize: 15, fontWeight: 500 }}>{t('dashboard.theme')}</span>
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
                onMouseEnter={() => setHoveredPanel('signout')}
                onMouseLeave={() => setHoveredPanel(null)}
                onClick={performLogout}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'start',
                  padding: '12px 10px',
                  background: hoveredPanel === 'signout' ? C.hover : 'none',
                  border: 'none',
                  borderRadius: 0,
                  color: '#ef4444',
                  fontSize: 15,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
              >
                {t('dashboard.signOut')}
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
            {t('dashboard.sessionExpiring')}
          </h2>
          <p style={{ fontSize: 15, color: C.textSecond, lineHeight: 1.5, margin: '0 0 8px 0' }}>
            {t('dashboard.sessionExpireIn')}
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
            {t('dashboard.continueSession')}
          </button>

          {/* Extension time options (pill buttons) */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 16 }}>
            {[
              { label: t('dashboard.plus5min'), ms: 5 * 60_000 },
              { label: t('dashboard.plus15min'), ms: 15 * 60_000 },
              { label: t('dashboard.plus30min'), ms: 30 * 60_000 },
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
            {t('dashboard.signOutNow')}
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
              insetInlineStart: 16,
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
            {t('dashboard.sessionTimeout')}
          </h2>
          <p style={{ fontSize: 15, color: C.textSecond, lineHeight: 1.5, margin: '0 0 24px 0' }}>
            {t('dashboard.sessionExpiredMessage')}
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
            {t('dashboard.signIn')}
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
            <span style={{ fontSize: 16, fontWeight: 700, color: C.textPrimary }}>{t('dashboard.language')}</span>
          </div>

          {/* Language options */}
          <div style={{ flex: 1, padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {([
              { value: 'en' as const, label: t('dashboard.english'), nativeLabel: 'English', flag: '🇺🇸' },
              { value: 'ar' as const, label: t('dashboard.arabic'), nativeLabel: t('dashboard.arabicNative'), flag: '🇸🇦' },
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
                    border: `1.5px solid ${isSelected ? accentVisibleMain : C.cardBorder}`,
                    background: isSelected
                      ? (isLight ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.10)')
                      : hoveredPanel === `lang-${option.value}` ? C.hover : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'start',
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
                    border: `2px solid ${isSelected ? accentVisibleMain : C.cardBorder}`,
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
                        background: accentVisibleMain,
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
              {selectedLang === lang ? t('dashboard.done') : t('dashboard.saveApply')}
            </button>
          </div>
        </div>
      </SlidePanel>

    </>
  );
}
