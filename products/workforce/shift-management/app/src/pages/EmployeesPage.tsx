import { useState } from 'react';
import { StatCard, Card, DataTable, Badge, Button, SearchInput } from '@berhot/ui';
import type { Column, BadgeVariant } from '@berhot/ui';

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  availability: 'available' | 'on-leave' | 'unavailable';
  hoursThisWeek: number;
  overtime: number;
  email: string;
  phone: string;
}

const EMPLOYEES: Employee[] = [
  { id: '1', name: 'Ahmed Al-Farsi', role: 'Server', department: 'Front of House', availability: 'available', hoursThisWeek: 38, overtime: 0, email: 'ahmed@berhot.com', phone: '+966 50 123 4567' },
  { id: '2', name: 'Sara Hassan', role: 'Cashier', department: 'Front of House', availability: 'available', hoursThisWeek: 42, overtime: 2, email: 'sara@berhot.com', phone: '+966 50 234 5678' },
  { id: '3', name: 'Omar Khalid', role: 'Manager', department: 'Management', availability: 'available', hoursThisWeek: 45, overtime: 5, email: 'omar@berhot.com', phone: '+966 50 345 6789' },
  { id: '4', name: 'Fatima Nour', role: 'Server', department: 'Front of House', availability: 'on-leave', hoursThisWeek: 0, overtime: 0, email: 'fatima@berhot.com', phone: '+966 50 456 7890' },
  { id: '5', name: 'Yusuf Bader', role: 'Cook', department: 'Kitchen', availability: 'available', hoursThisWeek: 40, overtime: 0, email: 'yusuf@berhot.com', phone: '+966 50 567 8901' },
  { id: '6', name: 'Layla Mansour', role: 'Server', department: 'Front of House', availability: 'available', hoursThisWeek: 36, overtime: 0, email: 'layla@berhot.com', phone: '+966 50 678 9012' },
  { id: '7', name: 'Khaled Rami', role: 'Security', department: 'Operations', availability: 'available', hoursThisWeek: 44, overtime: 4, email: 'khaled@berhot.com', phone: '+966 50 789 0123' },
  { id: '8', name: 'Nora Saeed', role: 'Hostess', department: 'Front of House', availability: 'unavailable', hoursThisWeek: 20, overtime: 0, email: 'nora@berhot.com', phone: '+966 50 890 1234' },
];

const AVAILABILITY_BADGE: Record<Employee['availability'], { variant: BadgeVariant; label: string }> = {
  available: { variant: 'green', label: 'Available' },
  'on-leave': { variant: 'orange', label: 'On Leave' },
  unavailable: { variant: 'red', label: 'Unavailable' },
};

export default function EmployeesPage() {
  const [search, setSearch] = useState('');

  const filtered = EMPLOYEES.filter(
    (e) =>
      search === '' ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()) ||
      e.department.toLowerCase().includes(search.toLowerCase()),
  );

  const available = EMPLOYEES.filter((e) => e.availability === 'available').length;
  const totalHours = EMPLOYEES.reduce((s, e) => s + e.hoursThisWeek, 0);
  const totalOvertime = EMPLOYEES.reduce((s, e) => s + e.overtime, 0);

  const columns: Column<Employee>[] = [
    {
      key: 'name',
      header: 'Employee',
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row.name}</div>
          <div className="text-xs text-gray-400">{row.email}</div>
        </div>
      ),
    },
    { key: 'role', header: 'Role' },
    { key: 'department', header: 'Department' },
    {
      key: 'availability',
      header: 'Availability',
      render: (row) => {
        const cfg = AVAILABILITY_BADGE[row.availability];
        return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
      },
    },
    {
      key: 'hoursThisWeek',
      header: 'Hours This Week',
      render: (row) => (
        <span className={row.hoursThisWeek > 40 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
          {row.hoursThisWeek}h
        </span>
      ),
    },
    {
      key: 'overtime',
      header: 'Overtime',
      render: (row) => (
        <span className={row.overtime > 0 ? 'text-orange-600 font-semibold' : 'text-gray-400'}>
          {row.overtime > 0 ? `${row.overtime}h` : '-'}
        </span>
      ),
    },
    {
      key: 'phone',
      header: 'Contact',
      render: (row) => <span className="text-xs text-gray-500">{row.phone}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Employees" value={EMPLOYEES.length} sub="Active roster" trend="neutral" />
        <StatCard label="Available" value={available} sub={`${EMPLOYEES.length - available} unavailable`} trend="neutral" />
        <StatCard label="Total Hours" value={`${totalHours}h`} sub="This week" trend="up" />
        <StatCard label="Overtime" value={`${totalOvertime}h`} sub="3 employees" trend="down" />
      </div>

      {/* Table */}
      <Card padding={false}>
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <SearchInput placeholder="Search employees..." onSearch={setSearch} className="w-72" />
          <Button variant="primary" size="sm">+ Add Employee</Button>
        </div>
        <DataTable columns={columns} data={filtered} emptyMessage="No employees found" />
      </Card>
    </div>
  );
}
