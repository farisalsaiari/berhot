import { useState } from 'react';
import { Card, Badge, Button, TabBar, DataTable, SearchInput } from '@berhot/ui';
import type { BadgeVariant, Column } from '@berhot/ui';

interface Booking {
  id: string;
  client: string;
  service: string;
  staffMember: string;
  date: string;
  time: string;
  duration: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  price: number;
  phone: string;
}

const STATUS_CONFIG: Record<Booking['status'], { label: string; variant: BadgeVariant }> = {
  confirmed: { label: 'Confirmed', variant: 'green' },
  pending: { label: 'Pending', variant: 'orange' },
  cancelled: { label: 'Cancelled', variant: 'red' },
};

const BOOKINGS: Booking[] = [
  { id: 'BK-001', client: 'Fatima Al-Rashid', service: 'Haircut & Style', staffMember: 'Ahmed', date: '2026-02-07', time: '9:00 AM', duration: 60, status: 'confirmed', price: 150, phone: '+966 50 123 4567' },
  { id: 'BK-002', client: 'Layla Mahmoud', service: 'Full Color', staffMember: 'Sara', date: '2026-02-07', time: '10:00 AM', duration: 120, status: 'confirmed', price: 350, phone: '+966 55 234 5678' },
  { id: 'BK-003', client: 'Hana Yusuf', service: 'Deep Conditioning', staffMember: 'Omar', date: '2026-02-07', time: '11:00 AM', duration: 45, status: 'pending', price: 120, phone: '+966 54 345 6789' },
  { id: 'BK-004', client: 'Reem Abdullah', service: 'Swedish Massage', staffMember: 'Nora', date: '2026-02-07', time: '1:00 PM', duration: 60, status: 'confirmed', price: 200, phone: '+966 56 456 7890' },
  { id: 'BK-005', client: 'Amira Hassan', service: 'Gel Manicure', staffMember: 'Khalid', date: '2026-02-07', time: '2:00 PM', duration: 45, status: 'pending', price: 80, phone: '+966 59 567 8901' },
  { id: 'BK-006', client: 'Dina Saeed', service: 'Balayage', staffMember: 'Sara', date: '2026-02-08', time: '10:00 AM', duration: 180, status: 'confirmed', price: 500, phone: '+966 50 678 9012' },
  { id: 'BK-007', client: 'Mona Khalil', service: "Men's Haircut", staffMember: 'Ahmed', date: '2026-02-08', time: '11:00 AM', duration: 30, status: 'confirmed', price: 80, phone: '+966 55 789 0123' },
  { id: 'BK-008', client: 'Nadia Farooq', service: 'Hot Stone Massage', staffMember: 'Nora', date: '2026-02-09', time: '3:00 PM', duration: 90, status: 'cancelled', price: 280, phone: '+966 54 890 1234' },
  { id: 'BK-009', client: 'Salma Idris', service: 'Keratin Treatment', staffMember: 'Omar', date: '2026-02-10', time: '10:00 AM', duration: 120, status: 'confirmed', price: 400, phone: '+966 56 901 2345' },
  { id: 'BK-010', client: 'Yasmin Nabil', service: 'Pedicure & Nail Art', staffMember: 'Khalid', date: '2026-02-10', time: '2:00 PM', duration: 60, status: 'pending', price: 120, phone: '+966 59 012 3456' },
  { id: 'BK-011', client: 'Noura Al-Dosari', service: 'Blowout', staffMember: 'Ahmed', date: '2026-02-12', time: '9:30 AM', duration: 45, status: 'confirmed', price: 100, phone: '+966 50 111 2222' },
  { id: 'BK-012', client: 'Lina Qasim', service: 'Highlights', staffMember: 'Sara', date: '2026-02-14', time: '1:00 PM', duration: 150, status: 'pending', price: 450, phone: '+966 55 333 4444' },
];

const TABS = [
  { key: 'today', label: 'Today', count: 5 },
  { key: 'week', label: 'This Week', count: 8 },
  { key: 'all', label: 'All Bookings', count: BOOKINGS.length },
];

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState('today');
  const [search, setSearch] = useState('');

  const filtered = BOOKINGS.filter((b) => {
    const matchesSearch = !search || b.client.toLowerCase().includes(search.toLowerCase()) || b.service.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (activeTab === 'today') return b.date === '2026-02-07';
    if (activeTab === 'week') return b.date >= '2026-02-07' && b.date <= '2026-02-13';
    return true;
  });

  const columns: Column<Booking>[] = [
    {
      key: 'id',
      header: 'Booking',
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.id}</div>
          <div className="text-xs text-gray-400">{row.date}</div>
        </div>
      ),
    },
    {
      key: 'client',
      header: 'Client',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.client}</div>
          <div className="text-xs text-gray-400">{row.phone}</div>
        </div>
      ),
    },
    {
      key: 'service',
      header: 'Service',
      render: (row) => (
        <div>
          <div className="text-gray-900">{row.service}</div>
          <div className="text-xs text-gray-400">{row.duration} min</div>
        </div>
      ),
    },
    { key: 'staffMember', header: 'Staff' },
    {
      key: 'time',
      header: 'Time',
      render: (row) => <span className="text-gray-700">{row.time}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      render: (row) => <span className="font-semibold">SAR {row.price}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const cfg = STATUS_CONFIG[row.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <div className="flex items-center gap-1">
          {row.status === 'pending' && (
            <Button variant="primary" size="sm">Confirm</Button>
          )}
          {row.status === 'confirmed' && (
            <Button variant="secondary" size="sm">Check In</Button>
          )}
          <Button variant="ghost" size="sm">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
            </svg>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <SearchInput placeholder="Search bookings..." onSearch={setSearch} className="w-72" />
        <Button variant="primary" size="md">+ New Booking</Button>
      </div>

      {/* Tabs */}
      <Card padding={false}>
        <div className="px-5 pt-4">
          <TabBar tabs={TABS} activeKey={activeTab} onChange={setActiveTab} />
        </div>
        <div className="pt-2">
          <DataTable columns={columns} data={filtered} emptyMessage="No bookings found" />
        </div>
      </Card>
    </div>
  );
}
