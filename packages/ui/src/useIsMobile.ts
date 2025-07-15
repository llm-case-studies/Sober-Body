import { useState, useEffect } from 'react';

export function useIsMobile(maxWidth: number = 640) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const match = window.matchMedia(`(max-width: ${maxWidth}px)`).matches;
      if (match !== isMobile) {
        setIsMobile(match);
      }
    };

    checkDevice();

    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, [isMobile, maxWidth]);

  return isMobile;
}

