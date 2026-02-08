import { useState } from 'react';
import { Card, Badge, Button, SearchInput } from '@berhot/ui';
import type { BadgeVariant } from '@berhot/ui';

interface MenuItem {
  id: number;
  name: string;
  nameAr?: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  popular?: boolean;
  image?: string;
}

const CATEGORIES = [
  { key: 'all', label: 'All Items', icon: 'M4 6h16M4 12h16M4 18h16' },
  { key: 'appetizers', label: 'Appetizers', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  { key: 'mains', label: 'Mains', icon: 'M3 3h18v18H3V3z' },
  { key: 'desserts', label: 'Desserts', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2' },
  { key: 'drinks', label: 'Drinks', icon: 'M9 12l2 2 4-4' },
  { key: 'specials', label: 'Specials', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
];

const MENU_ITEMS: MenuItem[] = [
  { id: 1, name: 'Hummus', description: 'Classic chickpea dip with tahini, lemon, and olive oil', price: 18, category: 'appetizers', available: true, popular: true },
  { id: 2, name: 'Fattoush', description: 'Fresh salad with crispy pita chips and pomegranate dressing', price: 22, category: 'appetizers', available: true },
  { id: 3, name: 'Lentil Soup', description: 'Hearty red lentil soup with cumin and lemon', price: 16, category: 'appetizers', available: true },
  { id: 4, name: 'Tabbouleh', description: 'Parsley, bulgur, tomato, and mint salad', price: 20, category: 'appetizers', available: false },
  { id: 5, name: 'Kabsa', description: 'Spiced rice with tender chicken, raisins, and almonds', price: 55, category: 'mains', available: true, popular: true },
  { id: 6, name: 'Lamb Mandi', description: 'Slow-cooked lamb on fragrant basmati rice', price: 72, category: 'mains', available: true },
  { id: 7, name: 'Mixed Grill', description: 'Assorted grilled meats with rice and grilled vegetables', price: 85, category: 'mains', available: true, popular: true },
  { id: 8, name: 'Grilled Chicken', description: 'Marinated half chicken with garlic sauce', price: 48, category: 'mains', available: true },
  { id: 9, name: 'Shawarma Plate', description: 'Sliced chicken shawarma with pickles and garlic paste', price: 42, category: 'mains', available: true },
  { id: 10, name: 'Fish Sayadieh', description: 'Pan-fried fish on spiced rice with caramelized onions', price: 68, category: 'mains', available: false },
  { id: 11, name: 'Lamb Ouzi', description: 'Whole roasted lamb shoulder with saffron rice', price: 95, category: 'specials', available: true },
  { id: 12, name: 'Kunafa', description: 'Warm cheese pastry with sugar syrup and pistachios', price: 28, category: 'desserts', available: true, popular: true },
  { id: 13, name: 'Basbousa', description: 'Semolina cake soaked in sweet syrup', price: 22, category: 'desserts', available: true },
  { id: 14, name: 'Um Ali', description: 'Egyptian bread pudding with cream, nuts, and raisins', price: 25, category: 'desserts', available: true },
  { id: 15, name: 'Arabic Coffee', description: 'Traditional cardamom-spiced coffee', price: 12, category: 'drinks', available: true },
  { id: 16, name: 'Fresh Juice', description: 'Orange, pomegranate, or mixed fruit juice', price: 15, category: 'drinks', available: true },
  { id: 17, name: 'Mint Lemonade', description: 'Fresh lemon and mint refresher', price: 14, category: 'drinks', available: true },
  { id: 18, name: 'Tea', description: 'Hot tea with sage or mint', price: 10, category: 'drinks', available: true },
];

export default function MenuPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = MENU_ITEMS
    .filter((item) => activeCategory === 'all' || item.category === activeCategory)
    .filter((item) => search === '' || item.name.toLowerCase().includes(search.toLowerCase()) || item.description.toLowerCase().includes(search.toLowerCase()));

  const totalItems = MENU_ITEMS.length;
  const availableCount = MENU_ITEMS.filter((i) => i.available).length;

  return (
    <div className="flex gap-6 h-full">
      {/* Categories Sidebar */}
      <div className="w-52 shrink-0">
        <Card className="sticky top-0">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Categories</div>
          <div className="space-y-1">
            {CATEGORIES.map((cat) => {
              const count = cat.key === 'all' ? MENU_ITEMS.length : MENU_ITEMS.filter((i) => i.category === cat.key).length;
              return (
                <button
                  key={cat.key}
                  onClick={() => setActiveCategory(cat.key)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeCategory === cat.key
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={cat.icon} />
                  </svg>
                  <span className="flex-1 text-left">{cat.label}</span>
                  <span className="text-xs text-gray-400">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="h-px bg-gray-200 my-4" />

          <div className="space-y-2 text-xs text-gray-500">
            <div className="flex justify-between">
              <span>Total items</span>
              <span className="font-semibold text-gray-700">{totalItems}</span>
            </div>
            <div className="flex justify-between">
              <span>Available</span>
              <span className="font-semibold text-green-600">{availableCount}</span>
            </div>
            <div className="flex justify-between">
              <span>Unavailable</span>
              <span className="font-semibold text-red-600">{totalItems - availableCount}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-4">
        {/* Search and Actions */}
        <div className="flex items-center gap-3">
          <SearchInput placeholder="Search menu items..." onSearch={setSearch} className="flex-1" />
          <Button variant="primary" size="md">
            + Add Item
          </Button>
        </div>

        {/* Items Count */}
        <div className="text-sm text-gray-500">
          Showing {filtered.length} of {totalItems} items
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((item) => (
            <Card key={item.id} className={`hover:shadow-md transition-shadow ${!item.available ? 'opacity-60' : ''}`}>
              {/* Placeholder image area */}
              <div className="h-28 bg-gradient-to-br from-gray-100 to-gray-200 -mx-5 -mt-5 mb-4 rounded-t-xl flex items-center justify-center">
                <span className="text-3xl">
                  {item.category === 'appetizers' && '🥗'}
                  {item.category === 'mains' && '🍖'}
                  {item.category === 'desserts' && '🍰'}
                  {item.category === 'drinks' && '☕'}
                  {item.category === 'specials' && '⭐'}
                </span>
              </div>

              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                </div>
                <div className="flex items-center gap-1.5 ml-2 shrink-0">
                  {item.popular && <Badge variant="purple">Popular</Badge>}
                  <Badge variant={item.available ? 'green' : 'red'}>
                    {item.available ? 'Available' : 'Out'}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-gray-500 mb-3 line-clamp-2">{item.description}</p>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-lg font-bold text-gray-900">SAR {item.price}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant={item.available ? 'danger' : 'primary'} size="sm">
                    {item.available ? 'Disable' : 'Enable'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <div className="text-lg mb-2">No items found</div>
            <div className="text-sm">Try adjusting your search or category filter</div>
          </div>
        )}
      </div>
    </div>
  );
}
