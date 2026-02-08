import { StatCard, Card, DataTable, Button } from '@berhot/ui';
import type { Column } from '@berhot/ui';

interface DepartmentBreakdown {
  department: string;
  employees: number;
  totalHours: number;
  avgHours: number;
  overtimeHours: number;
  overtimeCost: string;
  attendanceRate: string;
}

const DEPARTMENTS: DepartmentBreakdown[] = [
  { department: 'Front of House', employees: 4, totalHours: 136, avgHours: 34, overtimeHours: 2, overtimeCost: 'SAR 150', attendanceRate: '96%' },
  { department: 'Kitchen', employees: 3, totalHours: 120, avgHours: 40, overtimeHours: 0, overtimeCost: 'SAR 0', attendanceRate: '100%' },
  { department: 'Management', employees: 2, totalHours: 90, avgHours: 45, overtimeHours: 10, overtimeCost: 'SAR 1,200', attendanceRate: '100%' },
  { department: 'Operations', employees: 2, totalHours: 84, avgHours: 42, overtimeHours: 4, overtimeCost: 'SAR 320', attendanceRate: '92%' },
  { department: 'Support', employees: 1, totalHours: 40, avgHours: 40, overtimeHours: 0, overtimeCost: 'SAR 0', attendanceRate: '100%' },
];

const columns: Column<DepartmentBreakdown>[] = [
  {
    key: 'department',
    header: 'Department',
    render: (row) => <span className="font-medium text-gray-900">{row.department}</span>,
  },
  { key: 'employees', header: 'Employees' },
  {
    key: 'totalHours',
    header: 'Total Hours',
    render: (row) => <span>{row.totalHours}h</span>,
  },
  {
    key: 'avgHours',
    header: 'Avg Hours/Employee',
    render: (row) => (
      <span className={row.avgHours > 40 ? 'text-red-600 font-semibold' : ''}>
        {row.avgHours}h
      </span>
    ),
  },
  {
    key: 'overtimeHours',
    header: 'Overtime',
    render: (row) => (
      <span className={row.overtimeHours > 0 ? 'text-orange-600 font-semibold' : 'text-gray-400'}>
        {row.overtimeHours > 0 ? `${row.overtimeHours}h` : '-'}
      </span>
    ),
  },
  { key: 'overtimeCost', header: 'OT Cost' },
  {
    key: 'attendanceRate',
    header: 'Attendance',
    render: (row) => (
      <span className={parseFloat(row.attendanceRate) >= 95 ? 'text-green-600 font-semibold' : 'text-orange-600 font-semibold'}>
        {row.attendanceRate}
      </span>
    ),
  },
];

export default function ReportsPage() {
  const totalHours = DEPARTMENTS.reduce((s, d) => s + d.totalHours, 0);
  const totalEmployees = DEPARTMENTS.reduce((s, d) => s + d.employees, 0);
  const avgHoursPerEmployee = Math.round(totalHours / totalEmployees);
  const totalOvertime = DEPARTMENTS.reduce((s, d) => s + d.overtimeHours, 0);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Hours" value={`${totalHours}h`} sub="This week" trend="neutral" />
        <StatCard label="Avg Hours/Employee" value={`${avgHoursPerEmployee}h`} sub={`${totalEmployees} employees`} trend="neutral" />
        <StatCard label="Overtime Cost" value="SAR 1,670" sub={`${totalOvertime}h overtime`} trend="down" />
        <StatCard label="Attendance Rate" value="97%" sub="+1% vs last week" trend="up" />
      </div>

      {/* Summary Chart Placeholder */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Weekly Hours Summary</h3>
          <Button variant="secondary" size="sm">Export Report</Button>
        </div>
        <div className="h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-sm">Hours distribution chart</div>
            <div className="text-gray-300 text-xs mt-1">Charting library placeholder</div>
          </div>
        </div>
      </Card>

      {/* Department Breakdown */}
      <Card padding={false}>
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Department Breakdown</h3>
          <Button variant="secondary" size="sm">
            <svg className="w-4 h-4 mr-1 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export CSV
          </Button>
        </div>
        <DataTable columns={columns} data={DEPARTMENTS} emptyMessage="No data" />
      </Card>
    </div>
  );
}
