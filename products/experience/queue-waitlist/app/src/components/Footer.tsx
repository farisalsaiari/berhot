const LANDING_URL = Number(window.location.port) >= 5000 ? 'http://localhost:5001' : 'http://localhost:3000';

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Waitlist by Berhot</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="#privacy" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#terms" className="hover:text-gray-300 transition-colors">Terms</a>
            <a href="#support" className="hover:text-gray-300 transition-colors">Support</a>
            <a href={`${LANDING_URL}/en`} className="hover:text-gray-300 transition-colors">Visit berhot.com</a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Berhot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
