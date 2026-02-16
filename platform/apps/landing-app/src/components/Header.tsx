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
    label: 'Business Types',
    icon: '🏢',
    children: businessTypes.map((bt) => ({
      label: bt.label,
      icon: bt.icon,
      children: bt.links.map((l) => ({ label: l.name, href: l.href })),
    })),
  },
  {
    label: 'Products',
    icon: '📦',
    children: [
      {
        label: 'Hardware',
        icon: '🖥️',
        children: [
          { label: 'POS Terminals', href: '#hardware-pos' },
          { label: 'Receipt Printers', href: '#hardware-printers' },
          { label: 'Barcode Scanners', href: '#hardware-scanners' },
          { label: 'Cash Drawers', href: '#hardware-drawers' },
          { label: 'Kitchen Display', href: 'http://localhost:4001/kitchen' },
        ],
      },
      {
        label: 'Payments',
        icon: '💳',
        children: [
          { label: 'Card Processing', href: '#payments-card' },
          { label: 'Mobile Payments', href: '#payments-mobile' },
          { label: 'Online Payments', href: '#payments-online' },
          { label: 'Invoicing', href: '#payments-invoicing' },
        ],
      },
      {
        label: 'Customers',
        icon: '👥',
        children: [
          { label: 'Marketing', href: 'http://localhost:4007' },
          { label: 'Loyalty Programs', href: 'http://localhost:4005' },
          { label: 'CRM', href: '#customers-crm' },
          { label: 'Reviews & Feedback', href: '#customers-reviews' },
          { label: 'Queue Management', href: 'http://localhost:4006' },
        ],
      },
      {
        label: 'Staff',
        icon: '🧑‍💼',
        children: [
          { label: 'Scheduling', href: 'http://localhost:4008' },
          { label: 'Attendance', href: 'http://localhost:4011' },
          { label: 'Payroll', href: '#staff-payroll' },
          { label: 'Permissions', href: '#staff-permissions' },
        ],
      },
      ...productCategories.map((pc) => ({
        label: pc.label,
        icon: pc.icon,
        children: pc.links.map((l) => ({ label: l.name, href: l.href })),
      })),
    ],
  },
  { label: 'Hardware', icon: '🖥️', href: '#hardware' },
  { label: 'Pricing', icon: '💰', href: '/pricing' },
  { label: 'Partners', icon: '🤝', href: '/partners' },
  { label: 'Support', icon: '💬', href: '#support' },
];

