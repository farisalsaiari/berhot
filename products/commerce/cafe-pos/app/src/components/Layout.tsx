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

/** Parse auth data from URL hash. Format: #auth=BASE64({accessToken, refreshToken, user}) */
function parseAuthFromHash(): { accessToken: string; refreshToken: string; user: AuthUser } | null {
  try {
    const hash = window.location.hash;
    if (!hash || !hash.includes('auth=')) return null;
    const params = new URLSearchParams(hash.substring(1));
    const authData = params.get('auth');
    if (!authData) return null;
    const parsed = JSON.parse(atob(authData));
    if (parsed.user && parsed.accessToken) {
      // Clean up the URL hash
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
  { key: 'queue', labelKey: 'nav.queue', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { key: 'quick-order', labelKey: 'nav.quickOrder', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { key: 'menu', labelKey: 'nav.menu', icon: 'M4 6h16M4 12h16M4 18h16' },
  { key: 'barista', labelKey: 'nav.barista', icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z' },
  { key: 'loyalty', labelKey: 'nav.loyalty', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
];

const TITLE_KEYS: Record<string, string> = {
  dashboard: 'titles.dashboard',
  queue: 'titles.queue',
  'quick-order': 'titles.quickOrder',
  menu: 'titles.menu',
  barista: 'titles.barista',
  loyalty: 'titles.loyalty',
};

// Landing app URL: use env var or detect from current port
const LANDING_URL = import.meta.env.VITE_LANDING_URL
  || (window.location.port === '4002' ? 'http://localhost:5001' : 'http://localhost:3000');

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { t } = useTranslation();
  const [authChecked, setAuthChecked] = useState(false);

  // Auth guard: check URL hash → localStorage → redirect if not authenticated
  useEffect(() => {
    // 1. Try auth from URL hash (cross-origin handoff from port 3000)
    const hashAuth = parseAuthFromHash();
    if (hashAuth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hashAuth));
      setAuthChecked(true);
      return;
    }

    // 2. Try localStorage (returning user)
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user) {
          setAuthChecked(true);
          return;
        }
      }
    } catch {
      // ignore
    }

    // 3. No valid auth — redirect to marketing site sign-in
    window.location.href = `${LANDING_URL}/`;
  }, []);

  // Path: /:lang/dashboard/:page — extract active page from after "dashboard"
  const pathSegments = location.pathname.split('/');
  const dashIdx = pathSegments.indexOf('dashboard');
  const activeKey = dashIdx >= 0 && pathSegments[dashIdx + 1] ? pathSegments[dashIdx + 1] : 'dashboard';

  // Show loading spinner while checking auth
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
        </nav>

        <div className="px-6 py-4 border-t border-white/10">
          <a href={LANDING_URL} className="text-white/40 text-xs hover:text-white/70">{t('nav.backToBerhot')}</a>
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
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
