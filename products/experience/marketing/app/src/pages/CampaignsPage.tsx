import { useState } from 'react';
import { Card, Badge, Button, TabBar } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

type CampaignStatus = 'active' | 'draft' | 'completed';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push';
  status: CampaignStatus;
  audienceSize: number;
  startDate: string;
  endDate: string;
  sent: number;
  opened: number;
  converted: number;
}

const CAMPAIGNS: Campaign[] = [
  { id: 'C001', name: 'Ramadan Special Offers', type: 'email', status: 'active', audienceSize: 12500, startDate: '2026-02-01', endDate: '2026-03-01', sent: 12500, opened: 4200, converted: 340 },
  { id: 'C002', name: 'Weekend Brunch Promo', type: 'sms', status: 'active', audienceSize: 5800, startDate: '2026-02-03', endDate: '2026-02-10', sent: 5800, opened: 5100, converted: 580 },
  { id: 'C003', name: 'New Menu Launch', type: 'email', status: 'active', audienceSize: 8900, startDate: '2026-02-05', endDate: '2026-02-28', sent: 8900, opened: 3100, converted: 210 },
  { id: 'C004', name: 'Spring Collection Teaser', type: 'email', status: 'draft', audienceSize: 15000, startDate: '', endDate: '', sent: 0, opened: 0, converted: 0 },
  { id: 'C005', name: 'Flash Sale Alert', type: 'sms', status: 'draft', audienceSize: 8000, startDate: '', endDate: '', sent: 0, opened: 0, converted: 0 },
  { id: 'C006', name: 'Loyalty Points Reminder', type: 'push', status: 'completed', audienceSize: 15000, startDate: '2026-01-15', endDate: '2026-01-30', sent: 15000, opened: 6200, converted: 950 },
  { id: 'C007', name: 'Valentine Dinner', type: 'email', status: 'completed', audienceSize: 7200, startDate: '2026-02-01', endDate: '2026-02-14', sent: 7200, opened: 2800, converted: 280 },
  { id: 'C008', name: 'New Year Campaign', type: 'email', status: 'completed', audienceSize: 20000, startDate: '2025-12-25', endDate: '2026-01-05', sent: 20000, opened: 8400, converted: 1200 },
];

const STATUS_BADGE: Record<CampaignStatus, { variant: BadgeVariant; label: string }> = {
  active: { variant: 'green', label: 'Active' },
  draft: { variant: 'gray', label: 'Draft' },
  completed: { variant: 'blue', label: 'Completed' },
};

const TYPE_BADGE: Record<string, { variant: BadgeVariant }> = {
  email: { variant: 'purple' },
  sms: { variant: 'orange' },
  push: { variant: 'blue' },
};

const TABS = [
  { key: 'active', label: 'Active' },
  { key: 'draft', label: 'Draft' },
  { key: 'completed', label: 'Completed' },
];

export default function CampaignsPage() {
  const [activeTab, setActiveTab] = useState('active');

  const filtered = CAMPAIGNS.filter((c) => c.status === activeTab);

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    count: CAMPAIGNS.filter((c) => c.status === t.key).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <TabBar tabs={tabsWithCounts} activeKey={activeTab} onChange={setActiveTab} />
        <Button variant="primary">+ Create Campaign</Button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {filtered.map((campaign) => (
          <Card key={campaign.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={TYPE_BADGE[campaign.type].variant}>{campaign.type.toUpperCase()}</Badge>
                  <Badge variant={STATUS_BADGE[campaign.status].variant}>{STATUS_BADGE[campaign.status].label}</Badge>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Audience Size</span>
                <span className="font-medium text-gray-900">{campaign.audienceSize.toLocaleString()}</span>
              </div>
              {campaign.status !== 'draft' && (
                <>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Dates</span>
                    <span className="text-gray-700">{campaign.startDate} - {campaign.endDate}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Sent / Opened</span>
                    <span className="text-gray-700">{campaign.sent.toLocaleString()} / {campaign.opened.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Conversions</span>
                    <span className="font-semibold text-green-700">{campaign.converted.toLocaleString()}</span>
                  </div>
                </>
              )}
              {campaign.status === 'draft' && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Status</span>
                  <span className="text-gray-400">Not yet scheduled</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
              {campaign.status === 'draft' && (
                <>
                  <Button variant="primary" size="sm">Edit</Button>
                  <Button variant="secondary" size="sm">Schedule</Button>
                </>
              )}
              {campaign.status === 'active' && (
                <>
                  <Button variant="secondary" size="sm">View Report</Button>
                  <Button variant="ghost" size="sm">Pause</Button>
                </>
              )}
              {campaign.status === 'completed' && (
                <Button variant="secondary" size="sm">View Report</Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium">No {activeTab} campaigns</p>
          <p className="text-sm mt-1">Create a new campaign to get started</p>
        </div>
      )}
    </div>
  );
}
