import { useState } from 'react';
import { StatCard, Badge, Card, Button } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

interface Table {
  id: number;
  number: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved';
  server?: string;
  orderId?: string;
  orderTotal?: number;
  guests?: number;
  duration?: string;
}

const TABLES: Table[] = [
  { id: 1, number: 1, seats: 2, status: 'occupied', server: 'Ahmed', orderId: '#1042', orderTotal: 78.5, guests: 2, duration: '32 min' },
  { id: 2, number: 2, seats: 4, status: 'available' },
  { id: 3, number: 3, seats: 4, status: 'occupied', server: 'Sara', orderId: '#1039', orderTotal: 145.0, guests: 3, duration: '48 min' },
  { id: 4, number: 4, seats: 6, status: 'reserved', server: 'Ahmed' },
  { id: 5, number: 5, seats: 2, status: 'available' },
  { id: 6, number: 6, seats: 8, status: 'occupied', server: 'Omar', orderId: '#1044', orderTotal: 234.75, guests: 6, duration: '15 min' },
  { id: 7, number: 7, seats: 4, status: 'available' },
  { id: 8, number: 8, seats: 6, status: 'reserved' },
];

const STATUS_CONFIG: Record<Table['status'], { label: string; variant: BadgeVariant; bg: string; border: string }> = {
  available: { label: 'Available', variant: 'green', bg: 'bg-green-50', border: 'border-green-200' },
  occupied: { label: 'Occupied', variant: 'red', bg: 'bg-red-50', border: 'border-red-200' },
  reserved: { label: 'Reserved', variant: 'orange', bg: 'bg-orange-50', border: 'border-orange-200' },
};

export default function TablesPage() {
  const [filter, setFilter] = useState<'all' | Table['status']>('all');

  const filtered = filter === 'all' ? TABLES : TABLES.filter((t) => t.status === filter);
  const occupied = TABLES.filter((t) => t.status === 'occupied').length;
  const available = TABLES.filter((t) => t.status === 'available').length;
  const reserved = TABLES.filter((t) => t.status === 'reserved').length;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Tables" value={TABLES.length} sub="Floor capacity: 36 seats" trend="neutral" />
        <StatCard label="Occupied" value={occupied} sub={`${Math.round((occupied / TABLES.length) * 100)}% utilization`} trend="up" />
        <StatCard label="Available" value={available} sub="Ready for seating" trend="neutral" />
        <StatCard label="Reserved" value={reserved} sub="Upcoming reservations" trend="neutral" />
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-3">
        {[
          { key: 'all', label: 'All Tables' },
          { key: 'available', label: 'Available' },
          { key: 'occupied', label: 'Occupied' },
          { key: 'reserved', label: 'Reserved' },
        ].map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(f.key as typeof filter)}
          >
            {f.label}
          </Button>
        ))}
        <div className="flex-1" />
        <Button variant="primary" size="sm">
          + Add Table
        </Button>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-4 gap-5">
        {filtered.map((table) => {
          const cfg = STATUS_CONFIG[table.status];
          return (
            <Card key={table.id} className={`${cfg.bg} border ${cfg.border} hover:shadow-md transition-shadow cursor-pointer`}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-lg font-bold text-gray-900">Table {table.number}</div>
                  <div className="text-xs text-gray-500">{table.seats} seats</div>
                </div>
                <Badge variant={cfg.variant}>{cfg.label}</Badge>
              </div>

              {table.status === 'occupied' && (
                <div className="space-y-2 pt-3 border-t border-gray-200/60">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Order</span>
                    <span className="font-semibold text-gray-900">{table.orderId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Guests</span>
                    <span className="text-gray-700">{table.guests}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Server</span>
                    <span className="text-gray-700">{table.server}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration</span>
                    <span className="text-gray-700">{table.duration}</span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-gray-200/60">
                    <span className="text-gray-500">Total</span>
                    <span className="font-bold text-gray-900">SAR {table.orderTotal?.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {table.status === 'reserved' && (
                <div className="space-y-2 pt-3 border-t border-gray-200/60">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Reserved for</span>
                    <span className="text-gray-700">7:30 PM</span>
                  </div>
                  {table.server && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Server</span>
                      <span className="text-gray-700">{table.server}</span>
                    </div>
                  )}
                </div>
              )}

              {table.status === 'available' && (
                <div className="pt-3 border-t border-gray-200/60">
                  <Button variant="primary" size="sm" className="w-full">
                    Seat Guests
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
