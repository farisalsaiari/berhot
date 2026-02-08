import { useState } from 'react';
import { Card, Badge, Button, TabBar } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

type TemplateType = 'email' | 'sms' | 'push';

interface Template {
  id: string;
  name: string;
  type: TemplateType;
  preview: string;
  lastModified: string;
  usedCount: number;
}

const TEMPLATES: Template[] = [
  { id: 'T001', name: 'Welcome Email', type: 'email', preview: 'Welcome to our family! We are excited to have you join us. Enjoy exclusive deals...', lastModified: '2 days ago', usedCount: 45 },
  { id: 'T002', name: 'Order Confirmation', type: 'email', preview: 'Thank you for your order! Your order #{order_id} has been confirmed and will be ready...', lastModified: '1 week ago', usedCount: 230 },
  { id: 'T003', name: 'Promo Blast', type: 'sms', preview: 'Special offer just for you! Get 20% off your next visit. Use code: {promo_code}. Valid until...', lastModified: '3 days ago', usedCount: 18 },
  { id: 'T004', name: 'Reservation Reminder', type: 'sms', preview: 'Hi {name}, this is a reminder about your reservation tomorrow at {time}. Reply C to confirm.', lastModified: '5 days ago', usedCount: 120 },
  { id: 'T005', name: 'Birthday Special', type: 'email', preview: 'Happy Birthday, {name}! Celebrate with us and enjoy a complimentary dessert on your special...', lastModified: '1 day ago', usedCount: 32 },
  { id: 'T006', name: 'New Arrival Alert', type: 'push', preview: 'New items just dropped! Check out our latest additions to the menu. Limited time only...', lastModified: '4 days ago', usedCount: 15 },
  { id: 'T007', name: 'Feedback Request', type: 'email', preview: 'How was your experience? We would love to hear your feedback. Rate your recent visit...', lastModified: '1 week ago', usedCount: 85 },
  { id: 'T008', name: 'Loyalty Milestone', type: 'push', preview: 'Congratulations! You have earned {points} points. You are just {remaining} points away from...', lastModified: '2 weeks ago', usedCount: 42 },
];

const TYPE_BADGE: Record<TemplateType, { variant: BadgeVariant; label: string }> = {
  email: { variant: 'purple', label: 'Email' },
  sms: { variant: 'orange', label: 'SMS' },
  push: { variant: 'blue', label: 'Push' },
};

const TABS = [
  { key: 'all', label: 'All Templates' },
  { key: 'email', label: 'Email' },
  { key: 'sms', label: 'SMS' },
  { key: 'push', label: 'Push' },
];

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('all');

  const filtered = activeTab === 'all' ? TEMPLATES : TEMPLATES.filter((t) => t.type === activeTab);

  const tabsWithCounts = TABS.map((t) => ({
    ...t,
    count: t.key === 'all' ? TEMPLATES.length : TEMPLATES.filter((tmpl) => tmpl.type === t.key).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <TabBar tabs={tabsWithCounts} activeKey={activeTab} onChange={setActiveTab} />
        <Button variant="primary">+ New Template</Button>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {filtered.map((template) => {
          const typeCfg = TYPE_BADGE[template.type];
          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow cursor-pointer flex flex-col">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{template.name}</h3>
                <Badge variant={typeCfg.variant}>{typeCfg.label}</Badge>
              </div>

              <p className="text-sm text-gray-500 line-clamp-2 flex-1">{template.preview}</p>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-400">
                  Modified {template.lastModified} &middot; Used {template.usedCount}x
                </div>
                <Button variant="ghost" size="sm">Edit</Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Template Editor Placeholder */}
      <Card className="border-dashed border-2 border-gray-300 bg-gray-50/50">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h3 className="font-semibold text-gray-600">Template Editor</h3>
          <p className="text-sm text-gray-400 mt-1">Select a template to edit, or create a new one</p>
          <p className="text-xs text-gray-300 mt-3">Drag-and-drop editor &middot; Variable insertion &middot; Preview mode</p>
        </div>
      </Card>
    </div>
  );
}
