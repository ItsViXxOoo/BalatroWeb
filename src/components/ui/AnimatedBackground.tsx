import { useEffect, useRef, useMemo, useContext, createContext, useState, type ReactNode } from 'react';
import type { GameState } from '../../game/engine';

// Tipos internos para el contexto de tema
type BackgroundTheme = 'normal' | 'shop' | 'boss' | 'gameover' | 'menu';

interface BackgroundThemeContextValue {
  theme: BackgroundTheme;
  setGameState: (state: GameState | null) => void;
}

const BackgroundThemeContext = createContext<BackgroundThemeContextValue | null>(null);

interface BackgroundThemeProviderProps {
  children: ReactNode;
  gameState?: GameState | null;
}

function BackgroundThemeProviderInner({ children, gameState: initialGameState }: BackgroundThemeProviderProps) {
  const [theme, setTheme] = useState<BackgroundTheme>('menu');
  const [gameState, setGameStateState] = useState<GameState | null>(initialGameState ?? null);

  const calculateTheme = (state: GameState | null): BackgroundTheme => {
    if (!state) return 'menu';
    const { phase, roundIndex } = state;
    if (phase === 'shop') return 'shop';
    if (phase === 'runLost') return 'gameover';
    if (roundIndex >= 2 && (phase === 'playing' || phase === 'roundIntro' || phase === 'roundWon')) {
      return 'boss';
    }
    if (phase === 'playing' || phase === 'roundIntro' || phase === 'roundWon') {
      return 'normal';
    }
    if (phase === 'runComplete') return 'normal';
    return 'menu';
  };

  useEffect(() => {
    setTheme(calculateTheme(gameState));
  }, [gameState]);

  const setGameState = (newState: GameState | null) => {
    setGameStateState(newState);
  };

  return (
    <BackgroundThemeContext.Provider value={{ theme, setGameState }}>
      {children}
    </BackgroundThemeContext.Provider>
  );
}

function useBackgroundThemeValue(): BackgroundTheme {
  const context = useContext(BackgroundThemeContext);
  if (!context) {
    return 'menu';
  }
  return context.theme;
}

interface WaveLayer {
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
  color: string;
  opacity: number;
  yOffset: number;
}

interface AnimatedBackgroundProps {
  className?: string;
}

function AnimatedBackgroundCanvas({ className }: AnimatedBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const wavesRef = useRef<WaveLayer[]>([]);
  const theme = useBackgroundThemeValue();

  const waveConfigs = useMemo(() => {
    const baseWaves: Omit<WaveLayer, 'color'>[] = [
      { amplitude: 40, frequency: 0.008, speed: 0.3, phase: 0, opacity: 0.4, yOffset: 0.6 },
      { amplitude: 60, frequency: 0.005, speed: 0.2, phase: Math.PI / 3, opacity: 0.3, yOffset: 0.5 },
      { amplitude: 30, frequency: 0.012, speed: 0.5, phase: Math.PI / 2, opacity: 0.25, yOffset: 0.7 },
      { amplitude: 50, frequency: 0.006, speed: 0.15, phase: Math.PI, opacity: 0.2, yOffset: 0.4 },
    ];

    const themeColors: Record<string, string[]> = {
      normal: ['#4ade80', '#22c55e', '#16a34a', '#15803d'],
      shop: ['#93c5fd', '#60a5fa', '#3b82f6', '#2563eb'],
      boss: ['#f87171', '#ef4444', '#dc2626', '#b91c1c'],
      gameover: ['#7f1d1d', '#991b1b', '#b91c1c', '#ef4444'],
      menu: ['#4ade80', '#22c55e', '#16a34a', '#15803d'],
    };

    const colors = themeColors[theme] || themeColors.normal;

    return baseWaves.map((wave, i) => ({
      ...wave,
      color: colors[i % colors.length],
    }));
  }, [theme]);

  useEffect(() => {
    wavesRef.current = waveConfigs;
  }, [waveConfigs]);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  };

  const drawWave = (
    ctx: CanvasRenderingContext2D,
    wave: WaveLayer,
    time: number,
    width: number,
    height: number
  ) => {
    const { amplitude, frequency, speed, phase, color, opacity, yOffset } = wave;
    const yBase = height * yOffset;

    ctx.beginPath();
    ctx.moveTo(0, height);

    for (let x = 0; x <= width; x += 4) {
      const y =
        yBase +
        Math.sin(x * frequency + time * speed + phase) * amplitude +
        Math.sin(x * frequency * 2.3 + time * speed * 1.7 + phase * 1.5) * (amplitude * 0.3) +
        Math.sin(x * frequency * 0.5 + time * speed * 0.7 + phase * 0.5) * (amplitude * 0.5);
      ctx.lineTo(x, y);
    }

    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, yBase - amplitude * 2, 0, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.globalAlpha = opacity;
    ctx.fill();
    ctx.globalAlpha = 1;
  };

  const animate = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    timeRef.current = timestamp * 0.001;

    ctx.clearRect(0, 0, width, height);

    wavesRef.current.forEach((wave) => {
      drawWave(ctx, wave, timeRef.current, width, height);
    });

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`animated-background-canvas ${className || ''}`}
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 1,
        pointerEvents: 'none',
      }}
    />
  );
}

export function AnimatedBackground({ children, gameState }: { children: React.ReactNode; gameState?: GameState | null }) {
  return (
    <BackgroundThemeProviderInner gameState={gameState ?? null}>
      <AnimatedBackgroundCanvas />
      {children}
    </BackgroundThemeProviderInner>
  );
}

export { BackgroundThemeProviderInner as BackgroundThemeProvider };
export { useBackgroundThemeValue };
export type { BackgroundTheme };