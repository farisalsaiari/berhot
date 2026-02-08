import { useState } from 'react';
import { StatCard, Card, Badge, Button, DataTable, SearchInput, ProgressBar } from '@berhot/ui';
import type { Column } from '@berhot/ui';

interface StockItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  location: string;
}

interface StockAlert {
  id: number;
  product: string;
  sku: string;
  currentStock: number;
  minStock: number;
  severity: 'critical' | 'warning';
}

const STOCK_ITEMS: StockItem[] = [
  { id: 1, name: 'Wireless Earbuds Pro', sku: 'WEP-001', category: 'Audio', currentStock: 45, minStock: 10, maxStock: 100, location: 'Main Store' },
  { id: 2, name: 'Bluetooth Speaker Mini', sku: 'BSM-002', category: 'Audio', currentStock: 32, minStock: 15, maxStock: 80, location: 'Main Store' },
  { id: 3, name: 'USB-C Charging Cable', sku: 'UCC-003', category: 'Accessories', currentStock: 150, minStock: 50, maxStock: 300, location: 'Warehouse' },
  { id: 4, name: 'Phone Case (Clear)', sku: 'PCC-004', category: 'Accessories', currentStock: 88, minStock: 30, maxStock: 200, location: 'Main Store' },
  { id: 5, name: 'Portable Charger 10K', sku: 'PC1-006', category: 'Power', currentStock: 28, minStock: 10, maxStock: 60, location: 'Warehouse' },
  { id: 6, name: 'Mechanical Keyboard', sku: 'MKB-010', category: 'Computer', currentStock: 8, minStock: 10, maxStock: 40, location: 'Main Store' },
  { id: 7, name: 'USB Hub 7-Port', sku: 'UH7-016', category: 'Computer', currentStock: 3, minStock: 10, maxStock: 30, location: 'Main Store' },
  { id: 8, name: 'Laptop Stand Aluminum', sku: 'LSA-008', category: 'Computer', currentStock: 22, minStock: 8, maxStock: 50, location: 'Warehouse' },
  { id: 9, name: 'Fitness Tracker', sku: 'FTK-014', category: 'Wearables', currentStock: 18, minStock: 10, maxStock: 50, location: 'Main Store' },
  { id: 10, name: 'HDMI Cable 2m', sku: 'HDM-011', category: 'Cables', currentStock: 200, minStock: 50, maxStock: 300, location: 'Warehouse' },
];

const ALERTS: StockAlert[] = [
  { id: 1, product: 'USB Hub 7-Port', sku: 'UH7-016', currentStock: 3, minStock: 10, severity: 'critical' },
  { id: 2, product: 'Mechanical Keyboard', sku: 'MKB-010', currentStock: 8, minStock: 10, severity: 'warning' },
];

const CATEGORY_BREAKDOWN = [
  { category: 'Audio', items: 2, totalStock: 77, value: 10860 },
  { category: 'Accessories', items: 3, totalStock: 388, value: 12640 },
  { category: 'Power', items: 2, totalStock: 43, value: 7500 },
  { category: 'Computer', items: 3, totalStock: 33, value: 7190 },
  { category: 'Cables', items: 2, totalStock: 295, value: 11275 },
  { category: 'Wearables', items: 2, totalStock: 58, value: 7100 },
];

const stockColumns: Column<StockItem>[] = [
  { key: 'name', header: 'Product', render: (row) => <span className="font-medium">{row.name}</span> },
  { key: 'sku', header: 'SKU', render: (row) => <span className="font-mono text-xs text-gray-500">{row.sku}</span> },
  { key: 'category', header: 'Category' },
  {
    key: 'currentStock',
    header: 'Stock Level',
    render: (row) => (
      <div className="flex items-center gap-3">
        <ProgressBar
          value={row.currentStock}
          max={row.maxStock}
          color={row.currentStock <= row.minStock ? 'bg-red-500' : row.currentStock <= row.minStock * 2 ? 'bg-orange-500' : 'bg-green-500'}
          className="w-24"
        />
        <span className="text-sm">{row.currentStock} / {row.maxStock}</span>
      </div>
    ),
  },
  { key: 'location', header: 'Location', render: (row) => <Badge variant="gray">{row.location}</Badge> },
];

