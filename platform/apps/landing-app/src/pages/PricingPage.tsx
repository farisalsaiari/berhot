import { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Tier {
  name: string;
  price: { monthly: string; yearly: string };
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
  badge?: string;
}

const tiers: Tier[] = [
  {
    name: 'Starter',
    price: { monthly: '$29', yearly: '$24' },
    description: 'Perfect for small businesses just getting started with Berhot.',
    features: [
      'Up to 3 products included',
      '1 location',
      '2 team members',
      'Basic analytics',
      'Email support',
      'Community access',
    ],
    cta: 'Start Free Trial',
    highlighted: false,
  },
  {
    name: 'Professional',
    price: { monthly: '$79', yearly: '$66' },
    description: 'For growing businesses that need the full power of the platform.',
    features: [
      'All 23 products included',
      'Up to 5 locations',
      'Unlimited team members',
      'Advanced analytics & reports',
      'Priority support (chat & phone)',
      'API access',
      'Custom integrations',
      'White-label options',
    ],
    cta: 'Start Free Trial',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    price: { monthly: 'Custom', yearly: 'Custom' },
    description: 'For large organizations with custom requirements and dedicated support.',
    features: [
      'All 23 products included',
      'Unlimited locations',
      'Unlimited team members',
      'Custom analytics & BI',
      'Dedicated account manager',
      'SLA guarantee (99.99%)',
      'Custom development',
      'On-premise deployment option',
      'SSO & advanced security',
      'Training & onboarding',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const faqs = [
  {
    q: 'Can I switch plans at any time?',
    a: 'Yes. You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.',
  },
  {
    q: 'Is there a free trial?',
    a: 'All paid plans include a 14-day free trial with full access to every feature. No credit card required.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, bank transfers, and invoicing for Enterprise customers.',
  },
  {
    q: 'Can I add more locations later?',
    a: 'Absolutely. You can add additional locations at any time from your dashboard. Each additional location is billed at a flat monthly rate.',
  },
  {
    q: 'Do you offer discounts for non-profits?',
    a: 'Yes, we offer special pricing for registered non-profit organizations. Contact our sales team to learn more.',
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs sm:text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2 sm:mb-3">
            Pricing
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-gray-900">
            Simple, transparent pricing
          </h1>
          <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>

          {/* Billing toggle */}
          <div className="mt-8 sm:mt-10 inline-flex items-center gap-2 sm:gap-3 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                !annual
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 sm:px-5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all ${
                annual
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Annual
              <span className="ml-1.5 sm:ml-2 inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-700">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-16 sm:pb-24 -mt-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-start">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-xl sm:rounded-2xl border p-5 sm:p-8 transition-shadow ${
                  tier.highlighted
                    ? 'border-brand-500 shadow-xl shadow-brand-500/10 md:scale-105 bg-white z-10'
                    : 'border-gray-200 bg-white hover:shadow-lg'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3.5 sm:-top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 sm:px-4 py-0.5 sm:py-1 bg-brand-600 text-white text-[10px] sm:text-xs font-semibold rounded-full shadow-lg">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <h3 className="text-base sm:text-lg font-semibold text-gray-900">{tier.name}</h3>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">{tier.description}</p>

                <div className="mt-4 sm:mt-6 flex items-baseline gap-1">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">
                    {annual ? tier.price.yearly : tier.price.monthly}
                  </span>
                  {tier.price.monthly !== 'Custom' && (
                    <span className="text-xs sm:text-sm text-gray-500">/month</span>
                  )}
                </div>

                {annual && tier.price.monthly !== 'Custom' && (
                  <p className="mt-1 text-[10px] sm:text-xs text-gray-400">
                    billed annually
                  </p>
                )}

                <a
                  href="#get-started"
                  className={`mt-6 sm:mt-8 block w-full text-center px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold rounded-xl transition-all hover:-translate-y-0.5 ${
                    tier.highlighted
                      ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-600/25'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {tier.cta}
                </a>

                <ul className="mt-6 sm:mt-8 space-y-2.5 sm:space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-gray-700">
                      <svg
                        className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 ${
                          tier.highlighted ? 'text-brand-500' : 'text-gray-400'
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-24 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Frequently asked questions
            </h2>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-gray-600">
              Everything you need to know about our pricing.
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
              >
                <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                  {faq.q}
                </h3>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 sm:py-20 bg-gradient-to-br from-brand-600 to-brand-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Start your 14-day free trial
          </h2>
          <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-blue-100">
            No credit card required. Full access to all features. Cancel anytime.
          </p>
          <div className="mt-6 sm:mt-8">
            <a
              href="#get-started"
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-brand-700 bg-white hover:bg-gray-50 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
            >
              Get Started Free
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
