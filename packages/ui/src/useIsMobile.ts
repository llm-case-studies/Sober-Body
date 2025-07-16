import { useState, useEffect } from 'react';

export function useIsMobile(maxWidth: number = 640) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      // Check if matchMedia is available (not available in test environments)
      if (typeof window !== 'undefined' && window.matchMedia) {
        const match = window.matchMedia(`(max-width: ${maxWidth}px)`).matches;
        if (match !== isMobile) {
          setIsMobile(match);
        }
      }
    };

    checkDevice();

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkDevice);

      return () => {
        window.removeEventListener('resize', checkDevice);
      };
    }
  }, [isMobile, maxWidth]);

  return isMobile;
}

