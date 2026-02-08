import { Card, Badge, Button } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

interface AudienceSegment {
  id: string;
  name: string;
  memberCount: number;
  criteria: string[];
  lastUsed: string;
  growth: string;
}

const SEGMENTS: AudienceSegment[] = [
  { id: 'S001', name: 'VIP Customers', memberCount: 1240, criteria: ['Spent > SAR 5,000', 'Visits > 20', 'Member 6+ months'], lastUsed: '2 days ago', growth: '+8%' },
  { id: 'S002', name: 'New Customers (30 days)', memberCount: 3450, criteria: ['Registered < 30 days', 'First purchase made'], lastUsed: '1 day ago', growth: '+24%' },
  { id: 'S003', name: 'Inactive (90+ days)', memberCount: 2100, criteria: ['Last visit > 90 days', 'Has email'], lastUsed: '5 days ago', growth: '-3%' },
  { id: 'S004', name: 'Weekend Diners', memberCount: 4800, criteria: ['Orders on Fri-Sat', 'Avg order > SAR 150'], lastUsed: '3 days ago', growth: '+12%' },
  { id: 'S005', name: 'Birthday This Month', memberCount: 320, criteria: ['Birthday in Feb 2026', 'Active customer'], lastUsed: '1 week ago', growth: '+0%' },
  { id: 'S006', name: 'High-Value Prospects', memberCount: 890, criteria: ['Visited 3+ times', 'No loyalty sign-up', 'Avg spend > SAR 200'], lastUsed: 'Never', growth: '+5%' },
];

export default function AudiencesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Audience Segments</h2>
          <p className="text-sm text-gray-400 mt-0.5">{SEGMENTS.length} segments &middot; {SEGMENTS.reduce((s, a) => s + a.memberCount, 0).toLocaleString()} total contacts</p>
        </div>
        <Button variant="primary">+ Create Segment</Button>
      </div>

      <div className="grid grid-cols-2 gap-5">
        {SEGMENTS.map((segment) => (
          <Card key={segment.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-semibold text-gray-900">{segment.name}</h3>
                <div className="text-sm text-gray-500 mt-0.5">{segment.memberCount.toLocaleString()} members</div>
              </div>
              <span className={`text-sm font-semibold ${segment.growth.startsWith('+') && segment.growth !== '+0%' ? 'text-green-600' : segment.growth.startsWith('-') ? 'text-red-600' : 'text-gray-400'}`}>
                {segment.growth}
              </span>
            </div>

            <div className="pt-3 border-t border-gray-100">
              <div className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Criteria</div>
              <div className="flex flex-wrap gap-1.5">
                {segment.criteria.map((c, i) => (
                  <Badge key={i} variant="gray">{c}</Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-400">Last used: {segment.lastUsed}</span>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm">Edit</Button>
                <Button variant="primary" size="sm">Use in Campaign</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Rule Builder Preview */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-1">Segment Rule Builder</h3>
        <p className="text-xs text-gray-400 mb-4">Build custom audience segments with rules</p>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">WHERE</span>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Total Spent</option>
              <option>Visit Count</option>
              <option>Last Visit</option>
              <option>Registration Date</option>
            </select>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>is greater than</option>
              <option>is less than</option>
              <option>equals</option>
            </select>
            <input type="text" placeholder="Value" className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32" />
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded">AND</span>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Has Email</option>
              <option>Has Phone</option>
              <option>Is Active</option>
            </select>
            <select className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>equals</option>
            </select>
            <input type="text" placeholder="true" className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32" />
          </div>
          <Button variant="ghost" size="sm">+ Add Rule</Button>
        </div>
      </Card>
    </div>
  );
}
