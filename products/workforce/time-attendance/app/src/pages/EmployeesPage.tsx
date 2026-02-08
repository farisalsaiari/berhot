import { useState } from 'react';
import { StatCard, Card, Badge, Button, SearchInput } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

interface EmployeeAttendance {
  id: string;
  name: string;
  role: string;
  department: string;
  attendanceRate: number;
  avgHours: string;
  lateCount: number;
  overtimeHours: number;
  thisMonth: DayStatus[];
}

type DayStatus = 'present' | 'absent' | 'late' | 'off' | 'future';

function generateMonthDays(): DayStatus[] {
  const days: DayStatus[] = [];
  for (let i = 1; i <= 28; i++) {
    if (i > 7) {
      days.push('future');
    } else if (i % 7 === 0 || i % 7 === 6) {
      days.push('off');
    } else {
      const rand = Math.random();
      if (rand > 0.9) days.push('absent');
      else if (rand > 0.8) days.push('late');
      else days.push('present');
    }
  }
  return days;
}

const EMPLOYEES: EmployeeAttendance[] = [
  { id: '1', name: 'Ahmed Al-Farsi', role: 'Server', department: 'Front of House', attendanceRate: 96, avgHours: '7.8h', lateCount: 2, overtimeHours: 3, thisMonth: generateMonthDays() },
  { id: '2', name: 'Sara Hassan', role: 'Cashier', department: 'Front of House', attendanceRate: 92, avgHours: '7.5h', lateCount: 4, overtimeHours: 1, thisMonth: generateMonthDays() },
  { id: '3', name: 'Omar Khalid', role: 'Manager', department: 'Management', attendanceRate: 100, avgHours: '8.5h', lateCount: 0, overtimeHours: 12, thisMonth: generateMonthDays() },
  { id: '4', name: 'Fatima Nour', role: 'Server', department: 'Front of House', attendanceRate: 85, avgHours: '6.2h', lateCount: 1, overtimeHours: 0, thisMonth: generateMonthDays() },
  { id: '5', name: 'Yusuf Bader', role: 'Cook', department: 'Kitchen', attendanceRate: 98, avgHours: '8.0h', lateCount: 1, overtimeHours: 4, thisMonth: generateMonthDays() },
  { id: '6', name: 'Layla Mansour', role: 'Server', department: 'Front of House', attendanceRate: 94, avgHours: '7.2h', lateCount: 3, overtimeHours: 0, thisMonth: generateMonthDays() },
];

const DAY_COLORS: Record<DayStatus, string> = {
  present: 'bg-green-400',
  absent: 'bg-red-400',
  late: 'bg-orange-400',
  off: 'bg-gray-200',
  future: 'bg-gray-100',
};

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const filtered = EMPLOYEES.filter(
    (e) =>
      search === '' ||
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase()),
  );

  const selected = selectedEmployee ? EMPLOYEES.find((e) => e.id === selectedEmployee) : null;

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="flex items-center justify-between">
        <SearchInput placeholder="Search employees..." onSearch={setSearch} className="w-72" />
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-3 h-3 rounded bg-green-400 inline-block" /> Present
          <span className="w-3 h-3 rounded bg-orange-400 inline-block ml-2" /> Late
          <span className="w-3 h-3 rounded bg-red-400 inline-block ml-2" /> Absent
          <span className="w-3 h-3 rounded bg-gray-200 inline-block ml-2" /> Day Off
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Employee List */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.map((emp) => (
            <Card
              key={emp.id}
              className={`cursor-pointer transition-shadow hover:shadow-md ${selectedEmployee === emp.id ? 'ring-2 ring-blue-500' : ''}`}
            >
              <div onClick={() => setSelectedEmployee(emp.id)}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-gray-900">{emp.name}</div>
                    <div className="text-xs text-gray-500">{emp.role} - {emp.department}</div>
                  </div>
                  <Badge variant={emp.attendanceRate >= 95 ? 'green' : emp.attendanceRate >= 90 ? 'orange' : 'red'}>
                    {emp.attendanceRate}%
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-3 text-sm mb-3">
                  <div>
                    <div className="text-gray-400 text-xs">Avg Hours</div>
                    <div className="font-medium text-gray-700">{emp.avgHours}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Late Count</div>
                    <div className={`font-medium ${emp.lateCount > 2 ? 'text-orange-600' : 'text-gray-700'}`}>{emp.lateCount}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Overtime</div>
                    <div className="font-medium text-gray-700">{emp.overtimeHours}h</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-xs">Attendance</div>
                    <div className="font-medium text-gray-700">{emp.attendanceRate}%</div>
                  </div>
                </div>

                {/* Mini Calendar */}
                <div className="flex gap-1">
                  {emp.thisMonth.map((day, i) => (
                    <div key={i} className={`w-3 h-3 rounded-sm ${DAY_COLORS[day]}`} title={`Day ${i + 1}: ${day}`} />
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Detail Panel */}
        <div>
          {selected ? (
            <Card className="sticky top-0">
              <h3 className="font-semibold text-gray-900 mb-1">{selected.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{selected.role} - {selected.department}</p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-700">{selected.attendanceRate}%</div>
                    <div className="text-xs text-green-600">Attendance Rate</div>
                  </div>
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-700">{selected.avgHours}</div>
                    <div className="text-xs text-blue-600">Avg Daily Hours</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Late Arrivals</span>
                    <span className={`font-medium ${selected.lateCount > 2 ? 'text-orange-600' : 'text-gray-700'}`}>
                      {selected.lateCount} times
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Overtime Hours</span>
                    <span className="font-medium text-gray-700">{selected.overtimeHours}h</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Department</span>
                    <span className="text-gray-700">{selected.department}</span>
                  </div>
                </div>

                {/* Monthly Calendar View */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">February 2026</h4>
                  <div className="grid grid-cols-7 gap-1">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                      <div key={i} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                    ))}
                    {selected.thisMonth.map((day, i) => (
                      <div
                        key={i}
                        className={`w-full aspect-square rounded-md flex items-center justify-center text-xs font-medium ${
                          day === 'present' ? 'bg-green-100 text-green-700' :
                          day === 'absent' ? 'bg-red-100 text-red-700' :
                          day === 'late' ? 'bg-orange-100 text-orange-700' :
                          day === 'future' ? 'bg-gray-50 text-gray-300' :
                          'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                <Button variant="secondary" size="sm" className="w-full">View Full History</Button>
              </div>
            </Card>
          ) : (
            <Card className="text-center py-12">
              <div className="text-gray-400 text-sm">Select an employee to view details</div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
