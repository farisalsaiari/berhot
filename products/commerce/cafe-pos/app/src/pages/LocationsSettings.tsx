/* ──────────────────────────────────────────────────────────────────
   Locations Settings — Business location management
   Three views: List, Detail (SlidePanel), Edit/Create (SlidePanel)
   ────────────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '@berhot/i18n';
import { SlidePanel } from '@berhot/ui';
import {
  fetchBusinessLocations,
  fetchBusinessLocation,
  createBusinessLocation,
  updateBusinessLocation,
  deactivateBusinessLocation,
  type BusinessLocation,
} from '../lib/api';

interface Theme {
  bg: string; sidebar: string; card: string; cardBorder: string; hover: string;
  active: string; divider: string; textPrimary: string; textSecond: string;
  textLight: string; textDim: string; accent: string; btnBg: string; btnBorder: string;
}

interface Props {
  C: Theme;
  isLight: boolean;
}

// ── Weekday keys for business hours ─────────────────────────────
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

type BusinessHours = Record<string, { open: string; close: string; closed: boolean }>;

function defaultBusinessHours(): BusinessHours {
  const h: BusinessHours = {};
  WEEKDAYS.forEach(d => { h[d] = { open: '', close: '', closed: true }; });
  return h;
}

// ── Main component ──────────────────────────────────────────────
export default function LocationsSettings({ C, isLight }: Props) {
  const { t } = useTranslation();

  // List state
  const [locations, setLocations] = useState<BusinessLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Detail panel
  const [showDetail, setShowDetail] = useState(false);
  const [detailLoc, setDetailLoc] = useState<BusinessLocation | null>(null);

  // Edit panel
  const [showEdit, setShowEdit] = useState(false);
  const [editLoc, setEditLoc] = useState<BusinessLocation | null>(null); // null = create new
  const [saving, setSaving] = useState(false);

  // Toast / feedback message
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Form state
  const [formName, setFormName] = useState('');
  const [formBusinessName, setFormBusinessName] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formLocationType, setFormLocationType] = useState('physical');
  const [formAddr1, setFormAddr1] = useState('');
  const [formAddr2, setFormAddr2] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formPostal, setFormPostal] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTimezone, setFormTimezone] = useState('Asia/Riyadh');
  const [formLang, setFormLang] = useState('en');
  const [formHours, setFormHours] = useState<BusinessHours>(defaultBusinessHours());

  // Hover
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [showNickTip, setShowNickTip] = useState(false);
  const [showDeactivateTip, setShowDeactivateTip] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  // Sort
  const [sortKey, setSortKey] = useState<string>('nickname');
  const [sortAsc, setSortAsc] = useState(true);

  // ── Load locations ────────────────────────────────────────
  const loadLocations = useCallback(async () => {
    try {
      const locs = await fetchBusinessLocations(search || undefined);
      setLocations(locs);
    } catch { /* silently fail */ }
    setLoading(false);
  }, [search]);

  useEffect(() => { loadLocations(); }, [loadLocations]);

  // ── Open detail ───────────────────────────────────────────
  const openDetail = async (loc: BusinessLocation) => {
    try {
      const full = await fetchBusinessLocation(loc.id);
      setDetailLoc(full);
      setShowDetail(true);
    } catch {
      setDetailLoc(loc);
      setShowDetail(true);
    }
  };

  // ── Open edit/create ──────────────────────────────────────
  const openEdit = (loc: BusinessLocation | null) => {
    setShowDetail(false);
    if (loc) {
      setFormName(loc.name || '');
      setFormBusinessName(loc.businessName || '');
      setFormNickname(loc.nickname || '');
      setFormDescription(loc.description || '');
      setFormLocationType(loc.locationType || 'physical');
      setFormAddr1(loc.addressLine1 || '');
      setFormAddr2(loc.addressLine2 || '');
      setFormCity(loc.cityName || '');
      setFormPostal(loc.postalCode || '');
      setFormPhone(loc.phone || '');
      setFormEmail(loc.email || '');
      setFormTimezone(loc.timezone || 'Asia/Riyadh');
      setFormLang(loc.preferredLanguage || 'en');
      try { setFormHours(typeof loc.businessHours === 'string' ? JSON.parse(loc.businessHours) : defaultBusinessHours()); } catch { setFormHours(defaultBusinessHours()); }
    } else {
      setFormName(''); setFormBusinessName(''); setFormNickname('');
      setFormDescription(''); setFormLocationType('physical');
      setFormAddr1(''); setFormAddr2(''); setFormCity(''); setFormPostal('');
      setFormPhone(''); setFormEmail(''); setFormTimezone('Asia/Riyadh');
      setFormLang('en'); setFormHours(defaultBusinessHours());
    }
    setEditLoc(loc);
    setShowEdit(true);
  };

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    const data: Partial<BusinessLocation> = {
      name: formBusinessName || formName || 'New Location',
      businessName: formBusinessName || formName,
      nickname: formNickname,
      locationType: formLocationType,
      description: formDescription,
      addressLine1: formAddr1,
      addressLine2: formAddr2,
      cityName: formCity,
      postalCode: formPostal,
      phone: formPhone,
      email: formEmail,
      timezone: formTimezone,
      preferredLanguage: formLang,
      businessHours: JSON.stringify(formHours),
    };
    try {
      const isNew = !editLoc;
      if (editLoc) {
        await updateBusinessLocation(editLoc.id, data);
      } else {
        await createBusinessLocation(data);
      }
      setShowEdit(false);
      setSearch('');
      setLoading(true);
      try {
        const locs = await fetchBusinessLocations();
        setLocations(locs);
      } catch { /* ignore */ }
      setLoading(false);
      showToast(isNew ? t('locations.locationCreated') : t('locations.locationUpdated'));
    } catch {
      showToast(t('locations.saveFailed'), 'error');
    }
    setSaving(false);
  };

  // ── Deactivate ────────────────────────────────────────────
  const handleDeactivate = async () => {
    if (!editLoc) return;
    setShowDeactivateConfirm(false);
    try {
      await deactivateBusinessLocation(editLoc.id);
      setShowEdit(false);
      setSearch('');
      setLoading(true);
      try {
        const locs = await fetchBusinessLocations();
        setLocations(locs);
      } catch { /* ignore */ }
      setLoading(false);
      showToast(t('locations.locationDeactivated'));
    } catch {
      showToast(t('locations.deleteFailed'), 'error');
    }
  };

  // ── Sorted locations ──────────────────────────────────────
  const sorted = [...locations].sort((a, b) => {
    const av = (a as unknown as Record<string, unknown>)[sortKey] as string || '';
    const bv = (b as unknown as Record<string, unknown>)[sortKey] as string || '';
    return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  // ── Shared styles ─────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 14px', fontSize: 14,
    background: isLight ? '#fff' : C.hover,
    border: `1px solid ${C.cardBorder}`, borderRadius: 10,
    color: C.textPrimary, outline: 'none', boxSizing: 'border-box',
  };
  const blackBtn: React.CSSProperties = {
    padding: '10px 22px', fontSize: 13, fontWeight: 600,
    background: C.textPrimary, color: isLight ? '#fff' : '#000',
    border: 'none', borderRadius: 24, cursor: 'pointer',
  };
  const outlineBtn: React.CSSProperties = {
    padding: '10px 22px', fontSize: 13, fontWeight: 600,
    background: 'transparent', color: C.textPrimary,
    border: `1px solid ${C.cardBorder}`, borderRadius: 24, cursor: 'pointer',
  };
  const sectionDivider: React.CSSProperties = {
    height: 1, background: C.divider, opacity: 0.4, margin: '28px 0',
  };
  const thickDivider: React.CSSProperties = {
    height: 4, background: isLight ? '#e5e5e5' : C.divider, borderRadius: 2, margin: '28px 0',
  };

  const missingAddrCount = locations.filter(l => l.status === 'active' && !l.addressLine1).length;

  // ── Column headers ────────────────────────────────────────
  const columns = [
    { key: 'nickname', label: t('locations.nickname') },
    { key: 'locationType', label: t('locations.locationType') },
    { key: 'addressLine1', label: t('locations.address') },
    { key: 'cityName', label: t('locations.location') },
    { key: 'phone', label: t('locations.phone') },
    { key: 'email', label: t('locations.email') },
  ];

  // ── Sort icon ─────────────────────────────────────────────
  const SortArrow = ({ col }: { col: string }) => (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" style={{ marginLeft: 4, verticalAlign: 'middle' }}>
      <path d="M5 0L9 5H1L5 0Z" fill={sortKey === col && sortAsc ? C.textPrimary : '#bbb'} />
      <path d="M5 14L1 9H9L5 14Z" fill={sortKey === col && !sortAsc ? C.textPrimary : '#bbb'} />
    </svg>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════

  return (
    <div>
      {/* ── Toast notification ─────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
          padding: '12px 24px', borderRadius: 10, fontSize: 14, fontWeight: 600,
          background: toast.type === 'success' ? (isLight ? '#f0fdf4' : '#14532d') : (isLight ? '#fef2f2' : '#7f1d1d'),
          color: toast.type === 'success' ? (isLight ? '#166534' : '#bbf7d0') : (isLight ? '#991b1b' : '#fecaca'),
          border: `1px solid ${toast.type === 'success' ? (isLight ? '#bbf7d0' : '#22c55e30') : (isLight ? '#fecaca' : '#ef444430')}`,
          boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {toast.type === 'success'
              ? <><path d="M20 6L9 17l-5-5" /></>
              : <><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></>}
          </svg>
          {toast.msg}
        </div>
      )}

      {/* ── Deactivate Confirmation Modal (portal to body, above SlidePanel) ── */}
      {showDeactivateConfirm && createPortal(
        <div
          onClick={() => setShowDeactivateConfirm(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: isLight ? '#fff' : C.card,
              borderRadius: 16, padding: '28px 32px',
              maxWidth: 420, width: '90%',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              border: `1px solid ${isLight ? '#fecaca' : '#7f1d1d'}`,
            }}
          >
            {/* Warning icon */}
            <div style={{
              width: 48, height: 48, borderRadius: '50%',
              background: isLight ? '#fef2f2' : '#7f1d1d40',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 16,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: '0 0 8px 0' }}>
              {t('locations.deactivateConfirmTitle')}
            </h3>
            <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 24px 0', lineHeight: 1.6 }}>
              {t('locations.deactivateConfirmMsg', { name: editLoc?.nickname || editLoc?.businessName || editLoc?.name || '' })}
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeactivateConfirm(false)}
                style={{
                  ...outlineBtn,
                  padding: '10px 24px',
                }}
              >
                {t('locations.cancel')}
              </button>
              <button
                onClick={handleDeactivate}
                style={{
                  padding: '10px 24px', fontSize: 13, fontWeight: 600,
                  background: '#dc2626', color: '#fff',
                  border: 'none', borderRadius: 24, cursor: 'pointer',
                }}
              >
                {t('locations.confirmDeactivate')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Page Header ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
          {t('locations.title')}
        </h2>
        <button onClick={() => openEdit(null)} style={blackBtn}>
          {t('locations.createLocation')}
        </button>
      </div>

      {/* ── Search ───────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', marginBottom: 20,
        background: isLight ? '#fff' : C.card,
        border: `1px solid ${C.cardBorder}`, borderRadius: 10,
        maxWidth: 360,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('locations.searchPlaceholder')}
          style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontSize: 14, color: C.textPrimary }}
        />
      </div>

      {/* ── Info banner ──────────────────────────────────── */}
      {missingAddrCount > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '14px 18px', marginBottom: 20,
          background: isLight ? '#f9f9f9' : C.hover,
          borderRadius: 10, fontSize: 13, color: C.textSecond,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          {t('locations.infoBanner', { count: missingAddrCount })}
        </div>
      )}

      {/* ── Table ────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: C.textDim, fontSize: 14 }}>Loading...</div>
      ) : locations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: C.textDim, fontSize: 14 }}>
          No locations found. Create your first location.
        </div>
      ) : (
        <div>
          {/* Header row */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.2fr 1fr 1fr 1.2fr',
            padding: '10px 0', borderBottom: `2px solid ${C.textPrimary}`,
          }}>
            {columns.map((col) => (
              <div
                key={col.key}
                onClick={() => { if (sortKey === col.key) setSortAsc(!sortAsc); else { setSortKey(col.key); setSortAsc(true); } }}
                style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, cursor: 'pointer', userSelect: 'none' }}
              >
                {col.label} <SortArrow col={col.key} />
              </div>
            ))}
          </div>

          {/* Data rows */}
          {sorted.map((loc) => (
            <div
              key={loc.id}
              onClick={() => openDetail(loc)}
              onMouseEnter={() => setHoveredRow(loc.id)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                display: 'grid', gridTemplateColumns: '1.4fr 1fr 1.2fr 1fr 1fr 1.2fr',
                padding: '14px 0',
                borderBottom: `1px solid ${C.divider}40`,
                cursor: 'pointer',
                background: hoveredRow === loc.id ? C.hover : 'transparent',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: 14, color: C.textPrimary }}>{loc.nickname || loc.name}</span>
              <span style={{ fontSize: 14, color: C.textSecond, textTransform: 'capitalize' }}>{loc.locationType || 'Physical'}</span>
              <span
                onClick={(e) => { e.stopPropagation(); openEdit(loc); }}
                style={{ fontSize: 14, color: C.accent, fontWeight: 600, textDecoration: 'underline', cursor: 'pointer' }}
              >
                {loc.addressLine1 ? t('locations.updateAddress') : t('locations.addAddress')}
              </span>
              <span style={{ fontSize: 14, color: C.textSecond }}>{loc.cityName || ''}</span>
              <span style={{ fontSize: 14, color: C.textSecond }}>{loc.phone || ''}</span>
              <span style={{ fontSize: 14, color: C.textSecond }}>{loc.email || ''}</span>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          Detail SlidePanel (read-only)
         ══════════════════════════════════════════════════════ */}
      <SlidePanel open={showDetail} onClose={() => setShowDetail(false)} width={480}>
        <div style={{ background: C.card, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px' }}>
            <button onClick={() => setShowDetail(false)} style={{
              width: 36, height: 36, borderRadius: '50%', border: `1px solid ${C.cardBorder}`,
              background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <button onClick={() => openEdit(detailLoc)} style={blackBtn}>
              {t('locations.editLocation')}
            </button>
          </div>

          {/* Content */}
          {detailLoc && (
            <div style={{ padding: '0 24px 24px', flex: 1 }}>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: C.textPrimary, margin: '0 0 24px 0' }}>
                {detailLoc.businessName || detailLoc.nickname || detailLoc.name}
              </h3>
              <h4 style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px 0' }}>
                {t('locations.locationDetails')}
              </h4>

              {/* Detail rows */}
              {[
                { label: t('locations.nickname'), value: detailLoc.nickname || detailLoc.name },
                { label: t('locations.locationType'), value: detailLoc.locationType || 'Physical' },
                { label: t('locations.address'), value: detailLoc.addressLine1 || '', isLink: true },
                { label: t('locations.location'), value: detailLoc.cityName || '' },
                { label: t('locations.phone'), value: detailLoc.phone || '' },
                { label: t('locations.email'), value: detailLoc.email || '' },
                { label: t('locations.preferredLanguage'), value: detailLoc.preferredLanguage === 'ar' ? 'Arabic' : 'English' },
              ].map((row, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0', borderBottom: `1px solid ${C.divider}30`,
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{row.label}</span>
                  <span style={{
                    fontSize: 14, color: row.isLink ? C.textPrimary : C.textSecond,
                    textDecoration: row.isLink ? 'underline' : 'none', fontWeight: row.isLink ? 600 : 400,
                  }}>
                    {row.isLink ? (row.value ? t('locations.updateAddress') : t('locations.addAddress')) : (row.value || '—')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </SlidePanel>

      {/* ══════════════════════════════════════════════════════
          Edit / Create SlidePanel
         ══════════════════════════════════════════════════════ */}
      <SlidePanel open={showEdit} onClose={() => setShowEdit(false)} width={560}>
        <div style={{ background: C.card, height: '100%', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: `1px solid ${C.divider}30` }}>
            <button onClick={() => setShowEdit(false)} style={{
              width: 36, height: 36, borderRadius: '50%', border: `1px solid ${C.cardBorder}`,
              background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textPrimary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* Deactivate button — only shown when editing, disabled for first/only active location */}
              {editLoc && (() => {
                const isFirstLocation = locations.length > 0 && editLoc.id === locations[0].id;
                const activeCount = locations.filter(l => l.status === 'active').length;
                const cantDeactivate = isFirstLocation || activeCount <= 1;
                return (
                  <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                    <button
                      onClick={cantDeactivate ? undefined : () => setShowDeactivateConfirm(true)}
                      disabled={cantDeactivate}
                      style={{
                        padding: '10px 22px', fontSize: 13, fontWeight: 600,
                        background: 'transparent',
                        color: cantDeactivate ? C.textDim : '#dc2626',
                        border: `1px solid ${cantDeactivate ? C.cardBorder : '#dc2626'}`,
                        borderRadius: 24,
                        opacity: cantDeactivate ? 0.45 : 1,
                        cursor: cantDeactivate ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {t('locations.deactivate')}
                    </button>
                    {cantDeactivate && (
                      <button
                        onMouseEnter={() => setShowDeactivateTip(true)}
                        onMouseLeave={() => setShowDeactivateTip(false)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginLeft: 4, display: 'flex', alignItems: 'center' }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                      </button>
                    )}
                    {showDeactivateTip && cantDeactivate && (
                      <div style={{
                        position: 'absolute', top: '110%', right: 0, zIndex: 10,
                        background: '#222', color: '#fff', fontSize: 12, padding: '8px 14px',
                        borderRadius: 8, whiteSpace: 'nowrap',
                      }}>
                        {t('locations.cantDeactivateTip')}
                      </div>
                    )}
                  </div>
                );
              })()}
              <button onClick={handleSave} disabled={saving} style={{ ...blackBtn, opacity: saving ? 0.6 : 1 }}>
                {saving ? '...' : t('locations.save')}
              </button>
            </div>
          </div>

          {/* Scrollable form content */}
          <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
            {/* ── Location details / Basic info ── */}
            <h3 style={{ fontSize: 18, fontWeight: 700, color: C.textPrimary, margin: '0 0 20px 0' }}>
              {t('locations.locationDetails')}
            </h3>
            <h4 style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: '0 0 8px 0' }}>
              {t('locations.basicInformation')}
            </h4>
            <p style={{ fontSize: 13, color: C.textDim, margin: '0 0 20px 0', lineHeight: 1.5 }}>
              {t('locations.basicInfoDesc')}
            </p>

            {/* Location business name */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ position: 'relative' }}>
                <label style={{ position: 'absolute', top: 6, left: 14, fontSize: 11, color: C.textDim }}>{t('locations.locationBusinessName')}</label>
                <input value={formBusinessName} onChange={(e) => setFormBusinessName(e.target.value)}
                  style={{ ...inputStyle, paddingTop: 22 }} />
              </div>
            </div>

            {/* Location nickname */}
            <div style={{ marginBottom: 16, position: 'relative' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ position: 'absolute', top: 6, left: 14, fontSize: 11, color: C.textDim }}>{t('locations.locationNickname')}</label>
                <input value={formNickname} onChange={(e) => setFormNickname(e.target.value)}
                  style={{ ...inputStyle, paddingTop: 22, paddingRight: 40 }} />
                <button
                  onMouseEnter={() => setShowNickTip(true)} onMouseLeave={() => setShowNickTip(false)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </button>
              </div>
              {showNickTip && (
                <div style={{
                  position: 'absolute', bottom: -36, right: 0, zIndex: 10,
                  background: '#222', color: '#fff', fontSize: 12, padding: '8px 14px',
                  borderRadius: 8, maxWidth: 320, whiteSpace: 'normal',
                }}>
                  {t('locations.nicknameTip')}
                </div>
              )}
            </div>

            {/* Name change note */}
            <p style={{ fontSize: 12, color: C.textDim, margin: '0 0 16px 0', lineHeight: 1.5 }}>
              {t('locations.nameChangeLimit', { remaining: 3 })}
            </p>

            {/* Business description */}
            <div style={{ marginBottom: 4, position: 'relative' }}>
              <textarea
                value={formDescription}
                onChange={(e) => { if (e.target.value.length <= 1024) setFormDescription(e.target.value); }}
                placeholder={t('locations.businessDescription')}
                rows={4}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 100 }}
              />
            </div>
            <div style={{ fontSize: 11, color: C.textDim, textAlign: 'right', marginBottom: 8 }}>
              {formDescription.length}/1024
            </div>

            <div style={sectionDivider} />
            <div style={thickDivider} />

            {/* ── Business address ── */}
            <h4 style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px 0' }}>
              {t('locations.businessAddress')}
            </h4>

            {/* Location type dropdown */}
            <div style={{ marginBottom: 16, position: 'relative' }}>
              <label style={{ position: 'absolute', top: 6, left: 14, fontSize: 11, color: C.textDim, zIndex: 1 }}>{t('locations.locationType')}</label>
              <select
                value={formLocationType}
                onChange={(e) => setFormLocationType(e.target.value)}
                style={{ ...inputStyle, paddingTop: 22, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="physical">{t('locations.physical')}</option>
                <option value="online">{t('locations.online')}</option>
                <option value="mobile">{t('locations.mobile')}</option>
                <option value="popup">{t('locations.popup')}</option>
              </select>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            <div style={{ marginBottom: 16, position: 'relative' }}>
              <label style={{ position: 'absolute', top: 6, left: 14, fontSize: 11, color: C.textDim }}>{t('locations.addressLine1')}</label>
              <input value={formAddr1} onChange={(e) => setFormAddr1(e.target.value)}
                style={{ ...inputStyle, paddingTop: 22 }} />
            </div>

            <div style={{ marginBottom: 16, position: 'relative' }}>
              <input value={formAddr2} onChange={(e) => setFormAddr2(e.target.value)}
                placeholder={t('locations.addressLine2')}
                style={inputStyle} />
            </div>

            <div style={{ marginBottom: 16, position: 'relative' }}>
              <label style={{ position: 'absolute', top: 6, left: 14, fontSize: 11, color: C.textDim }}>{t('locations.city')}</label>
              <input value={formCity} onChange={(e) => setFormCity(e.target.value)}
                style={{ ...inputStyle, paddingTop: 22 }} />
            </div>

            <div style={{ marginBottom: 16, position: 'relative' }}>
              <label style={{ position: 'absolute', top: 6, left: 14, fontSize: 11, color: C.textDim }}>{t('locations.postalCode')}</label>
              <input value={formPostal} onChange={(e) => setFormPostal(e.target.value)}
                style={{ ...inputStyle, paddingTop: 22 }} />
            </div>

            <div style={sectionDivider} />
            <div style={thickDivider} />

            {/* ── Contact information ── */}
            <h4 style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px 0' }}>
              {t('locations.contactInformation')}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 8 }}>
              <div style={{ position: 'relative' }}>
                <label style={{ position: 'absolute', top: 6, left: 14, fontSize: 11, color: C.textDim }}>{t('locations.email')}</label>
                <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)}
                  style={{ ...inputStyle, paddingTop: 22 }} />
              </div>
              <div style={{ position: 'relative' }}>
                <label style={{ position: 'absolute', top: 6, left: 14, fontSize: 11, color: C.textDim }}>{t('locations.phone')}</label>
                <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)}
                  style={{ ...inputStyle, paddingTop: 22 }} />
              </div>
            </div>

            <div style={sectionDivider} />
            <div style={thickDivider} />

            {/* ── Branding ── */}
            <h4 style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: '0 0 8px 0' }}>
              {t('locations.branding')}
            </h4>
            <p style={{ fontSize: 13, color: C.textDim, margin: '0 0 16px 0', lineHeight: 1.5 }}>
              {t('locations.brandingDesc')}
            </p>
            <button style={{ ...outlineBtn, borderRadius: 24, marginBottom: 8 }}>
              {t('locations.applyBranding')}
            </button>

            <div style={sectionDivider} />
            <div style={thickDivider} />

            {/* ── Business hours ── */}
            <h4 style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px 0' }}>
              {t('locations.businessHours')}
            </h4>

            {/* Timezone */}
            <div style={{ marginBottom: 20, position: 'relative' }}>
              <label style={{ position: 'absolute', top: 6, left: 14, fontSize: 11, color: C.textDim, zIndex: 1 }}>{t('locations.timezone')}</label>
              <select
                value={formTimezone}
                onChange={(e) => setFormTimezone(e.target.value)}
                style={{ ...inputStyle, paddingTop: 22, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="Asia/Riyadh">Asia/Riyadh</option>
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {/* Regular hours */}
            <h4 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: '0 0 6px 0' }}>
              {t('locations.regularHours')}
            </h4>
            <p style={{ fontSize: 13, color: C.textDim, margin: '0 0 16px 0' }}>
              Let your clients know when you&apos;re open.
            </p>

            {WEEKDAYS.map((day) => {
              const h = formHours[day] || { open: '', close: '', closed: true };
              return (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, width: 120, fontSize: 14, color: C.textPrimary, textTransform: 'capitalize' }}>
                    <input
                      type="checkbox"
                      checked={!h.closed}
                      onChange={() => {
                        setFormHours(prev => ({ ...prev, [day]: { ...prev[day], closed: !prev[day].closed } }));
                      }}
                      style={{ width: 16, height: 16, accentColor: C.accent }}
                    />
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </label>
                  <input
                    type="text"
                    value={h.closed ? t('locations.closed') : h.open}
                    onChange={(e) => { if (!h.closed) setFormHours(prev => ({ ...prev, [day]: { ...prev[day], open: e.target.value } })); }}
                    disabled={h.closed}
                    style={{
                      ...inputStyle, width: 120, textAlign: 'center',
                      background: h.closed ? (isLight ? '#f3f4f6' : '#2a2a2a') : inputStyle.background,
                      color: h.closed ? C.textDim : C.textPrimary,
                    }}
                  />
                  <input
                    type="text"
                    value={h.closed ? t('locations.closed') : h.close}
                    onChange={(e) => { if (!h.closed) setFormHours(prev => ({ ...prev, [day]: { ...prev[day], close: e.target.value } })); }}
                    disabled={h.closed}
                    style={{
                      ...inputStyle, width: 120, textAlign: 'center',
                      background: h.closed ? (isLight ? '#f3f4f6' : '#2a2a2a') : inputStyle.background,
                      color: h.closed ? C.textDim : C.textPrimary,
                    }}
                  />
                </div>
              );
            })}

            <div style={sectionDivider} />
            <div style={thickDivider} />

            {/* ── Preferred language ── */}
            <h4 style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: '0 0 8px 0' }}>
              {t('locations.preferredLanguage')}
            </h4>
            <p style={{ fontSize: 13, color: C.textDim, margin: '0 0 16px 0' }}>
              Set the language for emails and customer receipts.
            </p>
            <div style={{ marginBottom: 16, position: 'relative' }}>
              <label style={{ position: 'absolute', top: 6, left: 14, fontSize: 11, color: C.textDim, zIndex: 1 }}>Select language</label>
              <select
                value={formLang}
                onChange={(e) => setFormLang(e.target.value)}
                style={{ ...inputStyle, paddingTop: 22, appearance: 'none', cursor: 'pointer' }}
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            <div style={sectionDivider} />
            <div style={thickDivider} />

            {/* ── Match item library ── */}
            {editLoc && (
              <>
                <h4 style={{ fontSize: 15, fontWeight: 600, color: C.textPrimary, margin: '0 0 8px 0' }}>
                  {t('locations.matchItemLibrary')}
                </h4>
                <p style={{ fontSize: 13, color: C.textDim, margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  {t('locations.matchItemDesc')}
                </p>
                <div style={{ position: 'relative' }}>
                  <select style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}>
                    <option value="">Location</option>
                    {locations.filter(l => l.id !== editLoc.id).map(l => (
                      <option key={l.id} value={l.id}>{l.nickname || l.name}</option>
                    ))}
                  </select>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </>
            )}

            {/* Bottom padding */}
            <div style={{ height: 40 }} />
          </div>
        </div>
      </SlidePanel>
    </div>
  );
}
