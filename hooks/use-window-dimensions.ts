import { useEffect, useState } from 'react';
import { Dimensions, ScaledSize } from 'react-native';

const MOBILE_BREAKPOINT = 430;

export function useWindowDimensions() {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height, isMobile: width <= MOBILE_BREAKPOINT };
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }: { window: ScaledSize }) => {
      setDimensions({
        width: window.width,
        height: window.height,
        isMobile: window.width <= MOBILE_BREAKPOINT,
      });
    });

    return () => subscription?.remove();
  }, []);

  return dimensions;
}

