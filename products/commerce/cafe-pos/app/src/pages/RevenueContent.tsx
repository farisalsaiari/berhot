/* ──────────────────────────────────────────────────────────────────
   Revenue Settings Page — Financial overview matching reference design
   Renders inside DashboardPage <main> area
   ────────────────────────────────────────────────────────────────── */

import { useState } from 'react';
import { useTranslation } from '@berhot/i18n';

interface Theme {
  bg: string;
  sidebar: string;
  card: string;
  cardBorder: string;
  hover: string;
  active: string;
  divider: string;
  textPrimary: string;
  textSecond: string;
  textLight: string;
  textDim: string;
  accent: string;
  btnBg: string;
  btnBorder: string;
}

interface RevenueContentProps {
  C: Theme;
  isLight: boolean;
}

// ── Dummy data ──────────────────────────────────────────────────

const ASSETS_BREAKDOWN = [
  { label: 'Cash', value: 7213.87, change: '+0.90%', pct: 24, color: '#3b82f6', icon: '💵' },
  { label: 'Visa', value: 6457.99, change: '+0.72%', pct: 33, color: '#8b5cf6', icon: '💳' },
  { label: 'Apple Pay', value: 4895.42, change: '+2.10', pct: 17, color: '#f97316', icon: '📱' },
  { label: 'Mada', value: 5455.00, change: '+0.05', pct: 40, color: '#f59e0b', icon: '🏧' },
];

const RECENT_TRANSACTIONS = [
  { type: 'Cash', subtitle: 'to POS register', amount: 613297, date: 'Nov 15, 2024', time: '02:30 PM', activity: 'Daily Sales', status: 'on_progress', icon: '↑' },
  { type: 'Cash', subtitle: 'to POS register', amount: 75318, date: 'Nov 15, 2024', time: '02:30 PM', activity: 'Daily Sales', status: 'completed', icon: '↑' },
  { type: 'Visa', subtitle: 'card payment', amount: 417506, date: 'May 20, 2024', time: '02:30 PM', activity: 'Card Terminal', status: 'completed', icon: '↔' },
  { type: 'Cash', subtitle: 'to POS register', amount: 934218, date: 'May 29, 2024', time: '02:30 PM', activity: 'Daily Sales', status: 'completed', icon: '↑' },
  { type: 'Visa', subtitle: 'card payment', amount: 301645, date: 'May 12, 2024', time: '02:30 PM', activity: 'Card Terminal', status: 'failed', icon: '↔' },
  { type: 'Apple Pay', subtitle: 'mobile payment', amount: 44790, date: 'Apr 28, 2024', time: '02:30 PM', activity: 'Mobile Pay', status: 'failed', icon: '↔' },
];

// ── Action button ───────────────────────────────────────────────

function ActionBtn({ C, label, icon }: { C: Theme; label: string; icon: string }) {
  return (
    <button style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '8px 16px', borderRadius: 10,
      border: `1px solid ${C.cardBorder}`,
      background: C.card, color: C.textPrimary,
      fontSize: 13, fontWeight: 500, cursor: 'pointer',
      transition: 'background 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = C.hover)}
      onMouseLeave={e => (e.currentTarget.style.background = C.card)}
    >
      <span style={{ fontSize: 14, opacity: 0.7 }}>{icon}</span>
      {label}
    </button>
  );
}

// ── Status Badge ────────────────────────────────────────────────

function StatusBadge({ status, isLight }: { status: string; isLight: boolean }) {
  const config: Record<string, { bg: string; text: string; label: string; dot: string }> = {
    on_progress: {
      bg: isLight ? '#eff6ff' : '#1e3a5f', text: isLight ? '#2563eb' : '#93c5fd',
      label: 'On Progress', dot: isLight ? '#3b82f6' : '#60a5fa',
    },
    completed: {
      bg: isLight ? '#ecfdf5' : '#16532e', text: isLight ? '#059669' : '#6ee7b7',
      label: 'Completed', dot: isLight ? '#10b981' : '#6ee7b7',
    },
    failed: {
      bg: isLight ? '#fef2f2' : '#5c1d1d', text: isLight ? '#dc2626' : '#fca5a5',
      label: 'Failed', dot: isLight ? '#ef4444' : '#fca5a5',
    },
  };
  const c = config[status] || config.completed;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 12, fontWeight: 500,
      padding: '4px 12px', borderRadius: 20,
      background: c.bg, color: c.text,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
      {c.label}
    </span>
  );
}

