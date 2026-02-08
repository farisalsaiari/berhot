import { Link } from 'react-router-dom';
import { LanguageSwitcher } from '@berhot/i18n';

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
      <span className="text-xl font-bold text-white tracking-tight">
        berhot
      </span>
    </Link>
  );
}

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <BerhotLogo />

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#testimonials" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Testimonials
            </a>
            <a href="#pricing-preview" className="text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <a
              href="http://localhost:3000/en/signin"
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
