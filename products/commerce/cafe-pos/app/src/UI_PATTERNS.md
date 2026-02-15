# Berhot Cafe-POS Dashboard — UI Patterns & Style Guide

> Reference file for consistent UI across all dashboard pages.
> Use this when building new pages or components.

---

## Theme Colors

### Dark Theme
| Token | Value |
|-------|-------|
| `bg` | `#0f0f0f` |
| `sidebar` | `#0f0f0f` |
| `card` | `#1a1a1a` |
| `cardBorder` | `#3f3f3f` |
| `hover` | `#2a2a2a` |
| `divider` | `#3f3f3f` |
| `textPrimary` | `#e7e7e7` |
| `textSecond` | `#a0a0a0` |
| `textDim` | `#949494` |
| `textLight` | `#757575ff` |
| `accent` | customizable (default `#3b82f6`) |
| `btnBg` | `accent` or `#2993f0` fallback when accent is `#000000` |

### Light Theme
| Token | Value |
|-------|-------|
| `bg` | `#ffffff` |
| `sidebar` | `#fafafa` |
| `card` | `#ffffff` |
| `cardBorder` | `#e5e5e5` |
| `hover` | `#f0f0f0` |
| `divider` | `#c7c7c7` |
| `textPrimary` | `#1a1a1a` |
| `textSecond` | `#444444` |
| `textDim` | `#999999` |
| `textLight` | `#9c9c9cff` |
| `accent` | customizable (default `#3b82f6`) |
| `btnBg` | `accent` or `#2993f0` fallback when accent is `#000000` |

### Accent Color Logic
```typescript
// C.accent = actual selected color (can be #000000)
// C.btnBg  = accent fallback (blue when accent is black)
// Use C.accent for accent-colored UI elements on settings/content pages
// Use C.btnBg for interactive buttons where black would be invisible on dark mode
```

---

## Typography

| Element | Size | Weight | Color | Notes |
|---------|------|--------|-------|-------|
| Page title | `22px` | `700` | `C.textPrimary` | margin: `0 0 4px 0` |
| Page description | `14px` | `400` | `C.textSecond` | margin: `0 0 18px 0`, lineHeight: `1.5` |
| Section title | `14px` | `600` | `C.textPrimary` | inside settings sections |
| Section description | `13px` | `400` | `C.textDim` | marginTop: `4px` |
| Dashboard welcome | `18px` | `600` | `C.textPrimary` | home page greeting |
| Card title | `14px` | `600` | `C.textPrimary` | plan/card names |
| Card description | `12px` | `400` | `C.textSecond` | lineHeight: `1.5` |
| Label text | `13px` | `500` | `C.textSecond` | form labels, info text |
| Button text | `13px` | `600` | varies | primary actions |
| Badge text | `11px` | `600` | varies | pills, tags |
| Tab text | `13px` | `500` | active: `C.textPrimary`, inactive: `C.textLight` | navigation tabs |
| Dim/meta text | `11-12px` | `400-500` | `C.textDim` | timestamps, hints |
| Price large | `24px` | `700` | `C.textPrimary` | plan pricing |

---

## Page Header Pattern (standard for all settings pages)

```tsx
{/* ── Page Header ── */}
<h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 4px 0' }}>
  {title}
</h2>
<p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 18px 0', lineHeight: 1.5 }}>
  {description}
</p>
<div style={{ height: 1, background: C.divider, opacity: 0.4 }} />
```

---

## Section Header Pattern (inside pages)

```tsx
<div style={{ padding: '20px 0' }}>
  <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>
    {sectionTitle}
  </span>
  <p style={{ fontSize: 13, color: C.textDim, marginTop: 4, margin: 0 }}>
    {sectionDescription}
  </p>
</div>
<div style={{ height: 1, background: C.divider, opacity: 0.4 }} />
```

---

## Divider

```tsx
<div style={{ height: 1, background: C.divider, opacity: 0.4 }} />
```

---

## Buttons

### Primary Action Button (Save, Submit)
```tsx
<button style={{
  padding: '10px 28px',
  borderRadius: 24,
  border: 'none',
  background: C.accent, // or C.btnBg for visibility
  color: '#ffffff',
  fontSize: 13,
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'all 0.2s',
}}>
  Save Preferences
</button>
```

### Secondary/Outline Button
```tsx
<button style={{
  padding: '8px 16px',
  borderRadius: 10,
  border: `1px solid ${C.cardBorder}`,
  background: C.card,
  color: C.textPrimary,
  fontSize: 13,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'background 0.15s',
}}>
  Action
</button>
```

### Text Link Button (Reset, Cancel)
```tsx
<button style={{
  padding: 0,
  background: 'transparent',
  border: 'none',
  color: C.textDim,
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  textDecoration: 'underline',
  opacity: 0.7,
}}>
  Reset to default
</button>
```

### Toggle Button Group
```tsx
{/* Wrapper */}
<div style={{
  display: 'inline-flex', alignItems: 'center', gap: 2,
  background: isLight ? '#f3f4f6' : C.hover,
  borderRadius: 12, padding: 3,
}}>
  {/* Each toggle button */}
  <button style={{
    padding: '7px 18px', fontSize: 13, fontWeight: 500, borderRadius: 10,
    border: 'none', cursor: 'pointer', transition: 'all 0.15s',
    background: active ? (isLight ? '#fff' : C.card) : 'transparent',
    color: active ? C.textPrimary : C.textSecond,
    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
  }}>
    Option
  </button>
</div>
```

---

## Cards

### Standard Card
```tsx
<div style={{
  background: isLight ? '#fff' : C.card,
  border: `1.5px solid ${C.cardBorder}`,
  borderRadius: 14,
  padding: '24px 20px 20px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
}}>
```

