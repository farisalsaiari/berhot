import { useState, useEffect, useRef } from 'react';
import { useTranslation } from '@berhot/i18n';
import { fetchMyTenant } from '../lib/api';

interface ProToolsProps {
  C: Record<string, string>;
  isLight: boolean;
  currentPlan: string;
  planExpiresAt: string | null;
  navigate: (path: string) => void;
  lang: string;
}

const PLAN_ORDER = ['free', 'starter', 'professional', 'enterprise'];

export default function ProToolsContent({ C, isLight, currentPlan, planExpiresAt, navigate, lang }: ProToolsProps) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState('');
  const [expired, setExpired] = useState(false);
  const [livePlan, setLivePlan] = useState(currentPlan);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isPro = PLAN_ORDER.indexOf(livePlan) >= PLAN_ORDER.indexOf('professional');

  // Countdown timer for plan expiry
  useEffect(() => {
    if (!planExpiresAt || !isPro) return;

    const update = () => {
      const now = Date.now();
      const exp = new Date(planExpiresAt).getTime();
      const diff = exp - now;
      if (diff <= 0) {
        setTimeLeft('0:00');
        setExpired(true);
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${mins}:${secs.toString().padStart(2, '0')}`);
    };
    update();
    timerRef.current = setInterval(update, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [planExpiresAt, isPro]);

  // Poll for plan changes (auto-downgrade detection)
  useEffect(() => {
    pollRef.current = setInterval(async () => {
      try {
        const tenant = await fetchMyTenant();
        if (tenant.plan !== livePlan) {
          setLivePlan(tenant.plan);
          if (PLAN_ORDER.indexOf(tenant.plan) < PLAN_ORDER.indexOf('professional')) {
            setExpired(true);
          }
        }
      } catch { /* ignore */ }
    }, 10000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [livePlan]);

  // When expired, check if plan was actually downgraded
  useEffect(() => {
    if (!expired) return;
    const check = async () => {
      try {
        const tenant = await fetchMyTenant();
        setLivePlan(tenant.plan);
      } catch { /* ignore */ }
    };
    check();
  }, [expired]);

  // Not on Professional plan — show upgrade prompt
  if (!isPro || expired) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '60px 30px', textAlign: 'center' }}>
        {/* Lock icon */}
        <div style={{
          width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
          background: isLight ? '#f3f4f6' : C.hover,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={C.textSecond} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0110 0v4"/>
          </svg>
        </div>

        {expired ? (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 8px' }}>
              {t('proTools.trialExpired')}
            </h2>
            <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 8px', lineHeight: 1.6 }}>
              {t('proTools.trialExpiredDesc')}
            </p>
            <p style={{ fontSize: 13, color: '#ef4444', fontWeight: 500, margin: '0 0 28px' }}>
              {t('proTools.downgradedToStarter')}
            </p>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: '0 0 8px' }}>
              {t('proTools.upgradeRequired')}
            </h2>
            <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 28px', lineHeight: 1.6 }}>
              {t('proTools.upgradeDesc')}
            </p>
          </>
        )}

        {/* Feature preview cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 32, textAlign: 'start' }}>
          {[
            { icon: '\u26A1', title: t('proTools.featureAdvancedAnalytics'), desc: t('proTools.featureAdvancedAnalyticsDesc') },
            { icon: '\uD83D\uDD17', title: t('proTools.featureApiAccess'), desc: t('proTools.featureApiAccessDesc') },
            { icon: '\uD83C\uDFA8', title: t('proTools.featureWhiteLabel'), desc: t('proTools.featureWhiteLabelDesc') },
            { icon: '\uD83D\uDD14', title: t('proTools.featurePrioritySupport'), desc: t('proTools.featurePrioritySupportDesc') },
          ].map((f, i) => (
            <div key={i} style={{
              padding: 16, borderRadius: 12,
              background: isLight ? '#f9fafb' : C.card,
              border: `1px solid ${C.cardBorder}`,
            }}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontSize: 12, color: C.textSecond, lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate(`/${lang}/dashboard/settings/subscription`)}
          style={{
            padding: '12px 32px', fontSize: 14, fontWeight: 600,
            borderRadius: 24, border: 'none', cursor: 'pointer',
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseOut={e => (e.currentTarget.style.transform = 'none')}
        >
          {expired ? t('proTools.resubscribe') : t('proTools.upgradeToPro')}
        </button>
      </div>
    );
  }

  // Professional plan — show the actual Pro Tools page
  return (
    <div style={{ maxWidth: 1100, padding: '30px 30px 60px 30px' }}>
      {/* Header with timer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: C.textPrimary, margin: 0 }}>
            {t('proTools.title')}
          </h2>
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
            padding: '3px 10px', borderRadius: 6,
            background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
            color: '#fff',
          }}>PRO</span>
        </div>

        {/* Countdown timer */}
        {planExpiresAt && timeLeft && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 10,
            background: parseInt(timeLeft) <= 1 ? (isLight ? '#fef2f2' : '#451a1a') : (isLight ? '#eff6ff' : '#1e293b'),
            border: `1px solid ${parseInt(timeLeft) <= 1 ? '#fca5a5' : (isLight ? '#bfdbfe' : '#334155')}`,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={parseInt(timeLeft) <= 1 ? '#ef4444' : '#3b82f6'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: parseInt(timeLeft) <= 1 ? '#ef4444' : C.textPrimary }}>
              {t('proTools.trialEndsIn')} {timeLeft}
            </span>
          </div>
        )}
      </div>
      <p style={{ fontSize: 14, color: C.textSecond, margin: '0 0 18px 0', lineHeight: 1.5 }}>
        {t('proTools.description')}
      </p>
      <div style={{ height: 1, background: C.divider, opacity: 0.4, marginBottom: 28 }} />

      {/* Pro Tools Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {/* Advanced Analytics Card */}
        <ToolCard C={C} isLight={isLight}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4h-4z"/></svg>}
          title={t('proTools.advancedReporting')}
          desc={t('proTools.advancedReportingDesc')}
          accent="#8b5cf6"
        />

        {/* API Console Card */}
        <ToolCard C={C} isLight={isLight}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 17l6-6-6-6M12 19h8"/></svg>}
          title={t('proTools.apiConsole')}
          desc={t('proTools.apiConsoleDesc')}
          accent="#3b82f6"
        />

        {/* Custom Integrations Card */}
        <ToolCard C={C} isLight={isLight}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>}
          title={t('proTools.customIntegrations')}
          desc={t('proTools.customIntegrationsDesc')}
          accent="#10b981"
        />

        {/* White Label Card */}
        <ToolCard C={C} isLight={isLight}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813h6.175l-4.999 3.622L17 18.248 12 14.626l-5 3.622 1.912-5.813L3.913 8.813h6.175z"/></svg>}
          title={t('proTools.whiteLabel')}
          desc={t('proTools.whiteLabelDesc')}
          accent="#f59e0b"
        />

        {/* Bulk Operations Card */}
        <ToolCard C={C} isLight={isLight}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><path d="M12 12v4"/><path d="M8 12v4"/><path d="M16 12v4"/></svg>}
          title={t('proTools.bulkOperations')}
          desc={t('proTools.bulkOperationsDesc')}
          accent="#ec4899"
        />

        {/* Priority Support Card */}
        <ToolCard C={C} isLight={isLight}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
          title={t('proTools.prioritySupport')}
          desc={t('proTools.prioritySupportDesc')}
          accent="#06b6d4"
        />
      </div>
    </div>
  );
}

function ToolCard({ C, isLight, icon, title, desc, accent }: {
  C: Record<string, string>; isLight: boolean;
  icon: React.ReactNode; title: string; desc: string; accent: string;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: 20, borderRadius: 14,
        background: isLight ? '#fff' : C.card,
        border: `1.5px solid ${hovered ? accent + '60' : C.cardBorder}`,
        boxShadow: hovered ? `0 4px 16px ${accent}15` : '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.2s',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 10, marginBottom: 14,
        background: accent + '15',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, margin: '0 0 6px' }}>{title}</h3>
      <p style={{ fontSize: 12, color: C.textSecond, margin: 0, lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}
