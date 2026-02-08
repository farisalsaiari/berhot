import { StatCard, Card, DataTable, Badge } from '@berhot/ui';
import type { Column } from '@berhot/ui';

interface Appointment {
  id: string;
  time: string;
  client: string;
  service: string;
  duration: string;
  amount: number;
  status: 'Confirmed' | 'In Progress' | 'Completed';
}

interface TopService {
  name: string;
  bookings: number;
  revenue: number;
}

const UPCOMING_APPOINTMENTS: Appointment[] = [
  { id: 'APT-1042', time: '14:00', client: 'Noura A.', service: 'Hair Color & Highlights', duration: '90 min', amount: 450, status: 'In Progress' },
  { id: 'APT-1043', time: '14:30', client: 'Reem K.', service: 'Classic Facial', duration: '60 min', amount: 280, status: 'Confirmed' },
  { id: 'APT-1044', time: '15:00', client: 'Lina M.', service: 'Full Body Massage', duration: '60 min', amount: 350, status: 'Confirmed' },
  { id: 'APT-1045', time: '15:30', client: 'Sara H.', service: 'Manicure & Pedicure', duration: '45 min', amount: 150, status: 'Confirmed' },
  { id: 'APT-1046', time: '16:00', client: 'Huda T.', service: 'Haircut & Styling', duration: '45 min', amount: 180, status: 'Confirmed' },
  { id: 'APT-1047', time: '10:00', client: 'Maha S.', service: 'Haircut & Blow Dry', duration: '30 min', amount: 120, status: 'Completed' },
  { id: 'APT-1048', time: '11:00', client: 'Dalal F.', service: 'Deep Tissue Massage', duration: '75 min', amount: 500, status: 'Completed' },
  { id: 'APT-1049', time: '12:30', client: 'Yara B.', service: 'Express Facial', duration: '30 min', amount: 80, status: 'Completed' },
];

const TOP_SERVICES: TopService[] = [
  { name: 'Hair Color & Highlights', bookings: 32, revenue: 14400 },
  { name: 'Full Body Massage', bookings: 28, revenue: 9800 },
  { name: 'Classic Facial', bookings: 25, revenue: 7000 },
  { name: 'Haircut & Styling', bookings: 40, revenue: 7200 },
  { name: 'Manicure & Pedicure', bookings: 22, revenue: 3300 },
];

const STATUS_COLORS: Record<string, 'green' | 'blue' | 'purple'> = {
  Confirmed: 'green',
  'In Progress': 'blue',
  Completed: 'purple',
};

const appointmentColumns: Column<Appointment>[] = [
  { key: 'id', header: 'Booking ID', render: (row) => <span className="font-mono text-xs">{row.id}</span> },
  { key: 'time', header: 'Time' },
  { key: 'client', header: 'Client' },
  { key: 'service', header: 'Service' },
  { key: 'duration', header: 'Duration' },
  { key: 'amount', header: 'Amount (SAR)', render: (row) => <span className="font-semibold">{row.amount} SAR</span> },
  { key: 'status', header: 'Status', render: (row) => <Badge variant={STATUS_COLORS[row.status] || 'gray'}>{row.status}</Badge> },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's Revenue"
          value="4,850 SAR"
          sub="+10% vs yesterday"
          trend="up"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Appointments"
          value={18}
          sub="today so far"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
        />
        <StatCard
          label="Avg Service"
          value="270 SAR"
          sub="+4% vs last week"
          trend="up"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          }
        />
        <StatCard
          label="Next Available"
          value="3:30 PM"
          sub="2 slots open"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Charts placeholder + Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings by Hour Placeholder */}
        <Card className="lg:col-span-2">
          <h3 className="font-semibold mb-4">Bookings by Hour</h3>
          <div className="h-48 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              <p className="text-sm">Bookings by hour chart area</p>
            </div>
          </div>
        </Card>

        {/* Top Services */}
        <Card>
          <h3 className="font-semibold mb-4">Top Services</h3>
          <div className="space-y-3">
            {TOP_SERVICES.map((service, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{service.name}</div>
                    <div className="text-xs text-gray-500">{service.bookings} bookings</div>
                  </div>
                </div>
                <span className="text-sm font-semibold">{service.revenue.toLocaleString()} SAR</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Revenue Trend Placeholder */}
      <Card>
        <h3 className="font-semibold mb-4">Revenue Trend (Today)</h3>
        <div className="h-32 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            <p className="text-sm">Revenue trend chart area</p>
          </div>
        </div>
      </Card>

      {/* Upcoming Appointments */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold">Upcoming Appointments</h3>
          <span className="text-xs text-gray-400">Today</span>
        </div>
        <DataTable columns={appointmentColumns} data={UPCOMING_APPOINTMENTS} />
      </Card>
    </div>
  );
}
