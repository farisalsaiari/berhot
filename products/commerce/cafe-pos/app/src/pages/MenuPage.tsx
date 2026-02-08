import { useState } from 'react';
import { Card, Badge, TabBar, SearchInput, Button } from '@berhot/ui';

interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  available: boolean;
  description: string;
}

const MENU_ITEMS: MenuItem[] = [
  // Hot Drinks
  { id: 1, name: 'Espresso', price: 12, category: 'hot-drinks', available: true, description: 'Rich single shot espresso' },
  { id: 2, name: 'Double Espresso', price: 16, category: 'hot-drinks', available: true, description: 'Bold double shot espresso' },
  { id: 3, name: 'Cappuccino', price: 18, category: 'hot-drinks', available: true, description: 'Espresso with steamed milk foam' },
  { id: 4, name: 'Flat White', price: 20, category: 'hot-drinks', available: true, description: 'Velvety microfoam espresso' },
  { id: 5, name: 'Americano', price: 15, category: 'hot-drinks', available: true, description: 'Espresso with hot water' },
  { id: 6, name: 'Turkish Coffee', price: 14, category: 'hot-drinks', available: true, description: 'Traditional cardamom coffee' },
  { id: 7, name: 'Mocha', price: 24, category: 'hot-drinks', available: false, description: 'Espresso with chocolate and steamed milk' },
  // Cold Drinks
  { id: 8, name: 'Iced Latte', price: 22, category: 'cold-drinks', available: true, description: 'Espresso over ice with milk' },
  { id: 9, name: 'Cold Brew', price: 20, category: 'cold-drinks', available: true, description: '16-hour slow steeped coffee' },
  { id: 10, name: 'Iced Americano', price: 17, category: 'cold-drinks', available: true, description: 'Espresso with cold water and ice' },
  { id: 11, name: 'Caramel Frappe', price: 28, category: 'cold-drinks', available: true, description: 'Blended caramel coffee drink' },
  { id: 12, name: 'Iced Mocha', price: 26, category: 'cold-drinks', available: false, description: 'Chocolate espresso over ice' },
  // Pastries
  { id: 13, name: 'Butter Croissant', price: 14, category: 'pastries', available: true, description: 'Flaky French butter croissant' },
  { id: 14, name: 'Chocolate Muffin', price: 16, category: 'pastries', available: true, description: 'Double chocolate chip muffin' },
  { id: 15, name: 'Blueberry Scone', price: 15, category: 'pastries', available: true, description: 'Fresh blueberry scone' },
  { id: 16, name: 'Cinnamon Roll', price: 18, category: 'pastries', available: true, description: 'Warm cinnamon sugar roll' },
  // Snacks
  { id: 17, name: 'Granola Bar', price: 10, category: 'snacks', available: true, description: 'Oat and honey granola bar' },
  { id: 18, name: 'Mixed Nuts', price: 12, category: 'snacks', available: true, description: 'Premium roasted nut mix' },
  { id: 19, name: 'Fruit Cup', price: 14, category: 'snacks', available: true, description: 'Seasonal fresh fruit' },
  // Specials
  { id: 20, name: 'Lavender Latte', price: 26, category: 'specials', available: true, description: 'Limited edition lavender espresso' },
  { id: 21, name: 'Rose Cardamom Latte', price: 28, category: 'specials', available: true, description: 'Arabic-inspired specialty drink' },
  { id: 22, name: 'Affogato', price: 22, category: 'specials', available: true, description: 'Espresso poured over gelato' },
];

const CATEGORIES = [
  { key: 'all', label: 'All Items', count: MENU_ITEMS.length },
  { key: 'hot-drinks', label: 'Hot Drinks', count: MENU_ITEMS.filter((i) => i.category === 'hot-drinks').length },
  { key: 'cold-drinks', label: 'Cold Drinks', count: MENU_ITEMS.filter((i) => i.category === 'cold-drinks').length },
  { key: 'pastries', label: 'Pastries', count: MENU_ITEMS.filter((i) => i.category === 'pastries').length },
  { key: 'snacks', label: 'Snacks', count: MENU_ITEMS.filter((i) => i.category === 'snacks').length },
  { key: 'specials', label: 'Specials', count: MENU_ITEMS.filter((i) => i.category === 'specials').length },
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = MENU_ITEMS.filter((item) => {
    const matchCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{MENU_ITEMS.length} items total</p>
        </div>
        <div className="flex items-center gap-3">
          <SearchInput placeholder="Search menu..." onSearch={setSearch} className="w-64" />
          <Button>Add Item</Button>
        </div>
      </div>

      {/* Categories */}
      <TabBar tabs={CATEGORIES} activeKey={activeCategory} onChange={setActiveCategory} />

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <Card key={item.id} className="flex flex-col">
            {/* Image Placeholder */}
            <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            </div>

            <div className="flex items-start justify-between mb-1">
              <h3 className="font-semibold text-sm">{item.name}</h3>
              <Badge variant={item.available ? 'green' : 'red'}>
                {item.available ? 'Available' : 'Out'}
              </Badge>
            </div>

            <p className="text-xs text-gray-500 mb-3 flex-1">{item.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold">{item.price} SAR</span>
              <Button variant="secondary" size="sm" disabled={!item.available}>
                Edit
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No menu items found matching your criteria.
        </div>
      )}
    </div>
  );
}
