import { useRef, useState, useEffect, useImperativeHandle, forwardRef, type KeyboardEvent, type ClipboardEvent } from 'react';

export interface OtpInputHandle {
  reset: () => void;
  focus: () => void;
}

interface OtpInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
  error?: string;
}

export const OtpInput = forwardRef<OtpInputHandle, OtpInputProps>(
  ({ length = 6, onComplete, disabled = false, error }, ref) => {
    const [values, setValues] = useState<string[]>(Array(length).fill(''));
    const [shaking, setShaking] = useState(false);
    const refs = useRef<(HTMLInputElement | null)[]>([]);

    // Shake on new error
    useEffect(() => {
      if (error) {
        setShaking(true);
        const timer = setTimeout(() => setShaking(false), 500);
        return () => clearTimeout(timer);
      }
    }, [error]);

    useImperativeHandle(ref, () => ({
      reset: () => {
        setValues(Array(length).fill(''));
        setTimeout(() => refs.current[0]?.focus(), 50);
      },
      focus: () => {
        refs.current[0]?.focus();
      },
    }));

    const handleChange = (index: number, value: string) => {
      const digit = value.replace(/\D/g, '').slice(-1);
      const newValues = [...values];
      newValues[index] = digit;
      setValues(newValues);

      if (digit && index < length - 1) {
        refs.current[index + 1]?.focus();
      }

      const code = newValues.join('');
      if (code.length === length && !newValues.includes('')) {
        onComplete(code);
      }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !values[index] && index > 0) {
        refs.current[index - 1]?.focus();
        const newValues = [...values];
        newValues[index - 1] = '';
        setValues(newValues);
      }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      if (!pasted) return;

      const newValues = [...values];
      for (let i = 0; i < pasted.length; i++) {
        newValues[i] = pasted[i];
      }
      setValues(newValues);

      const nextIndex = Math.min(pasted.length, length - 1);
      refs.current[nextIndex]?.focus();

      if (pasted.length === length) {
        onComplete(pasted);
      }
    };

    const hasError = !!error;

    return (
      <div>
        <div
          className={`flex gap-2 justify-center ${shaking ? 'animate-shake' : ''}`}
          dir="ltr"
          style={shaking ? {
            animation: 'shake 0.5s ease-in-out',
          } : undefined}
        >
          {values.map((value, index) => (
            <input
              key={index}
              ref={(el) => { refs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={value}
              disabled={disabled}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={index === 0 ? handlePaste : undefined}
              className={`w-11 h-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                hasError
                  ? 'border-red-400 focus:ring-red-500 text-red-600'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } ${disabled ? 'bg-gray-50 text-gray-400' : 'bg-white text-gray-900'}`}
              autoComplete="one-time-code"
            />
          ))}
        </div>
        {error && (
          <p className="text-sm text-red-600 text-center mt-3">{error}</p>
        )}
        {/* Inline keyframes for shake animation */}
        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 50%, 90% { transform: translateX(-4px); }
            30%, 70% { transform: translateX(4px); }
          }
        `}</style>
      </div>
    );
  }
);

OtpInput.displayName = 'OtpInput';
