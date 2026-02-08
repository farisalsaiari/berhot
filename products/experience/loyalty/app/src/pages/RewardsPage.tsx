import { useState } from 'react';
import { Card, Badge, Button, SearchInput, TabBar } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

interface Reward {
  id: number;
  name: string;
  pointsRequired: number;
  type: 'discount' | 'free_item' | 'experience';
  description: string;
  redemptions: number;
  status: 'active' | 'paused';
  image?: string;
}

const TYPE_CONFIG: Record<Reward['type'], { label: string; variant: BadgeVariant }> = {
  discount: { label: 'Discount', variant: 'blue' },
  free_item: { label: 'Free Item', variant: 'green' },
  experience: { label: 'Experience', variant: 'purple' },
};

const STATUS_CONFIG: Record<Reward['status'], { label: string; variant: BadgeVariant }> = {
  active: { label: 'Active', variant: 'green' },
  paused: { label: 'Paused', variant: 'gray' },
};

const REWARDS: Reward[] = [
  { id: 1, name: '10% Off Next Purchase', pointsRequired: 200, type: 'discount', description: 'Get 10% discount on your next purchase at any branch. Valid for 30 days after redemption.', redemptions: 1_247, status: 'active' },
  { id: 2, name: '20% Off Next Purchase', pointsRequired: 500, type: 'discount', description: 'Get 20% discount on your next purchase at any branch. Valid for 30 days after redemption.', redemptions: 832, status: 'active' },
  { id: 3, name: 'Free Coffee', pointsRequired: 150, type: 'free_item', description: 'Enjoy a complimentary coffee of your choice at our in-store cafe.', redemptions: 2_340, status: 'active' },
  { id: 4, name: 'Free Dessert', pointsRequired: 250, type: 'free_item', description: 'Choose any dessert from our menu, completely on the house.', redemptions: 1_456, status: 'active' },
  { id: 5, name: 'SAR 50 Gift Card', pointsRequired: 1_000, type: 'discount', description: 'Receive a SAR 50 gift card to use at any of our locations or partner stores.', redemptions: 567, status: 'active' },
  { id: 6, name: 'SAR 100 Gift Card', pointsRequired: 2_000, type: 'discount', description: 'Receive a SAR 100 gift card to use at any of our locations or partner stores.', redemptions: 234, status: 'active' },
  { id: 7, name: 'VIP Event Access', pointsRequired: 5_000, type: 'experience', description: 'Exclusive invitation to our quarterly VIP customer appreciation event with live entertainment and special offers.', redemptions: 89, status: 'active' },
  { id: 8, name: 'Personal Styling Session', pointsRequired: 3_000, type: 'experience', description: 'One-on-one 60-minute styling consultation with our senior stylist.', redemptions: 145, status: 'active' },
  { id: 9, name: 'Birthday Spa Package', pointsRequired: 4_000, type: 'experience', description: 'Full spa package including massage, facial, and manicure. Redeemable during your birthday month.', redemptions: 67, status: 'active' },
  { id: 10, name: 'Free Product Sample Box', pointsRequired: 800, type: 'free_item', description: 'Curated box of premium hair and beauty product samples delivered to your door.', redemptions: 423, status: 'paused' },
  { id: 11, name: '50% Off Service', pointsRequired: 1_500, type: 'discount', description: 'Half price on any single service. Cannot be combined with other offers.', redemptions: 312, status: 'paused' },
  { id: 12, name: 'Charity Donation', pointsRequired: 500, type: 'experience', description: 'Convert your points to a charitable donation. We match your contribution to local community programs.', redemptions: 198, status: 'active' },
];

const FILTER_TABS = [
  { key: 'all', label: 'All Rewards', count: REWARDS.length },
  { key: 'active', label: 'Active', count: REWARDS.filter((r) => r.status === 'active').length },
  { key: 'paused', label: 'Paused', count: REWARDS.filter((r) => r.status === 'paused').length },
  { key: 'discount', label: 'Discounts', count: REWARDS.filter((r) => r.type === 'discount').length },
  { key: 'free_item', label: 'Free Items', count: REWARDS.filter((r) => r.type === 'free_item').length },
  { key: 'experience', label: 'Experiences', count: REWARDS.filter((r) => r.type === 'experience').length },
];

export default function RewardsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = REWARDS.filter((r) => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    if (activeFilter === 'all') return matchSearch;
    if (activeFilter === 'active' || activeFilter === 'paused') return matchSearch && r.status === activeFilter;
    return matchSearch && r.type === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SearchInput placeholder="Search rewards..." onSearch={setSearch} className="w-72" />
        <Button variant="primary" size="md">+ Add Reward</Button>
      </div>

      {/* Filter Tabs */}
      <TabBar tabs={FILTER_TABS} activeKey={activeFilter} onChange={setActiveFilter} />

      {/* Rewards Grid */}
      <div className="grid grid-cols-3 gap-5">
        {filtered.map((reward) => {
          const typeCfg = TYPE_CONFIG[reward.type];
          const statusCfg = STATUS_CONFIG[reward.status];

          return (
            <Card key={reward.id} className={`hover:shadow-md transition-shadow ${reward.status === 'paused' ? 'opacity-60' : ''}`}>
              {/* Top Bar */}
              <div className="flex items-start justify-between mb-3">
                <Badge variant={typeCfg.variant}>{typeCfg.label}</Badge>
                <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
              </div>

              {/* Content */}
              <h3 className="text-base font-semibold text-gray-900 mb-1">{reward.name}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{reward.description}</p>

              {/* Points */}
              <div className="flex items-center gap-2 mb-4 p-3 bg-purple-50 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                <span className="text-lg font-bold text-purple-700">{reward.pointsRequired.toLocaleString()}</span>
                <span className="text-sm text-purple-500">points required</span>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-sm">
                  <span className="font-bold text-gray-900">{reward.redemptions.toLocaleString()}</span>
                  <span className="text-gray-400 ml-1">redemptions</span>
                </div>
                <div className="flex gap-1">
                  {reward.status === 'active' ? (
                    <Button variant="secondary" size="sm">Pause</Button>
                  ) : (
                    <Button variant="primary" size="sm">Activate</Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
