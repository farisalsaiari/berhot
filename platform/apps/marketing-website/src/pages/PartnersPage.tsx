import { useState, FormEvent } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

/* ------------------------------------------------------------------ */
/*  SVG Icons                                                          */
/* ------------------------------------------------------------------ */

function GearIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );
}

function HeadsetIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );
}

function MegaphoneIcon() {
  return (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Perks data                                                         */
/* ------------------------------------------------------------------ */

const perks = [
  {
    icon: <GearIcon />,
    title: 'Fast-growing innovative product',
    description:
      'Berhot products are ideal for tech partnerships, offering speed, sophistication and cutting-edge product innovation.',
  },
  {
    icon: <PeopleIcon />,
    title: 'Expanded customer base',
    description:
      'Get featured and connect with more retailers looking for seamless solutions.',
  },
  {
    icon: <ChartIcon />,
    title: 'Unmatched revenue share',
    description:
      'Benefit from some of the highest commission opportunities in the industry.',
  },
  {
    icon: <HeadsetIcon />,
    title: 'World-class support & resources',
    description:
      'Get help from a partner manager. Benefit from in-depth training and 24/7 tech support.',
  },
  {
    icon: <MegaphoneIcon />,
    title: 'Quicker growth with marketing',
    description:
      'Expand your reach with co-marketing, newsletter features, and a partner marketing toolkit.',
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PartnersPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [partnerType, setPartnerType] = useState<'referral' | 'integration' | ''>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!fullName || !email || !company || !partnerType) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/partners/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, company, phone, partnerType }),
      });

      if (!res.ok) throw new Error('Request failed');

      setSuccess(true);
      setFullName('');
      setEmail('');
      setCompany('');
      setPhone('');
      setPartnerType('');
    } catch {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* ── Section 1: Hero ── */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
            Berhot Partner Program
          </span>
          <h1 className="mt-6 text-4xl sm:text-5xl font-bold text-gray-900">
            Join our partner ecosystem to fuel your growth
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Berhot powers businesses worldwide with commerce solutions, making it
            the ideal partner for earning commissions, expanding your customer
            base, and entering new markets.
          </p>
          <div className="mt-10">
            <a
              href="#become-a-partner"
              onClick={(e) => {
                e.preventDefault();
                document
                  .getElementById('become-a-partner')
                  ?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-full shadow-lg transition-all hover:-translate-y-0.5"
            >
              Become a partner
            </a>
          </div>
        </div>
      </section>

      {/* ── Section 2: Partner Types ── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Choose the partner program perfectly tailored to you
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 1: Referral */}
            <div className="rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-emerald-400 to-emerald-600 h-48 rounded-t-2xl" />
              <div className="bg-gray-900 rounded-b-2xl p-8">
                <h3 className="text-xl font-semibold text-white">
                  Refer businesses to Berhot
                </h3>
                <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                  Promote Berhot's commerce platform to your audience and get
                  rewarded for every new user you bring on board.
                </p>
                <a
                  href="#become-a-partner"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById('become-a-partner')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-6 inline-flex items-center text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Learn more &gt;
                </a>
              </div>
            </div>

            {/* Card 2: Integration */}
            <div className="rounded-2xl overflow-hidden">
              <div className="bg-gradient-to-br from-blue-400 to-indigo-600 h-48 rounded-t-2xl" />
              <div className="bg-gray-900 rounded-b-2xl p-8">
                <h3 className="text-xl font-semibold text-white">
                  Build an integration with Berhot
                </h3>
                <p className="mt-3 text-gray-400 text-sm leading-relaxed">
                  Expand your reach to thousands of businesses by developing
                  solutions that integrate with Berhot's commerce platform.
                </p>
                <a
                  href="#become-a-partner"
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById('become-a-partner')
                      ?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-6 inline-flex items-center text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
                >
                  Learn more &gt;
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Perks ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Perks that power your growth
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              A global network of partners and world-class resources are just the
              beginning. With Berhot, partnerships shift into high gear:
            </p>
          </div>

          {/* First row: 3 items */}
          <div className="grid md:grid-cols-3 gap-8">
            {perks.slice(0, 3).map((perk) => (
              <div key={perk.title} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  {perk.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {perk.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {perk.description}
                </p>
              </div>
            ))}
          </div>

          {/* Second row: 2 items */}
          <div className="grid md:grid-cols-2 gap-8 mt-8 max-w-3xl mx-auto">
            {perks.slice(3).map((perk) => (
              <div key={perk.title} className="text-center">
                <div className="w-14 h-14 mx-auto rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4">
                  {perk.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {perk.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {perk.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 4: Application Form ── */}
      <section id="become-a-partner" className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Become a Partner
            </h2>
          </div>

          {success && (
            <div className="mb-8 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-800">
              Application submitted successfully! We'll be in touch soon.
            </div>
          )}

          {error && (
            <div className="mb-8 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder="you@company.com"
              />
            </div>

            {/* Company */}
            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Company <span className="text-red-500">*</span>
              </label>
              <input
                id="company"
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                placeholder="Your company name"
              />
            </div>

            {/* Phone with Saudi +966 prefix */}
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Phone number
              </label>
              <div className="flex">
                <div className="flex items-center px-4 py-3 bg-gray-100 border border-r-0 border-gray-300 rounded-l-xl text-sm text-gray-600 whitespace-nowrap">
                  Saudi Arabia +966
                </div>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
                  placeholder="5XXXXXXXX"
                />
              </div>
            </div>

            {/* Partner type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Partner type <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="partnerType"
                    value="referral"
                    checked={partnerType === 'referral'}
                    onChange={() => setPartnerType('referral')}
                    className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-700">
                    Refer clients to Berhot
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="partnerType"
                    value="integration"
                    checked={partnerType === 'integration'}
                    onChange={() => setPartnerType('integration')}
                    className="w-4 h-4 text-brand-600 border-gray-300 focus:ring-brand-500"
                  />
                  <span className="text-sm text-gray-700">
                    Build an integration with Berhot
                  </span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-3.5 text-base font-semibold text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 rounded-full shadow-lg transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0"
            >
              {loading ? 'Submitting...' : 'Apply now'}
            </button>
          </form>
        </div>
      </section>

      {/* ── Section 5: Footer ── */}
      <Footer />
    </div>
  );
}