### Highlighted Card (e.g. "Most Popular")
```tsx
border: '1.5px solid #2563eb',
boxShadow: '0 6px 24px rgba(37,99,235,0.08)',
transform: 'scale(1.02)',
zIndex: 1,
```

### Active/Current Card
```tsx
border: `2.5px solid ${C.accent}`,
```

---

## Badges & Pills

### Top Badge (floating above card)
```tsx
<div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)' }}>
  <span style={{
    fontSize: 11, fontWeight: 600, color: '#fff',
    background: C.accent,  // or '#2563eb' for highlight
    border: 'none',
    padding: '6px 18px', borderRadius: 20,
    whiteSpace: 'nowrap',
  }}>
    Current Plan
  </span>
</div>
```

### Inline Badge (Save 20%, status)
```tsx
<span style={{
  fontSize: 11, fontWeight: 600,
  background: isLight ? `${C.accent}18` : `${C.accent}26`,
  color: C.accent,
  padding: '2px 8px', borderRadius: 20,
}}>
  Save 20%
</span>
```

### Status Badge
```tsx
// Colors by status:
// on_progress: bg #eff6ff/#1e3a5f, text #2563eb/#93c5fd
// completed:   bg #ecfdf5/#16532e, text #059669/#6ee7b7
// failed:      bg #fef2f2/#5c1d1d, text #dc2626/#fca5a5
<span style={{
  display: 'inline-flex', alignItems: 'center', gap: 5,
  fontSize: 12, fontWeight: 500,
  padding: '4px 12px', borderRadius: 20,
  background: statusBg, color: statusText,
}}>
  <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor }} />
  {label}
</span>
```

---

## Success / Info Messages

```tsx
<div style={{
  display: 'inline-flex', alignItems: 'center', gap: 6,
  padding: '8px 14px', marginTop: 12,
  background: isLight ? `${C.accent}0a` : `${C.accent}14`,
  border: `1px solid ${isLight ? `${C.accent}30` : `${C.accent}33`}`,
  borderRadius: 10,
}}>
  <svg width="14" height="14" stroke={C.accent} strokeWidth="2" ... />
  <span style={{ fontSize: 13, fontWeight: 500, color: C.accent }}>{message}</span>
</div>
```

---

## Form Inputs

### Text Input (e.g. hex color, search)
```tsx
<div style={{
  display: 'flex', alignItems: 'center',
  border: `1px solid ${C.cardBorder}`, borderRadius: 8,
  padding: '6px 12px', gap: 4,
  background: isLight ? '#fff' : C.card,
}}>
  <input style={{
    border: 'none', outline: 'none', background: 'transparent',
    fontSize: 13, fontWeight: 500, color: C.textPrimary,
    width: '100%',
  }} />
</div>
```

---

## Grid / Responsive Layout

```css
/* 3-column grid with responsive breakpoints */
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: stretch;
}
@media (max-width: 860px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
```

### Two-card top row (e.g. Revenue page)
```tsx
<div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
  <div style={{ flex: 2, minWidth: 380 }}>  {/* wider card */}
  <div style={{ flex: 1, minWidth: 280 }}>  {/* narrower card */}
</div>
```

---

## Loading Spinner

```tsx
<div style={{
  width: 24, height: 24, borderRadius: '50%',
  border: `3px solid ${C.divider}`,
  borderTopColor: C.btnBg,
  animation: 'spin 0.6s linear infinite',
}} />
<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
```

---

## Tab Navigation

```tsx
<div style={{ borderBottom: `1px solid ${C.divider}`, marginBottom: 24, position: 'relative' }}>
  <div style={{ display: 'flex', gap: 32 }}>
    <button style={{
      padding: '0px 0 8px 0',
      background: 'none', border: 'none',
      color: active ? C.textPrimary : C.textLight,
      fontSize: 13, fontWeight: 500,
      cursor: 'pointer',
    }}>
      {label}
    </button>
  </div>
  {/* Sliding underline */}
  <div style={{
    position: 'absolute', bottom: -1, height: 2,
    background: C.accent,
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  }} />
</div>
```

---

## Spacing Reference

| Context | Value |
|---------|-------|
| Page header to divider | title `margin-bottom: 4px` + desc `margin-bottom: 18px` |
| After page divider | `marginTop: 16-24px` |
| Section padding | `20px 0` |
| Card padding | `24px 20px 20px` or `24px 28px` |
| Card border radius | `14px` |
| Button border radius | `24px` (pill) or `10px` (compact) |
| Grid gap | `16px` |
| Flex row gap | `20px` |
| Inner element gap | `6-8px` |
| Container maxWidth | `700px` (standard), `900px` (subscription), `1100px` (revenue) |
| Container padding | `30px 30px 60px 30px` |

---

## Accent Color Presets

```typescript
const accentColors = [
  '#000000', // Black (default)
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
];
// + Custom hex color input support
```

---

## i18n Pattern

```typescript
import { useTranslation } from '@berhot/i18n';
const { t } = useTranslation();
// Keys: 'settingsNav.xxx', 'settingsPages.xxxDesc', 'plan.xxx'
// Locale files: src/locales/en.json, src/locales/ar.json
```

---

## File Structure

| File | Purpose |
|------|---------|
| `DashboardPage.tsx` | Main layout, sidebar, routing, theme objects |
| `SettingsContent.tsx` | All settings page components (profile, subscription, etc.) |
| `ThemeSettings.tsx` | Theme/appearance settings with tabs |
| `RevenueContent.tsx` | Revenue dashboard with cards + transaction table |
| `ProfilePage.tsx` | User profile page |
| `BusinessProfileContent.tsx` | Business profile settings |

---

*Last updated: Feb 2026*
