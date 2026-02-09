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

interface NavChild {
  label: string;
  key?: string;
  children?: NavChild[];
}

interface NavItem {
  key: string;
  labelKey: string;
  icon: string;
  isIndex?: boolean;
  children?: NavChild[];
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', labelKey: 'nav.dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', isIndex: true },
  {
    key: 'queue', labelKey: 'nav.queue', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    children: [
      {
        label: 'Items', key: 'queue',
        children: [
          { label: 'All items', key: 'queue' },
          { label: 'Categories', key: 'queue' },
          { label: 'Modifiers', key: 'queue' },
          { label: 'Discounts', key: 'queue' },
          { label: 'Tax rates', key: 'queue' },
        ],
      },
      { label: 'Menus', key: 'queue' },
      {
        label: 'Inventory management', key: 'queue',
        children: [
          { label: 'Stock overview', key: 'queue' },
          { label: 'Purchase orders', key: 'queue' },
          { label: 'Suppliers', key: 'queue' },
        ],
      },
      { label: 'Order guide', key: 'queue' },
      {
        label: 'Gift cards', key: 'queue',
        children: [
          { label: 'Overview', key: 'queue' },
          { label: 'Activity', key: 'queue' },
        ],
      },
      { label: 'Subscription plans', key: 'queue' },
    ],
  },
  {
    key: 'quick-order', labelKey: 'nav.quickOrder', icon: 'M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z',
    children: [
      { label: 'Transactions', key: 'quick-order' },
      { label: 'Invoices', key: 'quick-order' },
      { label: 'Payment links', key: 'quick-order' },
      { label: 'Subscriptions', key: 'quick-order' },
    ],
  },
  {
    key: 'menu', labelKey: 'nav.menu', icon: 'M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9',
    children: [
      { label: 'Online ordering', key: 'menu' },
      {
        label: 'Site settings',
        children: [
          { label: 'General', key: 'menu' },
          { label: 'Appearance', key: 'menu' },
          { label: 'Domain', key: 'menu' },
          { label: 'SEO', key: 'menu' },
        ],
      },
      { label: 'Channels', key: 'menu' },
    ],
  },
  {
    key: 'barista', labelKey: 'nav.barista', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
    children: [
      { label: 'Directory', key: 'barista' },
      { label: 'Groups', key: 'barista' },
    ],
  },
  {
    key: 'loyalty', labelKey: 'nav.loyalty', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    children: [
      { label: 'Sales summary', key: 'loyalty' },
      { label: 'Sales trends', key: 'loyalty' },
      { label: 'Payment methods', key: 'loyalty' },
      { label: 'Item sales', key: 'loyalty' },
      { label: 'Category sales', key: 'loyalty' },
      { label: 'Modifier sales', key: 'loyalty' },
      { label: 'Discount activity', key: 'loyalty' },
      { label: 'Tax report', key: 'loyalty' },
    ],
  },
];

