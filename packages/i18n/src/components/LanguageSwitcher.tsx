import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from '../hooks/useTranslation';
import type { Lang } from '../types';

interface LanguageSwitcherProps {
  className?: string;
}

const LANG_OPTIONS: { value: Lang; label: string; nativeLabel: string }[] = [
  { value: 'en', label: 'EN', nativeLabel: 'English' },
  { value: 'ar', label: 'AR', nativeLabel: 'العربية' },
];

function LangTransitionOverlay({ visible, onDone }: { visible: boolean; onDone: () => void }) {
  const [phase, setPhase] = useState<'enter' | 'exit' | 'hidden'>('hidden');

  useEffect(() => {
    if (visible) {
      setPhase('enter');
      // After the new lang has rendered, start fading out
      const timer = setTimeout(() => setPhase('exit'), 350);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  useEffect(() => {
    if (phase === 'exit') {
      const timer = setTimeout(() => {
        setPhase('hidden');
        onDone();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [phase, onDone]);

  if (phase === 'hidden') return null;

  return createPortal(
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white',
        opacity: phase === 'enter' ? 1 : 0,
        transition: 'opacity 300ms ease-out',
        pointerEvents: phase === 'enter' ? 'all' : 'none',
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: 28,
          height: 28,
          border: '3px solid #e5e7eb',
          borderTopColor: '#111827',
          borderRadius: '50%',
          animation: 'lang-spin 0.6s linear infinite',
        }}
      />
      <style>{`@keyframes lang-spin { to { transform: rotate(360deg) } }`}</style>
    </div>,
    document.body
  );
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { lang, setLang } = useTranslation();
  const [switching, setSwitching] = useState(false);

  const handleSwitch = useCallback(
    (newLang: Lang) => {
      if (newLang === lang) return;
      setSwitching(true);
      // Small delay so overlay paints before URL change triggers re-render
      requestAnimationFrame(() => {
        setLang(newLang);
      });
    },
    [lang, setLang]
  );

  const handleDone = useCallback(() => setSwitching(false), []);

  return (
    <>
      <LangTransitionOverlay visible={switching} onDone={handleDone} />
      <div className={`flex items-center gap-1 ${className}`}>
        {LANG_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleSwitch(option.value)}
            title={option.nativeLabel}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
              lang === option.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </>
  );
}
