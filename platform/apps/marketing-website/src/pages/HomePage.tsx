import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { Footer } from '../components/Footer';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const SIGNUP_URL = 'http://localhost:3000/en/signin';

const benefits = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
    title: 'Save $500+/month',
    description: 'Replace 10+ separate subscriptions. One platform, one bill, one login for your entire team.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Setup in 2 Minutes',
    description: 'No complicated onboarding. Sign up, choose your business type, and start selling immediately.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Grow Revenue 35%',
    description: 'Our merchants see an average 35% revenue increase within 6 months using loyalty and marketing tools.',
  },
];

const tools = [
  { name: 'Point of Sale', icon: '💳', desc: '8 specialized POS systems for every business type' },
  { name: 'Loyalty Programs', icon: '💎', desc: 'Points, stamps, rewards to keep customers coming back' },
  { name: 'Staff Scheduling', icon: '📊', desc: 'Drag-and-drop shifts, time tracking, payroll exports' },
  { name: 'Queue Management', icon: '📋', desc: 'Digital waitlists with SMS notifications' },
  { name: 'Marketing Automation', icon: '📣', desc: 'Email campaigns, segmentation, automated workflows' },
  { name: 'Event Ticketing', icon: '🎪', desc: 'Create events, sell tickets, manage attendees' },
  { name: 'Memberships', icon: '🏅', desc: 'Subscription plans, member portals, auto-renewal' },
  { name: 'Appointments', icon: '📅', desc: 'Online booking, calendar sync, reminders' },
  { name: 'Real-Time Analytics', icon: '📈', desc: 'Live dashboards across all locations' },
];

const steps = [
  { step: '01', title: 'Create Your Account', description: 'Sign up with your email in under 60 seconds. No credit card needed.' },
  { step: '02', title: 'Choose Your Business', description: 'Select your business type and we auto-configure everything for you.' },
  { step: '03', title: 'Start Selling', description: 'Accept payments, manage customers, and grow your business from day one.' },
];

const testimonials = [
  {
    quote: 'Berhot replaced our POS, scheduling app, and loyalty program. We save over $600/month and everything just works together.',
    name: 'Sarah Al-Rashid',
    role: 'Owner, The Coffee House',
    avatar: 'S',
  },
  {
    quote: 'Setup took literally 3 minutes. My staff was trained in an hour. Best business decision we made this year.',
    name: 'Mohammed Khalil',
    role: 'Manager, Flame Grill Restaurant',
    avatar: 'M',
  },
  {
    quote: 'The loyalty program alone brought back 40% more repeat customers. The whole platform pays for itself 10x over.',
    name: 'Nora Hamdan',
    role: 'Founder, Bloom Boutique',
    avatar: 'N',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: '$29',
    period: '/month',
    description: 'Perfect for small businesses',
    features: ['3 products included', '1 location', '2 team members', 'Basic analytics', 'Email support'],
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$79',
    period: '/month',
    description: 'For growing businesses',
    features: ['All 23 products', 'Up to 5 locations', 'Unlimited team', 'Advanced analytics', 'Priority support', 'API access'],
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: ['Everything in Pro', 'Unlimited locations', 'Dedicated manager', '99.99% SLA', 'Custom development', 'On-premise option'],
    highlighted: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      <Hero />

      {/* ── Benefits / Why Switch ── */}
      <section id="features" className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-600/20 text-brand-400 border border-brand-500/30">
              Why Berhot
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              One platform to replace them all
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Stop juggling multiple apps and subscriptions. Berhot gives your business everything in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((b) => (
              <div key={b.title} className="bg-gray-900 rounded-2xl border border-gray-800 p-8 hover:border-brand-500/50 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center mb-5">
                  {b.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">{b.title}</h3>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tools Grid ── */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-600/20 text-purple-400 border border-purple-500/30">
              All-in-One
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              23 integrated tools. One subscription.
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tools.map((tool) => (
              <div key={tool.name} className="flex items-start gap-4 bg-gray-950/50 rounded-xl border border-gray-800 p-5 hover:border-gray-700 transition-colors">
                <span className="text-2xl flex-shrink-0 mt-0.5">{tool.icon}</span>
                <div>
                  <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
                  <p className="mt-1 text-xs text-gray-500 leading-relaxed">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 bg-gray-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-green-600/20 text-green-400 border border-green-500/30">
              Get Started
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              Up and running in 3 simple steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-brand-600/20 text-brand-400 flex items-center justify-center text-2xl font-bold mb-5">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{s.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a
              href={SIGNUP_URL}
              className="inline-flex items-center px-8 py-4 text-base font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
            >
              Create Your Free Account
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section id="testimonials" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-600/20 text-amber-400 border border-amber-500/30">
              Success Stories
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              Loved by business owners
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-950 rounded-2xl border border-gray-800 p-8">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed italic">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Preview ── */}
      <section id="pricing-preview" className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-600/20 text-brand-400 border border-brand-500/30">
              Simple Pricing
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              Start free. Scale as you grow.
            </h2>
            <p className="mt-3 text-gray-400">All plans include a 14-day free trial with full access.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 ${
                  plan.highlighted
                    ? 'border-brand-500 bg-gray-900 shadow-xl shadow-brand-500/10 scale-105 z-10'
                    : 'border-gray-800 bg-gray-900 hover:border-gray-700'
                } transition-all`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 bg-brand-600 text-white text-xs font-semibold rounded-full shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{plan.description}</p>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-sm text-gray-500">{plan.period}</span>
                </div>
                <a
                  href={SIGNUP_URL}
                  className={`mt-6 block w-full text-center px-6 py-3 text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5 ${
                    plan.highlighted
                      ? 'bg-brand-600 text-white hover:bg-brand-500 shadow-lg shadow-brand-600/25'
                      : 'bg-white text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
                </a>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                      <svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-24 bg-gradient-to-br from-brand-600 to-purple-700 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
            Ready to grow your business?
          </h2>
          <p className="mt-5 text-lg text-blue-100/80 max-w-2xl mx-auto">
            Join 10,000+ businesses already using Berhot. Start your 14-day free trial today -- no credit card required.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={SIGNUP_URL}
              className="inline-flex items-center justify-center px-10 py-4 text-base font-bold text-brand-700 bg-white hover:bg-gray-50 rounded-xl shadow-2xl transition-all hover:-translate-y-1"
            >
              Start Your Free Trial
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
            <a
              href="#"
              className="inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white border-2 border-white/30 hover:border-white/60 rounded-xl transition-all hover:-translate-y-0.5"
            >
              Watch 2-Min Demo
            </a>
          </div>
          <p className="mt-6 text-sm text-blue-200/60">
            No credit card required. Cancel anytime. Full access to all 23 products.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
