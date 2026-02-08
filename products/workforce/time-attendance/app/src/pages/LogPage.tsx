import { useState } from 'react';
import { StatCard, Card, DataTable, Badge, Button, SearchInput } from '@berhot/ui';
import type { Column, BadgeVariant } from '@berhot/ui';

type AttendanceStatus = 'on-time' | 'late' | 'absent' | 'early-leave';

interface AttendanceEntry {
  id: string;
  employee: string;
  role: string;
  clockIn: string;
  clockOut: string;
  totalHours: string;
  breakTime: string;
  status: AttendanceStatus;
}

const ATTENDANCE_LOG: AttendanceEntry[] = [
  { id: '1', employee: 'Ahmed Al-Farsi', role: 'Server', clockIn: '06:02 AM', clockOut: '02:05 PM', totalHours: '8h 3m', breakTime: '30m', status: 'on-time' },
  { id: '2', employee: 'Sara Hassan', role: 'Cashier', clockIn: '02:15 PM', clockOut: '10:10 PM', totalHours: '7h 55m', breakTime: '30m', status: 'late' },
  { id: '3', employee: 'Omar Khalid', role: 'Manager', clockIn: '05:55 AM', clockOut: '02:30 PM', totalHours: '8h 35m', breakTime: '45m', status: 'on-time' },
  { id: '4', employee: 'Fatima Nour', role: 'Server', clockIn: '-', clockOut: '-', totalHours: '0h', breakTime: '-', status: 'absent' },
  { id: '5', employee: 'Yusuf Bader', role: 'Cook', clockIn: '06:00 AM', clockOut: '02:00 PM', totalHours: '8h 0m', breakTime: '30m', status: 'on-time' },
  { id: '6', employee: 'Layla Mansour', role: 'Server', clockIn: '06:30 AM', clockOut: '01:30 PM', totalHours: '7h 0m', breakTime: '30m', status: 'early-leave' },
  { id: '7', employee: 'Khaled Rami', role: 'Security', clockIn: '10:00 PM', clockOut: '06:00 AM', totalHours: '8h 0m', breakTime: '45m', status: 'on-time' },
  { id: '8', employee: 'Nora Saeed', role: 'Hostess', clockIn: '06:45 AM', clockOut: '02:00 PM', totalHours: '7h 15m', breakTime: '30m', status: 'late' },
];

const STATUS_BADGE: Record<AttendanceStatus, { variant: BadgeVariant; label: string }> = {
  'on-time': { variant: 'green', label: 'On Time' },
  late: { variant: 'orange', label: 'Late' },
  absent: { variant: 'red', label: 'Absent' },
  'early-leave': { variant: 'blue', label: 'Early Leave' },
};

export default function LogPage() {
  const [search, setSearch] = useState('');
  const [dateFilter] = useState('Feb 7, 2026');

  const filtered = ATTENDANCE_LOG.filter(
    (e) =>
      search === '' ||
      e.employee.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()),
  );

  const onTime = ATTENDANCE_LOG.filter((e) => e.status === 'on-time').length;
  const late = ATTENDANCE_LOG.filter((e) => e.status === 'late').length;
  const absent = ATTENDANCE_LOG.filter((e) => e.status === 'absent').length;

  const columns: Column<AttendanceEntry>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.employee}</div>
          <div className="text-xs text-gray-400">{row.role}</div>
        </div>
      ),
    },
    {
      key: 'clockIn',
      header: 'Clock In',
      render: (row) => (
        <span className={row.clockIn === '-' ? 'text-gray-300' : 'text-gray-700'}>
          {row.clockIn}
        </span>
      ),
    },
    {
      key: 'clockOut',
      header: 'Clock Out',
      render: (row) => (
        <span className={row.clockOut === '-' ? 'text-gray-300' : 'text-gray-700'}>
          {row.clockOut}
        </span>
      ),
    },
    {
      key: 'totalHours',
      header: 'Total Hours',
      render: (row) => <span className="font-semibold">{row.totalHours}</span>,
    },
    { key: 'breakTime', header: 'Break' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const cfg = STATUS_BADGE[row.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Daily Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Present" value={ATTENDANCE_LOG.length - absent} sub={`of ${ATTENDANCE_LOG.length} employees`} trend="neutral" />
        <StatCard label="On Time" value={onTime} sub={`${Math.round((onTime / ATTENDANCE_LOG.length) * 100)}% punctuality`} trend="up" />
        <StatCard label="Late Arrivals" value={late} sub="Needs improvement" trend="down" />
        <StatCard label="Absent" value={absent} sub={absent === 0 ? 'Perfect attendance' : `${absent} missing`} trend={absent === 0 ? 'up' : 'down'} />
      </div>

      {/* Log Table */}
      <Card padding={false}>
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm">&larr;</Button>
              <span className="text-sm font-semibold text-gray-700">{dateFilter}</span>
              <Button variant="secondary" size="sm">&rarr;</Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <SearchInput placeholder="Search employees..." onSearch={setSearch} className="w-64" />
            <Button variant="secondary" size="sm">Export</Button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No attendance records" />
      </Card>
    </div>
  );
}
