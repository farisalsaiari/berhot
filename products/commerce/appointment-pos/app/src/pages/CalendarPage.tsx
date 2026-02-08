import { useState } from 'react';
import { StatCard, Card, Badge, Button } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

interface Appointment {
  id: number;
  client: string;
  service: string;
  staffMember: string;
  time: string;
  duration: number; // minutes
  category: 'haircut' | 'color' | 'treatment' | 'massage' | 'nails';
}

const STAFF_MEMBERS = ['Ahmed', 'Sara', 'Omar', 'Nora', 'Khalid'];

const CATEGORY_COLORS: Record<Appointment['category'], { bg: string; text: string; label: string }> = {
  haircut: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Haircut' },
  color: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Color' },
  treatment: { bg: 'bg-green-100', text: 'text-green-800', label: 'Treatment' },
  massage: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Massage' },
  nails: { bg: 'bg-pink-100', text: 'text-pink-800', label: 'Nails' },
};

const TIME_SLOTS = [
  '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM',
];

const WEEK_DAYS = ['Mon 3', 'Tue 4', 'Wed 5', 'Thu 6', 'Fri 7', 'Sat 8', 'Sun 9'];

const APPOINTMENTS: Appointment[] = [
  { id: 1, client: 'Fatima Al-Rashid', service: 'Haircut & Style', staffMember: 'Ahmed', time: '9:00 AM', duration: 60, category: 'haircut' },
  { id: 2, client: 'Layla Mahmoud', service: 'Full Color', staffMember: 'Sara', time: '10:00 AM', duration: 120, category: 'color' },
  { id: 3, client: 'Hana Yusuf', service: 'Deep Conditioning', staffMember: 'Omar', time: '11:00 AM', duration: 45, category: 'treatment' },
  { id: 4, client: 'Reem Abdullah', service: 'Swedish Massage', staffMember: 'Nora', time: '1:00 PM', duration: 60, category: 'massage' },
  { id: 5, client: 'Amira Hassan', service: 'Gel Manicure', staffMember: 'Khalid', time: '2:00 PM', duration: 45, category: 'nails' },
  { id: 6, client: 'Dina Saeed', service: 'Balayage', staffMember: 'Sara', time: '2:00 PM', duration: 180, category: 'color' },
  { id: 7, client: 'Mona Khalil', service: "Men's Haircut", staffMember: 'Ahmed', time: '3:00 PM', duration: 30, category: 'haircut' },
  { id: 8, client: 'Nadia Farooq', service: 'Hot Stone Massage', staffMember: 'Nora', time: '4:00 PM', duration: 90, category: 'massage' },
  { id: 9, client: 'Salma Idris', service: 'Keratin Treatment', staffMember: 'Omar', time: '3:00 PM', duration: 120, category: 'treatment' },
  { id: 10, client: 'Yasmin Nabil', service: 'Pedicure', staffMember: 'Khalid', time: '5:00 PM', duration: 60, category: 'nails' },
];

function getSlotIndex(time: string): number {
  return TIME_SLOTS.indexOf(time);
}

function getSpan(duration: number): number {
  return Math.max(1, Math.ceil(duration / 60));
}

export default function CalendarPage() {
  const [selectedDay] = useState(2); // Wed selected

  const totalBookings = APPOINTMENTS.length;
  const totalSlots = STAFF_MEMBERS.length * TIME_SLOTS.length;
  const occupiedSlots = APPOINTMENTS.reduce((sum, a) => sum + getSpan(a.duration), 0);
  const availabilityPct = Math.round(((totalSlots - occupiedSlots) / totalSlots) * 100);
  const estimatedRevenue = 2_340;

  return (
    <div className="space-y-6">
      {/* Today's Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Today's Bookings" value={totalBookings} sub="+2 from yesterday" trend="up" />
        <StatCard label="Availability" value={`${availabilityPct}%`} sub="Open slots remaining" trend="neutral" />
        <StatCard label="Estimated Revenue" value={`SAR ${estimatedRevenue.toLocaleString()}`} sub="+12% vs last Wed" trend="up" />
        <StatCard label="Staff On Duty" value={STAFF_MEMBERS.length} sub="All present" trend="neutral" />
      </div>

      {/* Week Navigation */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Button variant="secondary" size="sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 19l-7-7 7-7" /></svg>
            </Button>
            <h2 className="text-sm font-semibold">February 3 - 9, 2026</h2>
            <Button variant="secondary" size="sm">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5l7 7-7 7" /></svg>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm">+ New Booking</Button>
            <Button variant="secondary" size="sm">Today</Button>
          </div>
        </div>

        {/* Day tabs */}
        <div className="flex gap-1 mb-4 border-b border-gray-200">
          {WEEK_DAYS.map((day, i) => (
            <button
              key={day}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                i === selectedDay
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4">
          {Object.entries(CATEGORY_COLORS).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5">
              <div className={`w-3 h-3 rounded ${val.bg}`} />
              <span className="text-xs text-gray-500">{val.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Staff header */}
            <div className="grid gap-px" style={{ gridTemplateColumns: '80px repeat(5, 1fr)' }}>
              <div className="p-2 text-xs font-semibold text-gray-400">Time</div>
              {STAFF_MEMBERS.map((staff) => (
                <div key={staff} className="p-2 text-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 mx-auto mb-1 flex items-center justify-center text-xs font-bold text-gray-600">
                    {staff[0]}
                  </div>
                  <div className="text-xs font-semibold text-gray-700">{staff}</div>
                </div>
              ))}
            </div>

            {/* Time grid */}
            {TIME_SLOTS.map((slot, slotIdx) => (
              <div
                key={slot}
                className="grid gap-px border-t border-gray-100"
                style={{ gridTemplateColumns: '80px repeat(5, 1fr)', minHeight: '52px' }}
              >
                <div className="p-2 text-xs text-gray-400 font-medium">{slot}</div>
                {STAFF_MEMBERS.map((staff) => {
                  const appt = APPOINTMENTS.find(
                    (a) => a.staffMember === staff && getSlotIndex(a.time) === slotIdx
                  );

                  if (appt) {
                    const span = getSpan(appt.duration);
                    const cat = CATEGORY_COLORS[appt.category];
                    return (
                      <div key={staff} className="p-1" style={{ gridRow: `span ${span}` }}>
                        <div className={`${cat.bg} ${cat.text} rounded-lg p-2 h-full cursor-pointer hover:opacity-80 transition-opacity`}>
                          <div className="text-xs font-semibold truncate">{appt.client}</div>
                          <div className="text-[10px] opacity-70 truncate">{appt.service}</div>
                          <div className="text-[10px] opacity-60">{appt.duration} min</div>
                        </div>
                      </div>
                    );
                  }

                  // Check if this cell is covered by a multi-slot appointment above
                  const coveredByAbove = APPOINTMENTS.find((a) => {
                    if (a.staffMember !== staff) return false;
                    const startIdx = getSlotIndex(a.time);
                    const aSpan = getSpan(a.duration);
                    return startIdx < slotIdx && startIdx + aSpan > slotIdx;
                  });

                  if (coveredByAbove) {
                    return null;
                  }

                  return (
                    <div key={staff} className="p-1">
                      <div className="h-full rounded-lg border border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/30 transition-colors cursor-pointer" />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
