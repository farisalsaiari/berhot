import { useState } from 'react';
import { StatCard, Card, Badge, DataTable, Button } from '@berhot/ui';
import type { BadgeVariant, Column } from '@berhot/ui';

interface TicketType {
  id: string;
  name: string;
  event: string;
  price: number;
  quantity: number;
  sold: number;
  available: number;
  status: 'active' | 'sold-out' | 'inactive';
}

const TICKET_TYPES: TicketType[] = [
  { id: 'TK001', name: 'Early Bird', event: 'Tech Summit 2026', price: 250, quantity: 100, sold: 100, available: 0, status: 'sold-out' },
  { id: 'TK002', name: 'General Admission', event: 'Tech Summit 2026', price: 375, quantity: 300, sold: 280, available: 20, status: 'active' },
  { id: 'TK003', name: 'VIP Pass', event: 'Tech Summit 2026', price: 750, quantity: 100, sold: 70, available: 30, status: 'active' },
  { id: 'TK004', name: 'Standard', event: 'Annual Gala Dinner', price: 500, quantity: 150, sold: 150, available: 0, status: 'sold-out' },
  { id: 'TK005', name: 'Premium Table', event: 'Annual Gala Dinner', price: 1200, quantity: 50, sold: 50, available: 0, status: 'sold-out' },
  { id: 'TK006', name: 'Standard', event: 'Startup Pitch Night', price: 150, quantity: 120, sold: 65, available: 55, status: 'active' },
  { id: 'TK007', name: 'Investor Pass', event: 'Startup Pitch Night', price: 300, quantity: 30, sold: 20, available: 10, status: 'active' },
  { id: 'TK008', name: 'Workshop Seat', event: 'Workshop: AI in Business', price: 400, quantity: 40, sold: 20, available: 20, status: 'active' },
];

const STATUS_BADGE: Record<string, { variant: BadgeVariant; label: string }> = {
  active: { variant: 'green', label: 'Active' },
  'sold-out': { variant: 'red', label: 'Sold Out' },
  inactive: { variant: 'gray', label: 'Inactive' },
};

export default function TicketsPage() {
  const [showForm, setShowForm] = useState(false);

  const totalRevenue = TICKET_TYPES.reduce((s, t) => s + t.price * t.sold, 0);
  const totalSold = TICKET_TYPES.reduce((s, t) => s + t.sold, 0);
  const totalAvailable = TICKET_TYPES.reduce((s, t) => s + t.available, 0);

  const columns: Column<TicketType>[] = [
    {
      key: 'name',
      header: 'Ticket Type',
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-400">{row.event}</div>
        </div>
      ),
    },
    {
      key: 'price',
      header: 'Price',
      render: (row) => <span className="font-medium text-gray-900">SAR {row.price}</span>,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (row) => <span className="text-gray-700">{row.quantity}</span>,
    },
    {
      key: 'sold',
      header: 'Sold',
      render: (row) => (
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{row.sold}</span>
          <div className="w-16 bg-gray-200 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${row.sold === row.quantity ? 'bg-red-500' : 'bg-blue-600'}`}
              style={{ width: `${(row.sold / row.quantity) * 100}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: 'available',
      header: 'Available',
      render: (row) => (
        <span className={row.available === 0 ? 'text-red-600 font-medium' : 'text-gray-700'}>{row.available}</span>
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
  ];

  return (
    <div className="space-y-6">
      {/* Revenue Summary */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Revenue" value={`SAR ${(totalRevenue / 1000).toFixed(1)}K`} sub="All ticket sales" trend="up" />
        <StatCard label="Tickets Sold" value={totalSold} sub="Across all events" trend="up" />
        <StatCard label="Available" value={totalAvailable} sub="Remaining tickets" trend="neutral" />
      </div>

      {/* Create Ticket Type */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Ticket Types</h2>
          <p className="text-sm text-gray-400">{TICKET_TYPES.length} ticket types across {new Set(TICKET_TYPES.map((t) => t.event)).size} events</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Create Ticket Type'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">New Ticket Type</h3>
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
              <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select event...</option>
                <option>Tech Summit 2026</option>
                <option>Annual Gala Dinner</option>
                <option>Startup Pitch Night</option>
                <option>Workshop: AI in Business</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Name</label>
              <input type="text" placeholder="e.g., VIP Pass" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (SAR)</label>
              <input type="number" placeholder="0" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
              <input type="number" placeholder="100" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="primary">Create Ticket Type</Button>
          </div>
        </Card>
      )}

      {/* Ticket Types Table */}
      <Card padding={false}>
        <DataTable columns={columns} data={TICKET_TYPES} emptyMessage="No ticket types defined" />
      </Card>
    </div>
  );
}
