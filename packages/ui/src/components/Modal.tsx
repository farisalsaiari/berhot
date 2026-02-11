import { ReactNode, useEffect, useRef, useState } from 'react';

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  width?: number;
  closeOnOverlay?: boolean;
}

export function Modal({ open, onClose, children, width = 420, closeOnOverlay = true }: ModalProps) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const frameRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const mountTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (open) {
      // Step 1: mount the DOM in its initial (invisible) state
      setAnimating(false);
      setVisible(true);

      // Step 2: use setTimeout(20ms) to guarantee the browser has painted
      // the initial scale(0.95)/opacity:0 state before we animate in.
      // rAF alone isn't reliable on first mount due to React batching.
      cancelAnimationFrame(frameRef.current);
      clearTimeout(mountTimerRef.current);
      mountTimerRef.current = setTimeout(() => {
        frameRef.current = requestAnimationFrame(() => {
          setAnimating(true);
        });
      }, 20);
    } else {
      // Animate out first, then unmount
      cancelAnimationFrame(frameRef.current);
      clearTimeout(mountTimerRef.current);
      setAnimating(false);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 250);
    }

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(timerRef.current);
      clearTimeout(mountTimerRef.current);
    };
  }, [open]);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* Overlay */}
      <div
        onClick={closeOnOverlay && onClose ? onClose : undefined}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          opacity: animating ? 1 : 0,
          transition: 'opacity 0.25s ease',
        }}
      />

      {/* Modal panel */}
      <div
        style={{
          position: 'relative',
          width,
          maxWidth: 'calc(100vw - 40px)',
          maxHeight: 'calc(100vh - 40px)',
          overflowY: 'auto',
          transform: animating ? 'scale(1)' : 'scale(0.95)',
          opacity: animating ? 1 : 0,
          transition: 'transform 0.25s ease, opacity 0.25s ease',
        }}
      >
        {children}
      </div>
    </div>
  );
}
