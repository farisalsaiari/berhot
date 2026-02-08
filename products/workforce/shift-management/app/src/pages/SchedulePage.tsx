import { useState } from 'react';
import { StatCard, Card, Badge, Button } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

type ShiftType = 'morning' | 'afternoon' | 'night' | 'off';

interface ScheduleEntry {
  employeeId: string;
  employee: string;
  role: string;
  shifts: Record<string, ShiftType>;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SCHEDULE: ScheduleEntry[] = [
  { employeeId: '1', employee: 'Ahmed Al-Farsi', role: 'Server', shifts: { Mon: 'morning', Tue: 'morning', Wed: 'afternoon', Thu: 'morning', Fri: 'off', Sat: 'morning', Sun: 'off' } },
  { employeeId: '2', employee: 'Sara Hassan', role: 'Cashier', shifts: { Mon: 'afternoon', Tue: 'afternoon', Wed: 'morning', Thu: 'afternoon', Fri: 'afternoon', Sat: 'off', Sun: 'off' } },
  { employeeId: '3', employee: 'Omar Khalid', role: 'Manager', shifts: { Mon: 'morning', Tue: 'morning', Wed: 'morning', Thu: 'morning', Fri: 'morning', Sat: 'off', Sun: 'off' } },
  { employeeId: '4', employee: 'Fatima Nour', role: 'Server', shifts: { Mon: 'night', Tue: 'off', Wed: 'night', Thu: 'night', Fri: 'night', Sat: 'night', Sun: 'off' } },
  { employeeId: '5', employee: 'Yusuf Bader', role: 'Kitchen', shifts: { Mon: 'morning', Tue: 'afternoon', Wed: 'off', Thu: 'morning', Fri: 'afternoon', Sat: 'morning', Sun: 'afternoon' } },
  { employeeId: '6', employee: 'Layla Mansour', role: 'Server', shifts: { Mon: 'off', Tue: 'morning', Wed: 'morning', Thu: 'afternoon', Fri: 'morning', Sat: 'afternoon', Sun: 'morning' } },
  { employeeId: '7', employee: 'Khaled Rami', role: 'Security', shifts: { Mon: 'night', Tue: 'night', Wed: 'night', Thu: 'off', Fri: 'off', Sat: 'night', Sun: 'night' } },
];

const SHIFT_CONFIG: Record<ShiftType, { label: string; badge: BadgeVariant; bg: string }> = {
  morning: { label: '6AM-2PM', badge: 'blue', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
  afternoon: { label: '2PM-10PM', badge: 'green', bg: 'bg-green-50 text-green-700 border-green-200' },
  night: { label: '10PM-6AM', badge: 'purple', bg: 'bg-purple-50 text-purple-700 border-purple-200' },
  off: { label: 'OFF', badge: 'gray', bg: 'bg-gray-50 text-gray-400 border-gray-200' },
};

export default function SchedulePage() {
  const [currentWeek] = useState('Feb 3 - Feb 9, 2026');

  const totalShifts = SCHEDULE.reduce(
    (sum, e) => sum + Object.values(e.shifts).filter((s) => s !== 'off').length,
    0,
  );
  const openShifts = 4;
  const overtimeHours = 12;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Shifts This Week" value={totalShifts} sub="Across all employees" trend="neutral" />
        <StatCard label="Open Shifts" value={openShifts} sub="Need coverage" trend="down" />
        <StatCard label="Overtime Hours" value={`${overtimeHours}h`} sub="3 employees over 40h" trend="up" />
        <StatCard label="Employees Scheduled" value={SCHEDULE.length} sub="2 on leave" trend="neutral" />
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">&larr; Prev</Button>
          <span className="text-sm font-semibold text-gray-700">{currentWeek}</span>
          <Button variant="secondary" size="sm">Next &rarr;</Button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-3 h-3 rounded bg-blue-200 inline-block" /> Morning
            <span className="w-3 h-3 rounded bg-green-200 inline-block ml-2" /> Afternoon
            <span className="w-3 h-3 rounded bg-purple-200 inline-block ml-2" /> Night
          </div>
          <Button variant="primary" size="sm">+ Assign Shift</Button>
        </div>
      </div>

      {/* Schedule Grid */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide w-52">Employee</th>
                {DAYS.map((day) => (
                  <th key={day} className="text-center py-3 px-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">{day}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SCHEDULE.map((entry) => (
                <tr key={entry.employeeId} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{entry.employee}</div>
                    <div className="text-xs text-gray-400">{entry.role}</div>
                  </td>
                  {DAYS.map((day) => {
                    const shift = entry.shifts[day];
                    const cfg = SHIFT_CONFIG[shift];
                    return (
                      <td key={day} className="py-3 px-2 text-center">
                        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded border ${cfg.bg}`}>
                          {cfg.label}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
