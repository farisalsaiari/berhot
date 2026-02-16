import { useState, useRef, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LanguageSwitcher, useTranslation } from '@berhot/i18n';
import { useAuth } from '../lib/auth-context';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const businessTypes = [
  {
    label: 'Restaurants',
    icon: '🍽️',
    description: 'Full-service restaurant management with POS, kitchen display, and table management.',
    links: [
      { name: 'Restaurant POS', href: 'http://localhost:4001' },
      { name: 'Kitchen Display', href: 'http://localhost:4001/kitchen' },
      { name: 'Table Management', href: 'http://localhost:4001/tables' },
    ],
  },
  {
    label: 'Cafes',
    icon: '☕',
    description: 'Streamlined cafe operations with quick-service POS and loyalty programs.',
    links: [
      { name: 'Cafe POS', href: 'http://localhost:4002' },
      { name: 'Quick Order', href: 'http://localhost:4002/quick' },
    ],
  },
  {
    label: 'Retail',
    icon: '🛍️',
    description: 'Complete retail solution with inventory, barcode scanning, and e-commerce.',
    links: [
      { name: 'Retail POS', href: 'http://localhost:4003' },
      { name: 'Inventory', href: 'http://localhost:4003/inventory' },
    ],
  },
  {
    label: 'Services',
    icon: '📅',
    description: 'Appointment scheduling, client management, and service bookings.',
    links: [
      { name: 'Appointments', href: 'http://localhost:4004' },
      { name: 'Memberships', href: 'http://localhost:4009' },
    ],
  },
  {
    label: 'Events',
    icon: '🎪',
    description: 'Event ticketing, attendance tracking, and venue management.',
    links: [
      { name: 'Events', href: 'http://localhost:4010' },
      { name: 'Attendance', href: 'http://localhost:4011' },
    ],
  },
  {
    label: 'Food Trucks',
    icon: '🚚',
    description: 'Mobile food operations with portable POS and on-the-go ordering.',
    links: [
      { name: 'Food Truck POS', href: 'http://localhost:4011' },
    ],
  },
  {
    label: 'Grocery',
    icon: '🥬',
    description: 'Grocery store management with inventory, scales, and barcode scanning.',
    links: [
      { name: 'Grocery POS', href: 'http://localhost:4012' },
    ],
  },
  {
    label: 'Supermarkets',
    icon: '🏪',
    description: 'Large-scale retail with multi-lane checkout and warehouse management.',
    links: [
      { name: 'Supermarket POS', href: 'http://localhost:4013' },
    ],
  },
  {
    label: 'Quick Service',
    icon: '⚡',
    description: 'Fast ordering for cafeterias, home businesses, and dessert shops.',
    links: [
      { name: 'Quick Service POS', href: 'http://localhost:4014' },
    ],
  },
];

