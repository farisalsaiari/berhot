import { useState } from 'react';
import { StatCard, Card, Badge, DataTable, Button } from '@berhot/ui';
import type { BadgeVariant, Column } from '@berhot/ui';

type SmsStatus = 'delivered' | 'sent' | 'failed' | 'pending';

interface SmsRecord {
  id: string;
  campaign: string;
  recipient: string;
  message: string;
  status: SmsStatus;
  sentAt: string;
  replied: boolean;
}

const SMS_HISTORY: SmsRecord[] = [
  { id: 'SM001', campaign: 'Weekend Brunch Promo', recipient: '+966 55 111 2233', message: 'Special offer! 20% off brunch this weekend...', status: 'delivered', sentAt: '10:30 AM', replied: true },
  { id: 'SM002', campaign: 'Weekend Brunch Promo', recipient: '+966 55 222 3344', message: 'Special offer! 20% off brunch this weekend...', status: 'delivered', sentAt: '10:30 AM', replied: false },
  { id: 'SM003', campaign: 'Reservation Reminder', recipient: '+966 55 333 4455', message: 'Reminder: Your reservation is tomorrow at 7 PM...', status: 'delivered', sentAt: '9:00 AM', replied: true },
  { id: 'SM004', campaign: 'Weekend Brunch Promo', recipient: '+966 55 444 5566', message: 'Special offer! 20% off brunch this weekend...', status: 'sent', sentAt: '10:31 AM', replied: false },
  { id: 'SM005', campaign: 'Reservation Reminder', recipient: '+966 55 555 6677', message: 'Reminder: Your reservation is tomorrow at 8 PM...', status: 'failed', sentAt: '9:01 AM', replied: false },
  { id: 'SM006', campaign: 'Flash Sale Alert', recipient: '+966 55 666 7788', message: 'Flash sale! 30% off all menu items today only...', status: 'pending', sentAt: '-', replied: false },
  { id: 'SM007', campaign: 'Weekend Brunch Promo', recipient: '+966 55 777 8899', message: 'Special offer! 20% off brunch this weekend...', status: 'delivered', sentAt: '10:30 AM', replied: false },
  { id: 'SM008', campaign: 'Reservation Reminder', recipient: '+966 55 888 9900', message: 'Reminder: Your reservation is tomorrow at 6 PM...', status: 'delivered', sentAt: '9:00 AM', replied: true },
];

const STATUS_BADGE: Record<SmsStatus, { variant: BadgeVariant; label: string }> = {
  delivered: { variant: 'green', label: 'Delivered' },
  sent: { variant: 'blue', label: 'Sent' },
  failed: { variant: 'red', label: 'Failed' },
  pending: { variant: 'gray', label: 'Pending' },
};

export default function SmsPage() {
  const [message, setMessage] = useState('');

  const delivered = SMS_HISTORY.filter((s) => s.status === 'delivered').length;
  const replied = SMS_HISTORY.filter((s) => s.replied).length;

  const columns: Column<SmsRecord>[] = [
    {
      key: 'campaign',
      header: 'Campaign',
      render: (row) => <span className="font-medium text-gray-900">{row.campaign}</span>,
    },
    { key: 'recipient', header: 'Recipient' },
    {
      key: 'message',
      header: 'Message',
      render: (row) => (
        <span className="text-gray-500 text-sm truncate max-w-[200px] block">{row.message}</span>
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
    { key: 'sentAt', header: 'Sent At' },
    {
      key: 'replied',
      header: 'Replied',
      render: (row) => (
        <span className={row.replied ? 'text-green-600 font-medium' : 'text-gray-400'}>
          {row.replied ? 'Yes' : 'No'}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Messages Sent" value={SMS_HISTORY.length} sub="Today" trend="up" />
        <StatCard label="Delivered" value={delivered} sub={`${((delivered / SMS_HISTORY.length) * 100).toFixed(0)}% delivery rate`} trend="up" />
        <StatCard label="Replied" value={replied} sub={`${((replied / delivered) * 100).toFixed(0)}% reply rate`} trend="up" />
      </div>

      {/* Compose New SMS */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-1">Compose New SMS</h2>
        <p className="text-xs text-gray-400 mb-4">Send a quick SMS to an audience segment</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audience Segment</label>
              <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select a segment...</option>
                <option>VIP Customers (1,240)</option>
                <option>New Customers (3,450)</option>
                <option>Weekend Diners (4,800)</option>
                <option>All Contacts (12,800)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template (optional)</label>
              <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Write custom message...</option>
                <option>Promo Blast</option>
                <option>Reservation Reminder</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="Type your SMS message here... Use {name}, {promo_code} for variables."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">{message.length}/160 characters</span>
              <Button variant="primary" size="sm">Send SMS</Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Send History */}
      <Card padding={false}>
        <div className="px-5 pt-4 pb-2">
          <h2 className="font-semibold text-gray-900">Send History</h2>
          <p className="text-xs text-gray-400 mt-0.5">Recent SMS messages</p>
        </div>
        <DataTable columns={columns} data={SMS_HISTORY} emptyMessage="No SMS history" />
      </Card>
    </div>
  );
}