/* ------------------------------------------------------------------ */
/*  Mobile Slide Menu Component                                        */
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
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [animating, setAnimating] = useState(false);

  // Reset stack when menu closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStack([{ title: 'Menu', items: mobileMenuItems }]);
        setDirection('forward');
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const pushLevel = useCallback((title: string, items: MobileMenuItem[]) => {
    if (animating) return;
    setAnimating(true);
    setDirection('forward');
    setStack((prev: MenuLevel[]) => [...prev, { title, items }]);
    setTimeout(() => setAnimating(false), 350);
  }, [animating]);

  const popLevel = useCallback(() => {
    if (animating || stack.length <= 1) return;
    setAnimating(true);
    setDirection('back');
    setStack((prev: MenuLevel[]) => prev.slice(0, -1));
    setTimeout(() => setAnimating(false), 350);
  }, [animating, stack.length]);

  const currentLevel = stack[stack.length - 1];
  const isRoot = stack.length === 1;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-full max-w-[320px] bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
          {!isRoot ? (
            <button
              onClick={popLevel}
              className="flex items-center gap-2 text-sm font-medium text-brand-600 active:text-brand-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : (
            <span className="text-base font-semibold text-gray-900">Menu</span>
          )}
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Level title (when not root) */}
        {!isRoot && (
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
              {currentLevel.title}
            </h3>
          </div>
        )}

        {/* Menu items with slide animation */}
        <div className="overflow-y-auto overflow-x-hidden" style={{ height: isRoot ? 'calc(100% - 64px)' : 'calc(100% - 108px)' }}>
          <div
            key={stack.length}
            className={`px-3 py-3 ${
              direction === 'forward'
                ? 'animate-[slideInRight_0.3s_ease-out]'
                : 'animate-[slideInLeft_0.3s_ease-out]'
            }`}
          >
            {currentLevel.items.map((item: MobileMenuItem) => {
              const hasChildren = item.children && item.children.length > 0;

              if (hasChildren) {
                return (
                  <button
                    key={item.label}
                    onClick={() => pushLevel(item.label, item.children!)}
                    className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[15px] font-medium text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      {item.icon && <span className="text-lg w-6 text-center">{item.icon}</span>}
                      {item.label}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                );
              }

              // Leaf link
              const isExternal = item.href?.startsWith('http');
              if (isExternal) {
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    {item.icon && <span className="text-lg w-6 text-center">{item.icon}</span>}
                    {item.label}
                  </a>
                );
              }

              return (
                <Link
                  key={item.label}
                  to={item.href || '#'}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-[15px] font-medium text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  {item.icon && <span className="text-lg w-6 text-center">{item.icon}</span>}
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Account section (root level only) */}
          {isRoot && (
            <div className="px-3 pb-6 mt-2">
              <hr className="mb-4 border-gray-100" />
              <div className="px-4 mb-3">
                <LanguageSwitcher />
              </div>
              {isAuthenticated && user ? (
                <>
                  <div className="px-4 py-2 text-sm font-semibold text-gray-900">
                    {`${user.firstName} ${user.lastName}`.trim() || user.email}
                  </div>
                  <a
                    href={getDashboardUrl(lang)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                    </svg>
                    Dashboard
                  </a>
                  <button
                    onClick={() => { onLogout(); onClose(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Log out
                  </button>
                </>
              ) : (
                <div className="space-y-2 px-1">
                  <Link
                    to={`/${lang}/signin`}
                    onClick={onClose}
                    className="block px-4 py-3 text-center text-[15px] font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to={`/${lang}/signup`}
                    onClick={onClose}
                    className="block px-4 py-3 text-center text-[15px] font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors shadow-sm"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function BerhotLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 group">
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform group-hover:scale-105"
      >
        <rect width="32" height="32" rx="8" fill="#2563eb" />
        <path
          d="M8 10h6a4 4 0 010 8H8V10zm0 4h6M10 18h5a4 4 0 010 8H10V18z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
      <span className="text-xl font-bold text-gray-900 tracking-tight">
        berhot
      </span>
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

interface MegaDropdownProps {
  categories: typeof businessTypes;
  activePanel: number;
  onPanelChange: (idx: number) => void;
}

function MegaDropdown({ categories, activePanel, onPanelChange }: MegaDropdownProps) {
  const active = categories[activePanel];

  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[720px] bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-in">
      <div className="grid grid-cols-5">
        {/* Left: category list */}
        <div className="col-span-2 border-r border-gray-100 py-3">
          {categories.map((cat, idx) => (
            <button
              key={cat.label}
              onMouseEnter={() => onPanelChange(idx)}
              className={`w-full text-left px-5 py-3 flex items-center gap-3 transition-colors ${
                idx === activePanel
                  ? 'bg-brand-50 text-brand-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{cat.icon}</span>
              <span className="font-medium text-sm">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Right: detail panel */}
        <div className="col-span-3 p-6">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <span>{active.icon}</span> {active.label}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{active.description}</p>
          </div>
          <div className="space-y-1">
            {active.links.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
              >
                <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {link.name}
              </a>
            ))}
          </div>
        </div>
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
  const [businessPanel, setBusinessPanel] = useState(0);
  const [productsPanel, setProductsPanel] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = (menu: 'business' | 'products') => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenMenu(null), 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = `/${lang}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <BerhotLogo />

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Business Types */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('business')}
              onMouseLeave={handleMouseLeave}
            >
              <button className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                openMenu === 'business' ? 'text-brand-600 bg-brand-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}>
                Business Types
                <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openMenu === 'business' && (
                <MegaDropdown
                  categories={businessTypes}
                  activePanel={businessPanel}
                  onPanelChange={setBusinessPanel}
                />
              )}
            </div>

            {/* Products */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('products')}
              onMouseLeave={handleMouseLeave}
            >
              <button className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                openMenu === 'products' ? 'text-brand-600 bg-brand-50' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}>
                Products
                <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openMenu === 'products' && (
                <MegaDropdown
                  categories={productCategories}
                  activePanel={productsPanel}
                  onPanelChange={setProductsPanel}
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

          {/* Mobile menu button (burger) */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile slide menu */}
      <MobileSlideMenu
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        lang={lang}
        isAuthenticated={!!isAuthenticated}
        user={user ? { firstName: user.firstName, lastName: user.lastName, email: user.email } : null}
        onLogout={handleLogout}
      />
    </header>
  );
}