export default function InventoryPage() {
  const [search, setSearch] = useState('');
  const [adjustSku, setAdjustSku] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState<'add' | 'remove'>('add');
  const [transferFrom, setTransferFrom] = useState('Main Store');
  const [transferTo, setTransferTo] = useState('Warehouse');
  const [transferSku, setTransferSku] = useState('');
  const [transferQty, setTransferQty] = useState('');

  const totalItems = STOCK_ITEMS.reduce((sum, item) => sum + item.currentStock, 0);
  const lowStockCount = STOCK_ITEMS.filter((item) => item.currentStock <= item.minStock).length;

  const filtered = STOCK_ITEMS.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Items" value={totalItems.toLocaleString()} sub="across all locations" />
        <StatCard label="Product Types" value={STOCK_ITEMS.length} sub="unique SKUs" />
        <StatCard label="Low Stock Alerts" value={lowStockCount} sub="need restock" trend={lowStockCount > 0 ? 'down' : 'neutral'} />
        <StatCard label="Estimated Value" value="56,565 SAR" sub="total inventory value" />
      </div>

      {/* Alerts */}
      {ALERTS.length > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Low Stock Alerts
          </h3>
          <div className="space-y-2">
            {ALERTS.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <Badge variant={alert.severity === 'critical' ? 'red' : 'orange'}>
                    {alert.severity}
                  </Badge>
                  <div>
                    <span className="text-sm font-medium">{alert.product}</span>
                    <span className="text-xs text-gray-400 ml-2">{alert.sku}</span>
                  </div>
                </div>
                <div className="text-sm">
                  <span className="text-red-600 font-semibold">{alert.currentStock}</span>
                  <span className="text-gray-400"> / min {alert.minStock}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Category Breakdown */}
      <Card>
        <h3 className="font-semibold text-sm mb-4">Category Breakdown</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORY_BREAKDOWN.map((cat) => (
            <div key={cat.category} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-xs text-gray-500 mb-1">{cat.category}</div>
              <div className="text-lg font-bold">{cat.totalStock}</div>
              <div className="text-xs text-gray-400">{cat.items} types | {cat.value.toLocaleString()} SAR</div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Adjustment Form */}
        <Card>
          <h3 className="font-semibold text-sm mb-4">Stock Adjustment</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">SKU</label>
              <input
                type="text"
                placeholder="Enter SKU..."
                value={adjustSku}
                onChange={(e) => setAdjustSku(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Type</label>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setAdjustType('add')}
                    className={`flex-1 py-2 text-sm ${adjustType === 'add' ? 'bg-green-600 text-white' : 'bg-white text-gray-500'}`}
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setAdjustType('remove')}
                    className={`flex-1 py-2 text-sm ${adjustType === 'remove' ? 'bg-red-600 text-white' : 'bg-white text-gray-500'}`}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Quantity</label>
                <input
                  type="number"
                  placeholder="0"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <Button className="w-full">Apply Adjustment</Button>
          </div>
        </Card>

        {/* Transfer Form */}
        <Card>
          <h3 className="font-semibold text-sm mb-4">Transfer Between Locations</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Product SKU</label>
              <input
                type="text"
                placeholder="Enter SKU..."
                value={transferSku}
                onChange={(e) => setTransferSku(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">From</label>
                <select
                  value={transferFrom}
                  onChange={(e) => setTransferFrom(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Main Store</option>
                  <option>Warehouse</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">To</label>
                <select
                  value={transferTo}
                  onChange={(e) => setTransferTo(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Warehouse</option>
                  <option>Main Store</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Quantity</label>
              <input
                type="number"
                placeholder="0"
                value={transferQty}
                onChange={(e) => setTransferQty(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button className="w-full">Transfer Stock</Button>
          </div>
        </Card>
      </div>

      {/* Stock Levels Table */}
      <Card padding={false}>
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold">Stock Levels</h3>
          <SearchInput placeholder="Search by name or SKU..." onSearch={setSearch} className="w-64" />
        </div>
        <DataTable columns={stockColumns} data={filtered} emptyMessage="No stock items found" />
      </Card>
    </div>
  );
}
