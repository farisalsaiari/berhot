'use client';

import { useEffect, useState } from 'react';

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
}

const STORAGE_KEY = 'berhot_auth';

const POS_PRODUCTS = [
  {
    name: 'Restaurant POS',
    description: 'Full-service & quick-service restaurants',
    icon: '🍽️',
    port: 4001,
    color: 'bg-orange-50 border-orange-200 hover:border-orange-400',
  },
  {
    name: 'Cafe POS',
    description: 'Coffee shops & bakeries',
    icon: '☕',
    port: 4002,
    color: 'bg-amber-50 border-amber-200 hover:border-amber-400',
  },
  {
    name: 'Retail POS',
    description: 'Shops & general retail',
    icon: '🛒',
    port: 4003,
    color: 'bg-blue-50 border-blue-200 hover:border-blue-400',
  },
  {
    name: 'Appointment POS',
    description: 'Salons, clinics & services',
    icon: '📅',
    port: 4004,
    color: 'bg-purple-50 border-purple-200 hover:border-purple-400',
  },
  {
    name: 'Food Truck POS',
    description: 'Mobile food trucks & carts',
    icon: '🚚',
    port: 4011,
    color: 'bg-red-50 border-red-200 hover:border-red-400',
  },
  {
    name: 'Grocery POS',
    description: 'Grocery stores & fresh markets',
    icon: '🥬',
    port: 4012,
    color: 'bg-green-50 border-green-200 hover:border-green-400',
  },
  {
    name: 'Supermarket POS',
    description: 'Large retail supermarkets',
    icon: '🏪',
    port: 4013,
    color: 'bg-teal-50 border-teal-200 hover:border-teal-400',
  },
  {
    name: 'Quick Service POS',
    description: 'Cafeterias, home businesses & more',
    icon: '⚡',
    port: 4014,
    color: 'bg-yellow-50 border-yellow-200 hover:border-yellow-400',
  },
];

/**
 * Parse auth data from URL hash.
 * Format: #auth=BASE64({accessToken, refreshToken, user})
 */
function parseAuthFromHash(): { accessToken: string; refreshToken: string; user: AuthUser } | null {
  try {
    const hash = window.location.hash;
    if (!hash || !hash.includes('auth=')) return null;
    const params = new URLSearchParams(hash.substring(1));
    const authData = params.get('auth');
    if (!authData) return null;
    const parsed = JSON.parse(atob(authData));
    if (parsed.user && parsed.accessToken) {
      // Clean up the URL hash
      window.history.replaceState(null, '', window.location.pathname);
      return parsed;
    }
  } catch {
    // ignore
  }
  return null;
}

export default function DashboardPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Try auth from URL hash (cross-origin handoff from port 3000)
    const hashAuth = parseAuthFromHash();
    if (hashAuth) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hashAuth));
      setUser(hashAuth.user);
      setLoading(false);
      return;
    }

    // 2. Try localStorage (returning user on port 3001)
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.user) {
          setUser(parsed.user);
          setLoading(false);
          return;
        }
      }
    } catch {
      // ignore
    }

    // 3. No valid auth — redirect to marketing site home (not sign-in)
    window.location.href = 'http://localhost:3000/';
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = 'http://localhost:3000/';
  };

  // Show nothing while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">Berhot</h1>

          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-gray-600">
                {user.firstName} {user.lastName}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-4"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h2 className="text-3xl font-bold tracking-tight">
            {user ? `Welcome, ${user.firstName}` : 'Dashboard'}
          </h2>
          <p className="text-gray-500 mt-2">Choose a product to get started.</p>
        </div>

        {/* POS product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {POS_PRODUCTS.map((product) => (
            <a
              key={product.port}
              href={`http://localhost:${product.port}/en/dashboard/`}
              className={`block rounded-2xl border-2 p-6 transition-all ${product.color}`}
            >
              <div className="text-4xl mb-4">{product.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{product.description}</p>
              <div className="mt-4 text-xs font-mono text-gray-400">
                localhost:{product.port}/en/dashboard/
              </div>
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}
