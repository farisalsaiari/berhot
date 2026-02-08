import { useState } from 'react';
import { Card, Badge, Button, TabBar } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

type EventStatus = 'upcoming' | 'past' | 'draft';

interface Event {
  id: string;
  name: string;
  date: string;
  venue: string;
  ticketsSold: number;
  totalTickets: number;
  status: EventStatus;
  revenue: number;
  description: string;
}

const EVENTS: Event[] = [
  { id: 'EV001', name: 'Tech Summit 2026', date: 'Feb 15, 2026', venue: 'Riyadh Convention Center', ticketsSold: 450, totalTickets: 500, status: 'upcoming', revenue: 168750, description: 'Annual technology summit featuring industry leaders' },
  { id: 'EV002', name: 'Annual Gala Dinner', date: 'Feb 22, 2026', venue: 'Four Seasons Ballroom', ticketsSold: 200, totalTickets: 200, status: 'upcoming', revenue: 100000, description: 'Exclusive gala dinner with live entertainment' },
  { id: 'EV003', name: 'Startup Pitch Night', date: 'Mar 5, 2026', venue: 'Innovation Hub', ticketsSold: 85, totalTickets: 150, status: 'upcoming', revenue: 12750, description: 'Pitch competition for emerging startups' },
  { id: 'EV004', name: 'Workshop: AI in Business', date: 'Mar 12, 2026', venue: 'Business District Center', ticketsSold: 20, totalTickets: 40, status: 'draft', revenue: 0, description: 'Hands-on workshop on applying AI in business' },
  { id: 'EV005', name: 'Leadership Forum Q1', date: 'Jan 20, 2026', venue: 'Grand Hyatt', ticketsSold: 300, totalTickets: 300, status: 'past', revenue: 135000, description: 'Quarterly leadership and networking forum' },
  { id: 'EV006', name: 'New Year Celebration', date: 'Jan 1, 2026', venue: 'Ritz-Carlton', ticketsSold: 500, totalTickets: 500, status: 'past', revenue: 250000, description: 'New year celebration gala event' },
  { id: 'EV007', name: 'Product Launch Showcase', date: 'Dec 15, 2025', venue: 'Expo Center', ticketsSold: 180, totalTickets: 200, status: 'past', revenue: 54000, description: 'Product launch with demos and networking' },
  { id: 'EV008', name: 'Community Meetup Spring', date: 'Mar 20, 2026', venue: 'TBD', ticketsSold: 0, totalTickets: 100, status: 'draft', revenue: 0, description: 'Community meetup for spring season' },
];

const STATUS_BADGE: Record<EventStatus, { variant: BadgeVariant; label: string }> = {
  upcoming: { variant: 'green', label: 'Upcoming' },
  past: { variant: 'gray', label: 'Past' },
  draft: { variant: 'orange', label: 'Draft' },
};

const TABS = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'draft', label: 'Draft' },
];

export default function EventsPage() {
  const [activeTab, setActiveTab] = useState('upcoming');

  const filtered = EVENTS.filter((e) => e.status === activeTab);

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    count: EVENTS.filter((e) => e.status === t.key).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <TabBar tabs={tabsWithCounts} activeKey={activeTab} onChange={setActiveTab} />
        <Button variant="primary">+ Create Event</Button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {filtered.map((event) => {
          const pct = event.totalTickets > 0 ? Math.round((event.ticketsSold / event.totalTickets) * 100) : 0;
          const cfg = STATUS_BADGE[event.status];
          return (
            <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-gray-900">{event.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">{event.description}</p>
                </div>
                <Badge variant={cfg.variant}>{cfg.label}</Badge>
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-900">{event.date}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Venue</span>
                  <span className="text-gray-700">{event.venue}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tickets</span>
                  <span className="text-gray-700">{event.ticketsSold} / {event.totalTickets} ({pct}%)</span>
                </div>
                {event.status !== 'draft' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Revenue</span>
                    <span className="font-semibold text-green-700">SAR {event.revenue.toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                {event.status === 'upcoming' && (
                  <>
                    <Button variant="secondary" size="sm">Edit</Button>
                    <Button variant="primary" size="sm">View Attendees</Button>
                  </>
                )}
                {event.status === 'draft' && (
                  <>
                    <Button variant="primary" size="sm">Edit & Publish</Button>
                    <Button variant="ghost" size="sm">Preview</Button>
                  </>
                )}
                {event.status === 'past' && (
                  <Button variant="secondary" size="sm">View Report</Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No {activeTab} events</p>
          <p className="text-sm mt-1">Create a new event to get started</p>
        </div>
      )}
    </div>
  );
}
