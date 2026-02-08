import { useEffect, useState } from 'react';
import { useTranslation } from '@berhot/i18n';
import { useAuth } from '../lib/auth-context';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

const STORAGE_KEY = 'berhot_auth';
const POS_PRODUCTS_KEY = 'berhot_pos_products'; // per-user map: { "email": { name, port } }

const POS_PRODUCTS = [
  {
    name: 'Restaurant POS',
    description: 'Full-service & quick-service restaurants',
    icon: '🍽️',
    port: 3001,
    color: 'bg-orange-50 border-orange-200 hover:border-orange-400 hover:shadow-lg',
  },
  {
    name: 'Cafe POS',
    description: 'Coffee shops & bakeries',
    icon: '☕',
    port: 3002,
    color: 'bg-amber-50 border-amber-200 hover:border-amber-400 hover:shadow-lg',
  },
  {
    name: 'Retail POS',
    description: 'Shops & general retail',
    icon: '🛒',
    port: 3003,
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400 hover:shadow-lg',
  },
  {
    name: 'Appointment POS',
    description: 'Salons, clinics & services',
    icon: '📅',
    port: 3004,
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400 hover:shadow-lg',
  },
];

function getSavedPosProductForUser(email: string): { name: string; port: number } | null {
  try {
    const raw = localStorage.getItem(POS_PRODUCTS_KEY);
    if (raw) {
      const all = JSON.parse(raw);
      if (all[email]) return all[email];
    }
  } catch { /* ignore */ }
  return null;
}

function savePosProductForUser(email: string, posProduct: { name: string; port: number }) {
  try {
    const raw = localStorage.getItem(POS_PRODUCTS_KEY);
    const all = raw ? JSON.parse(raw) : {};
    all[email] = posProduct;
    localStorage.setItem(POS_PRODUCTS_KEY, JSON.stringify(all));

    // Also save inside berhot_auth for cross-origin handoff
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.posProduct = posProduct;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }
  } catch { /* ignore */ }
}

/** Build product link with auth hash for cross-origin handoff */
function getProductLink(port: number, lang: string, email: string): string {
  try {
    // Inject posProduct into auth before encoding
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.posProduct = { name: 'POS', port };
      const authHash = btoa(JSON.stringify(parsed));
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
    if (!isAuthenticated || !user) {
      setRedirecting(true);
      window.location.href = `/${lang}/signin`;
      return;
    }

    // Check if this user has a saved POS product → auto-redirect
    const savedProduct = getSavedPosProductForUser(user.email);
    if (savedProduct) {
      setRedirecting(true);
      // Ensure posProduct is in berhot_auth for cross-origin handoff
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          parsed.posProduct = savedProduct;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        } catch { /* ignore */ }
        const authHash = btoa(localStorage.getItem(STORAGE_KEY)!);
        window.location.href = `http://localhost:${savedProduct.port}/${lang}/dashboard/#auth=${authHash}`;
      } else {
        window.location.href = `http://localhost:${savedProduct.port}/${lang}/dashboard/`;
      }
      return;
    }
  }, [isAuthenticated, user, lang]);

  if (redirecting || !isAuthenticated || !user) {
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
              Welcome, {user.firstName}
            </h2>
            <p className="text-gray-500 mt-2">Choose a product to get started.</p>
          </div>

          {/* POS product grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {POS_PRODUCTS.map((product) => (
              <a
                key={product.name}
                href={getProductLink(product.port, lang, user.email)}
                onClick={() => {
                  // Save chosen product for THIS user
                  savePosProductForUser(user.email, { name: product.name, port: product.port });
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
