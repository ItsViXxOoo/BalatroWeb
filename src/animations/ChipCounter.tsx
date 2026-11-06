import { useEffect, useRef, useState } from 'react';
import type { ChipCounterProps, IncrementalChipCounterProps, ChipVariant, ChipSize } from './types';

const VARIANT_STYLES: Record<ChipVariant, { bg: string; text: string; border: string; glow: string }> = {
  chips: {
    bg: 'linear-gradient(180deg, var(--c-chips-600), var(--c-chips-800))',
    text: 'var(--c-chips-text)',
    border: 'var(--c-border-chips)',
    glow: 'rgba(46,213,207,0.5)',
  },
  mult: {
    bg: 'linear-gradient(180deg, var(--c-mult-600), var(--c-mult-800))',
    text: 'var(--c-mult-text)',
    border: 'var(--c-border-mult)',
    glow: 'rgba(245,96,64,0.5)',
  },
  total: {
    bg: 'linear-gradient(180deg, var(--c-gold-400), var(--c-primary))',
    text: 'var(--c-primary-text)',
    border: 'var(--c-border-gold)',
    glow: 'rgba(196,138,30,0.5)',
  },
  money: {
    bg: 'linear-gradient(180deg, #22c55e, #16a34a)',
    text: '#f0fdf4',
    border: '#16a34a',
    glow: 'rgba(34,197,94,0.5)',
  },
};

const SIZE_STYLES: Record<ChipSize, { fontSize: string; padding: string; minWidth: string; borderRadius: string }> = {
  sm: { fontSize: '0.875rem', padding: '4px 10px', minWidth: '56px', borderRadius: 'var(--radius-sm)' },
  md: { fontSize: '1.125rem', padding: '6px 14px', minWidth: '72px', borderRadius: 'var(--radius-md)' },
  lg: { fontSize: '1.5rem', padding: '8px 18px', minWidth: '90px', borderRadius: 'var(--radius-lg)' },
  xl: { fontSize: '2.25rem', padding: '12px 24px', minWidth: '120px', borderRadius: 'var(--radius-xl)' },
};

