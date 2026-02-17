import { useState, useEffect, useCallback, useRef } from 'react';
import {
  fetchAppSettings, updateAppSettings,
  fetchAppBanners, createAppBanner, updateAppBanner, deleteAppBanner,
  uploadImage,
  AppBanner, AppSettings
} from '../lib/posApi';

/* ─── Types ─────────────────────────────────────────── */
interface Props {
  C: Record<string, string>;
  isLight: boolean;
  isMobile: boolean;
  subPath?: string; // e.g. 'customer-app', 'customer-app/ui-design'
}

type AppTab = 'config' | 'ads' | 'ui-design' | 'notifications';

/* ─── ManageAppsContent ─────────────────────────────── */
export default function ManageAppsContent({ C, isLight, isMobile, subPath }: Props) {
  const [activeTab, setActiveTab] = useState<AppTab>('ui-design');
  const [settings, setSettings] = useState<AppSettings>({ bannerEnabled: false, bannerMode: 'single', autoSlideInterval: 5 });
  const [banners, setBanners] = useState<AppBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // New banner form
  const [showAddBanner, setShowAddBanner] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkType, setNewLinkType] = useState('external');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newShowOverlay, setNewShowOverlay] = useState(false);
  const [newOverlayTitle, setNewOverlayTitle] = useState('');
  const [newOverlayDesc, setNewOverlayDesc] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast('File too large. Max 10MB');
      return;
    }
    setUploading(true);
    setUploadProgress('Uploading...');
    try {
      const result = await uploadImage(file);
      setNewImageUrl(result.url);
      setUploadProgress('');
      showToast('Image uploaded');
    } catch (e: unknown) {
      showToast(e instanceof Error ? e.message : 'Upload failed');
      setUploadProgress('');
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileUpload(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    // Reset input so same file can be selected again
    e.target.value = '';
  };

  // Load data
  useEffect(() => {
    (async () => {
      try {
        const [s, b] = await Promise.all([fetchAppSettings(), fetchAppBanners()]);
        setSettings(s);
        setBanners(b);
      } catch { /* ignore */ }
      setLoading(false);
    })();
  }, []);

  const saveSettings = async (patch: Partial<AppSettings>) => {
    const updated = { ...settings, ...patch };
    setSettings(updated);
    setSaving(true);
    try {
      await updateAppSettings(patch);
      showToast('Settings saved');
    } catch { showToast('Failed to save'); }
    setSaving(false);
  };

  const handleAddBanner = async () => {
    if (!newImageUrl.trim()) return;
    setSaving(true);
    try {
      const res = await createAppBanner({
        imageUrl: newImageUrl, linkUrl: newLinkUrl, linkType: newLinkType,
        title: newOverlayTitle, description: newOverlayDesc, sortOrder: banners.length, isActive: true,
        showOverlay: newShowOverlay, overlayTitle: newOverlayTitle, overlayDescription: newOverlayDesc,
      });
      setBanners([...banners, {
        id: res.id, imageUrl: newImageUrl, linkUrl: newLinkUrl, linkType: newLinkType,
        title: newOverlayTitle, description: newOverlayDesc, sortOrder: banners.length, isActive: true,
        showOverlay: newShowOverlay, overlayTitle: newOverlayTitle, overlayDescription: newOverlayDesc,
        createdAt: new Date().toISOString(),
      }]);
      setNewImageUrl(''); setNewLinkUrl(''); setNewTitle(''); setNewDescription('');
      setNewShowOverlay(false); setNewOverlayTitle(''); setNewOverlayDesc('');
      setNewLinkType('external');
      setShowAddBanner(false);
      showToast('Banner added');
    } catch { showToast('Failed to add banner'); }
    setSaving(false);
  };

  const handleDeleteBanner = async (id: string) => {
    try {
      await deleteAppBanner(id);
      setBanners(banners.filter(b => b.id !== id));
      showToast('Banner removed');
    } catch { showToast('Failed to delete'); }
  };

  const handleToggleBanner = async (id: string, isActive: boolean) => {
    try {
      await updateAppBanner(id, { isActive });
      setBanners(banners.map(b => b.id === id ? { ...b, isActive } : b));
    } catch { showToast('Failed to update'); }
  };

  const tabs: { key: AppTab; label: string; icon: string }[] = [
    { key: 'config', label: 'App Configuration', icon: '⚙️' },
    { key: 'ads', label: 'App Ads', icon: '📢' },
    { key: 'ui-design', label: 'UI Design', icon: '🎨' },
    { key: 'notifications', label: 'Push Notifications', icon: '🔔' },
  ];

  const sidebarApps = [
    { key: 'customer-app', label: 'Customers App', icon: '📱' },
    { key: 'pos-app', label: 'POS Terminal', icon: '💳' },
    { key: 'driver-app', label: 'Driver App', icon: '🚗' },
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: `1px solid ${C.cardBorder}`, background: C.bg,
    color: C.textPrimary, fontSize: 14, outline: 'none',
    transition: 'border-color .15s',
  };

  const btnPrimary: React.CSSProperties = {
    padding: '10px 24px', borderRadius: 10, border: 'none',
    background: C.accent, color: '#fff', fontSize: 14, fontWeight: 600,
    cursor: 'pointer', transition: 'opacity .15s',
  };

  const btnOutline: React.CSSProperties = {
    padding: '10px 24px', borderRadius: 10,
    border: `1px solid ${C.cardBorder}`, background: 'transparent',
    color: C.textPrimary, fontSize: 14, fontWeight: 500,
    cursor: 'pointer',
  };

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: C.textDim }}>
        Loading app settings...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100%', gap: 0 }}>
      {/* ── Left sidebar: App list ── */}
      {!isMobile && (
        <div style={{
          width: 220, borderRight: `1px solid ${C.divider}`, padding: '24px 0',
          flexShrink: 0, background: C.sidebar,
        }}>
          <div style={{ padding: '0 16px 16px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: C.textDim }}>
            Apps
          </div>
          {sidebarApps.map(app => {
            const isActive = app.key === 'customer-app';
            return (
              <div key={app.key} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', cursor: 'pointer',
                background: isActive ? C.active : 'transparent',
                borderRight: isActive ? `2px solid ${C.accent}` : '2px solid transparent',
                color: isActive ? C.activeText : C.textSecond,
                fontSize: 14, fontWeight: isActive ? 600 : 400,
                transition: 'all .15s',
              }}>
                <span style={{ fontSize: 16 }}>{app.icon}</span>
                {app.label}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Main content area ── */}
      <div style={{ flex: 1, padding: isMobile ? '20px 16px' : '28px 32px', overflow: 'auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
            Customers App
          </h2>
          <p style={{ fontSize: 13, color: C.textDim, margin: '4px 0 0' }}>
            Configure the mobile app experience for your customers
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 0, borderBottom: `1px solid ${C.divider}`, marginBottom: 28,
          overflowX: 'auto',
        }}>
          {tabs.map(tab => {
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
                padding: '12px 20px', border: 'none', background: 'transparent',
                color: active ? C.accent : C.textDim, fontSize: 14, fontWeight: active ? 600 : 400,
                cursor: 'pointer', borderBottom: active ? `2px solid ${C.accent}` : '2px solid transparent',
                transition: 'all .15s', whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <span style={{ fontSize: 14 }}>{tab.icon}</span>
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab: App Configuration ── */}
        {activeTab === 'config' && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px' }}>General Configuration</h3>
              <p style={{ fontSize: 13, color: C.textDim }}>App configuration options will be available here — store name, currency display, delivery settings, etc.</p>
            </div>
          </div>
        )}

        {/* ── Tab: App Ads ── */}
        {activeTab === 'ads' && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px' }}>In-App Advertisements</h3>
              <p style={{ fontSize: 13, color: C.textDim }}>Manage promotional pop-ups, interstitial ads, and sponsored content within the customer app.</p>
            </div>
          </div>
        )}

        {/* ── Tab: Push Notifications ── */}
        {activeTab === 'notifications' && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: '0 0 16px' }}>Push Notifications</h3>
              <p style={{ fontSize: 13, color: C.textDim }}>Configure push notification campaigns, order updates, and promotional messages.</p>
            </div>
          </div>
        )}

        {/* ── Tab: UI Design (Banner / Slider management) ── */}
        {activeTab === 'ui-design' && (
          <div style={{ maxWidth: 700 }}>

            {/* Banner Toggle */}
            <div style={{
              background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 24, marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: 0 }}>Home Banner</h3>
                  <p style={{ fontSize: 13, color: C.textDim, margin: '4px 0 0' }}>
                    Display promotional banners below the search field in the app
                  </p>
                </div>
                {/* Toggle switch */}
                <div
                  onClick={() => saveSettings({ bannerEnabled: !settings.bannerEnabled })}
                  style={{
                    width: 48, height: 26, borderRadius: 13, cursor: 'pointer',
                    background: settings.bannerEnabled ? C.accent : (isLight ? '#d4d4d4' : '#444'),
                    position: 'relative', transition: 'background .2s', flexShrink: 0,
                  }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: 11,
                    background: '#fff', position: 'absolute', top: 2,
                    left: settings.bannerEnabled ? 24 : 2,
                    transition: 'left .2s', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                  }} />
                </div>
              </div>

              {settings.bannerEnabled && (
                <>
                  {/* Mode: Single banner or Slider */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: C.textSecond, marginBottom: 8, display: 'block' }}>Display Mode</label>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {(['single', 'slider'] as const).map(mode => (
                        <button key={mode} onClick={() => saveSettings({ bannerMode: mode })} style={{
                          padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                          border: settings.bannerMode === mode ? `2px solid ${C.accent}` : `1px solid ${C.cardBorder}`,
                          background: settings.bannerMode === mode ? (isLight ? '#eff6ff' : 'rgba(59,130,246,.12)') : 'transparent',
                          color: settings.bannerMode === mode ? C.accent : C.textSecond,
                          transition: 'all .15s',
                        }}>
                          {mode === 'single' ? '🖼️ Single Banner' : '🎠 Slider (Multi)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Auto-slide interval (for slider mode) */}
                  {settings.bannerMode === 'slider' && (
                    <div style={{ marginBottom: 16 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: C.textSecond, marginBottom: 8, display: 'block' }}>
                        Auto-slide interval (seconds)
                      </label>
                      <input
                        type="number" min={2} max={15} value={settings.autoSlideInterval}
                        onChange={e => saveSettings({ autoSlideInterval: parseInt(e.target.value) || 5 })}
                        style={{ ...inputStyle, width: 100 }}
                      />
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Banner list / management */}
            {settings.bannerEnabled && (
              <div style={{
                background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 24,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: C.textPrimary, margin: 0 }}>
                    {settings.bannerMode === 'slider' ? 'Slider Images' : 'Banner Image'}
                  </h3>
                  <button onClick={() => setShowAddBanner(true)} style={btnPrimary}>
                    + Add {settings.bannerMode === 'slider' ? 'Slide' : 'Banner'}
                  </button>
                </div>

                {/* Existing banners */}
                {banners.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px 0', color: C.textDim, fontSize: 14 }}>
                    No banners yet. Add your first one above.
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {banners.map((banner, idx) => (
                    <div key={banner.id} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: 14, borderRadius: 12, border: `1px solid ${C.cardBorder}`,
                      background: isLight ? '#fafafa' : '#1a1a1a',
                      opacity: banner.isActive ? 1 : 0.5,
                    }}>
                      {/* Thumbnail */}
                      <div style={{
                        width: 100, height: 56, borderRadius: 8, overflow: 'hidden',
                        background: C.hover, flexShrink: 0,
                      }}>
                        {banner.imageUrl && (
                          <img src={banner.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {banner.title || `Banner ${idx + 1}`}
                          </div>
                          {banner.showOverlay && (
                            <span style={{
                              fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 4,
                              background: isLight ? '#e0f2fe' : 'rgba(56,189,248,.15)',
                              color: isLight ? '#0369a1' : '#38bdf8',
                              whiteSpace: 'nowrap',
                            }}>TEXT</span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: C.textDim, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {banner.showOverlay ? (banner.overlayTitle || banner.linkUrl || 'No link') : (banner.linkUrl || 'No link')}
                        </div>
                      </div>

                      {/* Toggle */}
                      <div
                        onClick={() => handleToggleBanner(banner.id, !banner.isActive)}
                        style={{
                          width: 40, height: 22, borderRadius: 11, cursor: 'pointer', flexShrink: 0,
                          background: banner.isActive ? '#22c55e' : (isLight ? '#d4d4d4' : '#444'),
                          position: 'relative', transition: 'background .2s',
                        }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 9, background: '#fff',
                          position: 'absolute', top: 2,
                          left: banner.isActive ? 20 : 2,
                          transition: 'left .2s', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
                        }} />
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        style={{
                          width: 32, height: 32, borderRadius: 8, border: 'none',
                          background: 'transparent', color: '#ef4444', fontSize: 16,
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add banner form (inline) */}
                {showAddBanner && (
                  <div style={{
                    marginTop: 16, padding: 20, borderRadius: 12,
                    border: `1px dashed ${C.accent}`, background: isLight ? '#f8faff' : 'rgba(59,130,246,.05)',
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textSecond, marginBottom: 4, display: 'block' }}>Banner Image</label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          style={{ display: 'none' }}
                        />
                        {!newImageUrl ? (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            style={{
                              width: '100%', height: 140, borderRadius: 12,
                              border: `2px dashed ${dragOver ? C.accent : C.cardBorder}`,
                              background: dragOver ? (isLight ? '#eff6ff' : 'rgba(59,130,246,.08)') : (isLight ? '#fafafa' : '#1a1a1a'),
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                              gap: 8, cursor: 'pointer', transition: 'all .2s',
                            }}
                          >
                            {uploading ? (
                              <>
                                <div style={{ fontSize: 28 }}>⏳</div>
                                <span style={{ fontSize: 13, color: C.textDim }}>{uploadProgress}</span>
                              </>
                            ) : (
                              <>
                                <div style={{ fontSize: 32 }}>📷</div>
                                <span style={{ fontSize: 13, fontWeight: 500, color: C.textSecond }}>
                                  Click to upload or drag & drop
                                </span>
                                <span style={{ fontSize: 11, color: C.textDim }}>
                                  JPG, PNG, WebP, GIF — Max 10MB
                                </span>
                              </>
                            )}
                          </div>
                        ) : (
                          <div style={{ position: 'relative', width: '100%', height: 140, borderRadius: 12, overflow: 'hidden', background: C.hover }}>
                            <img src={newImageUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <button
                              onClick={() => { setNewImageUrl(''); }}
                              style={{
                                position: 'absolute', top: 8, right: 8,
                                width: 28, height: 28, borderRadius: 14, border: 'none',
                                background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 14,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >✕</button>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              style={{
                                position: 'absolute', bottom: 8, right: 8,
                                padding: '5px 12px', borderRadius: 8, border: 'none',
                                background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 12, fontWeight: 500,
                                cursor: 'pointer',
                              }}
                            >Change</button>
                          </div>
                        )}
                      </div>
                      {/* Overlay toggle */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: 10,
                        border: `1px solid ${C.cardBorder}`, background: C.bg,
                      }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>Text Overlay</div>
                          <div style={{ fontSize: 11, color: C.textDim, marginTop: 1 }}>Show title & description over the banner image</div>
                        </div>
                        <div
                          onClick={() => setNewShowOverlay(!newShowOverlay)}
                          style={{
                            width: 40, height: 22, borderRadius: 11, cursor: 'pointer', flexShrink: 0,
                            background: newShowOverlay ? C.accent : (isLight ? '#d4d4d4' : '#444'),
                            position: 'relative', transition: 'background .2s',
                          }}>
                          <div style={{
                            width: 18, height: 18, borderRadius: 9, background: '#fff',
                            position: 'absolute', top: 2,
                            left: newShowOverlay ? 20 : 2,
                            transition: 'left .2s', boxShadow: '0 1px 2px rgba(0,0,0,.2)',
                          }} />
                        </div>
                      </div>
                      {newShowOverlay && (
                        <>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: C.textSecond, marginBottom: 4, display: 'block' }}>Overlay Title</label>
                            <input value={newOverlayTitle} onChange={e => setNewOverlayTitle(e.target.value)} placeholder="e.g. 50% Off Today" style={inputStyle} />
                          </div>
                          <div>
                            <label style={{ fontSize: 12, fontWeight: 600, color: C.textSecond, marginBottom: 4, display: 'block' }}>Overlay Description</label>
                            <input value={newOverlayDesc} onChange={e => setNewOverlayDesc(e.target.value)} placeholder="e.g. On all iced drinks" style={inputStyle} />
                          </div>
                        </>
                      )}
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textSecond, marginBottom: 4, display: 'block' }}>Link Type</label>
                        <select value={newLinkType} onChange={e => setNewLinkType(e.target.value)}
                          style={{ ...inputStyle, cursor: 'pointer' }}>
                          <option value="external">External URL</option>
                          <option value="product">Product</option>
                          <option value="category">Category</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 12, fontWeight: 600, color: C.textSecond, marginBottom: 4, display: 'block' }}>Link URL / ID</label>
                        <input value={newLinkUrl} onChange={e => setNewLinkUrl(e.target.value)} placeholder="https://... or product/category ID" style={inputStyle} />
                      </div>
                      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                        <button onClick={() => setShowAddBanner(false)} style={btnOutline}>Cancel</button>
                        <button onClick={handleAddBanner} disabled={saving || uploading || !newImageUrl.trim()} style={{ ...btnPrimary, opacity: saving || uploading || !newImageUrl.trim() ? 0.5 : 1 }}>
                          {saving ? 'Saving...' : 'Save Banner'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Live Preview */}
            {settings.bannerEnabled && banners.filter(b => b.isActive).length > 0 && (
              <div style={{
                marginTop: 20, background: C.card, border: `1px solid ${C.cardBorder}`, borderRadius: 14, padding: 24,
              }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textDim, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: .5 }}>
                  📱 Live Preview
                </h3>
                <div style={{
                  maxWidth: 340, margin: '0 auto', background: isLight ? '#f5f5f5' : '#0a0a0a',
                  borderRadius: 20, padding: '20px 16px', border: `2px solid ${C.cardBorder}`,
                }}>
                  {/* Fake search bar */}
                  <div style={{
                    background: isLight ? '#fff' : '#1a1a1a', borderRadius: 20, padding: '10px 14px',
                    fontSize: 13, color: C.textDim, marginBottom: 12,
                    border: `1px solid ${C.cardBorder}`,
                  }}>
                    🔍 Search Berhot Cafe
                  </div>
                  {/* Banner preview */}
                  {(() => {
                    const activeBanner = banners.filter(b => b.isActive)[0];
                    return (
                      <div style={{
                        borderRadius: 14, overflow: 'hidden', height: 110,
                        background: C.hover, position: 'relative',
                      }}>
                        <img
                          src={activeBanner?.imageUrl}
                          alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        {activeBanner?.showOverlay && (activeBanner.overlayTitle || activeBanner.overlayDescription) && (
                          <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0,
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.65))',
                            padding: '24px 12px 10px',
                          }}>
                            {activeBanner.overlayTitle && (
                              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                                {activeBanner.overlayTitle}
                              </div>
                            )}
                            {activeBanner.overlayDescription && (
                              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', marginTop: 2 }}>
                                {activeBanner.overlayDescription}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  {settings.bannerMode === 'slider' && banners.filter(b => b.isActive).length > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginTop: 8 }}>
                      {banners.filter(b => b.isActive).map((_, i) => (
                        <div key={i} style={{
                          width: i === 0 ? 18 : 6, height: 6, borderRadius: 3,
                          background: i === 0 ? C.accent : C.textDim, opacity: i === 0 ? 1 : 0.4,
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: '#1a1a1a', color: '#fff', padding: '10px 24px', borderRadius: 10,
          fontSize: 14, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 20px rgba(0,0,0,.3)',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
