import { StatCard, Card, DataTable, Badge, Button } from '@berhot/ui';
import type { Column, BadgeVariant } from '@berhot/ui';

type DeviceStatus = 'online' | 'offline';
type DeviceType = 'biometric' | 'tablet' | 'kiosk';

interface Device {
  id: string;
  name: string;
  type: DeviceType;
  location: string;
  status: DeviceStatus;
  lastSync: string;
  firmware: string;
  todayScans: number;
}

const DEVICES: Device[] = [
  { id: '1', name: 'Main Entrance Scanner', type: 'biometric', location: 'Front Entrance', status: 'online', lastSync: '2 min ago', firmware: 'v3.2.1', todayScans: 24 },
  { id: '2', name: 'Kitchen Kiosk', type: 'kiosk', location: 'Kitchen', status: 'online', lastSync: '5 min ago', firmware: 'v2.8.0', todayScans: 8 },
  { id: '3', name: 'Back Office Tablet', type: 'tablet', location: 'Back Office', status: 'online', lastSync: '1 min ago', firmware: 'v4.1.0', todayScans: 6 },
  { id: '4', name: 'Gate Biometric', type: 'biometric', location: 'Gate', status: 'online', lastSync: '3 min ago', firmware: 'v3.2.1', todayScans: 18 },
  { id: '5', name: 'Warehouse Terminal', type: 'kiosk', location: 'Warehouse', status: 'offline', lastSync: '3 hours ago', firmware: 'v2.7.5', todayScans: 0 },
  { id: '6', name: 'Manager Tablet', type: 'tablet', location: 'Manager Office', status: 'online', lastSync: '8 min ago', firmware: 'v4.1.0', todayScans: 3 },
  { id: '7', name: 'Parking Lot Scanner', type: 'biometric', location: 'Parking', status: 'offline', lastSync: '1 day ago', firmware: 'v3.1.0', todayScans: 0 },
];

const STATUS_BADGE: Record<DeviceStatus, { variant: BadgeVariant; label: string }> = {
  online: { variant: 'green', label: 'Online' },
  offline: { variant: 'red', label: 'Offline' },
};

const TYPE_BADGE: Record<DeviceType, { variant: BadgeVariant; label: string }> = {
  biometric: { variant: 'purple', label: 'Biometric' },
  tablet: { variant: 'blue', label: 'Tablet' },
  kiosk: { variant: 'orange', label: 'Kiosk' },
};

export default function DevicesPage() {
  const onlineCount = DEVICES.filter((d) => d.status === 'online').length;
  const offlineCount = DEVICES.filter((d) => d.status === 'offline').length;
  const totalScans = DEVICES.reduce((s, d) => s + d.todayScans, 0);

  const columns: Column<Device>[] = [
    {
      key: 'name',
      header: 'Device',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-400">{row.firmware}</div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => {
        const cfg = TYPE_BADGE[row.type];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    { key: 'location', header: 'Location' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const cfg = STATUS_BADGE[row.status];
        return (
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${row.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`} />
            <Badge variant={cfg.variant}>{cfg.label}</Badge>
          </div>
        );
      },
    },
    {
      key: 'lastSync',
      header: 'Last Sync',
      render: (row) => (
        <span className={row.status === 'offline' ? 'text-red-500 font-medium' : 'text-gray-600'}>
          {row.lastSync}
        </span>
      ),
    },
    {
      key: 'todayScans',
      header: 'Today Scans',
      render: (row) => <span className="font-semibold">{row.todayScans}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (row) =>
        row.status === 'offline' ? (
          <Button variant="secondary" size="sm">Reconnect</Button>
        ) : (
          <Button variant="ghost" size="sm">Configure</Button>
        ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Devices" value={DEVICES.length} sub={`${onlineCount} online, ${offlineCount} offline`} trend="neutral" />
        <StatCard label="Online" value={onlineCount} sub={`${Math.round((onlineCount / DEVICES.length) * 100)}% uptime`} trend="up" />
        <StatCard label="Offline" value={offlineCount} sub="Needs attention" trend={offlineCount > 0 ? 'down' : 'up'} />
        <StatCard label="Scans Today" value={totalScans} sub="Across all devices" trend="neutral" />
      </div>

      {/* Device Table */}
      <Card padding={false}>
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Registered Devices</h3>
          <Button variant="primary" size="sm">+ Add Device</Button>
        </div>
        <DataTable columns={columns} data={DEVICES} emptyMessage="No devices registered" />
      </Card>
    </div>
  );
}
