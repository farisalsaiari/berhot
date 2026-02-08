import { useState } from 'react';

export function Hero() {
  const [email, setEmail] = useState('');

  return (
    <section className="relative overflow-hidden bg-gray-950 pt-32 pb-24">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-brand-600/20 via-purple-600/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Limited-time badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600/20 border border-brand-500/30 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-brand-300">
              Limited Offer: 14-Day Free Trial + 30% Off First 3 Months
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
          Stop losing money
          <br />
          on <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">outdated tools</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-center text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Berhot replaces 10+ business tools with one powerful platform.
          POS, loyalty, scheduling, marketing, analytics -- everything your business needs, starting at $29/month.
        </p>

        {/* Email signup */}
        <div className="mt-10 max-w-lg mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) {
                window.location.href = `http://localhost:3000/en/signin?email=${encodeURIComponent(email)}`;
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
            No credit card required. Cancel anytime. Setup takes 2 minutes.
          </p>
        </div>

        {/* Trust badges */}
        <div className="mt-16 flex flex-col items-center gap-6">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Trusted by 10,000+ businesses worldwide</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 max-w-2xl">
            {[
              { value: '10,000+', label: 'Active Businesses' },
              { value: '$2.4B+', label: 'Transactions Processed' },
              { value: '99.9%', label: 'Uptime Guarantee' },
              { value: '50+', label: 'Countries Served' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{stat.value}</div>
                <div className="mt-1 text-xs font-medium text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
