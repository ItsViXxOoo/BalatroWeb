import { useEffect, useRef, useState } from 'react';
import type { GrainTransitionOverlayProps, GrainTransitionWrapperProps } from './types';

export function GrainTransitionOverlay({
  isActive,
  config,
  onComplete,
  children,
  className = '',
}: GrainTransitionOverlayProps) {
  const [isMounted, setIsMounted] = useState(isActive);
  const [isExiting, setIsExiting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const startTimeRef = useRef(0);
  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (isActive) {
      setIsMounted(true);
      setIsExiting(false);
      startTimeRef.current = performance.now();
    } else if (isMounted && !prefersReducedMotion.current) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsMounted(false);
        onComplete?.();
      }, config.duration);
      return () => clearTimeout(timer);
    } else if (!isActive) {
      setIsMounted(false);
      onComplete?.();
    }
  }, [isActive, config.duration, onComplete]);

  if (!isMounted) return null;

  const drawNoise = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progress: number
  ) => {
    const { intensity, mode = 'overlay', seed = 12345, color = '#f59e0b' } = config;
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    const random = (x: number, y: number, t: number) => {
      const n = Math.sin(x * 12.9898 + y * 78.233 + t * 43.758 + seed) * 43758.5453;
      return n - Math.floor(n);
    };

    const hexToRgb = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return { r, g, b };
    };

    const { r, g, b } = hexToRgb(color);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const noise = random(x, y, timeRef.current);
        let alpha = 0;

        switch (mode) {
          case 'overlay':
            alpha = noise * intensity * 255;
            break;
          case 'wipe': {
            const wipeProgress = Math.min(1, progress * 2);
            const threshold = 1 - wipeProgress;
            alpha = noise > threshold ? intensity * 255 : 0;
            break;
          }
          case 'dissolve':
            alpha = noise > 1 - progress ? intensity * 255 : 0;
            break;
          case 'crt': {
            const scanline = Math.sin(y * 0.1 + timeRef.current * 5) * 0.5 + 0.5;
            alpha = noise * intensity * scanline * 255;
            break;
          }
        }

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = Math.min(255, Math.max(0, alpha));
      }
    }

    ctx.putImageData(imageData, 0, 0);
  };

  const animate = (timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    timeRef.current = timestamp * 0.001;

    const elapsed = timestamp - startTimeRef.current;
    const progress = isExiting ? 1 - Math.min(1, elapsed / config.duration) : Math.min(1, elapsed / config.duration);

    ctx.clearRect(0, 0, width, height);
    drawNoise(ctx, width, height, progress);

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div
      className={`grain-transition-overlay ${isExiting ? 'exiting' : ''} ${className}`}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} aria-hidden="true" />
      {children}
    </div>
  );
}

export function GrainTransitionWrapper({
  open,
  enterConfig,
  exitConfig,
  onEnterComplete,
  onExitComplete,
  children,
  className = '',
}: GrainTransitionWrapperProps) {
  const [isEntering, setIsEntering] = useState(open);
  const [isExiting, setIsExiting] = useState(false);
  const [showContent, setShowContent] = useState(open);

  useEffect(() => {
    if (open) {
      setShowContent(true);
      setIsEntering(true);
      setIsExiting(false);
      const timer = setTimeout(() => {
        setIsEntering(false);
        onEnterComplete?.();
      }, enterConfig.duration);
      return () => clearTimeout(timer);
    } else {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setIsExiting(false);
        setShowContent(false);
        onExitComplete?.();
      }, exitConfig.duration);
      return () => clearTimeout(timer);
    }
  }, [open, enterConfig.duration, exitConfig.duration, onEnterComplete, onExitComplete]);

  return (
    <div className={`grain-transition-wrapper ${className}`}>
      {isEntering && (
        <GrainTransitionOverlay
          isActive={true}
          config={enterConfig}
          onComplete={onEnterComplete}
        />
      )}
      <div className="grain-transition-content" style={{ opacity: showContent ? 1 : 0 }}>
        {children}
      </div>
      {isExiting && (
        <GrainTransitionOverlay
          isActive={true}
          config={exitConfig}
          onComplete={onExitComplete}
        />
      )}
    </div>
  );
}