import { useState } from 'react';

const LANDING_URL = Number(window.location.port) >= 5000 ? 'http://localhost:5001' : 'http://localhost:3000';
const SIGNUP_URL = `${LANDING_URL}/en/signin`;

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const TRUST_STATS = [
  { value: '50K+', label: 'Guests Managed Monthly' },
  { value: '40%', label: 'Fewer No-Shows' },
  { value: '99.9%', label: 'Uptime Guarantee' },
  { value: '2 min', label: 'Setup Time' },
];

const FEATURES = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: 'Virtual Queue',
    description: 'Replace physical lines with a digital queue. Guests join from their phone and wait comfortably anywhere.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
    ),
    title: 'Smart Notifications',
    description: 'Automated SMS and WhatsApp alerts keep guests informed. Notify when their turn is approaching.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Display Board',
    description: 'Show real-time queue status on any screen or TV. Guests see their position and estimated wait.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
    title: 'Analytics & Insights',
    description: 'Track wait times, no-show rates, peak hours, and staff performance with real-time dashboards.',
  },
];

const SHOWCASE_ITEMS = [
  {
    title: 'Eliminate long lines',
    description: 'Customers join your virtual queue from a QR code, link, or walk-in kiosk. They wait wherever they want while you serve them in order.',
    icon: '🚶',
    color: 'brand',
  },
  {
    title: 'Minimize no-shows',
    description: 'Automated SMS reminders and real-time position updates keep guests engaged. See up to 40% reduction in no-shows.',
    icon: '📲',
    color: 'green',
  },
  {
    title: 'Capture customer data',
    description: 'Collect guest information, visit frequency, and preferences. Build customer profiles to personalize every experience.',
    icon: '📊',
    color: 'purple',
  },
  {
    title: 'Optimize staff allocation',
    description: 'Use historical data and real-time metrics to schedule the right number of staff at the right time.',
    icon: '👥',
    color: 'amber',
  },
];

const INDUSTRIES = [
  {
    key: 'restaurants',
    label: 'Restaurants',
    icon: '🍽️',
    description: 'Manage reservations and walk-ins from a single queue. Guests browse the menu while waiting and get notified when their table is ready.',
    features: ['Table-ready notifications', 'Party size management', 'Wait time estimates', 'Reservation integration'],
  },
  {
    key: 'retail',
    label: 'Retail',
    icon: '🛒',
    description: 'Create a seamless in-store experience. Customers join a virtual line for fitting rooms, consultations, or checkout during peak hours.',
    features: ['Service-type queues', 'Staff assignment', 'Customer appointments', 'Peak hour management'],
  },
  {
    key: 'healthcare',
    label: 'Healthcare',
    icon: '🏥',
    description: 'Reduce crowded waiting rooms. Patients check in remotely and wait in their car or nearby until their provider is ready.',
    features: ['HIPAA-compliant', 'Provider assignment', 'Remote check-in', 'Wait room capacity'],
  },
  {
    key: 'government',
    label: 'Government',
    icon: '🏛️',
    description: 'Modernize citizen services. Digital queues for DMV, permit offices, and service centers reduce frustration and increase throughput.',
    features: ['Multi-service queues', 'Ticket numbering', 'Multi-location support', 'Accessibility options'],
  },
  {
    key: 'salons',
    label: 'Salons & Spas',
    icon: '💇',
    description: 'Let clients join the waitlist online or walk in. Match them with the right stylist and send appointment reminders automatically.',
    features: ['Stylist matching', 'Service duration estimates', 'Recurring appointments', 'Online booking'],
  },
];

const STEPS = [
  { step: '01', title: 'Set Up Your Queue', description: 'Create your queue in under 2 minutes. Customize wait messages, capacity, and operating hours.' },
  { step: '02', title: 'Guests Join Virtually', description: 'Customers scan a QR code, click a link, or walk in. They get a real-time position update on their phone.' },
  { step: '03', title: 'Serve & Track', description: 'Call the next guest, mark as served, track no-shows. Get analytics on every interaction.' },
];

const INTEGRATIONS = [
  {
    title: 'Works with Any POS',
    description: 'Integrates seamlessly with all Berhot POS products or your existing point-of-sale system.',
    icon: '💳',
  },
  {
    title: 'Best-in-Class API',
    description: 'RESTful API and WebSocket support for real-time updates. Build custom integrations with ease.',
    icon: '🔌',
  },
  {
    title: 'SMS & WhatsApp',
    description: 'Built-in messaging with Twilio and WhatsApp Business. Notify guests on the channel they prefer.',
    icon: '💬',
  },
  {
    title: 'Custom Branding',
    description: 'White-label the guest experience. Your logo, colors, and domain on every touchpoint.',
    icon: '🎨',
  },
];

