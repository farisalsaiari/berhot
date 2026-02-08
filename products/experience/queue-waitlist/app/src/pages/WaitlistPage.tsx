import { useState } from 'react';
import { Card, Button, Badge, DataTable, SearchInput } from '@berhot/ui';
import type { BadgeVariant, Column } from '@berhot/ui';

type WaitlistStatus = 'pending' | 'confirmed' | 'seated' | 'cancelled';

interface WaitlistEntry {
  id: string;
  name: string;
  phone: string;
  partySize: number;
  requestedTime: string;
  status: WaitlistStatus;
  notes: string;
  addedAt: string;
}

const WAITLIST: WaitlistEntry[] = [
  { id: 'W001', name: 'Mohammed Al-Qahtani', phone: '+966 55 111 2233', partySize: 4, requestedTime: '1:00 PM', status: 'confirmed', notes: 'Birthday celebration', addedAt: '11:30 AM' },
  { id: 'W002', name: 'Sarah Al-Dosari', phone: '+966 55 222 3344', partySize: 2, requestedTime: '1:15 PM', status: 'pending', notes: 'Window seat preferred', addedAt: '11:45 AM' },
  { id: 'W003', name: 'Abdullah Faris', phone: '+966 55 333 4455', partySize: 6, requestedTime: '1:30 PM', status: 'confirmed', notes: 'High chair needed', addedAt: '12:00 PM' },
  { id: 'W004', name: 'Huda Al-Shehri', phone: '+966 55 444 5566', partySize: 3, requestedTime: '1:45 PM', status: 'pending', notes: '', addedAt: '12:10 PM' },
  { id: 'W005', name: 'Youssef Nasser', phone: '+966 55 555 6677', partySize: 2, requestedTime: '2:00 PM', status: 'seated', notes: 'Regular customer', addedAt: '12:15 PM' },
  { id: 'W006', name: 'Amira Khalil', phone: '+966 55 666 7788', partySize: 5, requestedTime: '2:15 PM', status: 'cancelled', notes: 'Cancelled via SMS', addedAt: '12:20 PM' },
  { id: 'W007', name: 'Tariq Bin Zayed', phone: '+966 55 777 8899', partySize: 8, requestedTime: '2:30 PM', status: 'pending', notes: 'Large party - private area', addedAt: '12:30 PM' },
];

const STATUS_BADGE: Record<WaitlistStatus, { variant: BadgeVariant; label: string }> = {
  pending: { variant: 'gray', label: 'Pending' },
  confirmed: { variant: 'blue', label: 'Confirmed' },
  seated: { variant: 'green', label: 'Seated' },
  cancelled: { variant: 'red', label: 'Cancelled' },
};

export default function WaitlistPage() {
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = WAITLIST.filter(
    (w) =>
      search === '' ||
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.phone.includes(search)
  );

  const columns: Column<WaitlistEntry>[] = [
    {
      key: 'name',
      header: 'Name',
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-400">{row.phone}</div>
        </div>
      ),
    },
    { key: 'partySize', header: 'Party Size' },
    { key: 'requestedTime', header: 'Requested Time' },
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
      render: (row) => (
        <span className="text-gray-500 text-sm">{row.notes || '-'}</span>
      ),
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'pending' && (
            <Button variant="primary" size="sm">Confirm</Button>
          )}
          {row.status === 'confirmed' && (
            <Button variant="primary" size="sm">Add to Queue</Button>
          )}
          <Button variant="ghost" size="sm">Edit</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Add to Waitlist Form */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-gray-900">Add to Waitlist</h2>
            <p className="text-xs text-gray-400 mt-0.5">Register a new guest on the waitlist</p>
          </div>
          <Button variant={showForm ? 'ghost' : 'primary'} onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Add Guest'}
          </Button>
        </div>
        {showForm && (
          <div className="grid grid-cols-5 gap-4 pt-4 border-t border-gray-100">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Guest Name</label>
              <input type="text" placeholder="Full name" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
              <input type="tel" placeholder="+966 5X XXX XXXX" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Party Size</label>
              <input type="number" placeholder="2" min={1} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Requested Time</label>
              <input type="time" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex items-end">
              <Button variant="primary" className="w-full">Add to Waitlist</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Current Waitlist */}
      <Card padding={false}>
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Current Waitlist</h2>
            <p className="text-xs text-gray-400 mt-0.5">{WAITLIST.filter((w) => w.status !== 'cancelled' && w.status !== 'seated').length} active entries</p>
          </div>
          <SearchInput placeholder="Search guests..." onSearch={setSearch} className="w-64" />
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="Waitlist is empty" />
      </Card>
    </div>
  );
}
