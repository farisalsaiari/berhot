import { useState, useEffect, useCallback } from 'react';
import {
  fetchProducts, fetchCategories, createProduct, updateProduct,
  createCategory, Product, Category,
} from '../lib/posApi';

interface Props {
  C: Record<string, string>;
  isLight: boolean;
  isMobile: boolean;
}

export default function ProductsContent({ C, isLight, isMobile }: Props) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCost, setFormCost] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);

  // Category form
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([fetchProducts(), fetchCategories()]);
      setProducts(p);
      setCategories(c);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || p.categoryId === activeCategory;
    return matchSearch && matchCat;
  });

  function openCreate() {
    setEditingProduct(null);
    setFormName(''); setFormSku(''); setFormPrice(''); setFormCost('');
    setFormCategory(''); setFormDescription(''); setFormAvailable(true);
    setShowModal(true);
  }

  function openEdit(p: Product) {
    setEditingProduct(p);
    setFormName(p.name); setFormSku(p.sku); setFormPrice(String(p.price));
    setFormCost(p.cost ? String(p.cost) : ''); setFormCategory(p.categoryId || '');
    setFormDescription(p.description || ''); setFormAvailable(p.isAvailable);
    setShowModal(true);
  }

  async function handleSave() {
    if (!formName.trim() || !formPrice.trim()) return;
    setSaving(true);
    setError('');
    try {
      const payload: Partial<Product> = {
        name: formName.trim(),
        sku: formSku.trim(),
        price: parseFloat(formPrice),
        cost: formCost ? parseFloat(formCost) : undefined,
        categoryId: formCategory || undefined,
        description: formDescription.trim() || undefined,
        isAvailable: formAvailable,
      };
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct(payload);
      }
      setShowModal(false);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreateCategory() {
    if (!catName.trim()) return;
    setSaving(true);
    try {
      await createCategory({ name: catName.trim(), description: catDesc.trim() || undefined });
      setCatName(''); setCatDesc('');
      setShowCatModal(false);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed');
    } finally {
      setSaving(false);
    }
  }

  const getCategoryName = (id?: string) => categories.find(c => c.id === id)?.name || '—';

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: 8,
    border: `1px solid ${C.cardBorder}`, background: C.bg, color: C.textPrimary,
    fontSize: 14, outline: 'none', boxSizing: 'border-box',
  };

  const btnPrimary: React.CSSProperties = {
    padding: '10px 20px', borderRadius: 8, border: 'none',
    background: C.btnBg, color: '#fff', fontWeight: 600, fontSize: 14,
    cursor: 'pointer', opacity: saving ? 0.6 : 1,
  };

  const btnSecondary: React.CSSProperties = {
    padding: '10px 20px', borderRadius: 8,
    border: `1px solid ${C.cardBorder}`, background: 'transparent',
    color: C.textPrimary, fontWeight: 600, fontSize: 14, cursor: 'pointer',
  };

  return (
    <div style={{ padding: isMobile ? '20px 16px 60px 16px' : '30px 30px 60px 30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Products</h2>
          <span style={{ fontSize: 13, color: C.textSecond }}>{products.length} total products</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowCatModal(true)} style={btnSecondary}>+ Category</button>
          <button onClick={openCreate} style={btnPrimary}>+ Product</button>
        </div>
      </div>

      {error && <div style={{ padding: '10px 14px', background: '#ef44441a', color: '#ef4444', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      {/* Search + Category Tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, paddingLeft: 36 }}
          />
        </div>
      </div>

      {/* Category filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveCategory(null)}
          style={{
            padding: '6px 14px', borderRadius: 20, border: `1px solid ${!activeCategory ? C.btnBg : C.cardBorder}`,
            background: !activeCategory ? C.btnBg : 'transparent',
            color: !activeCategory ? '#fff' : C.textSecond,
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}
        >All</button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
            style={{
              padding: '6px 14px', borderRadius: 20, border: `1px solid ${activeCategory === cat.id ? C.btnBg : C.cardBorder}`,
              background: activeCategory === cat.id ? C.btnBg : 'transparent',
              color: activeCategory === cat.id ? '#fff' : C.textSecond,
              fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >{cat.name}</button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.textDim }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.textDim }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
            <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" />
          </svg>
          <p style={{ fontWeight: 600, fontSize: 15, margin: '0 0 4px' }}>No products found</p>
          <p style={{ fontSize: 13 }}>Create your first product to get started</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(product => (
            <div
              key={product.id}
              onClick={() => openEdit(product)}
              style={{
                background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12,
                padding: 16, cursor: 'pointer', transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = C.btnBg)}
              onMouseLeave={e => (e.currentTarget.style.borderColor = C.cardBorder)}
            >
              {/* Product image placeholder */}
              <div style={{
                width: '100%', height: 140, borderRadius: 8, marginBottom: 12,
                background: isLight ? '#f5f5f5' : '#1e1e1e',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: 15, color: C.textPrimary, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</p>
                  <p style={{ fontSize: 12, color: C.textDim, margin: 0 }}>{product.sku} · {getCategoryName(product.categoryId)}</p>
                </div>
                <span style={{
                  padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: product.isAvailable ? '#22c55e1a' : '#ef44441a',
                  color: product.isAvailable ? '#22c55e' : '#ef4444',
                }}>
                  {product.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p style={{ fontWeight: 700, fontSize: 18, color: C.textPrimary, margin: '8px 0 0' }}>
                ${product.price.toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', padding: 20,
        }} onClick={() => setShowModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: C.card, borderRadius: 16, padding: 28, width: '100%', maxWidth: 520,
            maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${C.cardBorder}`,
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: '0 0 20px' }}>
              {editingProduct ? 'Edit Product' : 'New Product'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 4 }}>Name *</label>
                <input value={formName} onChange={e => setFormName(e.target.value)} style={inputStyle} placeholder="Product name" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 4 }}>SKU</label>
                <input value={formSku} onChange={e => setFormSku(e.target.value)} style={inputStyle} placeholder="SKU code" />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 4 }}>Price *</label>
                  <input value={formPrice} onChange={e => setFormPrice(e.target.value)} style={inputStyle} placeholder="0.00" type="number" step="0.01" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 4 }}>Cost</label>
                  <input value={formCost} onChange={e => setFormCost(e.target.value)} style={inputStyle} placeholder="0.00" type="number" step="0.01" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 4 }}>Category</label>
                <select value={formCategory} onChange={e => setFormCategory(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">No category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 4 }}>Description</label>
                <textarea value={formDescription} onChange={e => setFormDescription(e.target.value)} style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} placeholder="Optional description" />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={formAvailable} onChange={e => setFormAvailable(e.target.checked)} />
                <span style={{ fontSize: 14, color: C.textPrimary }}>Available for sale</span>
              </label>
            </div>

            {error && <div style={{ padding: '8px 12px', background: '#ef44441a', color: '#ef4444', borderRadius: 8, marginTop: 14, fontSize: 13 }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowModal(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={btnPrimary}>{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCatModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', padding: 20,
        }} onClick={() => setShowCatModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: C.card, borderRadius: 16, padding: 28, width: '100%', maxWidth: 420,
            border: `1px solid ${C.cardBorder}`,
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: '0 0 20px' }}>New Category</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 4 }}>Name *</label>
                <input value={catName} onChange={e => setCatName(e.target.value)} style={inputStyle} placeholder="Category name" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 4 }}>Description</label>
                <input value={catDesc} onChange={e => setCatDesc(e.target.value)} style={inputStyle} placeholder="Optional" />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowCatModal(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleCreateCategory} disabled={saving} style={btnPrimary}>{saving ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
