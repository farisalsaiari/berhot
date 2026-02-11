import { useCallback, useEffect, useRef, useState } from 'react';

export interface SessionTimeoutConfig {
  /** Total idle time before session expires (ms). Default: 15 * 60 * 1000 */
  timeoutMs?: number;
  /** Time before expiry to show warning (ms). Default: 5 * 60 * 1000 */
  warningMs?: number;
  /** Callback when session fully expires */
  onTimeout: () => void;
  /** Whether the hook is active. Default: true */
  enabled?: boolean;
}

export interface SessionTimeoutState {
  /** Current phase: active (normal), warning (countdown shown), expired (timed out) */
  phase: 'active' | 'warning' | 'expired';
  /** Seconds remaining in countdown (only meaningful during 'warning' phase) */
  secondsLeft: number;
  /** Reset the idle timer — user clicked "Continue" */
  continueSession: () => void;
  /** Extend session by additional milliseconds and reset to active */
  extendSession: (additionalMs: number) => void;
}

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
const THROTTLE_MS = 500;

export function useSessionTimeout(config: SessionTimeoutConfig): SessionTimeoutState {
  const {
    timeoutMs = 15 * 60 * 1000,
    warningMs = 5 * 60 * 1000,
    onTimeout,
    enabled = true,
  } = config;

  const [phase, setPhase] = useState<'active' | 'warning' | 'expired'>('active');
  const [secondsLeft, setSecondsLeft] = useState(Math.floor(warningMs / 1000));

  // Refs for timers
  const idleTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const countdownRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const lastActivityRef = useRef<number>(Date.now());
  const warningStartRef = useRef<number>(0);
  const totalWarningMsRef = useRef<number>(warningMs);
  const phaseRef = useRef(phase);
  const onTimeoutRef = useRef(onTimeout);
  const currentTimeoutMsRef = useRef(timeoutMs);

  // Keep refs in sync
  phaseRef.current = phase;
  onTimeoutRef.current = onTimeout;

  // Clear all timers
  const clearAllTimers = useCallback(() => {
    clearTimeout(idleTimerRef.current);
    clearInterval(countdownRef.current);
  }, []);

  // Start the idle timer (time before warning appears)
  const startIdleTimer = useCallback(() => {
    clearAllTimers();
    const idleDuration = currentTimeoutMsRef.current - totalWarningMsRef.current;
    idleTimerRef.current = setTimeout(() => {
      // Transition to warning phase
      setPhase('warning');
      warningStartRef.current = Date.now();
      setSecondsLeft(Math.floor(totalWarningMsRef.current / 1000));

      // Start countdown interval — calculate from elapsed time for accuracy
      countdownRef.current = setInterval(() => {
        const elapsed = Date.now() - warningStartRef.current;
        const remaining = Math.max(0, Math.ceil((totalWarningMsRef.current - elapsed) / 1000));
        setSecondsLeft(remaining);

        if (remaining <= 0) {
          clearInterval(countdownRef.current);
          setPhase('expired');
          onTimeoutRef.current();
        }
      }, 1000);
    }, idleDuration);
  }, [clearAllTimers]);

  // Continue session — reset to active
  const continueSession = useCallback(() => {
    clearAllTimers();
    currentTimeoutMsRef.current = timeoutMs;
    totalWarningMsRef.current = warningMs;
    setPhase('active');
    setSecondsLeft(Math.floor(warningMs / 1000));
    lastActivityRef.current = Date.now();
    startIdleTimer();
  }, [clearAllTimers, startIdleTimer, timeoutMs, warningMs]);

  // Extend session — add time and reset to active
  const extendSession = useCallback((additionalMs: number) => {
    clearAllTimers();
    currentTimeoutMsRef.current = timeoutMs + additionalMs;
    totalWarningMsRef.current = warningMs;
    setPhase('active');
    setSecondsLeft(Math.floor(warningMs / 1000));
    lastActivityRef.current = Date.now();
    startIdleTimer();
  }, [clearAllTimers, startIdleTimer, timeoutMs, warningMs]);

  // Activity handler — only resets during active phase
  useEffect(() => {
    if (!enabled) return;

    const handleActivity = () => {
      // Only reset during active phase
      if (phaseRef.current !== 'active') return;

      // Throttle
      const now = Date.now();
      if (now - lastActivityRef.current < THROTTLE_MS) return;
      lastActivityRef.current = now;

      // Restart idle timer
      clearTimeout(idleTimerRef.current);
      const idleDuration = currentTimeoutMsRef.current - totalWarningMsRef.current;
      idleTimerRef.current = setTimeout(() => {
        setPhase('warning');
        warningStartRef.current = Date.now();
        setSecondsLeft(Math.floor(totalWarningMsRef.current / 1000));

        countdownRef.current = setInterval(() => {
          const elapsed = Date.now() - warningStartRef.current;
          const remaining = Math.max(0, Math.ceil((totalWarningMsRef.current - elapsed) / 1000));
          setSecondsLeft(remaining);

          if (remaining <= 0) {
            clearInterval(countdownRef.current);
            setPhase('expired');
            onTimeoutRef.current();
          }
        }, 1000);
      }, idleDuration);
    };

    ACTIVITY_EVENTS.forEach(event => {
      window.addEventListener(event, handleActivity, { passive: true, capture: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach(event => {
        window.removeEventListener(event, handleActivity, true);
      });
    };
  }, [enabled]);

  // Initial idle timer start
  useEffect(() => {
    if (!enabled) {
      clearAllTimers();
      setPhase('active');
      return;
    }

    startIdleTimer();

    return () => {
      clearAllTimers();
    };
  }, [enabled, startIdleTimer, clearAllTimers]);

  return { phase, secondsLeft, continueSession, extendSession };
}
