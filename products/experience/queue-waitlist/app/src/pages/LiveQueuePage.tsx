import { useState } from 'react';
import { StatCard, Badge, Card, Button, DataTable } from '@berhot/ui';
import type { BadgeVariant, Column } from '@berhot/ui';

type QueueStatus = 'waiting' | 'called' | 'serving' | 'no-show';

interface QueueEntry {
  position: number;
  name: string;
  partySize: number;
  waitTime: string;
  status: QueueStatus;
  phone: string;
  joinedAt: string;
}

const QUEUE: QueueEntry[] = [
  { position: 1, name: 'Khalid Al-Rashid', partySize: 4, waitTime: '2 min', status: 'serving', phone: '+966 55 123 4567', joinedAt: '12:30 PM' },
  { position: 2, name: 'Fatima Hassan', partySize: 2, waitTime: '8 min', status: 'called', phone: '+966 55 234 5678', joinedAt: '12:35 PM' },
  { position: 3, name: 'Omar Bin Saeed', partySize: 6, waitTime: '14 min', status: 'waiting', phone: '+966 55 345 6789', joinedAt: '12:38 PM' },
  { position: 4, name: 'Noura Al-Faisal', partySize: 3, waitTime: '18 min', status: 'waiting', phone: '+966 55 456 7890', joinedAt: '12:42 PM' },
  { position: 5, name: 'Ahmed Mansour', partySize: 2, waitTime: '22 min', status: 'waiting', phone: '+966 55 567 8901', joinedAt: '12:45 PM' },
  { position: 6, name: 'Layla Qasim', partySize: 5, waitTime: '25 min', status: 'waiting', phone: '+966 55 678 9012', joinedAt: '12:48 PM' },
  { position: 7, name: 'Sultan Al-Harbi', partySize: 2, waitTime: '28 min', status: 'no-show', phone: '+966 55 789 0123', joinedAt: '12:20 PM' },
  { position: 8, name: 'Reem Saleh', partySize: 4, waitTime: '30 min', status: 'waiting', phone: '+966 55 890 1234', joinedAt: '12:52 PM' },
];

const STATUS_BADGE: Record<QueueStatus, { variant: BadgeVariant; label: string }> = {
  waiting: { variant: 'gray', label: 'Waiting' },
  called: { variant: 'orange', label: 'Called' },
  serving: { variant: 'green', label: 'Serving' },
  'no-show': { variant: 'red', label: 'No-show' },
};

export default function LiveQueuePage() {
  const [queue, setQueue] = useState(QUEUE);

  const waiting = queue.filter((q) => q.status === 'waiting').length;
  const serving = queue.filter((q) => q.status === 'serving').length;
  const servedToday = 47;

  const columns: Column<QueueEntry>[] = [
    {
      key: 'position',
      header: '#',
      render: (row) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-700 font-bold text-sm rounded-lg">
          {row.position}
        </span>
      ),
    },
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
    {
      key: 'partySize',
      header: 'Party Size',
      render: (row) => (
        <span className="inline-flex items-center gap-1 text-gray-700">
          <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {row.partySize}
        </span>
      ),
    },
    {
      key: 'waitTime',
      header: 'Wait Time',
      render: (row) => <span className="text-gray-600">{row.waitTime}</span>,
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
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {row.status === 'waiting' && (
            <Button variant="primary" size="sm">Call Next</Button>
          )}
          {row.status === 'called' && (
            <Button variant="primary" size="sm">Seat</Button>
          )}
          <Button variant="ghost" size="sm">Skip</Button>
          <Button variant="danger" size="sm">Remove</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Current Wait" value="~15 min" sub="Based on avg service time" trend="neutral" />
        <StatCard label="In Queue" value={waiting} sub={`${serving} currently being served`} trend="up" />
        <StatCard label="Avg Wait Time" value="12 min" sub="3 min faster than yesterday" trend="up" />
        <StatCard label="Served Today" value={servedToday} sub="+12% vs last week" trend="up" />
      </div>

      {/* Queue Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="primary">Call Next in Queue</Button>
          <Button variant="secondary">Add to Queue</Button>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live updating
        </div>
      </div>

      {/* Queue Table */}
      <Card padding={false}>
        <div className="px-5 pt-4 pb-2 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Current Queue</h2>
          <p className="text-xs text-gray-400 mt-0.5">{queue.length} people in queue</p>
        </div>
        <DataTable columns={columns} data={queue} emptyMessage="Queue is empty" />
      </Card>
    </div>
  );
}
