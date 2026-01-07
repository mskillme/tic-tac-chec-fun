import { useCallback, useRef } from 'react';

type HapticType = 'place' | 'move' | 'capture' | 'win' | 'lose' | 'select' | 'invalid';

// Vibration patterns (in milliseconds)
const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  select: 10,           // Light tap
  place: 25,            // Firm tap
  move: [15, 50, 15],   // Double tap
  capture: 50,          // Strong pulse
  win: [50, 50, 50, 50, 100], // Celebration
  lose: 200,            // Long buzz
  invalid: [100, 50, 100], // Error shake
};

export const useHaptics = () => {
  const enabledRef = useRef(true);

  const isSupported = useCallback(() => {
    return 'vibrate' in navigator;
  }, []);

  const vibrate = useCallback((type: HapticType) => {
    if (!enabledRef.current || !isSupported()) return;

    try {
      navigator.vibrate(HAPTIC_PATTERNS[type]);
    } catch {
      // Silently fail if vibration not available
    }
  }, [isSupported]);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  return { vibrate, setEnabled, isEnabled: () => enabledRef.current, isSupported };
};
