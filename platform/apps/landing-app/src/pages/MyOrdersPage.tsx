import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuth } from '../lib/auth-context';
import { useTranslation } from '@berhot/i18n';
import { Link } from 'react-router-dom';

export default function MyOrdersPage() {
  const { isAuthenticated } = useAuth();
  const { lang } = useTranslation();

  // Redirect if not logged in
  if (!isAuthenticated) {
    window.location.href = `/${lang}/signin`;
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-8 text-sm text-gray-500">
            <Link to={`/${lang}`} className="hover:text-gray-700 transition-colors">
              Home
            </Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">My Orders</span>
          </nav>

          {/* Page heading */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            My Orders
          </h1>

          {/* Order history section */}
          <div className="mt-10">
            <h2 className="text-lg font-semibold text-gray-900 uppercase tracking-wider">
              Order History
            </h2>

            <div className="mt-8 text-center py-16 border border-gray-200 rounded-2xl bg-gray-50">
              {/* Empty state icon */}
              <div className="mx-auto w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-6">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-700">
                You don't have any orders yet.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                When you place an order, it will appear here.
              </p>
              <Link
                to={`/${lang}`}
                className="inline-flex items-center mt-6 px-6 py-3 text-sm font-semibold text-white bg-gray-900 hover:bg-black rounded-full transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
