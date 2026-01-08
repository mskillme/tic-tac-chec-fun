import { useCallback, useRef } from 'react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

type HapticType = 'place' | 'move' | 'capture' | 'win' | 'lose' | 'select' | 'invalid';

export const useHaptics = () => {
  const enabledRef = useRef(true);

  const vibrate = useCallback(async (type: HapticType) => {
    if (!enabledRef.current) return;

    try {
      switch (type) {
        case 'select':
          await Haptics.selectionChanged();
          break;
        case 'place':
          await Haptics.impact({ style: ImpactStyle.Medium });
          break;
        case 'move':
          await Haptics.impact({ style: ImpactStyle.Light });
          break;
        case 'capture':
          await Haptics.impact({ style: ImpactStyle.Heavy });
          break;
        case 'win':
          await Haptics.notification({ type: NotificationType.Success });
          break;
        case 'lose':
          await Haptics.notification({ type: NotificationType.Error });
          break;
        case 'invalid':
          await Haptics.notification({ type: NotificationType.Warning });
          break;
      }
    } catch {
      // Silently fail if haptics not available (web browser)
    }
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  const isSupported = useCallback(() => true, []);

  return { vibrate, setEnabled, isEnabled: () => enabledRef.current, isSupported };
};
