import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation, LanguageSwitcher } from '@berhot/i18n';

const STORAGE_KEY = 'berhot_auth';
const LANDING_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_LANDING_URL || (Number(window.location.port) >= 5000 ? 'http://localhost:5001' : 'http://localhost:3000');

const NAV_ITEMS = [
  { key: 'clock', labelKey: 'nav.clock', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'log', labelKey: 'nav.log', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01' },
  { key: 'employees', labelKey: 'nav.employees', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { key: 'devices', labelKey: 'nav.devices', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { key: 'overtime', labelKey: 'nav.overtime', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
  { key: 'reports', labelKey: 'nav.reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
];

const TITLE_KEYS: Record<string, string> = { clock: 'titles.clock', log: 'titles.log', employees: 'titles.employees', devices: 'titles.devices', overtime: 'titles.overtime', reports: 'titles.reports' };

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { t } = useTranslation();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user && parsed.accessToken) {
          setAuthChecked(true);
          return;
        }
      }
    } catch { /* ignore */ }
    window.location.href = `${LANDING_URL}/`;
  }, []);

  const pathSegments = location.pathname.split('/');
  const activeKey = pathSegments[pathSegments.length - 1] || 'clock';

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[240px_1fr] h-screen">
      <aside className="bg-slate-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-sm">{t('app.name')}</div>
            <div className="text-[11px] text-white/40">berhot</div>
          </div>
        </div>
        <nav className="flex-1 py-3">
          {NAV_ITEMS.map((item) => (
            <button key={item.key} onClick={() => navigate(`/${lang}/${item.key}`)} className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${activeKey === item.key ? 'text-white bg-white/10 ltr:border-r-2 rtl:border-l-2 border-blue-500' : 'text-white/50 hover:text-white hover:bg-white/5'}`}>
              <svg className="w-[18px] h-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
              {t(item.labelKey)}
            </button>
          ))}
        </nav>
        <div className="px-6 py-4 border-t border-white/10">
          <a href={LANDING_URL} className="text-white/40 text-xs hover:text-white/70">{t('nav.backToBerhot')}</a>
        </div>
      </aside>
      <main className="flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between shrink-0">
          <h1 className="text-lg font-semibold">{t(TITLE_KEYS[activeKey] || 'app.name')}</h1>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">{t('app.status')}</span>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50"><Outlet /></div>
      </main>
    </div>
  );
}