const productCategories = [
  {
    label: 'Commerce',
    icon: '💳',
    description: 'Point-of-sale solutions for every business type.',
    links: [
      { name: 'Restaurant POS', href: 'http://localhost:4001' },
      { name: 'Cafe POS', href: 'http://localhost:4002' },
      { name: 'Retail POS', href: 'http://localhost:4003' },
    ],
  },
  {
    label: 'Experience',
    icon: '✨',
    description: 'Customer-facing tools to delight and retain.',
    links: [
      { name: 'Loyalty', href: 'http://localhost:4005' },
      { name: 'Queue Management', href: 'http://localhost:4006' },
      { name: 'Memberships', href: 'http://localhost:4009' },
    ],
  },
  {
    label: 'Workforce',
    icon: '👥',
    description: 'Manage your team, schedules, and attendance.',
    links: [
      { name: 'Shifts', href: 'http://localhost:4008' },
      { name: 'Attendance', href: 'http://localhost:4011' },
    ],
  },
  {
    label: 'Intelligence',
    icon: '📊',
    description: 'Analytics, marketing, and business intelligence.',
    links: [
      { name: 'Marketing', href: 'http://localhost:4007' },
    ],
  },
  {
    label: 'Platform',
    icon: '⚙️',
    description: 'Appointments, events, and platform services.',
    links: [
      { name: 'Appointments', href: 'http://localhost:4004' },
      { name: 'Events', href: 'http://localhost:4010' },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Mobile Menu Data (multi-level)                                     */
/* ------------------------------------------------------------------ */

interface MobileMenuItem {
  label: string;
  icon?: string;
  href?: string;
  children?: MobileMenuItem[];
}

const mobileMenuItems: MobileMenuItem[] = [
  {
    label: 'Business types',
    children: [
      {
        label: 'Food & Beverage',
        children: [
          ...businessTypes.filter(bt => ['Restaurants', 'Cafes', 'Food Trucks', 'Quick Service'].includes(bt.label))
            .flatMap(bt => bt.links.map(l => ({ label: l.name, href: l.href }))),
        ],
      },
      {
        label: 'Retail',
        children: [
          ...businessTypes.filter(bt => ['Retail', 'Grocery', 'Supermarkets'].includes(bt.label))
            .flatMap(bt => bt.links.map(l => ({ label: l.name, href: l.href }))),
        ],
      },
      {
        label: 'Beauty',
        children: [
          { label: 'Salon POS', href: '#beauty-salon' },
          { label: 'Spa Management', href: '#beauty-spa' },
          { label: 'Barbershop', href: '#beauty-barbershop' },
        ],
      },
      {
        label: 'Services',
        children: [
          ...businessTypes.filter(bt => ['Services', 'Events'].includes(bt.label))
            .flatMap(bt => bt.links.map(l => ({ label: l.name, href: l.href }))),
        ],
      },
      { label: 'All business types', href: '#all-business-types' },
    ],
  },
  {
    label: 'Products',
    children: productCategories.map((pc) => ({
      label: pc.label,
      children: pc.links.map((l) => ({ label: l.name, href: l.href })),
    })),
  },
  { label: 'Hardware', href: '#hardware' },
  { label: 'Pricing', href: '/pricing' },
  { label: "What's new", href: '#whats-new' },
];

/* ------------------------------------------------------------------ */
/*  Mobile Full-Screen Menu Component                                  */
/* ------------------------------------------------------------------ */

interface MenuLevel {
  title: string;
  items: MobileMenuItem[];
}

function MobileSlideMenu({
  isOpen,
  onClose,
  lang,
  isAuthenticated,
  user,
  onLogout,
}: {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  isAuthenticated: boolean;
  user: { firstName: string; lastName: string; email: string } | null;
  onLogout: () => void;
}) {
  const [stack, setStack] = useState<MenuLevel[]>([
    { title: 'Menu', items: mobileMenuItems },
  ]);
  const [slideDir, setSlideDir] = useState<'forward' | 'back' | 'none'>('none');
  const [slideKey, setSlideKey] = useState(0);

  // Reset when menu closes
  useEffect(() => {
    if (!isOpen) {
      const t = setTimeout(() => {
        setStack([{ title: 'Menu', items: mobileMenuItems }]);
        setSlideDir('none');
        setSlideKey(0);
      }, 350);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const pushLevel = (title: string, items: MobileMenuItem[]) => {
    setSlideDir('forward');
    setSlideKey(k => k + 1);
    setStack(prev => [...prev, { title, items }]);
  };

  const popLevel = () => {
    if (stack.length <= 1) return;
    setSlideDir('back');
    setSlideKey(k => k + 1);
    setStack(prev => prev.slice(0, -1));
  };

  const current = stack[stack.length - 1];
  const isRoot = stack.length === 1;

  // Render a menu item (root or sub)
  const renderItem = (item: MobileMenuItem, _isRootLevel: boolean) => {
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <button
          key={item.label}
          onClick={() => pushLevel(item.label, item.children!)}
          className="w-full flex items-center justify-between py-3 text-lg sm:text-[22px] font-bold text-gray-900 active:opacity-60 transition-opacity"
        >
          <span>{item.label}</span>
          <svg className="w-5 h-5 text-gray-300" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      );
    }

    const isExt = item.href?.startsWith('http');
    if (isExt) {
      return (
        <a
          key={item.label}
          href={item.href}
          onClick={onClose}
          className="block py-3 text-lg sm:text-[22px] font-bold text-gray-900 active:opacity-60 transition-opacity"
        >
          {item.label}
        </a>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.href || '#'}
        onClick={onClose}
        className="block py-3 text-lg sm:text-[22px] font-bold text-gray-900 active:opacity-60 transition-opacity"
      >
        {item.label}
      </Link>
    );
  };

  // Slide animation class (none on initial render, only on push/pop)
  const slideClass = slideDir === 'forward'
    ? 'mob-slide-forward'
    : slideDir === 'back'
      ? 'mob-slide-back'
      : '';

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-white lg:hidden flex flex-col transition-transform duration-350 ease-[cubic-bezier(0.32,0.72,0,1)] ${
        isOpen ? 'translate-y-0' : '-translate-y-full'
      }`}
      style={{ transitionDuration: '350ms' }}
    >
      {/* ── Top bar: back arrow (sub-levels only) — X is handled by header burger toggle ── */}
      <div className="flex items-center px-5 sm:px-6 pt-5 sm:pt-6 pb-2 flex-shrink-0" style={{ minHeight: 48 }}>
        {!isRoot && (
          <button onClick={popLevel} className="p-1 -ml-1 text-gray-900 active:opacity-50">
            <svg className="w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto" style={{ overflowX: 'clip' }}>
        <div
          key={slideKey}
          className={slideClass}
          onAnimationEnd={() => setSlideDir('none')}
        >
          {/* Sub-level title */}
          {!isRoot && (
            <div className="px-5 sm:px-6 pt-2 pb-1">
              <span className="text-xs sm:text-sm font-medium text-gray-400">{current.title}</span>
            </div>
          )}

          {/* Items */}
          <div className="px-5 sm:px-6 pt-1 pb-8">
            {current.items.map(item => renderItem(item, isRoot))}
          </div>

          {/* Bottom links (root only) */}
          {isRoot && (
            <div className="px-5 sm:px-6 pb-12 pt-4 border-t border-gray-100 mt-2 space-y-1">
              {isAuthenticated && user ? (
                <>
                  <a
                    href={getDashboardUrl(lang)}
                    onClick={onClose}
                    className="flex items-center gap-4 py-3 text-[15px] sm:text-[17px] font-medium text-gray-700 active:opacity-60"
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                    Dashboard
                  </a>
                  <button
                    onClick={() => { onLogout(); onClose(); }}
                    className="w-full flex items-center gap-4 py-3 text-[15px] sm:text-[17px] font-medium text-red-600 active:opacity-60"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={`/${lang}/signin`}
                    onClick={onClose}
                    className="flex items-center gap-4 py-3 text-[15px] sm:text-[17px] font-medium text-gray-700 active:opacity-60"
                  >
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    Sign in
                  </Link>
                  <a href="#support" onClick={onClose} className="flex items-center gap-4 py-3 text-[15px] sm:text-[17px] font-medium text-gray-700 active:opacity-60">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                    Support
                  </a>
                  <button onClick={onClose} className="w-full flex items-center gap-4 py-3 text-[15px] sm:text-[17px] font-medium text-gray-700 active:opacity-60">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                    Search
                  </button>
                  <Link to={`/${lang}/shop/hardware/us/${lang}/checkout`} onClick={onClose} className="flex items-center gap-4 py-3 text-[15px] sm:text-[17px] font-medium text-gray-700 active:opacity-60">
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                    </svg>
                    Checkout
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function BerhotLogo() {
  return (
    <Link to="/" className="flex items-center group">
      <svg
        width="30"
        height="30"
        viewBox="0 0 89 90"
        fill="#1a1a1a"
        className="transition-transform group-hover:scale-105"
      >
        <g transform="translate(44.165915, 45) scale(1, -1) translate(-44.165915, -45)">
          <path fillRule="evenodd" d="M69.4192817,22.3611759 C84.2018365,38.081155 88.9828304,59.9401927 88.2622633,84.5632889 C88.1716123,87.6612948 88.2857175,89.4063644 86.470282,89.745827 C84.6548465,90.0852896 45.9204196,90.0841586 43.3635271,89.745827 C41.6589322,89.5202726 40.9198925,87.5799361 41.146408,83.9248175 C41.4268046,70.7590337 39.2744178,62.4474368 33.0811154,56.4790232 C26.8653713,50.4889828 18.8085697,48.4191258 5.53927832,47.9184709 C-0.26992001,47.6992879 0.04198992,45.2973641 0.04198992,42.2339225 L0.0419899201,5.68774353 C0.0419925178,2.64150057 -0.837693553,0 5.45564364,0.00662799493 L5.80171,0 C31.9022526,0.282039646 54.6081099,6.61076494 69.4192817,22.3611759 Z" />
        </g>
      </svg>
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Slide Dropdown (stack-based navigation like dashboard settings)     */
/* ------------------------------------------------------------------ */

interface SlideLevel {
  title: string;
  icon?: string;
  description?: string;
  items: { label: string; icon?: string; description?: string; href?: string; children?: { name: string; href: string }[] }[];
}

function SlideDropdown({
  categories,
  onClose,
}: {
  categories: typeof businessTypes;
  onClose: () => void;
}) {
  const [stack, setStack] = useState<SlideLevel[]>([{
    title: '',
    items: categories.map(c => ({
      label: c.label,
      icon: c.icon,
      description: c.description,
      children: c.links,
    })),
  }]);
  const [slideDir, setSlideDir] = useState<'forward' | 'back' | ''>('');
  const [slideKey, setSlideKey] = useState(0);

  const current = stack[stack.length - 1];
  const isRoot = stack.length === 1;

  const pushLevel = useCallback((item: SlideLevel['items'][0]) => {
    if (!item.children) return;
    setSlideDir('forward');
    setSlideKey(k => k + 1);
    setStack(prev => [...prev, {
      title: item.label,
      icon: item.icon,
      description: item.description,
      items: item.children!.map(c => ({ label: c.name, href: c.href })),
    }]);
  }, []);

  const popLevel = useCallback(() => {
    if (stack.length <= 1) return;
    setSlideDir('back');
    setSlideKey(k => k + 1);
    setStack(prev => prev.slice(0, -1));
  }, [stack.length]);

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[340px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
      style={{ animation: 'slideDropIn 0.15s ease-out' }}
    >
      {/* Back header (sub-levels) */}
      {!isRoot && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-1">
          <button
            onClick={popLevel}
            className="p-1 -ml-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{current.title}</span>
        </div>
      )}

      {/* Animated content */}
      <div
        key={slideKey}
        className={slideDir === 'forward' ? 'dd-slide-forward' : slideDir === 'back' ? 'dd-slide-back' : ''}
        onAnimationEnd={() => setSlideDir('')}
        style={{ padding: isRoot ? '8px 0' : '4px 0 8px' }}
      >
        {/* Sub-level description */}
        {!isRoot && current.description && (
          <p className="px-4 pb-2 text-xs text-gray-400 leading-relaxed">{current.description}</p>
        )}

        {current.items.map((item) => {
          const hasChildren = !!item.children && item.children.length > 0;

          if (hasChildren) {
            return (
              <button
                key={item.label}
                onClick={() => pushLevel(item)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition-colors group"
              >
                {item.icon && <span className="text-lg w-6 text-center">{item.icon}</span>}
                <span className="flex-1 text-sm font-medium">{item.label}</span>
                <svg className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            );
          }

          return (
            <a
              key={item.label}
              href={item.href || '#'}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
            >
              <svg className="w-4 h-4 text-brand-500 opacity-0 group-hover:opacity-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {item.label}
            </a>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Account Dropdown                                                   */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'berhot_auth';
const POS_PRODUCTS_KEY = 'berhot_pos_products';
const IS_PREVIEW = Number(window.location.port) >= 5000;
const DEV_TO_PREVIEW: Record<number, number> = { 3001: 5002, 3002: 5003, 3003: 5004, 3004: 5005 };
function resolvePort(devPort: number) { return IS_PREVIEW ? (DEV_TO_PREVIEW[devPort] || devPort) : devPort; }

function getDashboardUrl(lang: string): string {
  try {
    // Get current user email from auth
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return `/${lang}/dashboard`;
    const authData = JSON.parse(stored);
    const email = authData.user?.email;

    // Look up this user's saved POS product
    let savedPort: number | null = null;
    if (email) {
      const raw = localStorage.getItem(POS_PRODUCTS_KEY);
      if (raw) {
        const all = JSON.parse(raw);
        if (all[email]?.port) savedPort = all[email].port;
      }
    }
    // Fallback: check inside auth storage
    if (!savedPort && authData.posProduct?.port) {
      savedPort = authData.posProduct.port;
    }

    if (savedPort) {
      // Ensure posProduct in auth for handoff
      authData.posProduct = { name: 'POS', port: savedPort };
      const authHash = btoa(JSON.stringify(authData));
      return `http://localhost:${resolvePort(savedPort)}/${lang}/dashboard/#auth=${authHash}`;
    }
  } catch {
    // ignore
  }
  return `/${lang}/dashboard`;
}

function AccountDropdown({ userName, onLogout, lang }: { userName: string; onLogout: () => void; lang: string }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
        {/* User avatar circle */}
        <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-semibold">
          {userName.charAt(0).toUpperCase()}
        </div>
        <span>My Account</span>
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
          {/* User info */}
          <div className="px-4 py-2 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <a
              href={getDashboardUrl(lang)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Dashboard
            </a>

            <Link
              to={`/${lang}/shop/hardware/us/${lang}/my-orders`}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              Order Status
            </Link>

            <a
              href="#"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
              Refer &amp; Earn Rewards
            </a>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Header                                                             */
/* ------------------------------------------------------------------ */

export function Header() {
  const { lang } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const [openMenu, setOpenMenu] = useState<'business' | 'products' | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const toggleMenu = useCallback((menu: 'business' | 'products') => {
    setOpenMenu(prev => prev === menu ? null : menu);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!openMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenu]);

  const handleLogout = () => {
    logout();
    window.location.href = `/${lang}`;
  };

  return (
    <>
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <BerhotLogo />

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1" ref={dropdownRef}>
            {/* Business Types */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('business')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  openMenu === 'business' ? 'text-brand-600 bg-brand-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Business Types
                <svg className={`w-4 h-4 ml-1 inline-block transition-transform ${openMenu === 'business' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openMenu === 'business' && (
                <SlideDropdown
                  categories={businessTypes}
                  onClose={() => setOpenMenu(null)}
                />
              )}
            </div>

            {/* Products */}
            <div className="relative">
              <button
                onClick={() => toggleMenu('products')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  openMenu === 'products' ? 'text-brand-600 bg-brand-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Products
                <svg className={`w-4 h-4 ml-1 inline-block transition-transform ${openMenu === 'products' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openMenu === 'products' && (
                <SlideDropdown
                  categories={productCategories}
                  onClose={() => setOpenMenu(null)}
                />
              )}
            </div>

            {/* Static links */}
            <Link
              to="/pricing"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Pricing
            </Link>
            <Link
              to="partners"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              Partners
            </Link>
          </nav>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />
            <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <SearchIcon />
            </button>
            <a
              href="#support"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Support
            </a>

            {isAuthenticated && user ? (
              <AccountDropdown
                userName={`${user.firstName} ${user.lastName}`.trim() || user.email}
                onLogout={handleLogout}
                lang={lang}
              />
            ) : (
              <>
                <Link
                  to={`/${lang}/signin`}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to={`/${lang}/signup`}
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button (burger ↔ X animated) */}
          <button
            className="lg:hidden relative z-[100000] p-2 text-gray-900 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span
                className="block h-[2px] w-5 bg-current rounded-full transition-all duration-300 ease-in-out origin-center"
                style={{
                  transform: mobileOpen ? 'rotate(45deg) translateY(0px)' : 'rotate(0) translateY(-4px)',
                }}
              />
              <span
                className="block h-[2px] w-5 bg-current rounded-full transition-all duration-200 ease-in-out"
                style={{
                  opacity: mobileOpen ? 0 : 1,
                  transform: mobileOpen ? 'scaleX(0)' : 'scaleX(1)',
                }}
              />
              <span
                className="block h-[2px] w-5 bg-current rounded-full transition-all duration-300 ease-in-out origin-center"
                style={{
                  transform: mobileOpen ? 'rotate(-45deg) translateY(0px)' : 'rotate(0) translateY(4px)',
                }}
              />
            </div>
          </button>
        </div>
      </div>

    </header>

    {/* Mobile slide menu — rendered outside header to avoid stacking context */}
    <MobileSlideMenu
      isOpen={mobileOpen}
      onClose={() => setMobileOpen(false)}
      lang={lang}
      isAuthenticated={!!isAuthenticated}
      user={user ? { firstName: user.firstName, lastName: user.lastName, email: user.email } : null}
      onLogout={handleLogout}
    />
    </>
  );
}
