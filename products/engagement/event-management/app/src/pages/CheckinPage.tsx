import { useState } from 'react';
import { StatCard, Card, Badge, Button, SearchInput } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

interface RecentCheckin {
  id: string;
  name: string;
  ticketType: string;
  time: string;
  method: 'qr' | 'manual' | 'name';
}

const RECENT_CHECKINS: RecentCheckin[] = [
  { id: 'CI001', name: 'Khalid Al-Rashid', ticketType: 'VIP Pass', time: '9:02 AM', method: 'qr' },
  { id: 'CI002', name: 'Sarah Al-Dosari', ticketType: 'General Admission', time: '9:05 AM', method: 'qr' },
  { id: 'CI003', name: 'Noura Al-Faisal', ticketType: 'Early Bird', time: '9:08 AM', method: 'manual' },
  { id: 'CI004', name: 'Fatima Hassan', ticketType: 'Standard', time: '9:12 AM', method: 'qr' },
  { id: 'CI005', name: 'Youssef Nasser', ticketType: 'VIP Pass', time: '9:15 AM', method: 'name' },
  { id: 'CI006', name: 'Ahmed Mansour', ticketType: 'General Admission', time: '9:18 AM', method: 'qr' },
  { id: 'CI007', name: 'Maha Al-Otaibi', ticketType: 'General Admission', time: '9:22 AM', method: 'qr' },
  { id: 'CI008', name: 'Badr Al-Sulaiman', ticketType: 'General Admission', time: '9:25 AM', method: 'manual' },
];

const METHOD_BADGE: Record<string, { variant: BadgeVariant; label: string }> = {
  qr: { variant: 'blue', label: 'QR Scan' },
  manual: { variant: 'orange', label: 'Manual' },
  name: { variant: 'gray', label: 'Name Search' },
};

export default function CheckinPage() {
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('Tech Summit 2026');

  const totalAttendees = 500;
  const checkedIn = RECENT_CHECKINS.length;
  const rate = Math.round((checkedIn / 30) * 100); // 30 min

  return (
    <div className="space-y-6">
      {/* Event Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Tech Summit 2026</option>
            <option>Annual Gala Dinner</option>
            <option>Startup Pitch Night</option>
          </select>
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live Check-in Mode
          </span>
        </div>
      </div>

      {/* Check-in Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Checked In" value={`${checkedIn} / ${totalAttendees}`} sub={`${((checkedIn / totalAttendees) * 100).toFixed(1)}% attendance`} trend="up" />
        <StatCard label="Remaining" value={totalAttendees - checkedIn} sub="Not yet checked in" trend="neutral" />
        <StatCard label="Current Rate" value={`${rate}/hr`} sub="Check-ins per hour" trend="up" />
        <StatCard label="Avg Check-in Time" value="12 sec" sub="Per attendee" trend="up" />
      </div>

      <div className="grid grid-cols-[1fr_360px] gap-6">
        {/* Left: Search and Manual Check-in */}
        <div className="space-y-6">
          {/* Search Attendee */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-1">Search Attendee</h2>
            <p className="text-xs text-gray-400 mb-4">Search by name, email, or ticket ID to check in manually</p>
            <SearchInput
              placeholder="Search by name, email, or ticket ID..."
              onSearch={setSearch}
              className="w-full"
            />

            {search && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Mohammed Al-Qahtani</div>
                    <div className="text-xs text-gray-400">mohammed@example.com &middot; General Admission</div>
                  </div>
                  <Button variant="primary" size="sm">Check In</Button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">Omar Bin Saeed</div>
                    <div className="text-xs text-gray-400">omar@example.com &middot; Premium Table</div>
                  </div>
                  <Button variant="primary" size="sm">Check In</Button>
                </div>
              </div>
            )}
          </Card>

          {/* QR Scanner Placeholder */}
          <Card>
            <h2 className="font-semibold text-gray-900 mb-1">QR Code Scanner</h2>
            <p className="text-xs text-gray-400 mb-4">Scan attendee QR codes for quick check-in</p>
            <div className="bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center py-16">
              <svg className="w-16 h-16 text-gray-300 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="3" height="3" /><rect x="18" y="14" width="3" height="3" /><rect x="14" y="18" width="3" height="3" /><rect x="18" y="18" width="3" height="3" />
              </svg>
              <p className="text-gray-400 font-medium">Camera feed will appear here</p>
              <p className="text-xs text-gray-300 mt-1">Connect a camera or use mobile device</p>
              <Button variant="secondary" size="sm" className="mt-4">Enable Camera</Button>
            </div>
          </Card>
        </div>

        {/* Right: Recent Check-ins */}
        <div>
          <Card className="sticky top-0">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-semibold text-gray-900">Recent Check-ins</h2>
                <p className="text-xs text-gray-400 mt-0.5">{RECENT_CHECKINS.length} checked in today</p>
              </div>
              <Badge variant="green">{checkedIn} total</Badge>
            </div>

            <div className="space-y-3">
              {RECENT_CHECKINS.map((checkin) => {
                const methodCfg = METHOD_BADGE[checkin.method];
                return (
                  <div key={checkin.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <div className="font-medium text-gray-900 text-sm">{checkin.name}</div>
                      <div className="text-xs text-gray-400">{checkin.ticketType}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant={methodCfg.variant}>{methodCfg.label}</Badge>
                      <div className="text-xs text-gray-400 mt-1">{checkin.time}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
