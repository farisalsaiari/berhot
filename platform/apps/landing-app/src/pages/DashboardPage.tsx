import { useEffect, useState } from 'react';
import { useTranslation } from '@berhot/i18n';
import { useAuth } from '../lib/auth-context';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const STORAGE_KEY = 'berhot_auth';

const POS_PRODUCTS = [
  {
    name: 'Restaurant POS',
    description: 'Full-service & quick-service restaurants',
    icon: '🍽️',
    port: 4001,
    color: 'bg-orange-50 border-orange-200 hover:border-orange-400 hover:shadow-lg',
  },
  {
    name: 'Cafe POS',
    description: 'Coffee shops & bakeries',
    icon: '☕',
    port: 4002,
    color: 'bg-amber-50 border-amber-200 hover:border-amber-400 hover:shadow-lg',
  },
  {
    name: 'Retail POS',
    description: 'Shops & general retail',
    icon: '🛒',
    port: 4003,
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:shadow-lg',
  },
  {
    name: 'Appointment POS',
    description: 'Salons, clinics & services',
    icon: '📅',
    port: 4004,
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400 hover:shadow-lg',
  },
  {
    name: 'Food Truck POS',
    description: 'Mobile food trucks & carts',
    icon: '🚚',
    port: 4011,
    color: 'bg-red-50 border-red-200 hover:border-red-400 hover:shadow-lg',
  },
  {
    name: 'Grocery POS',
    description: 'Grocery stores & fresh markets',
    icon: '🥬',
    port: 4012,
    color: 'bg-green-50 border-green-200 hover:border-green-400 hover:shadow-lg',
  },
  {
    name: 'Supermarket POS',
    description: 'Large retail supermarkets',
    icon: '🏪',
    port: 4013,
    color: 'bg-teal-50 border-teal-200 hover:border-teal-400 hover:shadow-lg',
  },
  {
    name: 'Quick Service POS',
    description: 'Cafeterias, home businesses & more',
    icon: '⚡',
    port: 4014,
    color: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400 hover:shadow-lg',
  },
];

/** Build product link with auth hash for cross-origin handoff */
function getProductLink(port: number, lang: string): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const authHash = btoa(stored);
      return `http://localhost:${port}/${lang}/dashboard/#auth=${authHash}`;
    }
  } catch {
    // ignore
  }
  return `http://localhost:${port}/${lang}/dashboard/`;
}

export default function DashboardPage() {
  const { lang } = useTranslation();
  const { isAuthenticated, user } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  // Protect: redirect unauthenticated users to sign-in
  // Auto-redirect to saved POS product if one exists
  useEffect(() => {
    if (!isAuthenticated) {
      setRedirecting(true);
      window.location.href = `/${lang}/signin`;
      return;
    }

    // Check if user has a saved POS product → auto-redirect
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.posProduct?.port) {
          setRedirecting(true);
          const authHash = btoa(stored);
          window.location.href = `http://localhost:${parsed.posProduct.port}/${lang}/dashboard/#auth=${authHash}`;
          return;
        }
      }
    } catch {
      // ignore — show product selector
    }
  }, [isAuthenticated, lang]);

  if (redirecting || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <main className="flex-1 pt-16">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-10">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              {user ? `Welcome, ${user.firstName}` : 'Dashboard'}
            </h2>
            <p className="text-gray-500 mt-2">Choose a product to get started.</p>
          </div>

          {/* POS product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POS_PRODUCTS.map((product) => (
              <a
                key={product.port}
                href={getProductLink(product.port, lang)}
                onClick={() => {
                  // Save chosen product so next time user auto-redirects
                  try {
                    const stored = localStorage.getItem(STORAGE_KEY);
                    if (stored) {
                      const parsed = JSON.parse(stored);
                      parsed.posProduct = { name: product.name, port: product.port };
                      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
                    }
                  } catch {
                    // ignore
                  }
                }}
                className={`block rounded-2xl border-2 p-6 transition-all ${product.color}`}
              >
                <div className="text-4xl mb-4">{product.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{product.description}</p>
              </a>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
