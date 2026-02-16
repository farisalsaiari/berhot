import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Footer } from '../components/Footer';

/* ------------------------------------------------------------------ */
/*  Product cards data                                                 */
/* ------------------------------------------------------------------ */

const products = [
  {
    icon: '🍽️',
    title: 'Restaurant POS',
    description: 'Full-service restaurant point-of-sale with table management, kitchen display, and split billing.',
    tag: 'Commerce',
    href: 'http://localhost:4001',
  },
  {
    icon: '☕',
    title: 'Cafe POS',
    description: 'Streamlined quick-service POS optimized for high-volume cafes and coffee shops.',
    tag: 'Commerce',
    href: 'http://localhost:4002',
  },
  {
    icon: '🛍️',
    title: 'Retail POS',
    description: 'Inventory management, barcode scanning, and multi-location retail operations.',
    tag: 'Commerce',
    href: 'http://localhost:4003',
  },
  {
    icon: '🚚',
    title: 'Food Truck POS',
    description: 'Mobile food operations with portable POS.',
    tag: 'Commerce',
    href: '#',
  },
  {
    icon: '🥬',
    title: 'Grocery POS',
    description: 'Grocery store management with inventory.',
    tag: 'Commerce',
    href: '#',
  },
  {
    icon: '🏪',
    title: 'Supermarket POS',
    description: 'Large-scale retail with multi-lane checkout.',
    tag: 'Commerce',
    href: '#',
  },
  {
    icon: '⚡',
    title: 'Quick Service POS',
    description: 'Fast ordering for cafeterias and home businesses.',
    tag: 'Commerce',
    href: '#',
  },
  {
    icon: '📅',
    title: 'Appointments',
    description: 'Online booking, calendar management, and automated reminders for service businesses.',
    tag: 'Platform',
    href: 'http://localhost:4004',
  },
  {
    icon: '💎',
    title: 'Loyalty',
    description: 'Points programs, rewards, and customer engagement to drive repeat visits.',
    tag: 'Experience',
    href: 'http://localhost:4005',
  },
  {
    icon: '📋',
    title: 'Queue Management',
    description: 'Digital waitlists, SMS notifications, and real-time queue analytics.',
    tag: 'Experience',
    href: 'http://localhost:4006',
  },
  {
    icon: '📣',
    title: 'Marketing',
    description: 'Email campaigns, customer segmentation, and automated marketing workflows.',
    tag: 'Intelligence',
    href: 'http://localhost:4007',
  },
  {
    icon: '🎪',
    title: 'Events',
    description: 'Event creation, ticketing, attendee management, and venue coordination.',
    tag: 'Platform',
    href: 'http://localhost:4010',
  },
  {
    icon: '🏅',
    title: 'Memberships',
    description: 'Subscription plans, member portals, and recurring billing management.',
    tag: 'Experience',
    href: 'http://localhost:4009',
  },
  {
    icon: '📊',
    title: 'Shifts',
    description: 'Employee scheduling, shift swaps, labor cost tracking, and availability management.',
    tag: 'Workforce',
    href: 'http://localhost:4008',
  },
  {
    icon: '✅',
    title: 'Attendance',
    description: 'Clock in/out, time tracking, overtime alerts, and payroll-ready reports.',
    tag: 'Workforce',
    href: 'http://localhost:4011',
  },
];

const tagColors: Record<string, string> = {
  Commerce: 'bg-blue-50 text-blue-700 border-blue-200',
  Experience: 'bg-purple-50 text-purple-700 border-purple-200',
  Workforce: 'bg-amber-50 text-amber-700 border-amber-200',
  Intelligence: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Platform: 'bg-gray-50 text-gray-700 border-gray-200',
};

/* ------------------------------------------------------------------ */
/*  Features data                                                      */
/* ------------------------------------------------------------------ */

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    title: 'Multi-Tenant Architecture',
    description: 'Run multiple businesses from one account. Shared data, separate operations, unified billing.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: 'Real-Time Analytics',
    description: 'Live dashboards with sales, customer, and operational insights across all your locations.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    title: 'Enterprise Security',
    description: 'SOC 2 Type II certified. End-to-end encryption, role-based access, and audit logging.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Global Scale',
    description: 'Multi-currency, multi-language support. Edge-deployed in 50+ countries for low latency.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    title: 'API-First Design',
    description: 'RESTful APIs and webhooks for every service. Build custom integrations with full documentation.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    title: '24/7 Support',
    description: 'Dedicated support team available around the clock. Average response time under 5 minutes.',
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />

      {/* ── Products Section ── */}
      <section id="products" className="py-14 sm:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-xs sm:text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2 sm:mb-3">
              Product Suite
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">
              Everything you need, all in one place
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
              From commerce to workforce management, Berhot provides 23 integrated
              applications that work seamlessly together.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {products.map((product) => (
              <a
                key={product.title}
                href={product.href}
                className="group relative bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 hover:shadow-lg hover:border-brand-200 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <span className="text-2xl sm:text-3xl">{product.icon}</span>
                  <span
                    className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-medium border ${
                      tagColors[product.tag] || tagColors.Platform
                    }`}
                  >
                    {product.tag}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                  {product.title}
                </h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>
                <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm font-medium text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Learn more
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Section ── */}
      <section id="features" className="py-14 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <p className="text-xs sm:text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2 sm:mb-3">
              Why Berhot?
            </p>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-900">
              Built for scale. Designed for simplicity.
            </h2>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Enterprise-grade infrastructure meets intuitive design. Here is what sets
              Berhot apart.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 sm:mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-14 sm:py-24 bg-gradient-to-br from-brand-600 to-brand-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white">
            Ready to transform your business?
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-blue-100 max-w-2xl mx-auto">
            Join 10,000+ businesses already using Berhot to streamline operations,
            delight customers, and grow revenue.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
            <a
              href="#get-started"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-brand-700 bg-white hover:bg-gray-50 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
            >
              Start Free Trial
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="#demo"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white border-2 border-white/30 hover:border-white/60 rounded-xl transition-all hover:-translate-y-0.5"
            >
              Request a Demo
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
