import { useTranslation } from './useTranslation';
import type { Dir } from '../types';

interface UseDirectionReturn {
  dir: Dir;
  isRTL: boolean;
  isLTR: boolean;
}

export function useDirection(): UseDirectionReturn {
  const { dir } = useTranslation();
  return {
    dir,
    isRTL: dir === 'rtl',
    isLTR: dir === 'ltr',
  };
}
