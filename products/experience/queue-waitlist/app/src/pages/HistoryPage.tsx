import { useState } from 'react';
import { StatCard, Card, Badge, DataTable, SearchInput } from '@berhot/ui';
import type { BadgeVariant, Column } from '@berhot/ui';

type HistoryStatus = 'served' | 'no-show' | 'cancelled';

interface HistoryEntry {
  id: string;
  name: string;
  partySize: number;
  joinedAt: string;
  servedAt: string;
  waitDuration: string;
  status: HistoryStatus;
  date: string;
}

const HISTORY: HistoryEntry[] = [
  { id: 'H001', name: 'Khalid Al-Rashid', partySize: 4, joinedAt: '12:30 PM', servedAt: '12:45 PM', waitDuration: '15 min', status: 'served', date: '2026-02-07' },
  { id: 'H002', name: 'Maha Al-Otaibi', partySize: 2, joinedAt: '12:15 PM', servedAt: '12:28 PM', waitDuration: '13 min', status: 'served', date: '2026-02-07' },
  { id: 'H003', name: 'Badr Al-Sulaiman', partySize: 3, joinedAt: '12:00 PM', servedAt: '-', waitDuration: '-', status: 'no-show', date: '2026-02-07' },
  { id: 'H004', name: 'Salma Hamed', partySize: 5, joinedAt: '11:50 AM', servedAt: '12:10 PM', waitDuration: '20 min', status: 'served', date: '2026-02-07' },
  { id: 'H005', name: 'Faisal Al-Mutairi', partySize: 2, joinedAt: '11:40 AM', servedAt: '11:48 AM', waitDuration: '8 min', status: 'served', date: '2026-02-07' },
  { id: 'H006', name: 'Rania Jaber', partySize: 4, joinedAt: '11:30 AM', servedAt: '-', waitDuration: '-', status: 'cancelled', date: '2026-02-07' },
  { id: 'H007', name: 'Nayef Al-Dossary', partySize: 6, joinedAt: '11:15 AM', servedAt: '11:35 AM', waitDuration: '20 min', status: 'served', date: '2026-02-07' },
  { id: 'H008', name: 'Lina Al-Ghamdi', partySize: 2, joinedAt: '11:00 AM', servedAt: '11:07 AM', waitDuration: '7 min', status: 'served', date: '2026-02-07' },
  { id: 'H009', name: 'Waleed Turki', partySize: 3, joinedAt: '10:45 AM', servedAt: '10:58 AM', waitDuration: '13 min', status: 'served', date: '2026-02-06' },
  { id: 'H010', name: 'Dalal Al-Harbi', partySize: 4, joinedAt: '10:30 AM', servedAt: '10:50 AM', waitDuration: '20 min', status: 'served', date: '2026-02-06' },
];

const STATUS_BADGE: Record<HistoryStatus, { variant: BadgeVariant; label: string }> = {
  served: { variant: 'green', label: 'Served' },
  'no-show': { variant: 'red', label: 'No-show' },
  cancelled: { variant: 'gray', label: 'Cancelled' },
};

export default function HistoryPage() {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('2026-02-07');

  const filtered = HISTORY
    .filter((h) => dateFilter === '' || h.date === dateFilter)
    .filter((h) => search === '' || h.name.toLowerCase().includes(search.toLowerCase()));

  const totalServed = HISTORY.filter((h) => h.status === 'served').length;
  const noShows = HISTORY.filter((h) => h.status === 'no-show').length;

  const columns: Column<HistoryEntry>[] = [
    {
      key: 'name',
      header: 'Guest Name',
      render: (row) => <span className="font-semibold text-gray-900">{row.name}</span>,
    },
    { key: 'partySize', header: 'Party Size' },
    { key: 'joinedAt', header: 'Joined At' },
    { key: 'servedAt', header: 'Served At' },
    {
      key: 'waitDuration',
      header: 'Wait Duration',
      render: (row) => (
        <span className={row.waitDuration !== '-' ? 'text-gray-700' : 'text-gray-400'}>{row.waitDuration}</span>
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
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Served" value={totalServed} sub="Today's total" trend="up" />
        <StatCard label="Avg Wait Time" value="14 min" sub="2 min better than last week" trend="up" />
        <StatCard label="Peak Hour" value="12:00 - 1:00 PM" sub="32 guests served" trend="neutral" />
        <StatCard label="No-shows" value={noShows} sub={`${((noShows / HISTORY.length) * 100).toFixed(0)}% no-show rate`} trend="down" />
      </div>

      {/* History Table */}
      <Card padding={false}>
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Queue History</h2>
            <p className="text-xs text-gray-400 mt-0.5">{filtered.length} entries</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SearchInput placeholder="Search guests..." onSearch={setSearch} className="w-56" />
            <button className="px-4 py-2 bg-white text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition">
              Export CSV
            </button>
          </div>
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No history for selected date" />
      </Card>
    </div>
  );
}
