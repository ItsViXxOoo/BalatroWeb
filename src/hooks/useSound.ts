import { useCallback, useRef } from 'react';

export type SoundName = 'click' | 'card' | 'score' | 'win' | 'lose' | 'coin' | 'buy';

type ToneOptions = {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
  slideTo?: number;
};

export function useSound(muted: boolean) {
  const contextRef = useRef<AudioContext | null>(null);

  const getContext = useCallback(() => {
    if (!contextRef.current) {
      contextRef.current = new AudioContext();
    }
    if (contextRef.current.state === 'suspended') {
      void contextRef.current.resume();
    }
    return contextRef.current;
  }, []);

  const tone = useCallback(
    (context: AudioContext, options: ToneOptions) => {
      const start = context.currentTime + (options.delay ?? 0);
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = options.type ?? 'square';
      oscillator.frequency.setValueAtTime(options.frequency, start);
      if (options.slideTo) {
        oscillator.frequency.exponentialRampToValueAtTime(options.slideTo, start + options.duration);
      }
      const volume = options.gain ?? 0.035;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + options.duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + options.duration + 0.02);
    },
    [],
  );

  const play = useCallback(
    (name: SoundName) => {
      if (muted) return;

      try {
        const context = getContext();
        switch (name) {
          case 'click':
            tone(context, { frequency: 420, duration: 0.05, type: 'square', gain: 0.02 });
            break;
          case 'card':
            tone(context, { frequency: 680, duration: 0.06, type: 'triangle', gain: 0.025 });
            break;
          case 'score':
            tone(context, { frequency: 440, duration: 0.09, type: 'square' });
            tone(context, { frequency: 660, duration: 0.1, type: 'square', delay: 0.08 });
            tone(context, { frequency: 880, duration: 0.14, type: 'triangle', delay: 0.16 });
            break;
          case 'coin':
            tone(context, { frequency: 980, duration: 0.05, type: 'square', gain: 0.025 });
            tone(context, { frequency: 1320, duration: 0.09, type: 'square', gain: 0.025, delay: 0.05 });
            break;
          case 'buy':
            tone(context, { frequency: 320, duration: 0.08, type: 'triangle' });
            tone(context, { frequency: 520, duration: 0.1, type: 'triangle', delay: 0.07 });
            tone(context, { frequency: 780, duration: 0.14, type: 'triangle', delay: 0.14 });
            break;
          case 'win':
            [523, 659, 784, 1046].forEach((frequency, index) => {
              tone(context, {
                frequency,
                duration: 0.18,
                type: 'square',
                delay: index * 0.11,
                gain: 0.03,
              });
            });
            break;
          case 'lose':
            [330, 262, 196].forEach((frequency, index) => {
              tone(context, {
                frequency,
                duration: 0.24,
                type: 'triangle',
                delay: index * 0.16,
                gain: 0.035,
              });
            });
            break;
          default:
            break;
        }
      } catch {
        // Audio no disponible: el juego no se detiene por eso.
      }
    },
    [getContext, muted, tone],
  );

  return { play };
}

export type PlaySound = ReturnType<typeof useSound>['play'];
