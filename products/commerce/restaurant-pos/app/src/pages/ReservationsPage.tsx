import { useState } from 'react';
import { StatCard, Badge, Card, TabBar, Button, SearchInput, DataTable } from '@berhot/ui';
import type { BadgeVariant, Column } from '@berhot/ui';

type ReservationStatus = 'confirmed' | 'pending' | 'arrived' | 'cancelled';

interface Reservation {
  id: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  partySize: number;
  table: number | null;
  status: ReservationStatus;
  notes?: string;
}

const RESERVATIONS: Reservation[] = [
  { id: 'R-001', name: 'Khalid Al-Rashid', phone: '+966 50 123 4567', date: 'Today', time: '12:30 PM', partySize: 4, table: 4, status: 'arrived', notes: 'Birthday celebration' },
  { id: 'R-002', name: 'Noura Mohammed', phone: '+966 55 234 5678', date: 'Today', time: '1:00 PM', partySize: 2, table: 5, status: 'confirmed' },
  { id: 'R-003', name: 'Ahmad Hassan', phone: '+966 50 345 6789', date: 'Today', time: '1:30 PM', partySize: 6, table: 6, status: 'pending', notes: 'Allergic to nuts' },
  { id: 'R-004', name: 'Fatima Al-Sayed', phone: '+966 54 456 7890', date: 'Today', time: '2:00 PM', partySize: 3, table: null, status: 'pending' },
  { id: 'R-005', name: 'Yousef Ibrahim', phone: '+966 56 567 8901', date: 'Today', time: '7:00 PM', partySize: 8, table: null, status: 'confirmed', notes: 'Business dinner, quiet area' },
  { id: 'R-006', name: 'Maryam Abdulaziz', phone: '+966 50 678 9012', date: 'Today', time: '7:30 PM', partySize: 4, table: 3, status: 'confirmed' },
  { id: 'R-007', name: 'Omar Bin Ali', phone: '+966 55 789 0123', date: 'Today', time: '8:00 PM', partySize: 2, table: 1, status: 'confirmed' },
  { id: 'R-008', name: 'Layla Abdullah', phone: '+966 50 890 1234', date: 'Today', time: '8:30 PM', partySize: 5, table: null, status: 'pending', notes: 'High chair needed' },
  { id: 'R-009', name: 'Sultan Al-Qahtani', phone: '+966 54 901 2345', date: 'Today', time: '11:30 AM', partySize: 2, table: 2, status: 'cancelled' },
  { id: 'R-010', name: 'Huda Mansour', phone: '+966 56 012 3456', date: 'Today', time: '12:00 PM', partySize: 4, table: 7, status: 'arrived' },
];

const STATUS_BADGE: Record<ReservationStatus, { variant: BadgeVariant; label: string }> = {
  confirmed: { variant: 'blue', label: 'Confirmed' },
  pending: { variant: 'orange', label: 'Pending' },
  arrived: { variant: 'green', label: 'Arrived' },
  cancelled: { variant: 'red', label: 'Cancelled' },
};

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'pending', label: 'Pending' },
  { key: 'arrived', label: 'Arrived' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = RESERVATIONS
    .filter((r) => activeTab === 'all' || r.status === activeTab)
    .filter((r) => search === '' || r.name.toLowerCase().includes(search.toLowerCase()) || r.phone.includes(search) || r.id.toLowerCase().includes(search.toLowerCase()));

  const todayTotal = RESERVATIONS.filter((r) => r.status !== 'cancelled').length;
  const upcoming = RESERVATIONS.filter((r) => r.status === 'confirmed' || r.status === 'pending').length;
  const arrivedCount = RESERVATIONS.filter((r) => r.status === 'arrived').length;
  const totalGuests = RESERVATIONS.filter((r) => r.status !== 'cancelled').reduce((s, r) => s + r.partySize, 0);

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    count: t.key === 'all' ? RESERVATIONS.length : RESERVATIONS.filter((r) => r.status === t.key).length,
  }));

  const columns: Column<Reservation>[] = [
    {
      key: 'time',
      header: 'Time',
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.time}</div>
          <div className="text-xs text-gray-400">{row.date}</div>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Guest',
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-400">{row.phone}</div>
        </div>
      ),
    },
    {
      key: 'partySize',
      header: 'Party Size',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span className="font-medium">{row.partySize} guests</span>
        </div>
      ),
    },
    {
      key: 'table',
      header: 'Table',
      render: (row) =>
        row.table ? (
          <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 font-bold text-sm rounded-lg">
            {row.table}
          </span>
        ) : (
          <span className="text-xs text-gray-400 italic">Not assigned</span>
        ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const cfg = STATUS_BADGE[row.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (row) =>
        row.notes ? (
          <span className="text-xs text-gray-500 italic">{row.notes}</span>
        ) : (
          <span className="text-xs text-gray-300">--</span>
        ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          {row.status === 'pending' && (
            <Button variant="primary" size="sm">Confirm</Button>
          )}
          {row.status === 'confirmed' && (
            <Button variant="primary" size="sm">Check In</Button>
          )}
          {(row.status === 'pending' || row.status === 'confirmed') && (
            <Button variant="ghost" size="sm">Cancel</Button>
          )}
          {row.status === 'arrived' && !row.table && (
            <Button variant="primary" size="sm">Assign Table</Button>
          )}
        </div>
      ),
      className: 'text-right',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Today's Reservations" value={todayTotal} sub="Active bookings" trend="neutral" />
        <StatCard label="Upcoming" value={upcoming} sub="Confirmed + Pending" trend="up" />
        <StatCard label="Arrived" value={arrivedCount} sub="Checked in today" trend="up" />
        <StatCard label="Total Guests" value={totalGuests} sub="Expected covers" trend="neutral" />
      </div>

      {/* Timeline Cards */}
      <div className="grid grid-cols-4 gap-4">
        {['12:00 PM', '1:00 PM', '7:00 PM', '8:00 PM'].map((slot) => {
          const slotReservations = RESERVATIONS.filter((r) => r.time === slot && r.status !== 'cancelled');
          const guests = slotReservations.reduce((s, r) => s + r.partySize, 0);
          return (
            <Card key={slot} className="text-center">
              <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{slot}</div>
              <div className="text-xl font-bold text-gray-900">{slotReservations.length}</div>
              <div className="text-xs text-gray-500">{guests} guests</div>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="px-5 pt-4 flex items-center justify-between">
          <div className="flex-1">
            <TabBar tabs={tabsWithCounts} activeKey={activeTab} onChange={setActiveTab} />
          </div>
          <div className="flex items-center gap-3 ml-4 pb-2">
            <SearchInput placeholder="Search reservations..." onSearch={setSearch} className="w-56" />
            <Button variant="primary" size="sm">
              + New Reservation
            </Button>
          </div>
        </div>

        <DataTable columns={columns} data={filtered} emptyMessage="No reservations found" />
      </Card>
    </div>
  );
}