const TESTIMONIALS = [
  {
    quote: 'Our wait times dropped by 60% and customer complaints practically disappeared. The SMS notifications alone are worth it.',
    name: 'Ahmed Al-Dosari',
    role: 'Owner, Shawarma House',
    avatar: 'A',
  },
  {
    quote: 'We serve 200+ patients daily. Waitlist by Berhot eliminated our crowded lobby and made check-in effortless.',
    name: 'Dr. Layla Ibrahim',
    role: 'Clinic Director, MediCare Plus',
    avatar: 'L',
  },
  {
    quote: 'The display board feature is a game changer. Customers love seeing their position in real-time. Our no-show rate is nearly zero.',
    name: 'Faisal Nasser',
    role: 'GM, Pearl Shopping Mall',
    avatar: 'F',
  },
];

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'For small businesses getting started',
    features: ['1 queue', 'Up to 50 guests/day', 'SMS notifications', 'Basic analytics', 'Display board'],
    highlighted: false,
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For growing businesses',
    features: ['Unlimited queues', 'Unlimited guests', 'SMS + WhatsApp', 'Advanced analytics', 'Custom branding', 'API access', 'Priority support'],
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For large organizations',
    features: ['Everything in Pro', 'Multi-location', 'Dedicated manager', 'SLA guarantee', 'Custom integrations', 'On-premise option', 'HIPAA compliance'],
    highlighted: false,
  },
];

