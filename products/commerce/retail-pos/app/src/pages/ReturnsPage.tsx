import { useState } from 'react';
import { Card, Badge, Button, DataTable, StatCard, SearchInput } from '@berhot/ui';
import type { Column } from '@berhot/ui';

interface Return {
  id: string;
  originalTxn: string;
  date: string;
  customer: string;
  items: string[];
  reason: string;
  refundAmount: number;
  refundMethod: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
}

const RETURNS: Return[] = [
  { id: 'RTN-0091', originalTxn: 'TXN-4816', date: '2026-02-07', customer: 'Reem K.', items: ['Fitness Tracker', 'Watch Band', 'Screen Protector', 'Charging Cable'], reason: 'Defective product', refundAmount: 367, refundMethod: 'Original Card', status: 'completed' },
  { id: 'RTN-0090', originalTxn: 'TXN-4814', date: '2026-02-07', customer: 'Yusuf H.', items: ['USB Hub'], reason: 'Wrong item received', refundAmount: 110, refundMethod: 'Original Card', status: 'completed' },
  { id: 'RTN-0089', originalTxn: 'TXN-4798', date: '2026-02-06', customer: 'Salma B.', items: ['Bluetooth Speaker Mini'], reason: 'Changed mind', refundAmount: 120, refundMethod: 'Store Credit', status: 'approved' },
  { id: 'RTN-0088', originalTxn: 'TXN-4785', date: '2026-02-06', customer: 'Tariq M.', items: ['Mechanical Keyboard'], reason: 'Defective - keys not responding', refundAmount: 340, refundMethod: 'Cash', status: 'pending' },
  { id: 'RTN-0087', originalTxn: 'TXN-4770', date: '2026-02-05', customer: 'Aisha D.', items: ['Phone Case (Clear)'], reason: 'Wrong size for phone model', refundAmount: 40, refundMethod: 'Exchange', status: 'completed' },
  { id: 'RTN-0086', originalTxn: 'TXN-4755', date: '2026-02-04', customer: 'Nasser F.', items: ['Portable Charger 20K'], reason: 'Not charging properly', refundAmount: 220, refundMethod: 'Original Card', status: 'rejected' },
  { id: 'RTN-0085', originalTxn: 'TXN-4740', date: '2026-02-03', customer: 'Hind S.', items: ['Wireless Earbuds Pro'], reason: 'Audio quality issues', refundAmount: 180, refundMethod: 'Original Card', status: 'completed' },
];

const STATUS_BADGE: Record<Return['status'], { variant: 'orange' | 'blue' | 'green' | 'red'; label: string }> = {
  pending: { variant: 'orange', label: 'Pending' },
  approved: { variant: 'blue', label: 'Approved' },
  completed: { variant: 'green', label: 'Completed' },
  rejected: { variant: 'red', label: 'Rejected' },
};

const returnColumns: Column<Return>[] = [
  { key: 'id', header: 'Return ID', render: (row) => <span className="font-mono text-xs font-medium">{row.id}</span> },
  { key: 'originalTxn', header: 'Original Txn', render: (row) => <span className="font-mono text-xs text-gray-500">{row.originalTxn}</span> },
  { key: 'date', header: 'Date' },
  { key: 'customer', header: 'Customer' },
  {
    key: 'items',
    header: 'Items',
    render: (row) => (
      <div>
        <span className="text-sm">{row.items[0]}</span>
        {row.items.length > 1 && <span className="text-xs text-gray-400 ml-1">+{row.items.length - 1} more</span>}
      </div>
    ),
  },
  { key: 'reason', header: 'Reason', render: (row) => <span className="text-sm text-gray-600">{row.reason}</span> },
  { key: 'refundAmount', header: 'Refund', render: (row) => <span className="font-semibold">{row.refundAmount} SAR</span> },
  {
    key: 'status',
    header: 'Status',
    render: (row) => {
      const badge = STATUS_BADGE[row.status];
      return <Badge variant={badge.variant}>{badge.label}</Badge>;
    },
  },
];

export default function ReturnsPage() {
  const [search, setSearch] = useState('');
  const [returnTxnId, setReturnTxnId] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [returnMethod, setReturnMethod] = useState('Original Card');

  const filtered = RETURNS.filter(
    (r) =>
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.originalTxn.toLowerCase().includes(search.toLowerCase()) ||
      r.customer.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = RETURNS.filter((r) => r.status === 'pending').length;
  const totalRefunded = RETURNS.filter((r) => r.status === 'completed').reduce((sum, r) => sum + r.refundAmount, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Returns" value={RETURNS.length} sub="this week" />
        <StatCard label="Pending" value={pendingCount} sub="awaiting review" trend={pendingCount > 0 ? 'down' : 'neutral'} />
        <StatCard label="Total Refunded" value={`${totalRefunded.toLocaleString()} SAR`} sub="completed refunds" />
        <StatCard label="Return Rate" value="2.3%" sub="of all transactions" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Process Return Form */}
        <Card>
          <h3 className="font-semibold text-sm mb-4">Process New Return</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Original Transaction ID</label>
              <input
                type="text"
                placeholder="e.g. TXN-4821"
                value={returnTxnId}
                onChange={(e) => setReturnTxnId(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Reason</label>
              <select
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select reason...</option>
                <option>Defective product</option>
                <option>Wrong item received</option>
                <option>Changed mind</option>
                <option>Wrong size/fit</option>
                <option>Quality not as expected</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Refund Method</label>
              <select
                value={returnMethod}
                onChange={(e) => setReturnMethod(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option>Original Card</option>
                <option>Cash</option>
                <option>Store Credit</option>
                <option>Exchange</option>
              </select>
            </div>
            <Button className="w-full">Look Up Transaction</Button>
          </div>
        </Card>

        {/* Refund Status Tracking */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-sm mb-4">Refund Status Tracking</h3>
          <div className="space-y-3">
            {RETURNS.filter((r) => r.status !== 'completed' && r.status !== 'rejected').map((ret) => (
              <div key={ret.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-medium">{ret.id}</span>
                      <Badge variant={STATUS_BADGE[ret.status].variant}>
                        {STATUS_BADGE[ret.status].label}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{ret.customer} - {ret.items[0]}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{ret.refundAmount} SAR</div>
                  <div className="text-xs text-gray-400">{ret.refundMethod}</div>
                </div>
              </div>
            ))}
            {RETURNS.filter((r) => r.status !== 'completed' && r.status !== 'rejected').length === 0 && (
              <div className="text-center py-6 text-gray-400 text-sm">All returns have been processed</div>
            )}
          </div>
        </Card>
      </div>

      {/* Return History Table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold">Return History</h3>
          <SearchInput placeholder="Search returns..." onSearch={setSearch} className="w-64" />
        </div>
        <DataTable columns={returnColumns} data={filtered} emptyMessage="No returns found" />
      </Card>
    </div>
  );
}
