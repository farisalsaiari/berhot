import { useState } from 'react';

/* ──────────────────────────────────────────────────────────────────
   Dashboard v2 — Dark theme, Lunor-style layout
   Self-contained page with its own sidebar (doesn't use Layout.tsx)
   ────────────────────────────────────────────────────────────────── */

// ── Color tokens ────────────────────────────────────────────────
const C = {
  bg:         '#0f0f0f',       // page background
  sidebar:    '#0f0f0f',       // sidebar background (same)
  card:       '#16161f',       // card / elevated surface
  cardBorder: '#3f3f3f',       // subtle card border
  hover:      '#222222',       // hover state
  active:     '#222222',       // active nav item bg
  divider:    '#7a7a7a',       // separator lines
  textPrimary:'#e7e7e7',       // primary text (near-white)
  textSecond: '#949494',       // secondary / muted text
  textDim:    '#949494',       // very dim text
  accent:     '#3b82f6',       // blue accent (company contracts)
  btnBg:      '#3ec515',       // button background
  btnBorder:  '#e95151',       // button border
};

// ── Icon components ─────────────────────────────────────────────
function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  );
}

function ChevronUpDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textSecond} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 15l5 5 5-5" /><path d="M7 9l5-5 5 5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function ReportIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
    </svg>
  );
}

function ContractIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function TemplateIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function ClientsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IntegrationsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  );
}

function FolderPlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" /><line x1="12" y1="11" x2="12" y2="17" /><line x1="9" y1="14" x2="15" y2="14" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textSecond} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function SignatureIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect width="32" height="32" rx="8" fill={C.card} stroke={C.cardBorder} strokeWidth="1" />
      <path d="M8 22c2-4 4-12 6-12s2 8 4 8 2-6 4-6 1 4 2 4" stroke={C.textSecond} strokeWidth="1.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// ── Nav items config ────────────────────────────────────────────
interface NavItemDef {
  label: string;
  icon: React.ReactNode;
  active?: boolean;
  shortcut?: string;
}

interface FolderDef {
  label: string;
  color: string; // bg color for the square
}

const navTop: NavItemDef[] = [
  { label: 'Search', icon: <SearchIcon />, shortcut: '/' },
  { label: 'Reports', icon: <ReportIcon /> },
  { label: 'Contracts', icon: <ContractIcon /> },
];

const navMain: NavItemDef[] = [
  { label: 'Dashboard', icon: <GridIcon />, active: true },
  { label: 'Analytics', icon: <AnalyticsIcon /> },
  { label: 'Templates', icon: <TemplateIcon /> },
  { label: 'Clients', icon: <ClientsIcon /> },
  { label: 'Integrations', icon: <IntegrationsIcon /> },
  { label: 'Settings', icon: <SettingsIcon /> },
];

const folders: FolderDef[] = [
  { label: 'Company contracts', color: '#3b82f6' },
  { label: 'Onboarding templates', color: '#6b7280' },
  { label: 'Extra fees/legal stuff', color: '#eab308' },
];

