import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Product {
  icon: string;
  title: string;
  description: string;
  href: string;
  features: string[];
}

interface Category {
  name: string;
  tagline: string;
  color: string;
  bgColor: string;
  borderColor: string;
  products: Product[];
}

const categories: Category[] = [
  {
    name: 'Commerce',
    tagline: 'Point-of-sale solutions built for every business type',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    products: [
      {
        icon: '🍽️',
        title: 'Restaurant POS',
        description: 'Full-service restaurant management with table layouts, kitchen display system, and split billing.',
        href: 'http://localhost:4001',
        features: ['Table management', 'Kitchen display', 'Split billing', 'Course firing'],
      },
      {
        icon: '☕',
        title: 'Cafe POS',
        description: 'Quick-service point-of-sale optimized for high-volume cafes, bakeries, and juice bars.',
        href: 'http://localhost:4002',
        features: ['Quick order', 'Modifiers', 'Customer display', 'Mobile ordering'],
      },
      {
        icon: '🛍️',
        title: 'Retail POS',
        description: 'Full retail operations with inventory management, barcode scanning, and e-commerce integration.',
        href: 'http://localhost:4003',
        features: ['Inventory tracking', 'Barcode scanning', 'Multi-location', 'E-commerce sync'],
      },
      {
        icon: '🚚',
        title: 'Food Truck POS',
        description: 'Mobile food operations with portable POS.',
        href: '#',
        features: ['Mobile ordering', 'Portable hardware', 'GPS tracking', 'Quick payments'],
      },
      {
        icon: '🥬',
        title: 'Grocery POS',
        description: 'Grocery store management with inventory.',
        href: '#',
        features: ['Scale integration', 'Barcode scanning', 'Fresh produce management', 'Self-checkout'],
      },
      {
        icon: '🏪',
        title: 'Supermarket POS',
        description: 'Large-scale retail with multi-lane checkout.',
        href: '#',
        features: ['Multi-lane checkout', 'Warehouse management', 'Bulk pricing', 'Loyalty integration'],
      },
      {
        icon: '⚡',
        title: 'Quick Service POS',
        description: 'Fast ordering for cafeterias and home businesses.',
        href: '#',
        features: ['Fast ordering', 'Simple menu', 'Home delivery', 'Social media orders'],
      },
    ],
  },
  {
    name: 'Experience',
    tagline: 'Customer engagement tools that drive loyalty and retention',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    products: [
      {
        icon: '💎',
        title: 'Loyalty',
        description: 'Points-based loyalty programs, digital stamps, and reward tiers to keep customers coming back.',
        href: 'http://localhost:4005',
        features: ['Points & stamps', 'Reward tiers', 'Referral programs', 'Analytics'],
      },
      {
        icon: '📋',
        title: 'Queue Management',
        description: 'Digital waitlists with SMS notifications, estimated wait times, and real-time queue analytics.',
        href: 'http://localhost:4006',
        features: ['Digital waitlist', 'SMS alerts', 'Wait estimation', 'Queue analytics'],
      },
      {
        icon: '🏅',
        title: 'Memberships',
        description: 'Subscription plans, member portals, automatic renewals, and exclusive member benefits.',
        href: 'http://localhost:4009',
        features: ['Subscription plans', 'Member portal', 'Auto-renewal', 'Exclusive perks'],
      },
    ],
  },
  {
    name: 'Workforce',
    tagline: 'Team management and scheduling made effortless',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    products: [
      {
        icon: '📊',
        title: 'Shifts',
        description: 'Drag-and-drop employee scheduling, shift swaps, labor cost tracking, and availability management.',
        href: 'http://localhost:4008',
        features: ['Drag-and-drop scheduling', 'Shift swaps', 'Labor costs', 'Availability'],
      },
      {
        icon: '✅',
        title: 'Attendance',
        description: 'GPS-enabled clock in/out, break tracking, overtime alerts, and payroll-ready exports.',
        href: 'http://localhost:4011',
        features: ['GPS clock-in', 'Break tracking', 'Overtime alerts', 'Payroll export'],
      },
    ],
  },
  {
    name: 'Engagement',
    tagline: 'Marketing, events, and appointments to grow your business',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    products: [
      {
        icon: '📣',
        title: 'Marketing',
        description: 'Email campaigns, customer segmentation, automated workflows, and performance analytics.',
        href: 'http://localhost:4007',
        features: ['Email campaigns', 'Segmentation', 'Automations', 'Analytics'],
      },
      {
        icon: '📅',
        title: 'Appointments',
        description: 'Online booking pages, calendar management, automated reminders, and payment collection.',
        href: 'http://localhost:4004',
        features: ['Online booking', 'Calendar sync', 'Reminders', 'Payments'],
      },
      {
        icon: '🎪',
        title: 'Events',
        description: 'Event creation, ticketing, attendee management, check-in, and venue coordination.',
        href: 'http://localhost:4010',
        features: ['Ticketing', 'Check-in', 'Attendee management', 'Venue tools'],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ProductsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-3">
            Products
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
            23 products. One platform.
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Every tool your business needs, from commerce to workforce management,
            working together seamlessly.
          </p>
        </div>
      </section>

      {/* Categories */}
      {categories.map((category) => (
        <section key={category.name} className="py-20 even:bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Category header */}
            <div className="mb-12">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${category.bgColor} ${category.color} ${category.borderColor}`}
              >
                {category.name}
              </span>
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-gray-900">
                {category.tagline}
              </h2>
            </div>

            {/* Product cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {category.products.map((product) => (
                <a
                  key={product.title}
                  href={product.href}
                  className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg hover:border-brand-200 transition-all duration-200 hover:-translate-y-1"
                >
                  {/* Card top */}
                  <div className={`${category.bgColor} px-6 py-8`}>
                    <span className="text-4xl">{product.icon}</span>
                    <h3 className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">
                      {product.title}
                    </h3>
                  </div>

                  {/* Card body */}
                  <div className="px-6 py-6">
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {product.description}
                    </p>
                    <ul className="mt-4 space-y-2">
                      {product.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                          <svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex items-center text-sm font-medium text-brand-600">
                      Explore {product.title}
                      <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-brand-600 to-brand-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">
            See how it all works together
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Book a personalized demo and discover how Berhot can simplify your operations.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#demo"
              className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-brand-700 bg-white hover:bg-gray-50 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
            >
              Request a Demo
            </a>
            <a
              href="#get-started"
              className="inline-flex items-center px-8 py-3.5 text-base font-semibold text-white border-2 border-white/30 hover:border-white/60 rounded-xl transition-all hover:-translate-y-0.5"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
