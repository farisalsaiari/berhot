import { LanguageSwitcher } from '@berhot/i18n';

const LANDING_URL = Number(window.location.port) >= 5000 ? 'http://localhost:5001' : 'http://localhost:3000';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center transition-transform group-hover:scale-105">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-white tracking-tight leading-none">Waitlist</span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">by Berhot</span>
            </div>
          </a>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#industries" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Industries
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <a
              href={`${LANDING_URL}/en/signin`}
              className="hidden sm:inline-flex items-center px-5 py-2 text-sm font-semibold text-gray-950 bg-white hover:bg-gray-100 rounded-full transition-all hover:-translate-y-0.5 shadow-lg shadow-white/10"
            >
              Start Free Trial
              <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