const SECURITY_BADGES = [
  { label: 'SOC 2', icon: '🔒' },
  { label: 'GDPR', icon: '🇪🇺' },
  { label: 'HIPAA', icon: '🏥' },
  { label: '99.9% Uptime', icon: '⚡' },
  { label: 'End-to-End Encryption', icon: '🔐' },
  { label: 'SSO / SAML 2.0', icon: '🔑' },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [activeIndustry, setActiveIndustry] = useState('restaurants');
  const [openShowcase, setOpenShowcase] = useState(0);

  const currentIndustry = INDUSTRIES.find((i) => i.key === activeIndustry) || INDUSTRIES[0];

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gray-950 pt-32 pb-24">
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-brand-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600/20 border border-brand-500/30 rounded-full backdrop-blur-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-brand-400">
                Queue Management & Virtual Waitlist
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-center text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
            Say goodbye to
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">long lines</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-center text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Virtual queues, smart notifications, and real-time display boards.
            Delight your customers and optimize your operations -- starting free.
          </p>

          {/* Email signup */}
          <div className="mt-10 max-w-lg mx-auto">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email) {
                  window.location.href = `${SIGNUP_URL}?email=${encodeURIComponent(email)}`;
                }
              }}
              className="flex gap-3"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your work email"
                className="flex-1 px-5 py-3.5 bg-white/10 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 backdrop-blur-sm"
              />
              <button
                type="submit"
                className="px-7 py-3.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/25 transition-all hover:shadow-xl hover:shadow-brand-500/30 hover:-translate-y-0.5 whitespace-nowrap"
              >
                Get Started Free
              </button>
            </form>
            <p className="mt-3 text-center text-xs text-gray-500">
              No credit card required. Free plan available forever.
            </p>
          </div>

          {/* Trust stats */}
          <div className="mt-16 flex flex-col items-center gap-6">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Trusted by businesses worldwide</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl">
              {TRUST_STATS.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="mt-1 text-xs font-medium text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem Statement ── */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
              The Problem
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              Long waits are killing your business
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Customers who wait too long don't come back. Every minute in line is a chance to lose them forever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: '75%', label: 'of customers won\'t return after a long wait experience' },
              { value: '30%', label: 'of walk-ins leave before being served (walkaway rate)' },
              { value: '$1.6T', label: 'lost annually worldwide due to poor customer experience' },
            ].map((stat) => (
              <div key={stat.label} className="bg-gray-950 rounded-2xl border border-gray-800 p-8 text-center hover:border-red-500/30 transition-colors">
                <div className="text-5xl font-extrabold text-white mb-3">{stat.value}</div>
                <p className="text-sm text-gray-400 leading-relaxed">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ── */}
      <section id="features" className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-600/20 text-brand-400 border border-brand-500/30">
              Features
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              Everything you need to manage queues
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              A complete queue management platform built for modern businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-gray-900 rounded-2xl border border-gray-800 p-8 hover:border-brand-500/50 transition-colors">
                <div className="w-14 h-14 rounded-xl bg-brand-600/20 text-brand-400 flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-xl font-semibold text-white">{f.title}</h3>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature Showcase / Accordion ── */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-600/20 text-purple-400 border border-purple-500/30">
              How It Helps
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              Transform your customer experience
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Accordion */}
            <div className="space-y-4">
              {SHOWCASE_ITEMS.map((item, i) => (
                <button
                  key={item.title}
                  onClick={() => setOpenShowcase(i)}
                  className={`w-full text-left rounded-2xl border p-6 transition-all ${
                    openShowcase === i
                      ? 'border-brand-500/50 bg-gray-950'
                      : 'border-gray-800 bg-gray-950/50 hover:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl flex-shrink-0">{item.icon}</span>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                      {openShowcase === i && (
                        <p className="mt-2 text-sm text-gray-400 leading-relaxed">{item.description}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Visual preview */}
            <div className="hidden md:flex items-center justify-center rounded-2xl border border-gray-800 bg-gray-950 p-10">
              <div className="text-center space-y-6">
                <span className="text-7xl">{SHOWCASE_ITEMS[openShowcase].icon}</span>
                <h3 className="text-2xl font-bold text-white">{SHOWCASE_ITEMS[openShowcase].title}</h3>
                <p className="text-gray-400 max-w-sm mx-auto leading-relaxed">{SHOWCASE_ITEMS[openShowcase].description}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Industry Tabs ── */}
      <section id="industries" className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-green-600/20 text-green-400 border border-green-500/30">
              Industries
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              Built for every industry
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              From restaurants to hospitals, our queue management adapts to your specific needs.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {INDUSTRIES.map((ind) => (
              <button
                key={ind.key}
                onClick={() => setActiveIndustry(ind.key)}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  activeIndustry === ind.key
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/25'
                    : 'bg-gray-900 text-gray-400 border border-gray-800 hover:border-gray-700 hover:text-white'
                }`}
              >
                <span>{ind.icon}</span>
                {ind.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-10">
            <div className="grid md:grid-cols-2 gap-10">
              <div>
                <span className="text-5xl mb-6 block">{currentIndustry.icon}</span>
                <h3 className="text-2xl font-bold text-white">{currentIndustry.label}</h3>
                <p className="mt-4 text-gray-400 leading-relaxed">{currentIndustry.description}</p>
                <a
                  href={SIGNUP_URL}
                  className="mt-6 inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/25 transition-all hover:-translate-y-0.5"
                >
                  Try for {currentIndustry.label}
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Key Features</h4>
                {currentIndustry.features.map((feat) => (
                  <div key={feat} className="flex items-center gap-3 text-sm text-gray-300">
                    <svg className="w-5 h-5 text-brand-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feat}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-24 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-600/20 text-brand-400 border border-brand-500/30">
              Get Started
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              Up and running in 3 simple steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((s) => (
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

      {/* ── Integrations / Bento Grid ── */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-purple-600/20 text-purple-400 border border-purple-500/30">
              Integrations
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              Plays well with your stack
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Connect with your existing tools or use our API to build custom workflows.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {INTEGRATIONS.map((item) => (
              <div key={item.title} className="bg-gray-900 rounded-2xl border border-gray-800 p-8 hover:border-purple-500/30 transition-colors text-center">
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm text-gray-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-600/20 text-amber-400 border border-amber-500/30">
              Success Stories
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              Loved by businesses everywhere
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-gray-950 rounded-2xl border border-gray-800 p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-300 leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
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

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-brand-600/20 text-brand-400 border border-brand-500/30">
              Simple Pricing
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white">
              Start free. Scale as you grow.
            </h2>
            <p className="mt-3 text-gray-400">Free plan available forever. No credit card required.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {PRICING.map((plan) => (
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
                  {plan.price === 'Custom' ? 'Contact Sales' : plan.price === '$0' ? 'Start Free' : 'Start Free Trial'}
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

      {/* ── Security Badges ── */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-8">
            Enterprise-grade security & compliance
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {SECURITY_BADGES.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 px-5 py-3 bg-gray-950 rounded-xl border border-gray-800">
                <span className="text-xl">{badge.icon}</span>
                <span className="text-sm font-medium text-gray-300">{badge.label}</span>
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
            There's nothing to lose but the wait
          </h2>
          <p className="mt-5 text-lg text-blue-100/80 max-w-2xl mx-auto">
            Join thousands of businesses that have eliminated long lines. Start your free plan today -- no credit card required.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={SIGNUP_URL}
              className="inline-flex items-center justify-center px-10 py-4 text-base font-bold text-brand-700 bg-white hover:bg-gray-50 rounded-xl shadow-2xl transition-all hover:-translate-y-1"
            >
              Start Free Plan
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
            Free forever plan available. Upgrade anytime.
          </p>
        </div>
      </section>
    </>
  );
}
