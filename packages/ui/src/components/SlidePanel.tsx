import { ReactNode, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface SlidePanelProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: number;
}

export function SlidePanel({ open, onClose, children, width = 280 }: SlidePanelProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const frameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (open) {
      // Step 1: mount the DOM (off-screen)
      setAnimating(false);
      setVisible(true);

      // Step 2: wait for browser to paint the off-screen state, then slide in
      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        // Force a layout read to flush the off-screen paint
        document.body.offsetHeight;
        frameRef.current = requestAnimationFrame(() => {
          setAnimating(true);
        });
      });
    } else {
      // Slide out first, then unmount
      cancelAnimationFrame(frameRef.current);
      setAnimating(false);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 250);
    }

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(timerRef.current);
    };
  }, [open]);

  if (!visible) return null;

  const isRTL = typeof document !== 'undefined' && document.documentElement.dir === 'rtl';

  return createPortal(
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          opacity: animating ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Panel — slides from right (LTR) or left (RTL) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          ...(isRTL ? { left: 0 } : { right: 0 }),
          width,
          transform: animating
            ? 'translateX(0)'
            : isRTL ? 'translateX(-100%)' : 'translateX(100%)',
          transition: 'transform 0.25s ease',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 0,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
