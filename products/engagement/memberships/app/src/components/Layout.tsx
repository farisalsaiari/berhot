import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useTranslation, LanguageSwitcher } from '@berhot/i18n';

const NAV_ITEMS = [
  { key: 'overview', labelKey: 'nav.overview', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { key: 'members', labelKey: 'nav.members', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { key: 'plans', labelKey: 'nav.plans', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
  { key: 'billing', labelKey: 'nav.billing', icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z' },
  { key: 'access', labelKey: 'nav.access', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z' },
];

const TITLE_KEYS: Record<string, string> = { overview: 'titles.overview', members: 'titles.members', plans: 'titles.plans', billing: 'titles.billing', access: 'titles.access' };

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { t } = useTranslation();
  const pathSegments = location.pathname.split('/');
  const activeKey = pathSegments[pathSegments.length - 1] || 'overview';

  return (
    <div className="grid grid-cols-[240px_1fr] h-screen">
      <aside className="bg-slate-900 text-white flex flex-col">
        <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
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
          <a href="http://localhost:3000" className="text-white/40 text-xs hover:text-white/70">{t('nav.backToBerhot')}</a>
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
