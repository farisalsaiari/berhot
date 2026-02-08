import { useState } from 'react';
import { useTranslation } from '@berhot/i18n';

const STORAGE_KEY = 'berhot_auth';
const POS_PRODUCTS_KEY = 'berhot_pos_products';
const LANDING_URL = (import.meta as unknown as { env: Record<string, string> }).env.VITE_LANDING_URL || 'http://localhost:3000';
const APP_PORT = 3001;

const BUSINESS_TYPES = [
  { key: 'Restaurant', name: 'Restaurant POS', nameAr: 'نقاط البيع - مطعم', port: 3001, icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'bg-orange-500' },
  { key: 'Cafe', name: 'Cafe POS', nameAr: 'نقاط البيع - مقهى', port: 3002, icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z', color: 'bg-amber-600' },
  { key: 'Retail', name: 'Retail POS', nameAr: 'نقاط البيع - تجزئة', port: 3003, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4', color: 'bg-emerald-500' },
  { key: 'Appointment', name: 'Appointment POS', nameAr: 'نقاط البيع - مواعيد', port: 3004, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'bg-purple-500' },
];

export default function ChangeBusinessPage() {
  const { t, lang } = useTranslation();
  const isAr = lang === 'ar';
  const [selected, setSelected] = useState<number>(APP_PORT);
  const [switching, setSwitching] = useState(false);

  const currentType = BUSINESS_TYPES.find((b) => b.port === APP_PORT);
  const hasChanged = selected !== APP_PORT;

  const handleSave = () => {
    if (!hasChanged) return;
    setSwitching(true);

    const newProduct = BUSINESS_TYPES.find((b) => b.port === selected);
    if (!newProduct) return;

    try {
      // Update per-user POS product map
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const email = parsed.user?.email || '';

        // Update berhot_pos_products
        const allProducts = JSON.parse(localStorage.getItem(POS_PRODUCTS_KEY) || '{}');
        allProducts[email] = { name: newProduct.name, port: newProduct.port };
        localStorage.setItem(POS_PRODUCTS_KEY, JSON.stringify(allProducts));

        // Update berhot_auth with new posProduct
        parsed.posProduct = { name: newProduct.name, port: newProduct.port };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));

        // Redirect to new POS with auth handoff
        const authHash = btoa(localStorage.getItem(STORAGE_KEY)!);
        setTimeout(() => {
          window.location.href = `http://localhost:${newProduct.port}/${lang}/dashboard/#auth=${authHash}`;
        }, 1000);
      }
    } catch {
      setSwitching(false);
    }
  };

  if (switching) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <p className="text-gray-500 text-sm">{t('changeBusiness.switching')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">{t('changeBusiness.title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('changeBusiness.description')}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 gap-4">
          {BUSINESS_TYPES.map((biz) => {
            const isCurrent = biz.port === APP_PORT;
            const isSelected = biz.port === selected;
            return (
              <button
                key={biz.key}
                onClick={() => setSelected(biz.port)}
                className={`relative flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {isCurrent && (
                  <span className="absolute top-2 ltr:right-2 rtl:left-2 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                    {t('changeBusiness.current')}
                  </span>
                )}
                <div className={`w-12 h-12 ${biz.color} rounded-xl flex items-center justify-center`}>
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d={biz.icon} />
                  </svg>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-sm text-gray-900">{isAr ? biz.nameAr : biz.name}</div>
                </div>
                {isSelected && (
                  <div className="absolute top-2 ltr:left-2 rtl:right-2">
                    <svg className="w-5 h-5 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            {t('changeBusiness.warning')}
          </p>
          <button
            onClick={handleSave}
            disabled={!hasChanged}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              hasChanged
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {t('changeBusiness.save')}
          </button>
        </div>
      </div>
    </div>
  );
}
