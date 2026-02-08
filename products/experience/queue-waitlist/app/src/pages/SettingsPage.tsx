import { useState } from 'react';
import { Card, Button } from '@berhot/ui';

export default function SettingsPage() {
  const [maxCapacity, setMaxCapacity] = useState(50);
  const [autoAssign, setAutoAssign] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(true);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Queue Configuration */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-1">Queue Configuration</h2>
        <p className="text-xs text-gray-400 mb-5">Configure how the queue system operates</p>

        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Queue Capacity</label>
              <input
                type="number"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Maximum number of guests that can be in the queue at once</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avg Service Time (minutes)</label>
              <input
                type="number"
                defaultValue={15}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">Used to calculate estimated wait times</p>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-t border-gray-100">
            <div>
              <div className="text-sm font-medium text-gray-700">Auto-assignment</div>
              <div className="text-xs text-gray-400">Automatically assign next available table to queued guests</div>
            </div>
            <button
              onClick={() => setAutoAssign(!autoAssign)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoAssign ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${autoAssign ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </Card>

      {/* Operating Hours */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-1">Operating Hours</h2>
        <p className="text-xs text-gray-400 mb-5">Set when the queue accepts new entries</p>

        <div className="space-y-4">
          {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map((day) => (
            <div key={day} className="grid grid-cols-[120px_1fr_auto_1fr] items-center gap-3">
              <span className="text-sm font-medium text-gray-700">{day}</span>
              <input type="time" defaultValue="09:00" className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span className="text-gray-400 text-sm">to</span>
              <input type="time" defaultValue="22:00" className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
          {['Friday', 'Saturday'].map((day) => (
            <div key={day} className="grid grid-cols-[120px_1fr_auto_1fr] items-center gap-3">
              <span className="text-sm font-medium text-gray-700">{day}</span>
              <input type="time" defaultValue="10:00" className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <span className="text-gray-400 text-sm">to</span>
              <input type="time" defaultValue="23:00" className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          ))}
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h2 className="font-semibold text-gray-900 mb-1">Notification Settings</h2>
        <p className="text-xs text-gray-400 mb-5">Configure SMS and notification preferences</p>

        <div className="space-y-5">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div>
              <div className="text-sm font-medium text-gray-700">SMS Notifications</div>
              <div className="text-xs text-gray-400">Send SMS to guests when their turn is approaching</div>
            </div>
            <button
              onClick={() => setSmsEnabled(!smsEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${smsEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${smsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMS Template - Queue Joined</label>
            <textarea
              defaultValue="Hi {name}, you've been added to the queue! Your position is #{position}. Estimated wait: {wait_time}."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMS Template - Your Turn</label>
            <textarea
              defaultValue="Hi {name}, it's your turn! Please head to the entrance. Your table is ready."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SMS Template - Reminder</label>
            <textarea
              defaultValue="Hi {name}, you're next in line! Please be ready. If you can't make it, reply CANCEL."
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary">Reset to Defaults</Button>
        <Button variant="primary">Save Settings</Button>
      </div>
    </div>
  );
}
