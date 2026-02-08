import { useState } from 'react';
import { Card, Button, Badge } from '@berhot/ui';

interface Drink {
  id: number;
  name: string;
  basePrice: number;
  emoji: string;
  category: 'hot' | 'cold' | 'specialty';
}

interface OrderItem {
  drink: Drink;
  size: 'S' | 'M' | 'L';
  milk: string;
  extras: string[];
  price: number;
}

const POPULAR_DRINKS: Drink[] = [
  { id: 1, name: 'Cappuccino', basePrice: 18, emoji: '\u2615', category: 'hot' },
  { id: 2, name: 'Iced Latte', basePrice: 22, emoji: '\ud83e\uddca', category: 'cold' },
  { id: 3, name: 'Espresso', basePrice: 12, emoji: '\u2615', category: 'hot' },
  { id: 4, name: 'Americano', basePrice: 15, emoji: '\u2615', category: 'hot' },
  { id: 5, name: 'Flat White', basePrice: 20, emoji: '\u2615', category: 'hot' },
  { id: 6, name: 'Matcha Latte', basePrice: 25, emoji: '\ud83c\udf75', category: 'specialty' },
  { id: 7, name: 'Cold Brew', basePrice: 20, emoji: '\ud83e\uddca', category: 'cold' },
  { id: 8, name: 'Mocha', basePrice: 24, emoji: '\u2615', category: 'hot' },
  { id: 9, name: 'Chai Latte', basePrice: 22, emoji: '\ud83c\udf75', category: 'specialty' },
  { id: 10, name: 'Caramel Frappe', basePrice: 28, emoji: '\ud83e\uddca', category: 'cold' },
  { id: 11, name: 'Hot Chocolate', basePrice: 20, emoji: '\ud83c\udf75', category: 'specialty' },
  { id: 12, name: 'Turkish Coffee', basePrice: 14, emoji: '\u2615', category: 'hot' },
];

const SIZES = ['S', 'M', 'L'] as const;
const SIZE_PRICES: Record<string, number> = { S: 0, M: 4, L: 8 };
const MILK_OPTIONS = ['Regular', 'Oat', 'Almond', 'Soy', 'Coconut'];
const EXTRAS = [
  { name: 'Extra Shot', price: 5 },
  { name: 'Vanilla Syrup', price: 4 },
  { name: 'Caramel Syrup', price: 4 },
  { name: 'Whipped Cream', price: 3 },
  { name: 'Chocolate Drizzle', price: 3 },
];

function calculatePrice(drink: Drink, size: string, extras: string[]): number {
  let price = drink.basePrice + (SIZE_PRICES[size] || 0);
  extras.forEach((e) => {
    const extra = EXTRAS.find((ex) => ex.name === e);
    if (extra) price += extra.price;
  });
  return price;
}

export default function QuickOrderPage() {
  const [selectedDrink, setSelectedDrink] = useState<Drink | null>(null);
  const [size, setSize] = useState<'S' | 'M' | 'L'>('M');
  const [milk, setMilk] = useState('Regular');
  const [extras, setExtras] = useState<string[]>([]);
  const [order, setOrder] = useState<OrderItem[]>([]);

  const toggleExtra = (name: string) => {
    setExtras((prev) => (prev.includes(name) ? prev.filter((e) => e !== name) : [...prev, name]));
  };

  const addToOrder = () => {
    if (!selectedDrink) return;
    const price = calculatePrice(selectedDrink, size, extras);
    setOrder((prev) => [...prev, { drink: selectedDrink, size, milk, extras: [...extras], price }]);
    setSelectedDrink(null);
    setSize('M');
    setMilk('Regular');
    setExtras([]);
  };

  const removeFromOrder = (index: number) => {
    setOrder((prev) => prev.filter((_, i) => i !== index));
  };

  const total = order.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Drinks Grid */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="font-semibold text-gray-700">Popular Drinks</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {POPULAR_DRINKS.map((drink) => (
            <button
              key={drink.id}
              onClick={() => setSelectedDrink(drink)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md ${
                selectedDrink?.id === drink.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <span className="text-3xl">{drink.emoji}</span>
              <span className="text-sm font-medium text-center">{drink.name}</span>
              <span className="text-xs text-gray-500">{drink.basePrice} SAR</span>
            </button>
          ))}
        </div>

        {/* Customization Panel */}
        {selectedDrink && (
          <Card className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Customize: {selectedDrink.name}</h3>
              <span className="text-lg font-bold text-blue-600">
                {calculatePrice(selectedDrink, size, extras)} SAR
              </span>
            </div>

            {/* Size */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-2 block">Size</label>
              <div className="flex gap-2">
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`w-16 h-16 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${
                      size === s ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-bold text-lg">{s}</span>
                    <span className="text-[10px] text-gray-500">+{SIZE_PRICES[s]} SAR</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Milk Type */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-2 block">Milk Type</label>
              <div className="flex flex-wrap gap-2">
                {MILK_OPTIONS.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMilk(m)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                      milk === m ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Extras */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-600 mb-2 block">Extras</label>
              <div className="flex flex-wrap gap-2">
                {EXTRAS.map((e) => (
                  <button
                    key={e.name}
                    onClick={() => toggleExtra(e.name)}
                    className={`px-3 py-2 rounded-lg border text-sm transition-all ${
                      extras.includes(e.name)
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {e.name} (+{e.price})
                  </button>
                ))}
              </div>
            </div>

            <Button onClick={addToOrder} size="lg" className="w-full">
              Add to Order
            </Button>
          </Card>
        )}
      </div>

      {/* Order Summary */}
      <div className="space-y-4">
        <Card>
          <h3 className="font-semibold mb-4">Current Order</h3>
          {order.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No items yet. Tap a drink to start.</p>
          ) : (
            <div className="space-y-3">
              {order.map((item, i) => (
                <div key={i} className="flex items-start justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.drink.name}</span>
                      <Badge variant="blue">{item.size}</Badge>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.milk} milk{item.extras.length > 0 && ` + ${item.extras.join(', ')}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{item.price} SAR</span>
                    <button
                      onClick={() => removeFromOrder(i)}
                      className="text-gray-400 hover:text-red-500 text-xs"
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {order.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold text-blue-600">{total} SAR</span>
              </div>
              <Button size="lg" className="w-full">
                Checkout
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={() => setOrder([])}
              >
                Clear Order
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
