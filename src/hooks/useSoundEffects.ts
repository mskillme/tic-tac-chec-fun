import { useCallback, useRef, useEffect } from 'react';

type SoundType = 'place' | 'move' | 'capture' | 'win' | 'lose' | 'select' | 'invalid';

// Sound generation using Web Audio API
const createAudioContext = () => {
  return new (window.AudioContext || (window as any).webkitAudioContext)();
};

export const useSoundEffects = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(true);

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
      audioContextRef.current = createAudioContext();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume: number = 0.3
  ) => {
    if (!enabledRef.current) return;

    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [getAudioContext]);

  const playSound = useCallback((sound: SoundType) => {
    if (!enabledRef.current) return;

    switch (sound) {
      case 'place':
        playTone(400, 0.1, 'sine', 0.2);
        setTimeout(() => playTone(600, 0.15, 'sine', 0.15), 50);
        break;
      case 'move':
        playTone(350, 0.08, 'triangle', 0.15);
        setTimeout(() => playTone(450, 0.12, 'triangle', 0.1), 40);
        break;
      case 'capture':
        playTone(200, 0.15, 'sawtooth', 0.2);
        setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.15), 100);
        break;
      case 'win':
        [0, 100, 200, 300, 400].forEach((delay, i) => {
          setTimeout(() => playTone(400 + i * 100, 0.2, 'sine', 0.2), delay);
        });
        break;
      case 'lose':
        playTone(300, 0.3, 'sawtooth', 0.2);
        setTimeout(() => playTone(200, 0.4, 'sawtooth', 0.15), 200);
        break;
      case 'select':
        playTone(500, 0.05, 'sine', 0.1);
        break;
      case 'invalid':
        playTone(150, 0.2, 'square', 0.1);
        break;
    }
  }, [playTone]);

  const setEnabled = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
  }, []);

  return { playSound, setEnabled, isEnabled: () => enabledRef.current };
};
