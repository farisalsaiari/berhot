import { ReactNode } from 'react';
import { SidebarItem } from '../types';

interface SidebarProps {
  brand: { name: string; sub?: string; icon?: ReactNode };
  items: SidebarItem[];
  activeKey: string;
  onNavigate: (key: string) => void;
  footerLinks?: { label: string; href: string; icon?: ReactNode }[];
  backLink?: { label: string; href: string };
}

export function Sidebar({ brand, items, activeKey, onNavigate, footerLinks, backLink }: SidebarProps) {
  return (
    <aside className="bg-slate-900 text-white flex flex-col">
      <div className="px-6 py-5 border-b border-white/10 flex items-center gap-3">
        {brand.icon && (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            {brand.icon}
          </div>
        )}
        <div>
          <div className="font-bold text-sm">{brand.name}</div>
          {brand.sub && <div className="text-[11px] text-white/40">{brand.sub}</div>}
        </div>
      </div>

      <nav className="flex-1 py-3 overflow-y-auto">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => item.href ? window.location.href = item.href : onNavigate(item.key)}
            className={`w-full flex items-center gap-3 px-6 py-2.5 text-sm transition-colors ${
              activeKey === item.key
                ? 'text-white bg-white/10 ltr:border-r-2 rtl:border-l-2 border-blue-500'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="w-[18px] h-[18px] shrink-0 flex items-center justify-center">{item.icon}</span>
            {item.label}
          </button>
        ))}

        {footerLinks && footerLinks.length > 0 && (
          <>
            <div className="h-px bg-white/10 mx-6 my-3" />
            {footerLinks.map((link, i) => (
              <a key={i} href={link.href} className="flex items-center gap-3 px-6 py-2.5 text-sm text-white/40 hover:text-white/70">
                {link.icon && <span className="w-[18px] h-[18px]">{link.icon}</span>}
                {link.label}
              </a>
            ))}
          </>
        )}
      </nav>

      {backLink && (
        <div className="px-6 py-4 border-t border-white/10">
          <a href={backLink.href} className="text-white/40 text-xs hover:text-white/70">&larr; {backLink.label}</a>
        </div>
      )}
    </aside>
  );
}
