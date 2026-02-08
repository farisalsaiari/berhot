import { useState } from 'react';
import { StatCard, Card, DataTable, Badge, Button } from '@berhot/ui';
import type { Column, BadgeVariant } from '@berhot/ui';

interface DepartmentReport {
  department: string;
  employees: number;
  avgAttendance: string;
  totalHours: number;
  avgHoursPerDay: string;
  lateArrivals: number;
  absences: number;
  overtimeHours: number;
}

const DEPARTMENT_DATA: DepartmentReport[] = [
  { department: 'Front of House', employees: 4, avgAttendance: '94%', totalHours: 640, avgHoursPerDay: '7.6h', lateArrivals: 8, absences: 2, overtimeHours: 5 },
  { department: 'Kitchen', employees: 3, avgAttendance: '98%', totalHours: 510, avgHoursPerDay: '8.1h', lateArrivals: 2, absences: 0, overtimeHours: 4 },
  { department: 'Management', employees: 2, avgAttendance: '100%', totalHours: 380, avgHoursPerDay: '8.8h', lateArrivals: 0, absences: 0, overtimeHours: 12 },
  { department: 'Operations', employees: 2, avgAttendance: '92%', totalHours: 340, avgHoursPerDay: '8.0h', lateArrivals: 3, absences: 1, overtimeHours: 8 },
  { department: 'Support', employees: 1, avgAttendance: '96%', totalHours: 165, avgHoursPerDay: '7.5h', lateArrivals: 1, absences: 1, overtimeHours: 0 },
];

export default function ReportsPage() {
  const [dateRange] = useState('Feb 1 - Feb 7, 2026');

  const totalEmployees = DEPARTMENT_DATA.reduce((s, d) => s + d.employees, 0);
  const totalHours = DEPARTMENT_DATA.reduce((s, d) => s + d.totalHours, 0);
  const totalLate = DEPARTMENT_DATA.reduce((s, d) => s + d.lateArrivals, 0);
  const totalAbsent = DEPARTMENT_DATA.reduce((s, d) => s + d.absences, 0);
  const avgAttendance = Math.round(
    DEPARTMENT_DATA.reduce((s, d) => s + parseFloat(d.avgAttendance), 0) / DEPARTMENT_DATA.length,
  );

  const columns: Column<DepartmentReport>[] = [
    {
      key: 'department',
      header: 'Department',
      render: (row) => <span className="font-medium text-gray-900">{row.department}</span>,
    },
    { key: 'employees', header: 'Employees' },
    {
      key: 'avgAttendance',
      header: 'Attendance Rate',
      render: (row) => (
        <Badge variant={parseFloat(row.avgAttendance) >= 95 ? 'green' : parseFloat(row.avgAttendance) >= 90 ? 'orange' : 'red'}>
          {row.avgAttendance}
        </Badge>
      ),
    },
    {
      key: 'totalHours',
      header: 'Total Hours',
      render: (row) => <span>{row.totalHours}h</span>,
    },
    { key: 'avgHoursPerDay', header: 'Avg/Day' },
    {
      key: 'lateArrivals',
      header: 'Late',
      render: (row) => (
        <span className={row.lateArrivals > 5 ? 'text-orange-600 font-semibold' : 'text-gray-600'}>
          {row.lateArrivals}
        </span>
      ),
    },
    {
      key: 'absences',
      header: 'Absent',
      render: (row) => (
        <span className={row.absences > 0 ? 'text-red-600 font-semibold' : 'text-gray-400'}>
          {row.absences}
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
  ];

  return (
    <div className="space-y-6">
      {/* Date Range */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">&larr;</Button>
          <span className="text-sm font-semibold text-gray-700">{dateRange}</span>
          <Button variant="secondary" size="sm">&rarr;</Button>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">This Week</Button>
          <Button variant="secondary" size="sm">This Month</Button>
          <Button variant="primary" size="sm">
            <svg className="w-4 h-4 mr-1 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard label="Total Employees" value={totalEmployees} sub="Across all departments" trend="neutral" />
        <StatCard label="Total Hours" value={`${totalHours}h`} sub="This period" trend="neutral" />
        <StatCard label="Avg Attendance" value={`${avgAttendance}%`} sub="All departments" trend="up" />
        <StatCard label="Late Arrivals" value={totalLate} sub="Total this period" trend="down" />
        <StatCard label="Absences" value={totalAbsent} sub={`${totalAbsent} days total`} trend="down" />
      </div>

      {/* Attendance Chart Placeholder */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">Attendance Overview</h3>
        <div className="h-48 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 text-sm">Daily attendance trend chart</div>
            <div className="text-gray-300 text-xs mt-1">Bar chart showing on-time / late / absent per day</div>
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
        <DataTable columns={columns} data={DEPARTMENT_DATA} emptyMessage="No data" />
      </Card>
    </div>
  );
}
