import { useState, useEffect, useCallback } from 'react';
import { fetchCustomers, createCustomer, Customer } from '../lib/posApi';

interface Props {
  C: Record<string, string>;
  isLight: boolean;
  isMobile: boolean;
}

export default function CustomersContent({ C, isLight, isMobile }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form
  const [fFirst, setFFirst] = useState('');
  const [fLast, setFLast] = useState('');
  const [fEmail, setFEmail] = useState('');
  const [fPhone, setFPhone] = useState('');
  const [fNotes, setFNotes] = useState('');

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchCustomers(search || undefined);
      setCustomers(data);
    } catch (e: unknown) {
      if (!silent) setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      if (!silent) setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => load(), search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [load, search]);

  // Auto-refresh every 5s to pick up new signups from iOS app
  useEffect(() => {
    const interval = setInterval(() => {
      load(true);
    }, 5000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleCreate() {
    if (!fFirst.trim()) return;
    setSaving(true);
    setError('');
    try {
      await createCustomer({
        firstName: fFirst.trim(),
        lastName: fLast.trim(),
        email: fEmail.trim() || undefined,
        phone: fPhone.trim() || undefined,
        notes: fNotes.trim() || undefined,
      });
      setFFirst(''); setFLast(''); setFEmail(''); setFPhone(''); setFNotes('');
      setShowCreateModal(false);
      await load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create');
    } finally {
      setSaving(false);
    }
  }

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

  function getInitials(c: Customer) {
    return ((c.firstName?.[0] || '') + (c.lastName?.[0] || '')).toUpperCase() || '?';
  }

  return (
    <div style={{ padding: isMobile ? '20px 16px 60px 16px' : '30px 30px 60px 30px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Customers</h2>
          <span style={{ fontSize: 13, color: C.textSecond }}>{customers.length} customers</span>
        </div>
        <button onClick={() => setShowCreateModal(true)} style={btnPrimary}>+ Customer</button>
      </div>

      {error && <div style={{ padding: '10px 14px', background: '#ef44441a', color: '#ef4444', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
        <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        <input
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...inputStyle, paddingLeft: 36 }}
        />
      </div>

      {/* Customers Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.textDim }}>Loading...</div>
      ) : customers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.textDim }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
          </svg>
          <p style={{ fontWeight: 600, fontSize: 15, margin: '0 0 4px' }}>No customers yet</p>
          <p style={{ fontSize: 13 }}>Customers will appear as they sign up or are added</p>
        </div>
      ) : (
        <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
                  {['Customer', 'Email', 'Phone', 'Loyalty Pts', 'Total Spent', 'Visits', 'Joined'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600,
                      color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.5,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr
                    key={c.id}
                    onClick={() => setSelectedCustomer(c)}
                    style={{ borderBottom: `1px solid ${C.cardBorder}`, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.hover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: C.btnBg + '22', color: C.btnBg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 13, fontWeight: 700, flexShrink: 0,
                        }}>{getInitials(c)}</div>
                        <span style={{ fontWeight: 600, color: C.textPrimary }}>{c.firstName} {c.lastName}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: C.textSecond }}>{c.email || '—'}</td>
                    <td style={{ padding: '14px 16px', color: C.textSecond }}>{c.phone || '—'}</td>
                    <td style={{ padding: '14px 16px', color: C.textPrimary, fontWeight: 600 }}>{c.loyaltyPoints ?? 0}</td>
                    <td style={{ padding: '14px 16px', color: C.textPrimary, fontWeight: 600 }}>${(c.totalSpent ?? 0).toFixed(2)}</td>
                    <td style={{ padding: '14px 16px', color: C.textSecond }}>{c.visitCount ?? 0}</td>
                    <td style={{ padding: '14px 16px', color: C.textDim, fontSize: 13 }}>
                      {new Date(c.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Detail Slide Panel */}
      {selectedCustomer && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', justifyContent: 'flex-end',
          background: 'rgba(0,0,0,0.5)',
        }} onClick={() => setSelectedCustomer(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: isMobile ? '100%' : 420, height: '100%', background: C.card,
              borderLeft: `1px solid ${C.cardBorder}`, overflowY: 'auto', padding: 28,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Customer Details</h3>
              <button onClick={() => setSelectedCustomer(null)} style={{
                background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, fontSize: 22,
              }}>&times;</button>
            </div>

            {/* Avatar + Name */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
              <div style={{
                width: 56, height: 56, borderRadius: '50%',
                background: C.btnBg + '22', color: C.btnBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700,
              }}>{getInitials(selectedCustomer)}</div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
                  {selectedCustomer.firstName} {selectedCustomer.lastName}
                </p>
                <p style={{ fontSize: 13, color: C.textDim, margin: 0 }}>
                  Joined {new Date(selectedCustomer.createdAt).toLocaleDateString('en', { dateStyle: 'medium' })}
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div style={{ marginBottom: 20, padding: 14, background: isLight ? '#f9f9f9' : '#1a1a1a', borderRadius: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: C.textDim, margin: '0 0 8px', textTransform: 'uppercase' }}>Contact</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: C.textSecond }}>Email</span>
                  <span style={{ fontSize: 13, color: C.textPrimary }}>{selectedCustomer.email || '—'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: C.textSecond }}>Phone</span>
                  <span style={{ fontSize: 13, color: C.textPrimary }}>{selectedCustomer.phone || '—'}</span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Loyalty Points', value: String(selectedCustomer.loyaltyPoints ?? 0) },
                { label: 'Total Spent', value: `$${(selectedCustomer.totalSpent ?? 0).toFixed(2)}` },
                { label: 'Visits', value: String(selectedCustomer.visitCount ?? 0) },
              ].map(s => (
                <div key={s.label} style={{
                  padding: 14, background: isLight ? '#f9f9f9' : '#1a1a1a',
                  borderRadius: 10, textAlign: 'center',
                }}>
                  <p style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 2px' }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: C.textDim, margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {selectedCustomer.notes && (
              <div style={{ padding: 14, background: isLight ? '#f9f9f9' : '#1a1a1a', borderRadius: 10 }}>
                <p style={{ fontSize: 12, fontWeight: 600, color: C.textDim, margin: '0 0 4px', textTransform: 'uppercase' }}>Notes</p>
                <p style={{ fontSize: 14, color: C.textSecond, margin: 0 }}>{selectedCustomer.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Customer Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(0,0,0,0.5)', padding: 20,
        }} onClick={() => setShowCreateModal(false)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: C.card, borderRadius: 16, padding: 28, width: '100%', maxWidth: 480,
            border: `1px solid ${C.cardBorder}`,
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: '0 0 20px' }}>New Customer</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 4 }}>First Name *</label>
                  <input value={fFirst} onChange={e => setFFirst(e.target.value)} style={inputStyle} placeholder="First name" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 4 }}>Last Name</label>
                  <input value={fLast} onChange={e => setFLast(e.target.value)} style={inputStyle} placeholder="Last name" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 4 }}>Email</label>
                <input value={fEmail} onChange={e => setFEmail(e.target.value)} style={inputStyle} placeholder="email@example.com" type="email" />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 4 }}>Phone</label>
                <input value={fPhone} onChange={e => setFPhone(e.target.value)} style={inputStyle} placeholder="+966 ..." />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: C.textSecond, marginBottom: 4 }}>Notes</label>
                <textarea value={fNotes} onChange={e => setFNotes(e.target.value)} style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder="Optional notes" />
              </div>
            </div>

            {error && <div style={{ padding: '8px 12px', background: '#ef44441a', color: '#ef4444', borderRadius: 8, marginTop: 14, fontSize: 13 }}>{error}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
              <button onClick={() => setShowCreateModal(false)} style={btnSecondary}>Cancel</button>
              <button onClick={handleCreate} disabled={saving} style={btnPrimary}>{saving ? 'Creating...' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
