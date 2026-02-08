import { useState } from 'react';
import { Card, Badge, Button, TabBar } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

type RequestStatus = 'pending' | 'approved' | 'rejected';
type RequestType = 'swap' | 'time-off' | 'cover';

interface ShiftRequest {
  id: string;
  employee: string;
  type: RequestType;
  dates: string;
  reason: string;
  status: RequestStatus;
  submittedAt: string;
  swapWith?: string;
}

const REQUESTS: ShiftRequest[] = [
  { id: '1', employee: 'Ahmed Al-Farsi', type: 'swap', dates: 'Feb 5, 2026', reason: 'Family commitment in the evening', status: 'pending', submittedAt: '2 hours ago', swapWith: 'Layla Mansour' },
  { id: '2', employee: 'Sara Hassan', type: 'time-off', dates: 'Feb 10-12, 2026', reason: 'Medical appointment and recovery', status: 'pending', submittedAt: '5 hours ago' },
  { id: '3', employee: 'Khaled Rami', type: 'cover', dates: 'Feb 7, 2026', reason: 'Need someone to cover night shift', status: 'pending', submittedAt: '1 day ago' },
  { id: '4', employee: 'Yusuf Bader', type: 'time-off', dates: 'Feb 1-2, 2026', reason: 'Personal day', status: 'approved', submittedAt: '3 days ago' },
  { id: '5', employee: 'Layla Mansour', type: 'swap', dates: 'Jan 30, 2026', reason: 'Schedule conflict with classes', status: 'approved', submittedAt: '5 days ago', swapWith: 'Ahmed Al-Farsi' },
  { id: '6', employee: 'Nora Saeed', type: 'time-off', dates: 'Jan 28, 2026', reason: 'Vacation', status: 'approved', submittedAt: '1 week ago' },
  { id: '7', employee: 'Fatima Nour', type: 'cover', dates: 'Jan 25, 2026', reason: 'Childcare emergency', status: 'rejected', submittedAt: '2 weeks ago' },
  { id: '8', employee: 'Omar Khalid', type: 'swap', dates: 'Jan 22, 2026', reason: 'Prefer morning shift', status: 'rejected', submittedAt: '2 weeks ago', swapWith: 'Sara Hassan' },
];

const STATUS_BADGE: Record<RequestStatus, { variant: BadgeVariant; label: string }> = {
  pending: { variant: 'orange', label: 'Pending' },
  approved: { variant: 'green', label: 'Approved' },
  rejected: { variant: 'red', label: 'Rejected' },
};

const TYPE_BADGE: Record<RequestType, { variant: BadgeVariant; label: string }> = {
  swap: { variant: 'blue', label: 'Shift Swap' },
  'time-off': { variant: 'purple', label: 'Time Off' },
  cover: { variant: 'orange', label: 'Cover Request' },
};

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState('pending');

  const filtered = REQUESTS.filter((r) => r.status === activeTab);

  const tabs = [
    { key: 'pending', label: 'Pending', count: REQUESTS.filter((r) => r.status === 'pending').length },
    { key: 'approved', label: 'Approved', count: REQUESTS.filter((r) => r.status === 'approved').length },
    { key: 'rejected', label: 'Rejected', count: REQUESTS.filter((r) => r.status === 'rejected').length },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <TabBar tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {/* Request Cards */}
      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-12 text-gray-400">No {activeTab} requests</div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((request) => {
            const statusCfg = STATUS_BADGE[request.status];
            const typeCfg = TYPE_BADGE[request.type];
            return (
              <Card key={request.id}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.employee}</h3>
                    <span className="text-xs text-gray-400">{request.submittedAt}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={typeCfg.variant}>{typeCfg.label}</Badge>
                    <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Dates</span>
                    <span className="text-gray-700 font-medium">{request.dates}</span>
                  </div>
                  {request.swapWith && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Swap With</span>
                      <span className="text-gray-700">{request.swapWith}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500">Reason</span>
                    <span className="text-gray-700 text-right max-w-[240px]">{request.reason}</span>
                  </div>
                </div>

                {request.status === 'pending' && (
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                    <Button variant="primary" size="sm" className="flex-1">Approve</Button>
                    <Button variant="danger" size="sm" className="flex-1">Reject</Button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
