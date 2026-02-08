import { useState } from 'react';
import { Card, Badge, DataTable, Button, SearchInput } from '@berhot/ui';
import type { BadgeVariant, Column } from '@berhot/ui';

type CheckinStatus = 'checked-in' | 'not-checked-in' | 'no-show';

interface Attendee {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  event: string;
  checkinStatus: CheckinStatus;
  amountPaid: number;
  purchaseDate: string;
}

const ATTENDEES: Attendee[] = [
  { id: 'A001', name: 'Khalid Al-Rashid', email: 'khalid@example.com', ticketType: 'VIP Pass', event: 'Tech Summit 2026', checkinStatus: 'checked-in', amountPaid: 750, purchaseDate: 'Jan 10, 2026' },
  { id: 'A002', name: 'Sarah Al-Dosari', email: 'sarah@example.com', ticketType: 'General Admission', event: 'Tech Summit 2026', checkinStatus: 'checked-in', amountPaid: 375, purchaseDate: 'Jan 12, 2026' },
  { id: 'A003', name: 'Omar Bin Saeed', email: 'omar@example.com', ticketType: 'Premium Table', event: 'Annual Gala Dinner', checkinStatus: 'not-checked-in', amountPaid: 1200, purchaseDate: 'Jan 15, 2026' },
  { id: 'A004', name: 'Fatima Hassan', email: 'fatima@example.com', ticketType: 'Standard', event: 'Annual Gala Dinner', checkinStatus: 'checked-in', amountPaid: 500, purchaseDate: 'Jan 18, 2026' },
  { id: 'A005', name: 'Mohammed Al-Qahtani', email: 'mohammed@example.com', ticketType: 'General Admission', event: 'Tech Summit 2026', checkinStatus: 'not-checked-in', amountPaid: 375, purchaseDate: 'Jan 20, 2026' },
  { id: 'A006', name: 'Noura Al-Faisal', email: 'noura@example.com', ticketType: 'Early Bird', event: 'Tech Summit 2026', checkinStatus: 'checked-in', amountPaid: 250, purchaseDate: 'Dec 28, 2025' },
  { id: 'A007', name: 'Abdullah Faris', email: 'abdullah@example.com', ticketType: 'Standard', event: 'Startup Pitch Night', checkinStatus: 'no-show', amountPaid: 150, purchaseDate: 'Feb 1, 2026' },
  { id: 'A008', name: 'Reem Saleh', email: 'reem@example.com', ticketType: 'Investor Pass', event: 'Startup Pitch Night', checkinStatus: 'not-checked-in', amountPaid: 300, purchaseDate: 'Feb 3, 2026' },
  { id: 'A009', name: 'Youssef Nasser', email: 'youssef@example.com', ticketType: 'VIP Pass', event: 'Tech Summit 2026', checkinStatus: 'checked-in', amountPaid: 750, purchaseDate: 'Jan 5, 2026' },
  { id: 'A010', name: 'Layla Qasim', email: 'layla@example.com', ticketType: 'Workshop Seat', event: 'Workshop: AI in Business', checkinStatus: 'not-checked-in', amountPaid: 400, purchaseDate: 'Feb 5, 2026' },
];

const STATUS_BADGE: Record<CheckinStatus, { variant: BadgeVariant; label: string }> = {
  'checked-in': { variant: 'green', label: 'Checked In' },
  'not-checked-in': { variant: 'gray', label: 'Not Checked In' },
  'no-show': { variant: 'red', label: 'No Show' },
};

export default function AttendeesPage() {
  const [search, setSearch] = useState('');

  const filtered = ATTENDEES.filter(
    (a) =>
      search === '' ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      a.event.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Attendee>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-400">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'event',
      header: 'Event',
      render: (row) => (
        <div>
          <div className="text-gray-700">{row.event}</div>
          <div className="text-xs text-gray-400">{row.ticketType}</div>
        </div>
      ),
    },
    {
      key: 'checkinStatus',
      header: 'Check-in',
      render: (row) => {
        const cfg = STATUS_BADGE[row.checkinStatus];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'amountPaid',
      header: 'Amount Paid',
      render: (row) => <span className="font-medium text-gray-900">SAR {row.amountPaid}</span>,
    },
    {
      key: 'purchaseDate',
      header: 'Purchase Date',
      render: (row) => <span className="text-gray-600">{row.purchaseDate}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Attendee Directory</h2>
          <p className="text-sm text-gray-400">{ATTENDEES.length} registered attendees</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput placeholder="Search attendees..." onSearch={setSearch} className="w-64" />
          <Button variant="secondary">Export List</Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <div className="text-sm text-gray-500 mb-1">Total Registered</div>
          <div className="text-2xl font-bold text-gray-900">{ATTENDEES.length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500 mb-1">Checked In</div>
          <div className="text-2xl font-bold text-green-600">{ATTENDEES.filter((a) => a.checkinStatus === 'checked-in').length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500 mb-1">Pending</div>
          <div className="text-2xl font-bold text-gray-600">{ATTENDEES.filter((a) => a.checkinStatus === 'not-checked-in').length}</div>
        </Card>
        <Card>
          <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
          <div className="text-2xl font-bold text-gray-900">SAR {ATTENDEES.reduce((s, a) => s + a.amountPaid, 0).toLocaleString()}</div>
        </Card>
      </div>

      {/* Attendees Table */}
      <Card padding={false}>
        <DataTable columns={columns} data={filtered} emptyMessage="No attendees found" />
      </Card>
    </div>
  );
}
