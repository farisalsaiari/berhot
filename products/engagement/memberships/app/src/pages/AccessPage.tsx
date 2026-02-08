import { useState } from 'react';
import { StatCard, Card, DataTable, Badge, Button, TabBar } from '@berhot/ui';
import type { Column, BadgeVariant } from '@berhot/ui';

interface AccessRule {
  id: string;
  area: string;
  basic: boolean;
  pro: boolean;
  enterprise: boolean;
  hours: string;
}

const ACCESS_RULES: AccessRule[] = [
  { id: '1', area: 'Main Lobby', basic: true, pro: true, enterprise: true, hours: '6AM - 10PM' },
  { id: '2', area: 'Gym Floor', basic: true, pro: true, enterprise: true, hours: '6AM - 10PM' },
  { id: '3', area: 'Swimming Pool', basic: false, pro: true, enterprise: true, hours: '7AM - 9PM' },
  { id: '4', area: 'Sauna & Steam', basic: false, pro: true, enterprise: true, hours: '8AM - 8PM' },
  { id: '5', area: 'VIP Lounge', basic: false, pro: false, enterprise: true, hours: '24/7' },
  { id: '6', area: 'Executive Meeting Room', basic: false, pro: false, enterprise: true, hours: '8AM - 6PM' },
  { id: '7', area: 'Parking Garage', basic: false, pro: true, enterprise: true, hours: '24/7' },
];

type CheckInStatus = 'granted' | 'denied';

interface CheckInLog {
  id: string;
  member: string;
  plan: string;
  time: string;
  location: string;
  status: CheckInStatus;
  reason?: string;
}

const CHECK_INS: CheckInLog[] = [
  { id: '1', member: 'Nadia Al-Rashid', plan: 'Pro', time: '08:32 AM', location: 'Main Lobby', status: 'granted' },
  { id: '2', member: 'Tariq Hussain', plan: 'Basic', time: '08:15 AM', location: 'Swimming Pool', status: 'denied', reason: 'Plan does not include pool access' },
  { id: '3', member: 'Mariam Zahir', plan: 'Enterprise', time: '07:55 AM', location: 'VIP Lounge', status: 'granted' },
  { id: '4', member: 'Salim Nasser', plan: 'Pro', time: '07:40 AM', location: 'Gym Floor', status: 'granted' },
  { id: '5', member: 'Huda Faisal', plan: 'Basic', time: '07:22 AM', location: 'Main Lobby', status: 'granted' },
  { id: '6', member: 'Rayan Khalil', plan: 'Pro', time: '07:10 AM', location: 'Sauna & Steam', status: 'denied', reason: 'Membership paused' },
  { id: '7', member: 'Faris Majed', plan: 'Enterprise', time: '06:45 AM', location: 'Parking Garage', status: 'granted' },
  { id: '8', member: 'Dina Waleed', plan: 'Pro', time: '06:30 AM', location: 'Gym Floor', status: 'denied', reason: 'Membership paused' },
];

const STATUS_BADGE: Record<CheckInStatus, { variant: BadgeVariant; label: string }> = {
  granted: { variant: 'green', label: 'Granted' },
  denied: { variant: 'red', label: 'Denied' },
};

export default function AccessPage() {
  const [activeTab, setActiveTab] = useState('log');

  const tabs = [
    { key: 'log', label: 'Check-in Log' },
    { key: 'rules', label: 'Access Rules' },
  ];

  const deniedCount = CHECK_INS.filter((c) => c.status === 'denied').length;

  const logColumns: Column<CheckInLog>[] = [
    {
      key: 'member',
      header: 'Member',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.member}</div>
          <div className="text-xs text-gray-400">{row.plan} plan</div>
        </div>
      ),
    },
    { key: 'time', header: 'Time' },
    { key: 'location', header: 'Location' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const cfg = STATUS_BADGE[row.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'reason',
      header: 'Details',
      render: (row) =>
        row.reason ? (
          <span className="text-xs text-red-500">{row.reason}</span>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        ),
    },
  ];

  const ruleColumns: Column<AccessRule>[] = [
    {
      key: 'area',
      header: 'Area / Facility',
      render: (row) => <span className="font-medium text-gray-900">{row.area}</span>,
    },
    {
      key: 'basic',
      header: 'Basic',
      render: (row) =>
        row.basic ? (
          <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
        ) : (
          <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        ),
    },
    {
      key: 'pro',
      header: 'Pro',
      render: (row) =>
        row.pro ? (
          <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
        ) : (
          <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        ),
    },
    {
      key: 'enterprise',
      header: 'Enterprise',
      render: (row) =>
        row.enterprise ? (
          <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
        ) : (
          <svg className="w-5 h-5 text-gray-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
        ),
    },
    { key: 'hours', header: 'Access Hours' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Check-ins Today" value={CHECK_INS.length} sub="Since 6:00 AM" trend="neutral" />
        <StatCard label="Access Granted" value={CHECK_INS.length - deniedCount} sub={`${deniedCount} denied`} trend="neutral" />
        <StatCard label="Denied Attempts" value={deniedCount} sub="Requires attention" trend="down" />
        <StatCard label="Active Areas" value={ACCESS_RULES.length} sub="7 zones monitored" trend="neutral" />
      </div>

      {/* Tabs */}
      <TabBar tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {/* Content */}
      {activeTab === 'log' && (
        <>
          {/* Access Denied Alerts */}
          {CHECK_INS.filter((c) => c.status === 'denied').length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <h3 className="font-semibold text-red-800 mb-3">Access Denied Alerts</h3>
              <div className="space-y-2">
                {CHECK_INS.filter((c) => c.status === 'denied').map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100">
                    <div>
                      <span className="font-medium text-gray-900">{entry.member}</span>
                      <span className="text-gray-400 mx-2">at</span>
                      <span className="text-gray-700">{entry.location}</span>
                      <span className="text-gray-400 mx-2">-</span>
                      <span className="text-xs text-red-500">{entry.reason}</span>
                    </div>
                    <span className="text-xs text-gray-500">{entry.time}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card padding={false}>
            <div className="px-5 pt-4 pb-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Check-in Log</h3>
              <Button variant="secondary" size="sm">Export</Button>
            </div>
            <DataTable columns={logColumns} data={CHECK_INS} emptyMessage="No check-ins recorded" />
          </Card>
        </>
      )}

      {activeTab === 'rules' && (
        <Card padding={false}>
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Access Rules by Plan</h3>
            <Button variant="primary" size="sm">+ Add Rule</Button>
          </div>
          <DataTable columns={ruleColumns} data={ACCESS_RULES} emptyMessage="No access rules configured" />
        </Card>
      )}
    </div>
  );
}