const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    key: 'staff', labelKey: 'nav.posTerminal', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    children: [
      { label: 'Team members', key: 'staff' },
      { label: 'Roles & permissions', key: 'staff' },
      { label: 'Labor', key: 'staff' },
    ],
  },
  { key: 'banking', labelKey: 'nav.analytics', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { key: 'settings', labelKey: 'nav.settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  { key: 'change-business', labelKey: 'nav.changeBusiness', icon: 'M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z' },
];

const TITLE_KEYS: Record<string, string> = {
  dashboard: 'titles.dashboard',
  queue: 'titles.queue',
  'quick-order': 'titles.quickOrder',
  menu: 'titles.menu',
  barista: 'titles.barista',
  loyalty: 'titles.loyalty',
  'change-business': 'titles.changeBusiness',
  settings: 'titles.settings',
};

const APP_PORT = 3002;
const LANDING_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_LANDING_URL || (Number(window.location.port) >= 5000 ? 'http://localhost:5001' : 'http://localhost:3000');

// Sub-menu stack entry
interface SubMenuEntry {
  parentLabel: string;
  children: NavChild[];
}

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { t } = useTranslation();
  const [authChecked, setAuthChecked] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');
  // Stack-based sub-menu navigation
  const [subMenuStack, setSubMenuStack] = useState<SubMenuEntry[]>([]);
  const [slideAnim, setSlideAnim] = useState<'in' | 'out' | ''>('');
  const [activeChildLabel, setActiveChildLabel] = useState<string>('');

  useEffect(() => {
    const isAuthorized = (data: { posProduct?: { port: number } }) => {
      return data.posProduct?.port === APP_PORT;
    };

    const hashAuth = parseAuthFromHash();
    if (hashAuth) {
      if (!isAuthorized(hashAuth)) {
        if (hashAuth.posProduct?.port) {
          window.location.href = `http://localhost:${hashAuth.posProduct.port}/${lang || 'en'}/dashboard/#auth=${btoa(JSON.stringify(hashAuth))}`;
        } else {
          window.location.href = `${LANDING_URL}/`;
        }
        return;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hashAuth));
      setUserName(hashAuth.user?.firstName || hashAuth.user?.email || '');
      setUserRole(hashAuth.user?.role || 'Owner');
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
            window.location.href = `${LANDING_URL}/`;
            return;
          }
          setUserName(parsed.user?.firstName || parsed.user?.email || '');
          setUserRole(parsed.user?.role || 'Owner');
          setAuthChecked(true);
          return;
        }
      }
    } catch { /* ignore */ }
    window.location.href = `${LANDING_URL}/`;
  }, []);

  const pathSegments = location.pathname.split('/');
  const dashIdx = pathSegments.indexOf('dashboard');
  const activeKey = dashIdx >= 0 && pathSegments[dashIdx + 1] ? pathSegments[dashIdx + 1] : 'dashboard';

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const handleNav = (key: string, isIndex?: boolean) => {
    navigate(isIndex ? `/${lang}/dashboard` : `/${lang}/dashboard/${key}`);
    setMobileMenuOpen(false);
    setSubMenuStack([]);
    setSlideAnim('');
    setActiveChildLabel('');
  };

  const pushSubMenu = (parentLabel: string, children: NavChild[]) => {
    setSlideAnim('in');
    setSubMenuStack((prev) => [...prev, { parentLabel, children }]);
  };

  const popSubMenu = () => {
    setSlideAnim('out');
    setSubMenuStack((prev) => prev.slice(0, -1));
  };

  const handleNavItemClick = (item: NavItem) => {
    if (item.children && item.children.length > 0) {
      pushSubMenu(t(item.labelKey), item.children);
    } else {
      handleNav(item.key, item.isIndex);
    }
  };

  const handleChildClick = (child: NavChild) => {
    if (child.children && child.children.length > 0) {
      pushSubMenu(child.label, child.children);
    } else if (child.key) {
      // Navigate but stay in the sub-menu — don't clear the stack
      navigate(`/${lang}/dashboard/${child.key}`);
      setActiveChildLabel(child.label);
      setMobileMenuOpen(false);
    }
  };

  const currentSubMenu = subMenuStack.length > 0 ? subMenuStack[subMenuStack.length - 1] : null;

  // Render a root nav button (with icon)
  const renderNavButton = (item: NavItem) => (
    <button
      key={item.key}
      onClick={() => handleNavItemClick(item)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-0.5 ${
        activeKey === item.key
          ? 'bg-gray-100 text-gray-900 font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d={item.icon} />
      </svg>
      <span className="flex-1 text-left">{t(item.labelKey)}</span>
      {item.children && item.children.length > 0 && (
        <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </button>
  );

  // Sub-menu view that replaces the nav area in-place
  const subMenuView = currentSubMenu ? (
    <div
      key={subMenuStack.length}
      className={`absolute inset-0 bg-white flex flex-col ${
        slideAnim === 'in' ? 'animate-submenu-in' : slideAnim === 'out' ? 'animate-submenu-out' : ''
      }`}
    >
      {/* Back button with parent label */}
      <button
        onClick={popSubMenu}
        className="flex items-center gap-3 px-4 py-4 text-sm hover:bg-gray-50 transition-colors"
      >
        <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
        </svg>
        <span className="font-bold text-gray-900 text-base">{currentSubMenu.parentLabel}</span>
      </button>

      {/* Child items */}
      <nav className="flex-1 px-3 py-1 overflow-y-auto">
        {currentSubMenu.children.map((child, idx) => {
          const isActive = activeChildLabel === child.label;
          return (
            <button
              key={idx}
              onClick={() => handleChildClick(child)}
              className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm transition-colors mb-0.5 ${
                isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium">{child.label}</span>
              {child.children && child.children.length > 0 && (
                <svg className="w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  ) : null;

  const sidebarContent = (
    <div className="flex flex-col h-full overflow-hidden">
      {/* User profile area — clickable to open profile panel */}
      <button
        onClick={() => setProfilePanelOpen(true)}
        className="w-full px-5 py-5 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left shrink-0"
      >
        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-sm text-gray-900 truncate">{userName || t('app.name')}</div>
        </div>
      </button>

      {/* Search */}
      <div className="px-4 pb-3 shrink-0">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-gray-400 text-sm">
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Search</span>
        </div>
      </div>

      {/* Nav area — sub-menu overlays this section only */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {/* Root nav (hidden when sub-menu is open, animates back from left when returning) */}
        <nav className={`px-3 py-1 overflow-y-auto h-full ${
          currentSubMenu ? 'invisible' : slideAnim === 'out' ? 'animate-submenu-out' : ''
        }`}>
          {NAV_ITEMS.map((item) => renderNavButton(item))}
          <div className="h-px bg-gray-200 my-3 mx-1" />
          {BOTTOM_NAV_ITEMS.map((item) => renderNavButton(item))}
        </nav>

        {/* Sub-menu overlay (replaces nav in-place) */}
        {subMenuView}
      </div>

      {/* Take payment button */}
      <div className="px-4 py-4 border-t border-gray-100 shrink-0">
        <a
          href={`${LANDING_URL}/pos`}
          className="flex items-center gap-3 w-full px-3 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          Take payment
        </a>
      </div>

      {/* Bottom icons bar */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-4 shrink-0">
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </button>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
        </button>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="2" width="14" height="20" rx="2" ry="2" /><line x1="12" y1="18" x2="12" y2="18.01" /></svg>
        </button>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
        </button>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
        </button>
        <div className="flex-1" />
        <button
          onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.href = `${LANDING_URL}/en/signin?logout=true&port=${window.location.port}`; }}
          className="text-gray-400 hover:text-red-500 transition-colors"
          title="Logout"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[250px] bg-white border-r border-gray-200 flex-col shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => { setMobileMenuOpen(false); setSubMenuStack([]); setSlideAnim(''); }} />
          <aside className="absolute inset-y-0 left-0 w-[280px] bg-white flex flex-col shadow-xl z-50">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Profile slide-over panel */}
      {profilePanelOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setProfilePanelOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
            {/* Close button */}
            <div className="flex items-center px-6 py-5 border-b border-gray-100">
              <button
                onClick={() => setProfilePanelOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Profile menu items */}
            <div className="flex-1 overflow-y-auto">
              <div className="py-2">
                <div className="px-6 py-4 border-b border-gray-100">
                  <span className="text-base text-gray-900">{userRole || 'Owner'}</span>
                </div>
                <button className="w-full text-left px-6 py-4 text-base text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-100">
                  Account settings
                </button>
                <button className="w-full text-left px-6 py-4 text-base text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-100">
                  Feature log
                </button>
                <button className="w-full text-left px-6 py-4 text-base text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-100">
                  Roadmap
                </button>
                <button className="w-full text-left px-6 py-4 text-base text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-100">
                  Cookie preferences
                </button>
                <button
                  onClick={() => { localStorage.removeItem(STORAGE_KEY); window.location.href = `${LANDING_URL}/en/signin?logout=true&port=${window.location.port}`; }}
                  className="w-full text-left px-6 py-4 text-base text-gray-900 hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 h-14 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 -ml-1.5 text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {activeKey === 'dashboard' ? `Home : All locations` : t(TITLE_KEYS[activeKey] || 'app.name')}
            </h1>
            {activeKey === 'dashboard' && (
              <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
            )}
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
