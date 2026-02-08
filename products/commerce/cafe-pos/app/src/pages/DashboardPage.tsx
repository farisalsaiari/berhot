export default function DashboardPage() {
  const today = new Date();
  const dayNum = today.getDate();
  const monthShort = today.toLocaleString('en', { month: 'short' });
  const prevDay = new Date(today);
  prevDay.setDate(prevDay.getDate() - 1);
  const prevDayStr = `${prevDay.toLocaleString('en', { weekday: 'short' })}, ${prevDay.getDate()} ${prevDay.toLocaleString('en', { month: 'short' })} ${prevDay.getFullYear()}`;

  // Hourly labels
  const hours = ['8 am', '9 am', '10 am', '11 am', '12 pm', '1 pm', '2 pm'];

  return (
    <div className="flex flex-col lg:flex-row">
      {/* Main content area */}
      <div className="flex-1 min-w-0">
        {/* Prompt bar */}
        <div className="px-4 md:px-8 pt-6 pb-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl">
            <span className="text-sm text-gray-400 flex-1">How do I add someone to my team?</span>
            <button className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-200 transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
          </div>
        </div>

        {/* Performance section */}
        <div className="px-4 md:px-8 pb-6">
          <div className="bg-white border border-gray-200 rounded-xl p-5 md:p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Performance</h2>

            {/* Filter chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold text-gray-900">{dayNum} {monthShort}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <span className="text-gray-500">vs</span>
                <span className="font-semibold text-gray-900">Prior to day</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                <span className="text-gray-500">Bills</span>
                <span className="font-semibold text-gray-900">Closed</span>
              </div>
            </div>

            {/* Net sales */}
            <div className="mb-6">
              <div className="text-sm text-gray-500 mb-1">Net sales</div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">US$0.00</div>
              <div className="flex items-center gap-1 mt-1">
                <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5H7z" /></svg>
                <span className="text-sm text-gray-400 font-medium">N/A</span>
              </div>
            </div>

            {/* Chart area */}
            <div className="mb-6">
              <div className="h-32 md:h-44 flex items-center justify-center text-gray-300 text-sm border-b border-gray-100">
                No data available for timeframe selected
              </div>
            </div>

            {/* Chart legend */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-600 rounded-sm" />
                <span className="text-xs text-gray-500">Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 rounded-sm" />
                <span className="text-xs text-gray-500">{prevDayStr}</span>
              </div>
            </div>

            {/* Time labels */}
            <div className="flex justify-between text-xs text-gray-400 mb-8 overflow-x-auto">
              {hours.map((h) => (
                <span key={h} className="shrink-0">{h}</span>
              ))}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Gross sales</div>
                <div className="text-xl font-bold text-gray-900">US$0.00</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5H7z" /></svg>
                  <span className="text-xs text-gray-400 font-medium">N/A</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Transactions</div>
                <div className="text-xl font-bold text-gray-900">0</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5H7z" /></svg>
                  <span className="text-xs text-gray-400 font-medium">N/A</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Labour % of net sales</div>
                <div className="text-xl font-bold text-gray-900">0.00%</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5H7z" /></svg>
                  <span className="text-xs text-gray-400 font-medium">N/A</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Average sale</div>
                <div className="text-xl font-bold text-gray-900">US$0.00</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5H7z" /></svg>
                  <span className="text-xs text-gray-400 font-medium">N/A</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Comps & discounts</div>
                <div className="text-xl font-bold text-gray-900">US$0.00</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5H7z" /></svg>
                  <span className="text-xs text-gray-400 font-medium">N/A</span>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">Tips</div>
                <div className="text-xl font-bold text-gray-900">US$0.00</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5H7z" /></svg>
                  <span className="text-xs text-gray-400 font-medium">N/A</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-full lg:w-[280px] xl:w-[300px] shrink-0 px-4 md:px-8 lg:px-0 lg:pr-6 pb-6 lg:pt-6">
        {/* Banking card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4">
          <h3 className="font-bold text-gray-900 mb-3">Banking</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Total balance</span>
            <span className="text-sm font-semibold text-gray-900">$0.00</span>
          </div>
        </div>

        {/* Quick actions card */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="font-bold text-gray-900 mb-3">Quick actions</h3>
          <div className="space-y-0">
            <button className="w-full text-left py-2.5 text-sm text-gray-700 hover:text-gray-900 transition-colors border-b border-gray-100 last:border-0">
              Take a payment
            </button>
            <button className="w-full text-left py-2.5 text-sm text-gray-700 hover:text-gray-900 transition-colors border-b border-gray-100 last:border-0">
              Edit a menu
            </button>
            <button className="w-full text-left py-2.5 text-sm text-gray-700 hover:text-gray-900 transition-colors">
              Add an item
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