// ── Main component ──────────────────────────────────────────────
export default function DashboardPage2() {
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  return (
    <div style={{ background: C.bg, color: C.textPrimary, minHeight: '100vh', display: 'flex', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside style={{
        width: 280,
        minWidth: 260,
        background: C.sidebar,
        display: 'flex',
        flexDirection: 'column',
        borderRight: `1px solid ${C.divider}70`,
        height: '100vh',
        position: 'sticky',
        top: 0,
      }}>

        {/* Workspace selector — 1px gray border rounded */}
        <div style={{ padding: '16px 16px 10px 16px' }}>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 10px',
            width: '100%',
            background: C.active,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 8,
            cursor: 'pointer',
            color: C.textPrimary,
          }}>
            <MoonIcon />
            <span style={{ fontWeight: 600, fontSize: 14, flex: 1, textAlign: 'left' }}>Lunor</span>
            <ChevronUpDown />
          </button>
        </div>

        {/* Top nav items (Search, Reports, Contracts) */}
        <nav style={{ padding: '0 16px' }}>
          {navTop.map((item) => (
            <button
              key={item.label}
              onMouseEnter={() => setHoveredNav(item.label)}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: 'none',
                background: hoveredNav === item.label ? C.hover : 'transparent',
                color: C.textSecond,
                cursor: 'pointer',
                fontSize: 13,
                transition: 'background 0.15s',
                marginBottom: 1,
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', width: 18, justifyContent: 'center' }}>{item.icon}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.shortcut && (
                <span style={{
                  fontSize: 11,
                  color: C.textDim,
                  background: C.card,
                  borderRadius: 4,
                  padding: '1px 6px',
                  border: `1px solid ${C.active}`,
                  fontFamily: 'monospace',
                }}>{item.shortcut}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Divider */}
        {/* <div style={{ height: 1, background: C.divider,  }} /> */}


        {/* Main nav items (Dashboard, Analytics...) */}
        <nav style={{  display: 'flex',
    flexDirection: 'column', gap: 5, padding: '0 16px'}}>
          {navMain.map((item) => (
            <button
              key={item.label}
              onMouseEnter={() => setHoveredNav(item.label)}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: item.active ? `1px solid ${C.cardBorder}` : '1px solid transparent',
                background: item.active ? C.active : hoveredNav === item.label ? C.hover : 'transparent',
                color: item.active ? C.textPrimary : C.textSecond,
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: item.active ? 400 : 400,
                transition: 'background 0.15s',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', width: 18, justifyContent: 'center' }}>{item.icon}</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
            </button>
          ))}

          {/* Divider */}
          <div style={{ height: '0.5px', background: C.divider, margin: '10px 8px' }} />

          {/* Folder items */}
          {folders.map((folder) => (
            <button
              key={folder.label}
              onMouseEnter={() => setHoveredNav(folder.label)}
              onMouseLeave={() => setHoveredNav(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: 'none',
                background: hoveredNav === folder.label ? C.hover : 'transparent',
                color: C.textSecond,
                cursor: 'pointer',
                fontSize: 13,
                transition: 'background 0.15s',
                marginBottom: 1,
              }}
            >
              <span style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                background: folder.color,
                flexShrink: 0,
              }} />
              <span style={{ flex: 1, textAlign: 'left' }}>{folder.label}</span>
              <ChevronDown />
            </button>
          ))}

          {/* Create folder */}
          <button
            onMouseEnter={() => setHoveredNav('create-folder')}
            onMouseLeave={() => setHoveredNav(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '8px 10px',
              borderRadius: 8,
              border: 'none',
              background: hoveredNav === 'create-folder' ? C.hover : 'transparent',
              color: C.textSecond,
              cursor: 'pointer',
              fontSize: 13,
              transition: 'background 0.15s',
              marginBottom: 1,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', width: 18, justifyContent: 'center' }}><FolderPlusIcon /></span>
            <span style={{ flex: 1, textAlign: 'left' }}>Create folder</span>
          </button>
        </nav>

        {/* ── Upgrade card at bottom ── */}
        <div style={{
          margin: '0 12px 16px 12px',
          padding: 16,
          borderRadius: 12,
          border: `1px solid ${C.cardBorder}`,
          background: C.card,
        }}>
          {/* Close button top-right */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <SignatureIcon />
            <button style={{
              background: 'none',
              border: 'none',
              color: C.textDim,
              cursor: 'pointer',
              fontSize: 16,
              padding: 0,
              lineHeight: 1,
            }}>&times;</button>
          </div>
          <div style={{ fontWeight: 600, fontSize: 14, color: C.textPrimary, marginBottom: 4 }}>
            Upgrade to Premium!
          </div>
          <div style={{ fontSize: 12, color: C.textSecond, lineHeight: 1.5, marginBottom: 14 }}>
            Send unlimited contracts<br />Customize for your brand
          </div>
          <button style={{
            width: '100%',
            padding: '9px 0',
            borderRadius: 8,
            border: `1px solid ${C.btnBorder}`,
            background: C.btnBg,
            color: C.textPrimary,
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}>
            Upgrade Now
          </button>
        </div>
      </aside>

      {/* ═══ MAIN CONTENT ═══ */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Top header bar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '16px 28px 0 28px',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', color: C.textSecond }}><GridIcon /></span>
          <span style={{ fontSize: 13, color: C.textSecond, fontWeight: 500 }}>Dashboard</span>
        </header>

        {/* Welcome text */}
        <div style={{ padding: '24px 28px 20px 28px' }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, color: C.textPrimary, margin: 0, letterSpacing: '-0.01em' }}>
            Welcome back John Doe!
          </h1>
        </div>

        {/* Dashboard cards grid */}
        <div style={{ padding: '0 28px 28px 28px', flex: 1 }}>

          {/* Row 1: 2 cards side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div style={{
              background: C.card,
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 12,
              height: 160,
            }} />
            <div style={{
              background: C.card,
              border: `1px solid ${C.cardBorder}`,
              borderRadius: 12,
              height: 160,
            }} />
          </div>

          {/* Row 2: 1 full-width card */}
          <div style={{
            background: C.card,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 12,
            height: 200,
            marginBottom: 16,
          }} />

          {/* Row 3: 1 full-width card */}
          <div style={{
            background: C.card,
            border: `1px solid ${C.cardBorder}`,
            borderRadius: 12,
            height: 160,
          }} />
        </div>
      </main>
    </div>
  );
}
