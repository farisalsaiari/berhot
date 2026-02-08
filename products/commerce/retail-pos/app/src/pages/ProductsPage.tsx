import { useState } from 'react';
import { Card, Badge, Button, SearchInput, TabBar, DataTable } from '@berhot/ui';
import type { Column } from '@berhot/ui';

interface Product {
  id: number;
  name: string;
  sku: string;
  price: number;
  category: string;
  stock: number;
  barcode: string;
}

const PRODUCTS: Product[] = [
  { id: 1, name: 'Wireless Earbuds Pro', sku: 'WEP-001', price: 180, category: 'audio', stock: 45, barcode: '6281000001' },
  { id: 2, name: 'Bluetooth Speaker Mini', sku: 'BSM-002', price: 120, category: 'audio', stock: 32, barcode: '6281000002' },
  { id: 3, name: 'USB-C Charging Cable', sku: 'UCC-003', price: 40, category: 'accessories', stock: 150, barcode: '6281000003' },
  { id: 4, name: 'Phone Case (Clear)', sku: 'PCC-004', price: 40, category: 'accessories', stock: 88, barcode: '6281000004' },
  { id: 5, name: 'Screen Protector Pack', sku: 'SPP-005', price: 30, category: 'accessories', stock: 120, barcode: '6281000005' },
  { id: 6, name: 'Portable Charger 10K', sku: 'PC1-006', price: 150, category: 'power', stock: 28, barcode: '6281000006' },
  { id: 7, name: 'Portable Charger 20K', sku: 'PC2-007', price: 220, category: 'power', stock: 15, barcode: '6281000007' },
  { id: 8, name: 'Laptop Stand Aluminum', sku: 'LSA-008', price: 195, category: 'computer', stock: 22, barcode: '6281000008' },
  { id: 9, name: 'Wireless Mouse', sku: 'WMS-009', price: 85, category: 'computer', stock: 60, barcode: '6281000009' },
  { id: 10, name: 'Mechanical Keyboard', sku: 'MKB-010', price: 340, category: 'computer', stock: 8, barcode: '6281000010' },
  { id: 11, name: 'HDMI Cable 2m', sku: 'HDM-011', price: 35, category: 'cables', stock: 200, barcode: '6281000011' },
  { id: 12, name: 'Lightning Cable', sku: 'LTC-012', price: 45, category: 'cables', stock: 95, barcode: '6281000012' },
  { id: 13, name: 'Smart Watch Band', sku: 'SWB-013', price: 65, category: 'wearables', stock: 40, barcode: '6281000013' },
  { id: 14, name: 'Fitness Tracker', sku: 'FTK-014', price: 250, category: 'wearables', stock: 18, barcode: '6281000014' },
  { id: 15, name: 'Car Phone Mount', sku: 'CPM-015', price: 55, category: 'accessories', stock: 75, barcode: '6281000015' },
  { id: 16, name: 'USB Hub 7-Port', sku: 'UH7-016', price: 110, category: 'computer', stock: 3, barcode: '6281000016' },
];

const CATEGORIES = [
  { key: 'all', label: 'All', count: PRODUCTS.length },
  { key: 'audio', label: 'Audio', count: PRODUCTS.filter((p) => p.category === 'audio').length },
  { key: 'accessories', label: 'Accessories', count: PRODUCTS.filter((p) => p.category === 'accessories').length },
  { key: 'power', label: 'Power', count: PRODUCTS.filter((p) => p.category === 'power').length },
  { key: 'computer', label: 'Computer', count: PRODUCTS.filter((p) => p.category === 'computer').length },
  { key: 'cables', label: 'Cables', count: PRODUCTS.filter((p) => p.category === 'cables').length },
  { key: 'wearables', label: 'Wearables', count: PRODUCTS.filter((p) => p.category === 'wearables').length },
];

function stockBadge(stock: number) {
  if (stock <= 5) return <Badge variant="red">Critical ({stock})</Badge>;
  if (stock <= 20) return <Badge variant="orange">Low ({stock})</Badge>;
  return <Badge variant="green">In Stock ({stock})</Badge>;
}

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = PRODUCTS.filter((p) => {
    const matchCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  const listColumns: Column<Product>[] = [
    { key: 'name', header: 'Product', render: (row) => <span className="font-medium">{row.name}</span> },
    { key: 'sku', header: 'SKU', render: (row) => <span className="font-mono text-xs text-gray-500">{row.sku}</span> },
    { key: 'price', header: 'Price', render: (row) => <span className="font-semibold">{row.price} SAR</span> },
    { key: 'stock', header: 'Stock', render: (row) => stockBadge(row.stock) },
    { key: 'barcode', header: 'Barcode', render: (row) => <span className="font-mono text-xs text-gray-400">{row.barcode}</span> },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SearchInput placeholder="Search products by name or SKU..." onSearch={setSearch} className="w-72" />
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 text-sm ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 text-sm ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
          <Button>Add Product</Button>
        </div>
      </div>

      {/* Categories */}
      <TabBar tabs={CATEGORIES} activeKey={activeCategory} onChange={setActiveCategory} />

      {/* Content */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => (
            <Card key={product.id}>
              {/* Image placeholder */}
              <div className="w-full h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-semibold text-sm mb-1">{product.name}</h3>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-xs text-gray-400">{product.sku}</span>
                <span className="text-gray-300">|</span>
                <span className="font-mono text-xs text-gray-400">{product.barcode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">{product.price} SAR</span>
                {stockBadge(product.stock)}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card padding={false}>
          <DataTable columns={listColumns} data={filtered} emptyMessage="No products found" />
        </Card>
      )}

      {filtered.length === 0 && viewMode === 'grid' && (
        <div className="text-center py-12 text-gray-400">No products found matching your criteria.</div>
      )}
    </div>
  );
}
