import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { CardAnimationState, CardPlayAnimationConfig, CardPosition, RequiredCardPlayAnimationConfig } from './types';

const DEFAULT_CONFIG: RequiredCardPlayAnimationConfig = {
  duration: 500,
  staggerDelay: 80,
  centerPosition: { x: 0, y: 0 },
  arcHeight: 120,
  onCardReachCenter: () => {},
  onComplete: () => {},
  reducedMotion: false,
};

interface CardPlayAnimationProps {
  cards: CardAnimationState[];
  config?: Partial<CardPlayAnimationConfig>;
  children: (card: CardAnimationState, index: number, style: React.CSSProperties) => ReactNode;
  className?: string;
}

export function CardPlayAnimation({
  cards,
  config,
  children,
  className = '',
}: CardPlayAnimationProps) {
  const mergedConfig: RequiredCardPlayAnimationConfig = { ...DEFAULT_CONFIG, ...config } as RequiredCardPlayAnimationConfig;
  const [animatedCards, setAnimatedCards] = useState<CardAnimationState[]>(cards);
  const animationRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const startTimeRef = useRef<number>(0);
  const completedRef = useRef<Set<number>>(new Set());

  const prefersReducedMotion = useRef(
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    if (mergedConfig.reducedMotion || prefersReducedMotion.current) {
      setAnimatedCards(
        cards.map((card) => ({
          ...card,
          position: { ...mergedConfig.centerPosition, rotation: 0, scale: 1, zIndex: 100 },
          opacity: 0,
          hasReachedCenter: true,
        }))
      );
      mergedConfig.onComplete();
      return;
    }

    const startTime = performance.now();
    startTimeRef.current = startTime;
    completedRef.current.clear();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const { duration, staggerDelay, centerPosition, arcHeight, onCardReachCenter, onComplete } =
        mergedConfig;

      setAnimatedCards((prev) =>
        prev.map((card, index) => {
          const cardStart = index * staggerDelay;
          const cardElapsed = elapsed - cardStart;

          if (cardElapsed <= 0) {
            return card;
          }

          const progress = Math.min(1, cardElapsed / duration);

          if (progress >= 1 && !completedRef.current.has(index)) {
            completedRef.current.add(index);
            if (cardElapsed >= duration) {
              onCardReachCenter(index, card);
            }
          }

          const easedProgress = 1 - Math.pow(1 - progress, 3);

          const startX = card.position.x;
          const startY = card.position.y;
          const startRotation = card.position.rotation;
          const startScale = card.position.scale;

          const currentX = startX + (centerPosition.x - startX) * easedProgress;
          const arcProgress = Math.sin(easedProgress * Math.PI);
          const currentY = startY + (centerPosition.y - startY) * easedProgress - arcHeight * arcProgress;
          const currentRotation = startRotation + (Math.random() * 40 - 20) * easedProgress;
          const currentScale = startScale + (0.5 - startScale) * easedProgress;

          const hasReachedCenter = progress >= 0.65;
          const opacity = hasReachedCenter ? 1 - (progress - 0.65) / 0.35 : 1;

          return {
            ...card,
            position: {
              x: currentX,
              y: currentY,
              rotation: currentRotation,
              scale: currentScale,
              zIndex: 100 + index,
            },
            opacity: Math.max(0, opacity),
            hasReachedCenter,
          };
        })
      );

      const allComplete = animatedCards.every((_, index) => completedRef.current.has(index));
      if (allComplete && elapsed > duration + cards.length * staggerDelay) {
        onComplete();
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [cards, mergedConfig]);

  return (
    <div className={`card-play-animation ${className}`.trim()} aria-hidden="true">
      {animatedCards.map((card, index) => {
        const style: React.CSSProperties = {
          transform: `translate(${card.position.x}px, ${card.position.y}px) rotate(${card.position.rotation}deg) scale(${card.position.scale})`,
          opacity: card.opacity,
          zIndex: card.position.zIndex,
          pointerEvents: 'none',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transformOrigin: 'center center',
        };

        return children(card, index, style);
      })}
    </div>
  );
}

interface SimpleCardPlayProps {
  startPositions: CardPosition[];
  centerPosition: { x: number; y: number };
  onCardReachCenter?: (index: number) => void;
  onComplete?: () => void;
  children: (index: number, style: React.CSSProperties) => ReactNode;
  reducedMotion?: boolean;
}

export function SimpleCardPlay({
  startPositions,
  centerPosition,
  onCardReachCenter,
  onComplete,
  children,
  reducedMotion = false,
}: SimpleCardPlayProps) {
  const cards: CardAnimationState[] = startPositions.map((pos, index) => ({
    index,
    position: pos,
    opacity: 1,
    hasReachedCenter: false,
  }));

  return (
    <CardPlayAnimation
      cards={cards}
      config={{
        centerPosition,
        duration: 500,
        staggerDelay: 80,
        arcHeight: 140,
        onCardReachCenter: (index) => onCardReachCenter?.(index),
        onComplete,
        reducedMotion,
      }}
    >
      {(_card, index, style) => children(index, style)}
    </CardPlayAnimation>
  );
}