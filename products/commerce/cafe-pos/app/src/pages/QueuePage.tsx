import { useState } from 'react';
import { StatCard, Card, Badge, Button, DataTable } from '@berhot/ui';
import type { Column } from '@berhot/ui';

interface QueueEntry {
  id: number;
  customer: string;
  order: string;
  waitTime: string;
  status: 'waiting' | 'preparing' | 'ready';
}

const INITIAL_QUEUE: QueueEntry[] = [
  { id: 1, customer: 'Ahmad M.', order: 'Cappuccino + Croissant', waitTime: '2 min', status: 'preparing' },
  { id: 2, customer: 'Sara K.', order: 'Iced Latte', waitTime: '4 min', status: 'waiting' },
  { id: 3, customer: 'Omar J.', order: 'Espresso x2', waitTime: '5 min', status: 'waiting' },
  { id: 4, customer: 'Lina A.', order: 'Matcha Latte + Muffin', waitTime: '6 min', status: 'waiting' },
  { id: 5, customer: 'Khaled R.', order: 'Americano', waitTime: '7 min', status: 'waiting' },
  { id: 6, customer: 'Nora S.', order: 'Flat White + Scone', waitTime: '8 min', status: 'waiting' },
  { id: 7, customer: 'Yusuf H.', order: 'Cold Brew', waitTime: '9 min', status: 'waiting' },
  { id: 8, customer: 'Huda T.', order: 'Chai Latte', waitTime: '10 min', status: 'waiting' },
];

const STATUS_BADGE: Record<QueueEntry['status'], { variant: 'green' | 'orange' | 'blue'; label: string }> = {
  waiting: { variant: 'orange', label: 'Waiting' },
  preparing: { variant: 'blue', label: 'Preparing' },
  ready: { variant: 'green', label: 'Ready' },
};

const columns: Column<QueueEntry>[] = [
  { key: 'id', header: '#', className: 'w-12' },
  { key: 'customer', header: 'Customer' },
  { key: 'order', header: 'Order Summary' },
  { key: 'waitTime', header: 'Wait Time' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => {
      const badge = STATUS_BADGE[row.status];
      return <Badge variant={badge.variant}>{badge.label}</Badge>;
    },
  },
];

export default function QueuePage() {
  const [queue, setQueue] = useState(INITIAL_QUEUE);
  const nextInLine = queue.find((q) => q.status === 'waiting');
  const avgWait = queue.length > 0 ? Math.round(queue.reduce((sum, q) => sum + parseInt(q.waitTime), 0) / queue.length) : 0;

  const handleCallNext = () => {
    setQueue((prev) => {
      const updated = [...prev];
      const preparingIdx = updated.findIndex((q) => q.status === 'preparing');
      if (preparingIdx >= 0) {
        updated[preparingIdx] = { ...updated[preparingIdx], status: 'ready' };
      }
      const nextIdx = updated.findIndex((q) => q.status === 'waiting');
      if (nextIdx >= 0) {
        updated[nextIdx] = { ...updated[nextIdx], status: 'preparing' };
      }
      return updated;
    });
  };

  const handleClearReady = () => {
    setQueue((prev) => prev.filter((q) => q.status !== 'ready'));
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Current Queue"
          value={queue.filter((q) => q.status === 'waiting').length}
          sub="customers waiting"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Avg Wait Time"
          value={`${avgWait} min`}
          sub="across all orders"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Next In Line"
          value={nextInLine?.customer ?? 'None'}
          sub={nextInLine?.order ?? 'Queue is empty'}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button onClick={handleCallNext} size="lg">
          Call Next Customer
        </Button>
        <Button variant="secondary" onClick={handleClearReady}>
          Clear Completed
        </Button>
      </div>

      {/* Queue Table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="font-semibold">Queue List</h2>
        </div>
        <DataTable columns={columns} data={queue} emptyMessage="No customers in queue" />
      </Card>
    </div>
  );
}
