import { useState } from 'react';
import { Card, Badge, Button, SearchInput, TabBar } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

interface Service {
  id: number;
  name: string;
  category: string;
  duration: number;
  price: number;
  description: string;
  popular: boolean;
}

const CATEGORIES = [
  { key: 'all', label: 'All Services' },
  { key: 'haircut', label: 'Haircut' },
  { key: 'color', label: 'Color' },
  { key: 'treatment', label: 'Treatment' },
  { key: 'massage', label: 'Massage' },
  { key: 'nails', label: 'Nails' },
];

const CATEGORY_BADGE: Record<string, BadgeVariant> = {
  haircut: 'blue',
  color: 'purple',
  treatment: 'green',
  massage: 'orange',
  nails: 'red',
};

const SERVICES: Service[] = [
  { id: 1, name: "Women's Haircut & Style", category: 'haircut', duration: 60, price: 150, description: 'Consultation, wash, precision cut, and professional styling.', popular: true },
  { id: 2, name: "Men's Haircut", category: 'haircut', duration: 30, price: 80, description: 'Classic or modern cut with styling and hot towel finish.', popular: true },
  { id: 3, name: 'Kids Haircut', category: 'haircut', duration: 30, price: 60, description: 'Fun and gentle haircut for children under 12.', popular: false },
  { id: 4, name: 'Blowout & Styling', category: 'haircut', duration: 45, price: 100, description: 'Wash and professional blowout with heat styling.', popular: true },
  { id: 5, name: 'Full Color', category: 'color', duration: 120, price: 350, description: 'Complete single-process color application from root to tip.', popular: true },
  { id: 6, name: 'Balayage', category: 'color', duration: 180, price: 500, description: 'Hand-painted highlights for a natural sun-kissed effect.', popular: true },
  { id: 7, name: 'Highlights (Partial)', category: 'color', duration: 120, price: 300, description: 'Foil highlights on the top and crown sections.', popular: false },
  { id: 8, name: 'Highlights (Full)', category: 'color', duration: 150, price: 450, description: 'Full head foil highlights for maximum dimension.', popular: false },
  { id: 9, name: 'Root Touch-Up', category: 'color', duration: 60, price: 180, description: 'Color refresh for regrowth areas only.', popular: true },
  { id: 10, name: 'Deep Conditioning', category: 'treatment', duration: 45, price: 120, description: 'Intensive moisture treatment for dry or damaged hair.', popular: false },
  { id: 11, name: 'Keratin Treatment', category: 'treatment', duration: 120, price: 400, description: 'Smoothing treatment for frizz-free, manageable hair up to 3 months.', popular: true },
  { id: 12, name: 'Scalp Treatment', category: 'treatment', duration: 30, price: 90, description: 'Exfoliation and nourishing treatment for a healthy scalp.', popular: false },
  { id: 13, name: 'Swedish Massage', category: 'massage', duration: 60, price: 200, description: 'Classic full-body relaxation massage with long flowing strokes.', popular: true },
  { id: 14, name: 'Hot Stone Massage', category: 'massage', duration: 90, price: 280, description: 'Heated basalt stones combined with massage for deep relaxation.', popular: true },
  { id: 15, name: 'Deep Tissue Massage', category: 'massage', duration: 60, price: 230, description: 'Targeted pressure for chronic muscle tension and knots.', popular: false },
  { id: 16, name: 'Gel Manicure', category: 'nails', duration: 45, price: 80, description: 'Long-lasting gel polish manicure with cuticle care and shaping.', popular: true },
  { id: 17, name: 'Classic Pedicure', category: 'nails', duration: 60, price: 100, description: 'Foot soak, exfoliation, nail shaping, and polish application.', popular: false },
  { id: 18, name: 'Nail Art Design', category: 'nails', duration: 30, price: 60, description: 'Custom nail art on top of any manicure service.', popular: false },
];

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = SERVICES.filter((s) => {
    const matchCategory = activeCategory === 'all' || s.category === activeCategory;
    const matchSearch = !search || s.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SearchInput placeholder="Search services..." onSearch={setSearch} className="w-72" />
        <Button variant="primary" size="md">+ Add Service</Button>
      </div>

      {/* Category Tabs */}
      <TabBar
        tabs={CATEGORIES.map((c) => ({
          key: c.key,
          label: c.label,
          count: c.key === 'all' ? SERVICES.length : SERVICES.filter((s) => s.category === c.key).length,
        }))}
        activeKey={activeCategory}
        onChange={setActiveCategory}
      />

      {/* Service Grid */}
      <div className="grid grid-cols-3 gap-5">
        {filtered.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <Badge variant={CATEGORY_BADGE[service.category] || 'gray'}>
                {service.category.charAt(0).toUpperCase() + service.category.slice(1)}
              </Badge>
              {service.popular && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Popular
                </span>
              )}
            </div>

            <h3 className="text-base font-semibold text-gray-900 mb-1">{service.name}</h3>
            <p className="text-sm text-gray-500 mb-4 line-clamp-2">{service.description}</p>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                  </svg>
                  <span className="text-sm text-gray-600">{service.duration} min</span>
                </div>
                <span className="text-base font-bold text-gray-900">SAR {service.price}</span>
              </div>
              <Button variant="ghost" size="sm">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
