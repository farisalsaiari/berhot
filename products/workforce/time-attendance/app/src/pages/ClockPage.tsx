import { useState, useEffect } from 'react';
import { Card, Badge, Button, SearchInput } from '@berhot/ui';

interface ClockedInEmployee {
  id: string;
  name: string;
  role: string;
  clockedInAt: string;
  duration: string;
  location: string;
}

const CLOCKED_IN: ClockedInEmployee[] = [
  { id: '1', name: 'Ahmed Al-Farsi', role: 'Server', clockedInAt: '06:02 AM', duration: '2h 30m', location: 'Main Entrance' },
  { id: '2', name: 'Sara Hassan', role: 'Cashier', clockedInAt: '06:15 AM', duration: '2h 17m', location: 'Main Entrance' },
  { id: '3', name: 'Omar Khalid', role: 'Manager', clockedInAt: '05:55 AM', duration: '2h 37m', location: 'Back Office' },
  { id: '4', name: 'Yusuf Bader', role: 'Cook', clockedInAt: '06:00 AM', duration: '2h 32m', location: 'Kitchen Kiosk' },
  { id: '5', name: 'Layla Mansour', role: 'Server', clockedInAt: '06:30 AM', duration: '2h 2m', location: 'Main Entrance' },
  { id: '6', name: 'Khaled Rami', role: 'Security', clockedInAt: '10:00 PM', duration: '8h 32m', location: 'Gate Biometric' },
];

const ALL_EMPLOYEES = [
  { id: '1', name: 'Ahmed Al-Farsi', role: 'Server' },
  { id: '2', name: 'Sara Hassan', role: 'Cashier' },
  { id: '3', name: 'Omar Khalid', role: 'Manager' },
  { id: '4', name: 'Fatima Nour', role: 'Server' },
  { id: '5', name: 'Yusuf Bader', role: 'Cook' },
  { id: '6', name: 'Layla Mansour', role: 'Server' },
  { id: '7', name: 'Khaled Rami', role: 'Security' },
  { id: '8', name: 'Nora Saeed', role: 'Hostess' },
];

export default function ClockPage() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [search, setSearch] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const timeString = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const dateString = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const filteredEmployees = ALL_EMPLOYEES.filter(
    (e) =>
      search !== '' &&
      (e.name.toLowerCase().includes(search.toLowerCase()) ||
        e.role.toLowerCase().includes(search.toLowerCase())),
  );

  const isClockedIn = (id: string) => CLOCKED_IN.some((e) => e.id === id);

  return (
    <div className="space-y-6">
      {/* Clock Display */}
      <Card className="text-center py-10">
        <div className="text-6xl font-bold text-gray-900 font-mono tracking-wider">
          {timeString}
        </div>
        <div className="text-sm text-gray-500 mt-2">{dateString}</div>

        {/* Employee Selection */}
        <div className="max-w-md mx-auto mt-8">
          <SearchInput
            placeholder="Search employee to clock in/out..."
            onSearch={(val) => {
              setSearch(val);
              setSelectedEmployee(null);
            }}
            className="w-full"
          />

          {filteredEmployees.length > 0 && !selectedEmployee && (
            <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
              {filteredEmployees.map((emp) => (
                <button
                  key={emp.id}
                  onClick={() => {
                    setSelectedEmployee(emp.id);
                    setSearch(emp.name);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{emp.name}</div>
                    <div className="text-xs text-gray-400">{emp.role}</div>
                  </div>
                  {isClockedIn(emp.id) && (
                    <Badge variant="green">Clocked In</Badge>
                  )}
                </button>
              ))}
            </div>
          )}

          {selectedEmployee && (
            <div className="flex items-center gap-3 mt-4">
              {isClockedIn(selectedEmployee) ? (
                <Button variant="danger" size="lg" className="flex-1">
                  Clock Out
                </Button>
              ) : (
                <Button variant="primary" size="lg" className="flex-1">
                  Clock In
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Currently Clocked In */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">Currently Clocked In</h3>
            <p className="text-sm text-gray-500">{CLOCKED_IN.length} employees active</p>
          </div>
          <Badge variant="green">{CLOCKED_IN.length} Active</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CLOCKED_IN.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center justify-between p-3 bg-green-50 border border-green-100 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900 text-sm">{emp.name}</div>
                <div className="text-xs text-gray-500">{emp.role}</div>
                <div className="text-xs text-gray-400 mt-1">In: {emp.clockedInAt} - {emp.location}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-700">{emp.duration}</div>
                <Button variant="ghost" size="sm" className="mt-1 text-xs">
                  Clock Out
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
