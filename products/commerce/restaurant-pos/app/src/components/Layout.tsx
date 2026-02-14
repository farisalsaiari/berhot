import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation, LanguageSwitcher } from '@berhot/i18n';

const STORAGE_KEY = 'berhot_auth';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
}

interface AuthData {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
  posProduct?: { name: string; port: number };
}

function parseAuthFromHash(): AuthData | null {
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
  } catch {
    // ignore
  }
  return null;
}

const NAV_ITEMS = [
  { key: 'dashboard', labelKey: 'nav.dashboard', icon: 'M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-2a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z', isIndex: true },
  { key: 'tables', labelKey: 'nav.tables', icon: 'M3 3h7v7H3V3zm11 0h7v7h-7V3zm-11 11h7v7H3v-7zm11 0h7v7h-7v-7z' },
  { key: 'orders', labelKey: 'nav.orders', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { key: 'kitchen', labelKey: 'nav.kitchen', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' },
  { key: 'menu', labelKey: 'nav.menu', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { key: 'reservations', labelKey: 'nav.reservations', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
];

const TITLE_KEYS: Record<string, string> = {
  dashboard: 'titles.dashboard',
  tables: 'titles.tables',
  orders: 'titles.orders',
  kitchen: 'titles.kitchen',
  menu: 'titles.menu',
  reservations: 'titles.reservations',
  'change-business': 'titles.changeBusiness',
};

// This POS app's designated port — used to verify user authorization
const APP_PORT = 3001;

// Landing app URL for auth redirects
const LANDING_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_LANDING_URL || (Number(window.location.port) >= 5000 ? 'http://localhost:5001' : 'http://localhost:3000');

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { t } = useTranslation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Helper: check if user is authorized for THIS POS app
    const isAuthorized = (data: { posProduct?: { port: number } }) => {
      return data.posProduct?.port === APP_PORT;
    };

    const hashAuth = parseAuthFromHash();
    if (hashAuth) {
      if (!isAuthorized(hashAuth)) {
        if (hashAuth.posProduct?.port) {
          window.location.href = `http://localhost:${hashAuth.posProduct.port}/${lang || 'en'}/dashboard/#auth=${btoa(JSON.stringify(hashAuth))}`;
        } else {
          window.location.href = `${LANDING_URL}/${lang || 'en'}/signin`;
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
            window.location.href = `${LANDING_URL}/${lang || 'en'}/signin`;
            return;
          }
          setAuthChecked(true);
          return;
        }
      }
    } catch { /* ignore */ }
    window.location.href = `${LANDING_URL}/${lang || 'en'}/signin`;
  }, []);

  const pathSegments = location.pathname.split('/');
  const dashIdx = pathSegments.indexOf('dashboard');
  const activeKey = dashIdx >= 0 && pathSegments[dashIdx + 1] ? pathSegments[dashIdx + 1] : 'dashboard';

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[240px_1fr] h-screen">
      {/* Sidebar */}
      <aside className="bg-slate-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-sm">{t('app.name')}</div>
            <div className="text-[11px] text-white/40">berhot</div>
          </div>
        </div>

        <nav className="flex-1 py-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => navigate(item.isIndex ? `/${lang}/dashboard` : `/${lang}/dashboard/${item.key}`)}
              className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
                activeKey === item.key
                  ? 'text-white bg-white/10 ltr:border-r-2 rtl:border-l-2 border-blue-500'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              {t(item.labelKey)}
            </button>
          ))}

          <div className="h-px bg-white/10 mx-6 my-3" />

          <a href={`${LANDING_URL}/pos`} className="flex items-center gap-3 px-6 py-2.5 text-sm text-white/40 hover:text-white/70">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            {t('nav.posTerminal')}
          </a>
          <a href={`${LANDING_URL}/dashboard`} className="flex items-center gap-3 px-6 py-2.5 text-sm text-white/40 hover:text-white/70">
            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            {t('nav.analytics')}
          </a>
          <button onClick={() => navigate(`/${lang}/dashboard/change-business`)} className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${activeKey === 'change-business' ? 'text-white bg-white/10 ltr:border-r-2 rtl:border-l-2 border-blue-500' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
            <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 5H4m0 0l4 4m-4-4l4-4" /></svg>
            {t('nav.changeBusiness')}
          </button>
        </nav>

        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
          <a href={LANDING_URL} className="text-white/40 text-xs hover:text-white/70">{t('nav.backToBerhot')}</a>
          <button
            onClick={() => { try { const _a = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); const _pp = _a.posProduct; const _em = _a.user?.email || ''; localStorage.removeItem(STORAGE_KEY); window.location.href = `${LANDING_URL}/en/signin?logout=true&port=${window.location.port}${_pp ? '&posProduct=' + encodeURIComponent(JSON.stringify(_pp)) : ''}${_em ? '&email=' + encodeURIComponent(_em) : ''}`; } catch { localStorage.removeItem(STORAGE_KEY); window.location.href = `${LANDING_URL}/en/signin?logout=true`; } }}
            className="flex items-center gap-1.5 text-white/40 text-xs hover:text-red-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-semibold">{t(TITLE_KEYS[activeKey] || 'app.name')}</h1>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">{t('app.branch')}</span>
            <a href={`${LANDING_URL}/pos`} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition">{t('app.newOrder')}</a>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