// ── Stacked horizontal bar ──────────────────────────────────────

function StackedBar({ C, isLight }: { C: Theme; isLight: boolean }) {
  const segments = [
    { pct: 28.79, color: '#3b82f6', label: '+28.79%' },
    { pct: 4.01, color: '#8b5cf6', label: '4.01%' },
    { pct: 2.12, color: '#c084fc', label: '2.12%' },
  ];
  // Normalize so segments fill bar proportionally
  const total = segments.reduce((s, seg) => s + seg.pct, 0);
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        {segments.map((s, i) => (
          <span key={i} style={{ fontSize: 11, color: C.textSecond, fontWeight: 500 }}>{s.label}</span>
        ))}
      </div>
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', gap: 2 }}>
        {segments.map((s, i) => (
          <div key={i} style={{
            flex: s.pct / total,
            background: s.color,
            borderRadius: i === 0 ? '4px 0 0 4px' : i === segments.length - 1 ? '0 4px 4px 0' : 0,
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        <LegendDot color="#3b82f6" label="Most profitable" C={C} />
        <LegendDot color="#8b5cf6" label="To hold" C={C} />
        <LegendDot color="#c084fc" label="To sell" C={C} />
      </div>
    </div>
  );
}

function LegendDot({ color, label, C }: { color: string; label: string; C: Theme }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <div style={{ width: 8, height: 3, borderRadius: 2, background: color }} />
      <span style={{ fontSize: 11, color: C.textSecond }}>{label}</span>
    </div>
  );
}

// ── Tab filter (All / Cash / Card / etc.) ───────────────────────

function FilterTabs({ tabs, active, onChange, C }: {
  tabs: { key: string; label: string; count: number }[];
  active: string;
  onChange: (key: string) => void;
  C: Theme;
}) {
  return (
    <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: `1px solid ${C.cardBorder}` }}>
      {tabs.map((tab, i) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          style={{
            fontSize: 13, fontWeight: 500,
            color: active === tab.key ? C.textPrimary : C.textSecond,
            background: active === tab.key ? C.hover : 'transparent',
            border: 'none',
            borderInlineEnd: i < tabs.length - 1 ? `1px solid ${C.cardBorder}` : 'none',
            padding: '8px 16px',
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
        >
          {tab.label} <span style={{ fontSize: 12, color: C.textDim, marginInlineStart: 3 }}>{tab.count}</span>
        </button>
      ))}
    </div>
  );
}

// ── Main Revenue Page ───────────────────────────────────────────

export default function RevenueContent({ C, isLight }: RevenueContentProps) {
  const { t } = useTranslation();
  const [txFilter, setTxFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const totalBalance = 24022.28;
  const assetsValue = 2904.29;

  return (
    <div>
      {/* Header */}
      <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 4px 0' }}>
        {t('settingsNav.revenue')}
      </h2>
      <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 18px 0', lineHeight: 1.5 }}>
        {t('settingsPages.revenueDesc')}
      </p>
      <div style={{ height: 1, background: C.divider, opacity: 0.4 }} />

      {/* ── Top row: Current balance + Sales analyzer ── */}
      <div style={{ display: 'flex', gap: 20, marginTop: 24, marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Current balance card */}
        <div style={{
          flex: 2, minWidth: 380,
          background: C.card, border: `1px solid ${C.cardBorder}`,
          borderRadius: 14, padding: '24px 28px',
        }}>
          <div style={{ fontSize: 13, color: C.textSecond, marginBottom: 8 }}>Current balance</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontSize: 32, fontWeight: 700, color: C.textPrimary, letterSpacing: -0.5 }}>
                SAR {totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: 13, color: '#10b981', fontWeight: 500, marginTop: 4 }}>
                +12.09% Last 24 hours
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <ActionBtn C={C} label="Payout" icon="↑" />
              <ActionBtn C={C} label="Refund" icon="↔" />
              <ActionBtn C={C} label="Invoice" icon="📄" />
              <button style={{
                width: 36, height: 36, borderRadius: 10,
                border: `1px solid ${C.cardBorder}`, background: C.card,
                color: C.textSecond, fontSize: 16, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                ···
              </button>
            </div>
          </div>
        </div>

        {/* Assets analyzer card */}
        <div style={{
          flex: 1, minWidth: 280,
          background: C.card, border: `1px solid ${C.cardBorder}`,
          borderRadius: 14, padding: '24px 28px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: C.textSecond }}>Sales analyzer</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.textDim, fontSize: 16 }}>↻</button>
          </div>
          <div style={{ marginBottom: 14 }}>
            <span style={{ fontSize: 26, fontWeight: 700, color: C.textPrimary }}>
              SAR {assetsValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span style={{ fontSize: 13, color: C.textDim, marginInlineStart: 6 }}>(12.09%)</span>
          </div>

          <StackedBar C={C} isLight={isLight} />

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: C.textPrimary, marginBottom: 8 }}>12.1%</div>
            <div style={{ fontSize: 12, color: C.textSecond, lineHeight: 1.6, marginBottom: 12 }}>
              Your sales performance is good! This area will describe store&apos;s overall revenue performance, generated by analytics.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <span style={{ fontSize: 14 }}>📊</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>See Reports & Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Assets breakdown row ── */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 14 }}>Payment breakdown</div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        {ASSETS_BREAKDOWN.map((asset, idx) => (
          <div key={idx} style={{
            flex: 1, minWidth: 170,
            background: C.card, border: `1px solid ${C.cardBorder}`,
            borderRadius: 14, padding: '20px 20px 14px 20px',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* Value + change */}
            <div style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, marginBottom: 3 }}>
              SAR {asset.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: 12, color: '#10b981', fontWeight: 500, marginBottom: 16 }}>
              {asset.change} <span style={{ color: C.textDim, fontWeight: 400 }}>vs last week</span>
            </div>

            {/* Vertical color bar (visual representation) */}
            <div style={{
              flex: 1, minHeight: 60, display: 'flex', alignItems: 'flex-end',
              marginBottom: 14,
            }}>
              <div style={{
                width: '100%', height: `${20 + asset.pct * 1.5}%`,
                background: `linear-gradient(to top, ${asset.color}, ${asset.color}90)`,
                borderRadius: '4px 4px 0 0',
                minHeight: 20,
              }} />
            </div>

            {/* Footer: icon + label + pct */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: `1px solid ${C.divider}30`,
              paddingTop: 12,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>{asset.icon}</span>
                <span style={{ fontSize: 13, color: C.textSecond, fontWeight: 500 }}>{asset.label}</span>
              </div>
              <span style={{ fontSize: 13, color: C.textDim, fontWeight: 500 }}>{asset.pct}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent transactions section ── */}
      <div style={{
        background: C.card, border: `1px solid ${C.cardBorder}`,
        borderRadius: 14, padding: '24px 0',
      }}>
        {/* Title row */}
        <div style={{ padding: '0 24px', marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>Recent transaction</div>
            <div style={{ fontSize: 13, color: C.textDim }}>Short description about the title will be placed here</div>
          </div>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 18px', borderRadius: 10,
            border: `1px solid ${C.cardBorder}`,
            background: C.card, color: C.textPrimary,
            fontSize: 13, fontWeight: 500, cursor: 'pointer',
          }}>
            Download CSV
            <span style={{ fontSize: 14 }}>⬇</span>
          </button>
        </div>

        {/* Filter + search row */}
        <div style={{ padding: '0 24px', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <FilterTabs
            tabs={[
              { key: 'all', label: 'All', count: 26 },
              { key: 'cash', label: 'Cash', count: 14 },
              { key: 'card', label: 'Card', count: 8 },
              { key: 'mobile', label: 'Mobile', count: 4 },
            ]}
            active={txFilter}
            onChange={setTxFilter}
            C={C}
          />
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              border: `1px solid ${C.cardBorder}`, borderRadius: 8,
              padding: '7px 14px', minWidth: 180,
            }}>
              <span style={{ fontSize: 14, color: C.textDim }}>🔍</span>
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  border: 'none', outline: 'none', background: 'transparent',
                  fontSize: 13, color: C.textPrimary, width: '100%',
                }}
              />
            </div>
            {/* Show dropdown */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              border: `1px solid ${C.cardBorder}`, borderRadius: 8,
              padding: '7px 14px', cursor: 'pointer',
            }}>
              <span style={{ fontSize: 13, color: C.textSecond }}>Show:</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>All</span>
              <span style={{ fontSize: 10, color: C.textDim, marginInlineStart: 4 }}>▼</span>
            </div>
          </div>
        </div>

        {/* Transaction table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 750 }}>
            <thead>
              <tr style={{ borderTop: `1px solid ${C.divider}30`, borderBottom: `1px solid ${C.divider}30` }}>
                {[
                  { label: 'Transaction type', align: 'left' as const },
                  { label: 'Amount', align: 'left' as const },
                  { label: 'Date issued', align: 'left' as const },
                  { label: 'Activity', align: 'left' as const },
                  { label: 'Status', align: 'left' as const },
                  { label: '', align: 'center' as const },
                ].map((h, i) => (
                  <th key={i} style={{
                    fontSize: 12, fontWeight: 500, color: C.textDim,
                    textAlign: h.align,
                    padding: '12px 20px',
                  }}>
                    {h.label}
                    {(h.label === 'Amount' || h.label === 'Date issued') && (
                      <span style={{ marginInlineStart: 4, fontSize: 10, opacity: 0.5 }}>⇅</span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RECENT_TRANSACTIONS.map((tx, i) => {
                const typeColors: Record<string, string> = {
                  'Cash': '#10b981',
                  'Visa': '#8b5cf6',
                  'Apple Pay': '#3b82f6',
                  'Mada': '#f59e0b',
                  'STC Pay': '#ef4444',
                };
                const iconBg = `${typeColors[tx.type] || '#6b7280'}15`;
                const iconColor = typeColors[tx.type] || '#6b7280';

                return (
                  <tr
                    key={i}
                    style={{
                      borderBottom: i < RECENT_TRANSACTIONS.length - 1 ? `1px solid ${C.divider}18` : 'none',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.hover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {/* Transaction type */}
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 10,
                          background: iconBg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 16, color: iconColor, fontWeight: 700, flexShrink: 0,
                        }}>
                          {tx.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{tx.type}</div>
                          <div style={{ fontSize: 12, color: C.textDim }}>{tx.subtitle}</div>
                        </div>
                      </div>
                    </td>
                    {/* Amount */}
                    <td style={{ padding: '14px 20px', fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
                      SAR {tx.amount.toLocaleString()}
                    </td>
                    {/* Date issued */}
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{ fontSize: 13, color: C.textSecond }}>{tx.date}</span>
                      <span style={{ fontSize: 12, color: C.textDim, marginInlineStart: 6 }}>{tx.time}</span>
                    </td>
                    {/* Activity */}
                    <td style={{ padding: '14px 20px', fontSize: 13, color: C.textSecond }}>
                      {tx.activity}
                    </td>
                    {/* Status */}
                    <td style={{ padding: '14px 20px' }}>
                      <StatusBadge status={tx.status} isLight={isLight} />
                    </td>
                    {/* More */}
                    <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                      <button style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 16, color: C.textDim, padding: '4px 8px',
                      }}>
                        ···
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
