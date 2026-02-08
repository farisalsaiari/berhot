import { Card, Badge, Button } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

interface ShiftTemplate {
  id: string;
  name: string;
  type: 'morning' | 'afternoon' | 'night' | 'custom';
  startTime: string;
  endTime: string;
  breakDuration: string;
  positionsNeeded: number;
  filledPositions: number;
  color: BadgeVariant;
}

const SHIFT_TEMPLATES: ShiftTemplate[] = [
  { id: '1', name: 'Morning Shift', type: 'morning', startTime: '06:00 AM', endTime: '02:00 PM', breakDuration: '30 min', positionsNeeded: 8, filledPositions: 7, color: 'blue' },
  { id: '2', name: 'Afternoon Shift', type: 'afternoon', startTime: '02:00 PM', endTime: '10:00 PM', breakDuration: '30 min', positionsNeeded: 6, filledPositions: 6, color: 'green' },
  { id: '3', name: 'Night Shift', type: 'night', startTime: '10:00 PM', endTime: '06:00 AM', breakDuration: '45 min', positionsNeeded: 4, filledPositions: 3, color: 'purple' },
  { id: '4', name: 'Weekend Special', type: 'custom', startTime: '08:00 AM', endTime: '04:00 PM', breakDuration: '30 min', positionsNeeded: 10, filledPositions: 8, color: 'orange' },
  { id: '5', name: 'Split Shift', type: 'custom', startTime: '07:00 AM', endTime: '11:00 AM / 04:00 PM - 08:00 PM', breakDuration: '5h off', positionsNeeded: 3, filledPositions: 2, color: 'orange' },
];

export default function ShiftsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Shift Templates</h2>
          <p className="text-sm text-gray-500 mt-1">Define and manage your shift templates</p>
        </div>
        <Button variant="primary" size="md">+ Create Shift Template</Button>
      </div>

      {/* Shift Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SHIFT_TEMPLATES.map((shift) => (
          <Card key={shift.id}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{shift.name}</h3>
                <Badge variant={shift.color} className="mt-1">{shift.type.charAt(0).toUpperCase() + shift.type.slice(1)}</Badge>
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Time Range</span>
                <span className="font-medium text-gray-900">{shift.startTime} - {shift.endTime}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Break Duration</span>
                <span className="text-gray-700">{shift.breakDuration}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Positions Needed</span>
                <span className="text-gray-700">{shift.positionsNeeded}</span>
              </div>

              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-500">Coverage</span>
                  <span className="font-medium text-gray-700">
                    {shift.filledPositions}/{shift.positionsNeeded} filled
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${shift.filledPositions >= shift.positionsNeeded ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(100, (shift.filledPositions / shift.positionsNeeded) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
              <Button variant="secondary" size="sm" className="flex-1">Edit</Button>
              <Button variant="ghost" size="sm">Duplicate</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
