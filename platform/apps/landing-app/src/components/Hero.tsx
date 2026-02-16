export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white pt-24 sm:pt-32 pb-14 sm:pb-20">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-brand-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-brand-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 bg-brand-50 border border-brand-200 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs sm:text-sm font-medium text-brand-700">
              23 integrated services, one platform
            </span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center text-3xl xs:text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
          Run your entire
          <br />
          <span className="text-brand-600">business</span> with
          <br />
          one platform
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-center text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          From point-of-sale to scheduling, loyalty to analytics -- Berhot gives you
          every tool you need to launch, manage, and grow your business.
        </p>

        {/* CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-4 sm:px-0">
          <a
            href="#get-started"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-lg shadow-red-600/25 transition-all hover:shadow-xl hover:shadow-red-600/30 hover:-translate-y-0.5"
          >
            Get Started Free
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
          <a
            href="#contact"
            className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-semibold text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 rounded-xl transition-all hover:-translate-y-0.5"
          >
            Contact Sales
          </a>
        </div>

        {/* Stats */}
        <div className="mt-14 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-3xl mx-auto">
          {[
            { value: '10,000+', label: 'Businesses' },
            { value: '23', label: 'Services' },
            { value: '99.9%', label: 'Uptime' },
            { value: '50+', label: 'Countries' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl sm:text-4xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="mt-1 text-xs sm:text-sm font-medium text-gray-500">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
