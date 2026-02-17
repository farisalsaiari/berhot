import { useState, useEffect, useCallback } from 'react';
import {
  fetchOrders, fetchOrder, updateOrderStatus, completeOrder, cancelOrder,
  Order,
} from '../lib/posApi';

interface Props {
  C: Record<string, string>;
  isLight: boolean;
  isMobile: boolean;
}

const STATUS_TABS = ['all', 'pending', 'preparing', 'ready', 'completed', 'cancelled'] as const;

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#f59e0b1a', text: '#f59e0b' },
  preparing: { bg: '#3b82f61a', text: '#3b82f6' },
  ready: { bg: '#8b5cf61a', text: '#8b5cf6' },
  completed: { bg: '#22c55e1a', text: '#22c55e' },
  cancelled: { bg: '#ef44441a', text: '#ef4444' },
};

export default function OrdersContent({ C, isLight, isMobile }: Props) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const status = activeTab === 'all' ? undefined : activeTab;
      const data = await fetchOrders(status);
      setOrders(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  async function openDetail(id: string) {
    setDetailLoading(true);
    try {
      const order = await fetchOrder(id);
      setSelectedOrder(order);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load order');
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleStatusUpdate(id: string, status: string) {
    setActionLoading(true);
    try {
      if (status === 'completed') await completeOrder(id);
      else if (status === 'cancelled') await cancelOrder(id);
      else await updateOrderStatus(id, status);
      if (selectedOrder?.id === id) {
        const updated = await fetchOrder(id);
        setSelectedOrder(updated);
      }
      await loadOrders();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Status update failed');
    } finally {
      setActionLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const c = STATUS_COLORS[status] || { bg: `${C.textDim}1a`, text: C.textDim };
    return (
      <span style={{
        padding: '3px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
        background: c.bg, color: c.text, textTransform: 'capitalize',
      }}>{status}</span>
    );
  }

  function getNextStatuses(current: string): string[] {
    switch (current) {
      case 'pending': return ['preparing', 'cancelled'];
      case 'preparing': return ['ready', 'cancelled'];
      case 'ready': return ['completed', 'cancelled'];
      default: return [];
    }
  }

  const btnPrimary: React.CSSProperties = {
    padding: '8px 16px', borderRadius: 8, border: 'none',
    background: C.btnBg, color: '#fff', fontWeight: 600, fontSize: 13,
    cursor: 'pointer', opacity: actionLoading ? 0.6 : 1,
  };

  const btnDanger: React.CSSProperties = {
    ...btnPrimary, background: '#ef4444',
  };

  return (
    <div style={{ padding: isMobile ? '20px 16px 60px 16px' : '30px 30px 60px 30px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>Orders</h2>
        <span style={{ fontSize: 13, color: C.textSecond }}>{orders.length} orders</span>
      </div>

      {error && <div style={{ padding: '10px 14px', background: '#ef44441a', color: '#ef4444', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      {/* Status Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '6px 14px', borderRadius: 20,
              border: `1px solid ${activeTab === tab ? C.btnBg : C.cardBorder}`,
              background: activeTab === tab ? C.btnBg : 'transparent',
              color: activeTab === tab ? '#fff' : C.textSecond,
              fontSize: 13, fontWeight: 500, cursor: 'pointer', textTransform: 'capitalize',
            }}
          >{tab}</button>
        ))}
      </div>

      {/* Orders Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.textDim }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: C.textDim }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
            <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /><polyline points="12 7 12 12 16 14" />
          </svg>
          <p style={{ fontWeight: 600, fontSize: 15, margin: '0 0 4px' }}>No orders found</p>
          <p style={{ fontSize: 13 }}>Orders will appear here when customers place them</p>
        </div>
      ) : (
        <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 12, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.cardBorder}` }}>
                  {['Order #', 'Customer', 'Type', 'Items', 'Total', 'Status', 'Date'].map(h => (
                    <th key={h} style={{
                      padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600,
                      color: C.textDim, textTransform: 'uppercase', letterSpacing: 0.5,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr
                    key={order.id}
                    onClick={() => openDetail(order.id)}
                    style={{ borderBottom: `1px solid ${C.cardBorder}`, cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.hover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: C.textPrimary }}>#{order.orderNumber}</td>
                    <td style={{ padding: '14px 16px', color: C.textSecond }}>{order.customerName || '—'}</td>
                    <td style={{ padding: '14px 16px', color: C.textSecond, textTransform: 'capitalize' }}>{order.orderType}</td>
                    <td style={{ padding: '14px 16px', color: C.textSecond }}>{order.items?.length || 0}</td>
                    <td style={{ padding: '14px 16px', fontWeight: 600, color: C.textPrimary }}>${order.totalAmount.toFixed(2)}</td>
                    <td style={{ padding: '14px 16px' }}>{getStatusBadge(order.status)}</td>
                    <td style={{ padding: '14px 16px', color: C.textDim, fontSize: 13 }}>
                      {new Date(order.createdAt).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Detail Slide Panel */}
      {(selectedOrder || detailLoading) && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', justifyContent: 'flex-end',
          background: 'rgba(0,0,0,0.5)',
        }} onClick={() => setSelectedOrder(null)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: isMobile ? '100%' : 480, height: '100%', background: C.card,
              borderLeft: `1px solid ${C.cardBorder}`, overflowY: 'auto', padding: 28,
            }}
          >
            {detailLoading ? (
              <div style={{ textAlign: 'center', padding: 40, color: C.textDim }}>Loading...</div>
            ) : selectedOrder && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
                      Order #{selectedOrder.orderNumber}
                    </h3>
                    <span style={{ fontSize: 13, color: C.textDim }}>
                      {new Date(selectedOrder.createdAt).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} style={{
                    background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, fontSize: 22,
                  }}>&times;</button>
                </div>

                {/* Status + Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                  {getStatusBadge(selectedOrder.status)}
                  <span style={{ fontSize: 13, color: C.textDim, textTransform: 'capitalize' }}>{selectedOrder.orderType}</span>
                </div>

                {getNextStatuses(selectedOrder.status).length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    {getNextStatuses(selectedOrder.status).map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusUpdate(selectedOrder.id, status)}
                        disabled={actionLoading}
                        style={status === 'cancelled' ? btnDanger : btnPrimary}
                      >
                        {status === 'cancelled' ? 'Cancel' : `Mark ${status}`}
                      </button>
                    ))}
                  </div>
                )}

                {/* Customer Info */}
                {selectedOrder.customerName && (
                  <div style={{ marginBottom: 20, padding: 14, background: isLight ? '#f9f9f9' : '#1a1a1a', borderRadius: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: C.textDim, margin: '0 0 6px', textTransform: 'uppercase' }}>Customer</p>
                    <p style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: 0 }}>{selectedOrder.customerName}</p>
                    {selectedOrder.customerEmail && <p style={{ fontSize: 13, color: C.textSecond, margin: '2px 0 0' }}>{selectedOrder.customerEmail}</p>}
                    {selectedOrder.customerPhone && <p style={{ fontSize: 13, color: C.textSecond, margin: '2px 0 0' }}>{selectedOrder.customerPhone}</p>}
                  </div>
                )}

                {/* Items */}
                <div style={{ marginBottom: 20 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: C.textDim, margin: '0 0 10px', textTransform: 'uppercase' }}>Items</p>
                  {selectedOrder.items?.map((item, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 0', borderBottom: i < selectedOrder.items.length - 1 ? `1px solid ${C.cardBorder}` : 'none',
                    }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: C.textPrimary, margin: 0 }}>{item.productName}</p>
                        <span style={{ fontSize: 12, color: C.textDim }}>x{item.quantity} · ${item.unitPrice.toFixed(2)} ea</span>
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>${item.totalPrice.toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div style={{ padding: 14, background: isLight ? '#f9f9f9' : '#1a1a1a', borderRadius: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, color: C.textSecond }}>Subtotal</span>
                    <span style={{ fontSize: 13, color: C.textPrimary }}>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  {selectedOrder.taxAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: C.textSecond }}>Tax</span>
                      <span style={{ fontSize: 13, color: C.textPrimary }}>${selectedOrder.taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {selectedOrder.discountAmount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: C.textSecond }}>Discount</span>
                      <span style={{ fontSize: 13, color: '#22c55e' }}>-${selectedOrder.discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: `1px solid ${C.cardBorder}` }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>Total</span>
                    <span style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary }}>${selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div style={{ marginTop: 16, padding: 14, background: isLight ? '#f9f9f9' : '#1a1a1a', borderRadius: 10 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: C.textDim, margin: '0 0 4px', textTransform: 'uppercase' }}>Notes</p>
                    <p style={{ fontSize: 14, color: C.textSecond, margin: 0 }}>{selectedOrder.notes}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
