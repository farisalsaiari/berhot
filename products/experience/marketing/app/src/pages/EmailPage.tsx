import { useState } from 'react';
import { StatCard, Card, Badge, DataTable, Button } from '@berhot/ui';
import type { BadgeVariant, Column } from '@berhot/ui';

type EmailStatus = 'sent' | 'opened' | 'clicked' | 'bounced' | 'scheduled';

interface EmailRecord {
  id: string;
  subject: string;
  campaign: string;
  recipients: number;
  status: EmailStatus;
  sentAt: string;
  openRate: string;
  clickRate: string;
}

const EMAILS: EmailRecord[] = [
  { id: 'E001', subject: 'Ramadan Kareem - Special Menu Inside!', campaign: 'Ramadan Special Offers', recipients: 12500, status: 'sent', sentAt: 'Feb 1, 10:00 AM', openRate: '33.6%', clickRate: '14.4%' },
  { id: 'E002', subject: 'Your Weekly Loyalty Update', campaign: 'Loyalty Points Reminder', recipients: 15000, status: 'sent', sentAt: 'Jan 28, 9:00 AM', openRate: '41.3%', clickRate: '18.7%' },
  { id: 'E003', subject: 'Discover Our New Spring Menu', campaign: 'New Menu Launch', recipients: 8900, status: 'sent', sentAt: 'Feb 5, 11:00 AM', openRate: '34.8%', clickRate: '13.5%' },
  { id: 'E004', subject: 'Valentine Dinner - Reserve Now', campaign: 'Valentine Dinner', recipients: 7200, status: 'sent', sentAt: 'Feb 2, 2:00 PM', openRate: '38.9%', clickRate: '15.3%' },
  { id: 'E005', subject: 'We Miss You! Come Back for 25% Off', campaign: 'Win-back Campaign', recipients: 2100, status: 'scheduled', sentAt: 'Feb 10, 9:00 AM', openRate: '-', clickRate: '-' },
  { id: 'E006', subject: 'Happy Birthday, {name}!', campaign: 'Birthday Special', recipients: 320, status: 'scheduled', sentAt: 'Feb 8, 8:00 AM', openRate: '-', clickRate: '-' },
];

const STATUS_BADGE: Record<EmailStatus, { variant: BadgeVariant; label: string }> = {
  sent: { variant: 'green', label: 'Sent' },
  opened: { variant: 'blue', label: 'Opened' },
  clicked: { variant: 'purple', label: 'Clicked' },
  bounced: { variant: 'red', label: 'Bounced' },
  scheduled: { variant: 'orange', label: 'Scheduled' },
};

export default function EmailPage() {
  const [showCompose, setShowCompose] = useState(false);

  const totalSent = EMAILS.filter((e) => e.status === 'sent').reduce((s, e) => s + e.recipients, 0);
  const scheduled = EMAILS.filter((e) => e.status === 'scheduled').length;

  const columns: Column<EmailRecord>[] = [
    {
      key: 'subject',
      header: 'Subject',
      render: (row) => (
        <div>
          <div className="font-semibold text-gray-900">{row.subject}</div>
          <div className="text-xs text-gray-400">{row.campaign}</div>
        </div>
      ),
    },
    {
      key: 'recipients',
      header: 'Recipients',
      render: (row) => <span className="text-gray-700">{row.recipients.toLocaleString()}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const cfg = STATUS_BADGE[row.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    { key: 'sentAt', header: 'Sent / Scheduled' },
    {
      key: 'openRate',
      header: 'Open Rate',
      render: (row) => (
        <span className={row.openRate !== '-' ? 'font-medium text-gray-700' : 'text-gray-400'}>{row.openRate}</span>
      ),
    },
    {
      key: 'clickRate',
      header: 'Click Rate',
      render: (row) => (
        <span className={row.clickRate !== '-' ? 'font-medium text-gray-700' : 'text-gray-400'}>{row.clickRate}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Emails Sent" value={totalSent.toLocaleString()} sub="This month" trend="up" />
        <StatCard label="Opened" value="36.2%" sub="Avg open rate" trend="up" />
        <StatCard label="Clicked" value="15.5%" sub="Avg click rate" trend="up" />
        <StatCard label="Bounced" value="1.2%" sub="Below threshold" trend="down" />
      </div>

      {/* Compose / Schedule */}
      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={() => setShowCompose(!showCompose)}>
          {showCompose ? 'Cancel' : 'Compose Email'}
        </Button>
        <Button variant="secondary">Schedule Email</Button>
        <div className="flex-1" />
        <span className="text-sm text-gray-400">{scheduled} scheduled</span>
      </div>

      {showCompose && (
        <Card>
          <h2 className="font-semibold text-gray-900 mb-4">New Email Campaign</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                <input
                  type="text"
                  placeholder="Enter email subject..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audience Segment</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Select a segment...</option>
                  <option>VIP Customers (1,240)</option>
                  <option>New Customers (3,450)</option>
                  <option>Inactive (2,100)</option>
                  <option>All Contacts (12,800)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                <select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Choose a template...</option>
                  <option>Welcome Email</option>
                  <option>Promo Blast</option>
                  <option>Birthday Special</option>
                  <option>Feedback Request</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Body</label>
              <textarea
                rows={5}
                placeholder="Write your email content or select a template above..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="primary">Send Now</Button>
              <Button variant="secondary">Schedule</Button>
              <Button variant="ghost">Save as Draft</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Sent Emails Table */}
      <Card padding={false}>
        <div className="px-5 pt-4 pb-2">
          <h2 className="font-semibold text-gray-900">Email History</h2>
          <p className="text-xs text-gray-400 mt-0.5">All sent and scheduled emails</p>
        </div>
        <DataTable columns={columns} data={EMAILS} emptyMessage="No emails sent yet" />
      </Card>
    </div>
  );
}