function useCountUp(value: number, targetValue: number | undefined, duration: number, easing: string, onComplete?: () => void) {
  const [display, setDisplay] = useState(value);
  const frameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const startValueRef = useRef(value);
  const targetRef = useRef(targetValue ?? value);

  useEffect(() => {
    targetRef.current = targetValue ?? value;
  }, [targetValue, value]);

  useEffect(() => {
    if (value === (targetValue ?? value)) {
      setDisplay(value);
      return;
    }

    const start = performance.now();
    startTimeRef.current = start;
    startValueRef.current = display;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / duration);

      let eased = progress;
      switch (easing) {
        case 'easeOut':
          eased = 1 - Math.pow(1 - progress, 3);
          break;
        case 'spring':
          eased = 1 - Math.pow(1 - progress, 2) * (1 - progress * 0.5);
          break;
        case 'bounce':
          eased = progress * (2 - progress);
          break;
      }

      const current = Math.round(startValueRef.current + (targetRef.current - startValueRef.current) * eased);
      setDisplay(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        onComplete?.();
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [value, targetValue, duration, easing, onComplete]);

  return display;
}

export function ChipCounter({
  value,
  variant = 'total',
  size = 'md',
  animate = true,
  duration = 520,
  className = '',
  'aria-label': ariaLabel,
}: ChipCounterProps) {
  const displayValue = useCountUp(value, undefined, duration, 'easeOut');

  const styles = VARIANT_STYLES[variant];
  const sizeStyles = SIZE_STYLES[size];

  const style: React.CSSProperties = {
    background: styles.bg,
    color: styles.text,
    border: `1px solid ${styles.border}`,
    fontSize: sizeStyles.fontSize,
    padding: sizeStyles.padding,
    minWidth: sizeStyles.minWidth,
    borderRadius: sizeStyles.borderRadius,
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    textAlign: 'center',
    boxShadow: `0 3px 0 ${styles.border}, inset 0 1px 0 rgba(255,255,255,0.15), 0 0 16px ${styles.glow}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
  };

  if (animate) {
    style.animation = 'chip-pop var(--dur-fast) var(--ease-bounce)';
  }

  return (
    <div
      className={`chip-counter chip-counter--${variant} chip-counter--${size} ${className}`.trim()}
      style={style}
      aria-label={ariaLabel || `${value} ${variant}`}
      role="status"
      aria-live="polite"
    >
      {displayValue.toLocaleString('es')}
    </div>
  );
}

export function IncrementalChipCounter({
  targetValue,
  currentValue,
  step = 1,
  stepDelay = 50,
  variant = 'total',
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
}: IncrementalChipCounterProps) {
  const [display, setDisplay] = useState(currentValue);
  const [isAnimating, setIsAnimating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetRef = useRef(targetValue);

  useEffect(() => {
    targetRef.current = targetValue;
    if (targetValue !== currentValue && !isAnimating) {
      setIsAnimating(true);
      animateStep();
    }
  }, [targetValue, currentValue, isAnimating]);

  const animateStep = () => {
    if (display === targetRef.current) {
      setIsAnimating(false);
      return;
    }

    const diff = targetRef.current - display;
    const direction = diff > 0 ? 1 : -1;
    const nextStep = Math.min(Math.abs(diff), step) * direction;
    const nextValue = display + nextStep;

    setDisplay(nextValue);

    if (nextValue !== targetRef.current) {
      timeoutRef.current = setTimeout(animateStep, stepDelay);
    } else {
      setIsAnimating(false);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const styles = VARIANT_STYLES[variant];
  const sizeStyles = SIZE_STYLES[size];

  const style: React.CSSProperties = {
    background: styles.bg,
    color: styles.text,
    border: `1px solid ${styles.border}`,
    fontSize: sizeStyles.fontSize,
    padding: sizeStyles.padding,
    minWidth: sizeStyles.minWidth,
    borderRadius: sizeStyles.borderRadius,
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    textAlign: 'center',
    boxShadow: `0 3px 0 ${styles.border}, inset 0 1px 0 rgba(255,255,255,0.15), 0 0 16px ${styles.glow}`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform var(--dur-fast) var(--ease-out), box-shadow var(--dur-fast) var(--ease-out)',
  };

  if (isAnimating) {
    style.animation = 'chip-pop var(--dur-fast) var(--ease-bounce)';
  }

  return (
    <div
      className={`chip-counter chip-counter--${variant} chip-counter--${size} ${isAnimating ? 'is-animating' : ''} ${className}`.trim()}
      style={style}
      aria-label={ariaLabel || `${display} ${variant}`}
      role="status"
      aria-live="polite"
    >
      {display.toLocaleString('es')}
    </div>
  );
}

export function MoneyCounter({
  value,
  previousValue,
  animate = true,
  size = 'md',
  className = '',
  'aria-label': ariaLabel,
}: {
  value: number;
  previousValue?: number;
  animate?: boolean;
  size?: ChipSize;
  className?: string;
  'aria-label'?: string;
}) {
  const [display, setDisplay] = useState(value);
  const [showChange, setShowChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState(0);

  useEffect(() => {
    if (previousValue !== undefined && previousValue !== value && animate) {
      const diff = value - previousValue;
      setChangeAmount(diff);
      setShowChange(true);
      setDisplay(previousValue);

      const start = performance.now();
      const duration = 600;
      const frame = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(previousValue + diff * eased));
        if (progress < 1) requestAnimationFrame(frame);
        else {
          setDisplay(value);
          setTimeout(() => setShowChange(false), 1500);
        }
      };
      requestAnimationFrame(frame);
    } else {
      setDisplay(value);
    }
  }, [value, previousValue, animate]);

  const styles = VARIANT_STYLES.money;
  const sizeStyles = SIZE_STYLES[size];

  const style: React.CSSProperties = {
    background: styles.bg,
    color: styles.text,
    border: `1px solid ${styles.border}`,
    fontSize: sizeStyles.fontSize,
    padding: sizeStyles.padding,
    minWidth: sizeStyles.minWidth,
    borderRadius: sizeStyles.borderRadius,
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    textAlign: 'center',
    boxShadow: `0 3px 0 ${styles.border}, inset 0 1px 0 rgba(255,255,255,0.15)`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    position: 'relative',
  };

  return (
    <div
      className={`chip-counter chip-counter--money chip-counter--${size} ${className}`.trim()}
      style={style}
      aria-label={ariaLabel || `Dinero: $${value}`}
      role="status"
      aria-live="polite"
    >
      <span>$</span>
      <span>{display.toLocaleString('es')}</span>
      {showChange && changeAmount !== 0 && (
        <span
          className={`money-change-indicator ${changeAmount > 0 ? 'positive' : 'negative'}`}
          style={{
            position: 'absolute',
            right: '-28px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: sizeStyles.fontSize,
            fontFamily: 'var(--font-display)',
            fontWeight: '700',
            color: changeAmount > 0 ? '#22c55e' : '#ef4444',
            animation: 'money-change var(--dur-smooth) var(--ease-spring)',
            whiteSpace: 'nowrap',
          }}
        >
          {changeAmount > 0 ? '+' : ''}${changeAmount}
        </span>
      )}
    </div>
  );
}