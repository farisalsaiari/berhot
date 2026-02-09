const LANDING_URL = Number(window.location.port) >= 5000 ? 'http://localhost:5001' : 'http://localhost:3000';

export function Footer() {
  return (
    <footer className="bg-gray-950 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <span className="text-lg font-bold text-white tracking-tight">berhot</span>
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
