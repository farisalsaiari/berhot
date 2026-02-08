import { StatCard, Card, Badge } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

interface UpcomingEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  venue: string;
  ticketsSold: number;
  totalTickets: number;
  status: 'upcoming' | 'on-sale' | 'sold-out';
}

const UPCOMING_EVENTS: UpcomingEvent[] = [
  { id: 'EV001', name: 'Tech Summit 2026', date: 'Feb 15, 2026', time: '9:00 AM - 6:00 PM', venue: 'Riyadh Convention Center', ticketsSold: 450, totalTickets: 500, status: 'on-sale' },
  { id: 'EV002', name: 'Annual Gala Dinner', date: 'Feb 22, 2026', time: '7:00 PM - 11:00 PM', venue: 'Four Seasons Ballroom', ticketsSold: 200, totalTickets: 200, status: 'sold-out' },
  { id: 'EV003', name: 'Startup Pitch Night', date: 'Mar 5, 2026', time: '6:00 PM - 9:00 PM', venue: 'Innovation Hub', ticketsSold: 85, totalTickets: 150, status: 'on-sale' },
  { id: 'EV004', name: 'Workshop: AI in Business', date: 'Mar 12, 2026', time: '10:00 AM - 4:00 PM', venue: 'Business District Center', ticketsSold: 20, totalTickets: 40, status: 'upcoming' },
];

const STATUS_BADGE: Record<string, { variant: BadgeVariant; label: string }> = {
  upcoming: { variant: 'gray', label: 'Upcoming' },
  'on-sale': { variant: 'green', label: 'On Sale' },
  'sold-out': { variant: 'red', label: 'Sold Out' },
};

export default function DashboardPage() {
  const totalTicketsSold = UPCOMING_EVENTS.reduce((s, e) => s + e.ticketsSold, 0);
  const totalRevenue = 284500;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Upcoming Events" value={UPCOMING_EVENTS.length} sub="Next 30 days" trend="neutral" />
        <StatCard label="Total Tickets Sold" value={totalTicketsSold} sub="Across all events" trend="up" />
        <StatCard label="Revenue" value={`SAR ${(totalRevenue / 1000).toFixed(1)}K`} sub="+22% vs last month" trend="up" />
        <StatCard label="Total Attendees" value={totalTicketsSold} sub="Registered guests" trend="up" />
      </div>

      {/* Upcoming Events Timeline */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-1">Upcoming Events</h2>
        <p className="text-xs text-gray-400 mb-5">Your next scheduled events</p>

        <div className="space-y-4">
          {UPCOMING_EVENTS.map((event, i) => {
            const pct = Math.round((event.ticketsSold / event.totalTickets) * 100);
            const cfg = STATUS_BADGE[event.status];
            return (
              <div key={event.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                {/* Date Badge */}
                <div className="shrink-0 w-14 h-14 bg-blue-600 rounded-xl flex flex-col items-center justify-center text-white">
                  <div className="text-xs font-medium leading-none">{event.date.split(' ')[0]}</div>
                  <div className="text-lg font-bold leading-none mt-0.5">{event.date.split(' ')[1].replace(',', '')}</div>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{event.name}</h3>
                    <Badge variant={cfg.variant}>{cfg.label}</Badge>
                  </div>
                  <div className="text-sm text-gray-500">{event.venue} &middot; {event.time}</div>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[200px]">
                      <div
                        className={`h-2 rounded-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-orange-500' : 'bg-blue-600'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{event.ticketsSold}/{event.totalTickets} tickets ({pct}%)</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-5">
        <Card>
          <div className="text-sm text-gray-500 mb-1">Avg Ticket Price</div>
          <div className="text-2xl font-bold text-gray-900">SAR 375</div>
          <div className="text-xs text-green-600 mt-1">+12% vs last quarter</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500 mb-1">Check-in Rate</div>
          <div className="text-2xl font-bold text-gray-900">87%</div>
          <div className="text-xs text-green-600 mt-1">Above 85% target</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500 mb-1">Repeat Attendees</div>
          <div className="text-2xl font-bold text-gray-900">34%</div>
          <div className="text-xs text-green-600 mt-1">+6% growth</div>
        </Card>
      </div>
    </div>
  );
}
