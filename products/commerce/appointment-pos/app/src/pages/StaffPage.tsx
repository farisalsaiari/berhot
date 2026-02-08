import { useState } from 'react';
import { Card, Badge, Button, SearchInput } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

interface StaffMember {
  id: number;
  name: string;
  role: string;
  specialties: string[];
  availability: { day: string; hours: string }[];
  rating: number;
  totalBookings: number;
  phone: string;
  email: string;
  status: 'available' | 'busy' | 'off';
}

const STATUS_CONFIG: Record<StaffMember['status'], { label: string; variant: BadgeVariant }> = {
  available: { label: 'Available', variant: 'green' },
  busy: { label: 'With Client', variant: 'orange' },
  off: { label: 'Day Off', variant: 'gray' },
};

const STAFF: StaffMember[] = [
  {
    id: 1,
    name: 'Ahmed Al-Mutairi',
    role: 'Senior Stylist',
    specialties: ['Haircut', 'Beard Trim', 'Styling'],
    availability: [
      { day: 'Sun-Thu', hours: '9:00 AM - 6:00 PM' },
      { day: 'Sat', hours: '10:00 AM - 4:00 PM' },
    ],
    rating: 4.9,
    totalBookings: 1_247,
    phone: '+966 50 111 2222',
    email: 'ahmed@salon.com',
    status: 'available',
  },
  {
    id: 2,
    name: 'Sara Hassan',
    role: 'Color Specialist',
    specialties: ['Balayage', 'Full Color', 'Highlights', 'Ombre'],
    availability: [
      { day: 'Sun-Wed', hours: '10:00 AM - 7:00 PM' },
      { day: 'Fri', hours: '2:00 PM - 8:00 PM' },
    ],
    rating: 4.8,
    totalBookings: 982,
    phone: '+966 55 333 4444',
    email: 'sara@salon.com',
    status: 'busy',
  },
  {
    id: 3,
    name: 'Omar Ibrahim',
    role: 'Treatment Expert',
    specialties: ['Keratin', 'Deep Conditioning', 'Scalp Treatment'],
    availability: [
      { day: 'Sun-Thu', hours: '9:00 AM - 5:00 PM' },
    ],
    rating: 4.7,
    totalBookings: 756,
    phone: '+966 54 555 6666',
    email: 'omar@salon.com',
    status: 'available',
  },
  {
    id: 4,
    name: 'Nora Al-Qahtani',
    role: 'Massage Therapist',
    specialties: ['Swedish Massage', 'Hot Stone', 'Deep Tissue', 'Aromatherapy'],
    availability: [
      { day: 'Sun-Wed', hours: '10:00 AM - 6:00 PM' },
      { day: 'Thu', hours: '10:00 AM - 3:00 PM' },
    ],
    rating: 4.9,
    totalBookings: 1_103,
    phone: '+966 56 777 8888',
    email: 'nora@salon.com',
    status: 'busy',
  },
  {
    id: 5,
    name: 'Khalid Nasser',
    role: 'Nail Technician',
    specialties: ['Gel Manicure', 'Pedicure', 'Nail Art', 'Acrylic'],
    availability: [
      { day: 'Sun-Thu', hours: '9:00 AM - 5:00 PM' },
      { day: 'Sat', hours: '11:00 AM - 4:00 PM' },
    ],
    rating: 4.6,
    totalBookings: 634,
    phone: '+966 59 999 0000',
    email: 'khalid@salon.com',
    status: 'off',
  },
  {
    id: 6,
    name: 'Mariam Al-Subaie',
    role: 'Junior Stylist',
    specialties: ['Haircut', 'Blowout', 'Styling'],
    availability: [
      { day: 'Mon-Fri', hours: '10:00 AM - 6:00 PM' },
    ],
    rating: 4.5,
    totalBookings: 312,
    phone: '+966 50 222 3333',
    email: 'mariam@salon.com',
    status: 'available',
  },
];

function renderStars(rating: number) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          className={`w-4 h-4 ${i < full ? 'text-amber-400' : i === full && hasHalf ? 'text-amber-400' : 'text-gray-200'}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1 text-sm font-semibold text-gray-700">{rating}</span>
    </div>
  );
}

export default function StaffPage() {
  const [search, setSearch] = useState('');

  const filtered = STAFF.filter((s) =>
    !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SearchInput placeholder="Search staff..." onSearch={setSearch} className="w-72" />
        <Button variant="primary" size="md">+ Add Staff Member</Button>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-3 gap-5">
        {filtered.map((member) => {
          const statusCfg = STATUS_CONFIG[member.status];
          return (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              {/* Profile Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500 shrink-0">
                  {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900 truncate">{member.name}</h3>
                    <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
                  </div>
                  <div className="text-sm text-gray-500">{member.role}</div>
                  {renderStars(member.rating)}
                </div>
              </div>

              {/* Specialties */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Specialties</div>
                <div className="flex flex-wrap gap-1.5">
                  {member.specialties.map((s) => (
                    <span key={s} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">{s}</span>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="mb-4">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Availability</div>
                {member.availability.map((a, i) => (
                  <div key={i} className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">{a.day}</span>
                    <span className="text-gray-700 font-medium">{a.hours}</span>
                  </div>
                ))}
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="text-sm">
                  <span className="font-bold text-gray-900">{member.totalBookings.toLocaleString()}</span>
                  <span className="text-gray-400 ml-1">bookings</span>
                </div>
                <div className="flex gap-1">
                  <Button variant="secondary" size="sm">Schedule</Button>
                  <Button variant="ghost" size="sm">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
