import { useState } from 'react';
import { StatCard, Card, DataTable, Badge, Button, TabBar } from '@berhot/ui';
import type { Column, BadgeVariant } from '@berhot/ui';

interface OvertimeEmployee {
  id: string;
  name: string;
  role: string;
  department: string;
  overtimeHours: number;
  regularHours: number;
  overtimeCost: string;
  weekTrend: 'up' | 'down' | 'same';
}

const TOP_OVERTIME: OvertimeEmployee[] = [
  { id: '3', name: 'Omar Khalid', role: 'Manager', department: 'Management', overtimeHours: 12, regularHours: 40, overtimeCost: 'SAR 1,440', weekTrend: 'up' },
  { id: '7', name: 'Khaled Rami', role: 'Security', department: 'Operations', overtimeHours: 8, regularHours: 40, overtimeCost: 'SAR 640', weekTrend: 'same' },
  { id: '5', name: 'Yusuf Bader', role: 'Cook', department: 'Kitchen', overtimeHours: 4, regularHours: 40, overtimeCost: 'SAR 280', weekTrend: 'down' },
  { id: '2', name: 'Sara Hassan', role: 'Cashier', department: 'Front of House', overtimeHours: 2, regularHours: 42, overtimeCost: 'SAR 150', weekTrend: 'up' },
];

type ApprovalStatus = 'pending' | 'approved' | 'rejected';

interface OvertimeRequest {
  id: string;
  employee: string;
  role: string;
  date: string;
  hours: number;
  reason: string;
  status: ApprovalStatus;
}

const OVERTIME_QUEUE: OvertimeRequest[] = [
  { id: '1', employee: 'Omar Khalid', role: 'Manager', date: 'Feb 7, 2026', hours: 3, reason: 'Month-end closing procedures', status: 'pending' },
  { id: '2', employee: 'Khaled Rami', role: 'Security', date: 'Feb 7, 2026', hours: 2, reason: 'Event security coverage', status: 'pending' },
  { id: '3', employee: 'Yusuf Bader', role: 'Cook', date: 'Feb 6, 2026', hours: 1.5, reason: 'Large catering order', status: 'approved' },
  { id: '4', employee: 'Sara Hassan', role: 'Cashier', date: 'Feb 6, 2026', hours: 2, reason: 'End of day reconciliation', status: 'approved' },
  { id: '5', employee: 'Ahmed Al-Farsi', role: 'Server', date: 'Feb 5, 2026', hours: 1, reason: 'Short staffed coverage', status: 'rejected' },
];

const APPROVAL_BADGE: Record<ApprovalStatus, { variant: BadgeVariant; label: string }> = {
  pending: { variant: 'orange', label: 'Pending' },
  approved: { variant: 'green', label: 'Approved' },
  rejected: { variant: 'red', label: 'Rejected' },
};

export default function OvertimePage() {
  const [activeTab, setActiveTab] = useState('overview');

  const totalOvertimeHours = TOP_OVERTIME.reduce((s, e) => s + e.overtimeHours, 0);

  const topColumns: Column<OvertimeEmployee>[] = [
    {
      key: 'name',
      header: 'Employee',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-400">{row.role} - {row.department}</div>
        </div>
      ),
    },
    {
      key: 'regularHours',
      header: 'Regular Hours',
      render: (row) => <span>{row.regularHours}h</span>,
    },
    {
      key: 'overtimeHours',
      header: 'Overtime Hours',
      render: (row) => <span className="font-semibold text-orange-600">{row.overtimeHours}h</span>,
    },
    {
      key: 'overtimeCost',
      header: 'OT Cost',
      render: (row) => <span className="font-semibold">{row.overtimeCost}</span>,
    },
    {
      key: 'weekTrend',
      header: 'Trend',
      render: (row) => (
        <Badge variant={row.weekTrend === 'up' ? 'red' : row.weekTrend === 'down' ? 'green' : 'gray'}>
          {row.weekTrend === 'up' ? 'Increasing' : row.weekTrend === 'down' ? 'Decreasing' : 'Stable'}
        </Badge>
      ),
    },
  ];

  const queueColumns: Column<OvertimeRequest>[] = [
    {
      key: 'employee',
      header: 'Employee',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.employee}</div>
          <div className="text-xs text-gray-400">{row.role}</div>
        </div>
      ),
    },
    { key: 'date', header: 'Date' },
    {
      key: 'hours',
      header: 'Hours',
      render: (row) => <span className="font-semibold">{row.hours}h</span>,
    },
    { key: 'reason', header: 'Reason' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const cfg = APPROVAL_BADGE[row.status];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.status === 'pending' ? (
          <div className="flex gap-2">
            <Button variant="primary" size="sm">Approve</Button>
            <Button variant="danger" size="sm">Reject</Button>
          </div>
        ) : null,
    },
  ];

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'approvals', label: 'Approval Queue', count: OVERTIME_QUEUE.filter((r) => r.status === 'pending').length },
    { key: 'policy', label: 'Policy' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Overtime" value={`${totalOvertimeHours}h`} sub="This week" trend="down" />
        <StatCard label="Overtime Cost" value="SAR 2,510" sub="This week" trend="down" />
        <StatCard label="Top Overtime Employee" value="Omar Khalid" sub="12h overtime" trend="down" />
        <StatCard label="Pending Approvals" value={OVERTIME_QUEUE.filter((r) => r.status === 'pending').length} sub="Needs review" trend="neutral" />
      </div>

      {/* Tabs */}
      <TabBar tabs={tabs} activeKey={activeTab} onChange={setActiveTab} />

      {/* Overview */}
      {activeTab === 'overview' && (
        <Card padding={false}>
          <div className="px-5 pt-4 pb-3">
            <h3 className="font-semibold text-gray-900">Top Overtime Employees</h3>
          </div>
          <DataTable columns={topColumns} data={TOP_OVERTIME} emptyMessage="No overtime recorded" />
        </Card>
      )}

      {/* Approval Queue */}
      {activeTab === 'approvals' && (
        <Card padding={false}>
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Overtime Approval Queue</h3>
            <Button variant="secondary" size="sm">Export</Button>
          </div>
          <DataTable columns={queueColumns} data={OVERTIME_QUEUE} emptyMessage="No overtime requests" />
        </Card>
      )}

      {/* Policy Configuration */}
      {activeTab === 'policy' && (
        <Card>
          <h3 className="font-semibold text-gray-900 mb-4">Overtime Policy Configuration</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Weekly Hour Limit</div>
                <div className="text-2xl font-bold text-gray-900">40 hours</div>
                <div className="text-xs text-gray-500 mt-1">Hours beyond this are considered overtime</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Overtime Rate</div>
                <div className="text-2xl font-bold text-gray-900">1.5x</div>
                <div className="text-xs text-gray-500 mt-1">Multiplier applied to base hourly rate</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Max Overtime / Week</div>
                <div className="text-2xl font-bold text-gray-900">15 hours</div>
                <div className="text-xs text-gray-500 mt-1">Maximum allowed overtime per employee</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm font-medium text-gray-700 mb-1">Approval Required</div>
                <div className="text-2xl font-bold text-green-600">Yes</div>
                <div className="text-xs text-gray-500 mt-1">Manager approval needed for overtime</div>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" size="sm">Edit Policy</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
