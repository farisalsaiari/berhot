interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  label?: string;
  className?: string;
}

const SIZES = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
};

export function LoadingSpinner({
  size = 'md',
  fullScreen = false,
  label,
  className = '',
}: LoadingSpinnerProps) {
  const spinnerEl = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className={`${SIZES[size]} rounded-full border-gray-200 border-t-gray-900 animate-spin`}
      />
      {(label || size === 'lg') && (
        <span className="text-sm text-gray-500 animate-pulse">
          {label || 'Loading...'}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinnerEl}
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {spinnerEl}
    </div>
  );
}
